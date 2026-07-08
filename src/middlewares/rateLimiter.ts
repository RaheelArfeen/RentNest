import rateLimit from "express-rate-limit";

// Stricter limit for auth endpoints to slow down brute-force attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later",
      errorDetails: null,
    });
  },
});

// General limit for the whole API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later",
      errorDetails: null,
    });
  },
});
