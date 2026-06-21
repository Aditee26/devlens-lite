const rateLimit = require("express-rate-limit");

function rateLimiter(windowMinutes, max) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: `Too many requests – try again in ${windowMinutes} min` },
  });
}

module.exports = { rateLimiter };
