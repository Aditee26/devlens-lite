const { Router } = require("express");
const { param }  = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const ctrl = require("./analysis.controller");

const router = Router();
router.use(authenticate);

// Get latest analysis for a repository
router.get("/repository/:repoId",
  [param("repoId").isMongoId()],
  validate,
  ctrl.getByRepo
);

// Get analysis by ID
router.get("/:id",
  [param("id").isMongoId()],
  validate,
  ctrl.getById
);

module.exports = router;
