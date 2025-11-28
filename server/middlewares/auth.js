import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { adminSecretKey } from "../app.js";
import { TryCatch } from "./error.js";
import { CHAT_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";

// const isAuthenticated = TryCatch(async (req, res, next) => {
//   const token = req.cookies[CHAT_TOKEN];

//   if (!token) return next(new ErrorHandler("Please Login To Access", 401));

//   const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

//   // Fetch full user object with avatar + name
//   const user = await User.findById(decodedData._id).select("name avatar");

//   if (!user) return next(new ErrorHandler("User not found", 404));

//   req.user = user; // ✅ store full user, not just ID

//   next();
// });

// original one
const isAuthenticated = TryCatch((req, res, next) => {
  const token = req.cookies[CHAT_TOKEN];

  if (!token) return next(new ErrorHandler("Please Login To Access", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = decodedData._id;

  next();
});

// const adminOnly = (req, res, next) => {
//   const token = req.cookies["chat-admin-token"];

//   if (!token)
//     return next(new ErrorHandler("Only Admin Can Access This Route", 401));

//   const secretKey = jwt.verify(token, process.env.JWT_SECRET_KEY);

//   const isMatched = secretKey === adminSecretKey;

//   if (!isMatched)
//     return next(new ErrorHandler("Only Admin Can Access This Route", 401));

//   next();
// };

const adminOnly = (req, res, next) => {
  const token = req.cookies["chat-admin-token"];

  if (!token) {
    return next(new ErrorHandler("Only Admin Can Access This Route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.role !== "admin") {
      return next(new ErrorHandler("Only Admin Can Access This Route", 401));
    }

    req.admin = decoded; // optional: attach admin info to req
    next();
  } catch (err) {
    return next(new ErrorHandler("Only Admin Can Access This Route", 401));
  }
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[CHAT_TOKEN];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };
