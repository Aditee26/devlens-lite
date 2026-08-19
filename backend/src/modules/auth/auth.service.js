const jwt      = require("jsonwebtoken");
const User     = require("../../models/User");
const AppError = require("../../shared/AppError");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}
function safeUser(u) {
  return { _id: u._id, name: u.name, email: u.email, bio: u.bio, createdAt: u.createdAt };
}

class AuthService {
  async register({ name, email, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw new AppError("Email already registered", 409);

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    return { token, user: safeUser(user) };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid credentials", 401);
    const match = await user.comparePassword(password);
    if (!match) throw new AppError("Invalid credentials", 401);

    const token = signToken(user._id);
    return { token, user: safeUser(user) };
  }

  async getMe(userId) {
    const user = await User.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);
    return safeUser(user);
  }

  async updateProfile(userId, { name, bio }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }), ...(bio !== undefined && { bio }) },
      { new: true, runValidators: true }
    ).lean();
    if (!user) throw new AppError("User not found", 404);
    return safeUser(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!newPassword || newPassword.length < 6) throw new AppError("New password min 6 chars", 400);
    const user = await User.findById(userId).select("+password");
    const match = await user.comparePassword(currentPassword);
    if (!match) throw new AppError("Current password is incorrect", 401);
    user.password = newPassword;
    await user.save();
  }
}

module.exports = AuthService;
