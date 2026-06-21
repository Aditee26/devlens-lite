const jwt     = require("jsonwebtoken");
const AppError = require("../shared/AppError");
const User    = require("../models/User");

async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("No token provided", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select("-password -refreshTokens").lean();
  if (!user) return next(new AppError("User not found", 401));
  if (!user.isActive) return next(new AppError("Account deactivated", 403));

  req.user = user;
  next();
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
