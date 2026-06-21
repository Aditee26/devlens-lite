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

// Refresh token
router.post("/refresh", ctrl.refreshToken);

// Logout
router.post("/logout", authenticate, ctrl.logout);

// Get current user
router.get("/me", authenticate, ctrl.getMe);

// Forgot password
router.post("/forgot-password",
  [body("email").isEmail().normalizeEmail().withMessage("Valid email required")],
  validate,
  ctrl.forgotPassword
);

// Reset password
router.post("/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  validate,
  ctrl.resetPassword
);

module.exports = router;

// Update profile
router.patch("/profile", authenticate, ctrl.updateProfile);

// Change password
router.patch("/password", authenticate, ctrl.changePassword);
