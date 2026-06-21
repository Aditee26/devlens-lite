const { Router }    = require("express");
const { body, param } = require("express-validator");
const { validate }  = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const ctrl          = require("./repository.controller");

const router = Router();
router.use(authenticate);

// List user's repositories
router.get("/", ctrl.list);

// Create / import repository
router.post("/",
  [body("githubUrl").isURL().withMessage("Valid GitHub URL required")],
  validate,
  ctrl.create
);

// Get single repository
router.get("/:id",
  [param("id").isMongoId().withMessage("Invalid repository ID")],
  validate,
  ctrl.get
);

// Delete repository
router.delete("/:id",
  [param("id").isMongoId().withMessage("Invalid repository ID")],
  validate,
  ctrl.remove
);

// Trigger re-analysis
router.post("/:id/analyze",
  [param("id").isMongoId().withMessage("Invalid repository ID")],
  validate,
  ctrl.analyze
);

// Poll analysis status
router.get("/:id/status",
  [param("id").isMongoId().withMessage("Invalid repository ID")],
  validate,
  ctrl.status
);

module.exports = router;
