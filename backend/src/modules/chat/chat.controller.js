const ChatService = require("./chat.service");
const { ok, created } = require("../../shared/response");

const svc = new ChatService();

exports.listSessions = async (req, res) => {
  const sessions = await svc.listSessions(req.params.repoId, req.user._id);
  ok(res, { sessions });
};

exports.createSession = async (req, res) => {
  const session = await svc.createSession(req.body.repositoryId, req.user._id);
  created(res, { session }, "Chat session created");
};

exports.getSession = async (req, res) => {
  const session = await svc.getSession(req.params.id, req.user._id);
  ok(res, { session });
};

exports.deleteSession = async (req, res) => {
  await svc.deleteSession(req.params.id, req.user._id);
  ok(res, null, "Session deleted");
};

exports.sendMessage = async (req, res) => {
  const result = await svc.sendMessage(req.params.id, req.user._id, req.body.message);
  ok(res, result, "Message sent");
};
