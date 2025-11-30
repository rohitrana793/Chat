import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import {
  createGroupChats,
  createMessagesInAChats,
  createSingleChats,
} from "./seeders/chat.js";
import { createUser } from "./seeders/user.js";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import geminiRoute from "./routes/gemini.js";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
  ALERT,
} from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";
import { checkToxicity } from "./utils/toxicCheck.js";

dotenv.config({
  path: "./.env",
});

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

export async function main(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      // contents: "what is the value of pie in math",
    });
    console.log(response.text);
    return response.text;
  } catch (err) {
    console.log(err);
  }
}

// await main();

const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const adminSecretKey = process.env.ADMIN_SECRET_KEY || "adsadasdasdadsa";

const userSocketIDs = new Map();
const onlineUsers = new Set();

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// createUser(10);
// createSingleChats(10);
// createGroupChats(10);
// createMessagesInAChats("689a2a1029c5014864a9e963", 50);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// Using Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/content", geminiRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;

  userSocketIDs.set(user._id.toString(), socket.id);

  // console.log(userSocketIDs);

  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    try {
      // 1️⃣ Check toxicity using Gemini
      const moderation = await checkToxicity(message);

      if (moderation.isToxic) {
        // 🚫 Block message and notify sender only
        socket.emit(ALERT, {
          message: `⚠️ Message blocked: ${moderation.reason}`,
        });
        return; // Stop processing toxic messages
      }

      // 2️⃣ Construct message for DB & real-time broadcast
      const messageForDB = {
        content: message,
        sender: user._id,
        chat: chatId,
      };

      const messageForRealTime = {
        ...messageForDB,
        _id: uuid(),
        sender: { _id: user._id, name: user.name },
        createdAt: new Date().toISOString(),
      };

      // 3️⃣ Broadcast safe message to chat members
      const membersSocket = getSockets(members);
      io.to(membersSocket).emit(NEW_MESSAGE, {
        chatId,
        message: messageForRealTime,
      });

      // Optional: Notify members about new message alert
      io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

      // 4️⃣ Save message to DB
      await Message.create(messageForDB);
    } catch (err) {
      console.error("Error handling new message:", err);
      // Optional: notify sender of failure
      socket.emit(ALERT, {
        message: "⚠️ Failed to send message due to server error.",
      });
    }
  });

  /*
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    // console.log("Emitting", messageForRealTime);

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
      chatId,
    });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

  */

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSocket = getSockets(members);
    socket.to(membersSocket).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSocket = getSockets(members);
    socket.to(membersSocket).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on("disconnect", () => {
    // console.log("user disconnected");
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

app.use(errorMiddleware);

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${envMode} Mode`);
});

export { envMode, adminSecretKey, userSocketIDs };
