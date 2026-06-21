const { Router } = require("express");
const { param, body } = require("express-validator");
const { validate } = require("../../middleware/validate");
const { authenticate, authorize } = require("../../middleware/authenticate");
const ctrl = require("./admin.controller");

const router = Router();
router.use(authenticate, authorize("admin"));

// Dashboard stats
router.get("/stats", ctrl.getStats);

// Users
router.get("/users", ctrl.listUsers);
router.get("/users/:id", [param("id").isMongoId()], validate, ctrl.getUser);
router.patch("/users/:id",
  [
    param("id").isMongoId(),
    body("role").optional().isIn(["user","admin"]),
    body("isActive").optional().isBoolean(),
  ],
  validate,
  ctrl.updateUser
);
router.delete("/users/:id", [param("id").isMongoId()], validate, ctrl.deleteUser);

// Repositories
router.get("/repositories", ctrl.listRepositories);

// System
router.get("/system", ctrl.getSystemInfo);

module.exports = router;
