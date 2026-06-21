const User       = require("../../models/User");
const Repository = require("../../models/Repository");
const Analysis   = require("../../models/Analysis");
const Report     = require("../../models/Report");
const ChatSession= require("../../models/ChatSession");
const AppError   = require("../../shared/AppError");
const { ok }     = require("../../shared/response");
const os         = require("os");

exports.getStats = async (_req, res) => {
  const [
    totalUsers, activeUsers, totalRepos, completedAnalyses,
    totalReports, totalChats, recentUsers, recentRepos,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Repository.countDocuments(),
    Repository.countDocuments({ status: "complete" }),
    Report.countDocuments(),
    ChatSession.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt").lean(),
    Repository.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email").lean(),
  ]);

  // Repo status breakdown
  const statusBreakdown = await Repository.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Registrations over last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyReg = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  ok(res, {
    totalUsers, activeUsers, totalRepos, completedAnalyses,
    totalReports, totalChats,
    statusBreakdown, dailyRegistrations: dailyReg,
    recentUsers, recentRepos,
  });
};

exports.listUsers = async (req, res) => {
  const page  = parseInt(req.query.page  || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const skip  = (page - 1) * limit;
  const query = req.query.search
    ? { $or: [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    User.countDocuments(query),
  ]);
  ok(res, { users, total, page, pages: Math.ceil(total / limit) });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new AppError("User not found", 404);
  const repos = await Repository.find({ userId: user._id }).countDocuments();
  ok(res, { user, stats: { repositories: repos } });
};

exports.updateUser = async (req, res) => {
  const { role, isActive, name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(isActive !== undefined && { isActive }), ...(name && { name }) },
    { new: true, runValidators: true }
  ).lean();
  if (!user) throw new AppError("User not found", 404);
  ok(res, { user }, "User updated");
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError("Cannot delete your own account", 400);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  await Repository.deleteMany({ userId: req.params.id });
  ok(res, null, "User and their data deleted");
};

exports.listRepositories = async (req, res) => {
  const page  = parseInt(req.query.page  || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const repos = await Repository.find()
    .skip((page - 1) * limit).limit(limit)
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .lean();
  const total = await Repository.countDocuments();
  ok(res, { repositories: repos, total, page, pages: Math.ceil(total / limit) });
};

exports.getSystemInfo = (_req, res) => {
  ok(res, {
    node:      process.version,
    platform:  process.platform,
    arch:      process.arch,
    uptime:    process.uptime(),
    memory:    { total: os.totalmem(), free: os.freemem(), used: os.totalmem() - os.freemem() },
    cpus:      os.cpus().length,
    loadAvg:   os.loadavg(),
  });
};
