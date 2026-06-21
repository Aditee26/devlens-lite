const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");
const User     = require("../../models/User");
const AppError = require("../../shared/AppError");
const { sendEmail } = require("../../utils/email");

function signAccess(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
}
function signRefresh(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
}
function safeUser(u) {
  return { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, bio: u.bio, createdAt: u.createdAt };
}

class AuthService {
  async register({ name, email, password }) {
    const exists = await User.findOne({ email });
    if (exists) throw new AppError("Email already registered", 409);

    const user         = await User.create({ name, email, password });
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    return { accessToken, refreshToken, user: safeUser(user) };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password +refreshTokens");
    if (!user)                          throw new AppError("Invalid credentials", 401);
    if (!user.isActive)                 throw new AppError("Account deactivated", 403);
    const ok = await user.comparePassword(password);
    if (!ok)                            throw new AppError("Invalid credentials", 401);

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    // Keep max 5 refresh tokens per user
    const tokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: tokens } });

    return { accessToken, refreshToken, user: safeUser(user) };
  }

  async refreshToken(token) {
    if (!token) throw new AppError("Refresh token required", 400);
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
    catch (_) { throw new AppError("Invalid or expired refresh token", 401); }

    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(token)) {
      throw new AppError("Refresh token revoked", 401);
    }

    const newAccess  = signAccess(user._id);
    const newRefresh = signRefresh(user._id);

    // Rotate
    const tokens = user.refreshTokens.filter((t) => t !== token);
    tokens.push(newRefresh);
    await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: tokens } });

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  async logout(userId, token) {
    if (token) {
      await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } });
    } else {
      await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
    }
  }

  async getMe(userId) {
    const user = await User.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);
    return safeUser(user);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return; // silent – don't reveal existence

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:   token,
      resetPasswordExpires: expires,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "DevLens – Reset your password",
      html: `<p>Hello ${user.name},</p>
             <p>Click the link below to reset your password (valid 1 hour):</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, ignore this email.</p>`,
    });
  }

  async resetPassword(token, password) {
    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens        = [];
    await user.save();
  }
}

module.exports = AuthService;
