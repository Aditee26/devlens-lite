const { Router } = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const ctrl = require("./report.controller");

const router = Router();
router.use(authenticate);

// List user's reports
router.get("/", ctrl.list);

// Generate a report
router.post("/",
  [
    body("repositoryId").isMongoId().withMessage("Valid repository ID required"),
    body("format").isIn(["pdf","json"]).withMessage("Format must be pdf or json"),
  ],
  validate,
  ctrl.generate
);

// Download a report
router.get("/:id/download",
  [param("id").isMongoId()],
  validate,
  ctrl.download
);

// Delete a report
router.delete("/:id",
  [param("id").isMongoId()],
  validate,
  ctrl.remove
);

module.exports = router;
