const AuthService = require("./auth.service");
const { ok, created } = require("../../shared/response");

const svc = new AuthService();

exports.register = async (req, res) => {
  const data = await svc.register(req.body);
  created(res, data, "Account created");
};

exports.login = async (req, res) => {
  const data = await svc.login(req.body);
  ok(res, data, "Login successful");
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  const data = await svc.refreshToken(refreshToken);
  ok(res, data, "Token refreshed");
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  await svc.logout(req.user._id, refreshToken);
  ok(res, null, "Logged out");
};

exports.getMe = async (req, res) => {
  const user = await svc.getMe(req.user._id);
  ok(res, { user });
};

exports.forgotPassword = async (req, res) => {
  await svc.forgotPassword(req.body.email);
  ok(res, null, "If that email exists, a reset link was sent");
};

exports.resetPassword = async (req, res) => {
  await svc.resetPassword(req.body.token, req.body.password);
  ok(res, null, "Password reset successfully");
};

exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;
  const User = require("../../models/User");
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(bio !== undefined && { bio }) },
    { new: true, runValidators: true }
  ).select("-password -refreshTokens").lean();
  const { ok } = require("../../shared/response");
  ok(res, { user }, "Profile updated");
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const AppError = require("../../shared/AppError");
  const { ok } = require("../../shared/response");
  const User = require("../../models/User");
  if (!newPassword || newPassword.length < 6) throw new AppError("New password min 6 chars", 400);
  const user = await User.findById(req.user._id).select("+password");
  const match = await user.comparePassword(currentPassword);
  if (!match) throw new AppError("Current password is incorrect", 401);
  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
  ok(res, null, "Password changed – please log in again");
};
