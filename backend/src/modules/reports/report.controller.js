const ReportService = require("./report.service");
const { ok, created } = require("../../shared/response");

const svc = new ReportService();

exports.list = async (req, res) => {
  const reports = await svc.list(req.user._id);
  ok(res, { reports });
};

exports.generate = async (req, res) => {
  const report = await svc.generate(req.user._id, req.body.repositoryId, req.body.format);
  created(res, { report }, "Report generated");
};

exports.download = async (req, res) => {
  await svc.download(req.params.id, req.user._id, res);
};

exports.remove = async (req, res) => {
  await svc.remove(req.params.id, req.user._id);
  ok(res, null, "Report deleted");
};
