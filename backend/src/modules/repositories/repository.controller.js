const RepoService = require("./repository.service");
const { ok, created } = require("../../shared/response");

const svc = new RepoService();

exports.list = async (req, res) => {
  const repos = await svc.list(req.user._id);
  ok(res, { repositories: repos });
};

exports.create = async (req, res) => {
  const repo = await svc.create(req.user._id, req.body.githubUrl);
  created(res, { repository: repo }, "Repository imported and analysis started");
};

exports.get = async (req, res) => {
  const repo = await svc.get(req.params.id, req.user._id);
  ok(res, { repository: repo });
};

exports.remove = async (req, res) => {
  await svc.remove(req.params.id, req.user._id);
  ok(res, null, "Repository deleted");
};

exports.analyze = async (req, res) => {
  const repo = await svc.triggerAnalysis(req.params.id, req.user._id);
  ok(res, { repository: repo }, "Analysis started");
};

exports.status = async (req, res) => {
  const status = await svc.getStatus(req.params.id, req.user._id);
  ok(res, status);
};
