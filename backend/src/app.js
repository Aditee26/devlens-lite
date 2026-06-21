const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { errorHandler } = require("./middleware/errorHandler");
const { rateLimiter } = require("./middleware/rateLimiter");

// ── Routes ──────────────────────────────────────────────────────────────────
const authRoutes       = require("./modules/auth/auth.routes");
const repoRoutes       = require("./modules/repositories/repository.routes");
const analysisRoutes   = require("./modules/analysis/analysis.routes");
const chatRoutes       = require("./modules/chat/chat.routes");
const reportRoutes     = require("./modules/reports/report.routes");
const adminRoutes      = require("./modules/admin/admin.routes");

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use("/api/v1/auth",        rateLimiter(15, 25));
app.use("/api/v1",             rateLimiter(15, 200));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",        authRoutes);
app.use("/api/v1/repositories", repoRoutes);
app.use("/api/v1/analysis",    analysisRoutes);
app.use("/api/v1/chat",        chatRoutes);
app.use("/api/v1/reports",     reportRoutes);
app.use("/api/v1/admin",       adminRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "devlens-api" })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
