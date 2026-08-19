const jwt      = require("jsonwebtoken");
const AppError = require("../shared/AppError");
const User     = require("../models/User");

async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.id).select("-password").lean();
  if (!user) return next(new AppError("User not found", 401));

  req.user = user;
  next();
}

module.exports = { authenticate };
