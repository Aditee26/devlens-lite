const { Router } = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const ctrl = require("./chat.controller");

const router = Router();
router.use(authenticate);

// List sessions for a repository
router.get("/repository/:repoId",
  [param("repoId").isMongoId()],
  validate,
  ctrl.listSessions
);

// Create new session
router.post("/sessions",
  [body("repositoryId").isMongoId().withMessage("Valid repository ID required")],
  validate,
  ctrl.createSession
);

// Get session with messages
router.get("/sessions/:id",
  [param("id").isMongoId()],
  validate,
  ctrl.getSession
);

// Delete session
router.delete("/sessions/:id",
  [param("id").isMongoId()],
  validate,
  ctrl.deleteSession
);

// Send message
router.post("/sessions/:id/message",
  [
    param("id").isMongoId(),
    body("message").trim().isLength({ min: 1, max: 4000 }).withMessage("Message required (max 4000 chars)"),
  ],
  validate,
  ctrl.sendMessage
);

module.exports = router;
