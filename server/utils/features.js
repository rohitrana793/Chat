// import mongoose from "mongoose";

// const connectDB = (uri) => {
//   mongoose
//     .connect(uri, { dbName: "Chat" })
//     .then((data) => console.log(`Connected to DB:${data.connection.host}`))
//     .catch((err) => {
//       throw err;
//     });
// };

// export { connectDB };
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       dbName: "chatapp",
//     });
//     console.log(`MongoDB connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     process.exit(1);
//   }
// };

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "chatapp",
      serverSelectionTimeoutMS: 30000, // wait up to 30s instead of 10s
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

  return res
    .status(code)
    .cookie("chat-token", token, cookieOptions)
    .json({ success: true, message });
};

const emitEvent = (req, event, users, data) => {
  console.log("Emmiting event", event);
};

const deleteFilesFromCloudinary = async (public_ids) => {
  // delete files form cloudianry
};

export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deleteFilesFromCloudinary,
};
