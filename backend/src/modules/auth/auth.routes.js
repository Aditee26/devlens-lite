const { Router }    = require("express");
const { body }      = require("express-validator");
const { validate }  = require("../../middleware/validate");
const { authenticate } = require("../../middleware/authenticate");
const ctrl          = require("./auth.controller");

const router = Router();

// Register
router.post("/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 chars"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  validate,
  ctrl.register
);

// Login
router.post("/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  ctrl.login
);

// Get current user
router.get("/me", authenticate, ctrl.getMe);

// Update profile
router.patch("/profile", authenticate, ctrl.updateProfile);

// Change password
router.patch("/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password min 6 chars"),
  ],
  validate,
  ctrl.changePassword
);

module.exports = router;
