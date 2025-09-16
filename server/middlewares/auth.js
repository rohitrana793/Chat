import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { adminSecretKey } from "../app.js";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies["chat-token"];

  if (!token) return next(new ErrorHandler("Please Login To Access", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = decodedData._id;

  next();
};

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

export default adminOnly;

export { isAuthenticated, adminOnly };
