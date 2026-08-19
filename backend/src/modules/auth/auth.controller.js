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

exports.getMe = async (req, res) => {
  const user = await svc.getMe(req.user._id);
  ok(res, { user });
};

exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;
  const user = await svc.updateProfile(req.user._id, { name, bio });
  ok(res, { user }, "Profile updated");
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await svc.changePassword(req.user._id, currentPassword, newPassword);
  ok(res, null, "Password changed");
};
