import rateLimit from "express-rate-limit";

// Brute-force / spam-signup guard: a handful of attempts per IP every 15 minutes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Protects the Gemini free-tier quota and the server from being hammered by one client.
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many messages. Please slow down a little." },
});
