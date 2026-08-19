const Analysis   = require("../../models/Analysis");
const Repository = require("../../models/Repository");
const AppError   = require("../../shared/AppError");
const { ok }     = require("../../shared/response");

exports.getByRepo = async (req, res) => {
  const repo = await Repository.findOne({ _id: req.params.repoId, userId: req.user._id });
  if (!repo) throw new AppError("Repository not found", 404);

  const analysis = await Analysis.findOne({ repositoryId: repo._id }).sort({ createdAt: -1 }).lean();
  if (!analysis) throw new AppError("No analysis found – trigger one first", 404);

  ok(res, { analysis });
};

exports.getById = async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id }).lean();
  if (!analysis) throw new AppError("Analysis not found", 404);
  ok(res, { analysis });
};
