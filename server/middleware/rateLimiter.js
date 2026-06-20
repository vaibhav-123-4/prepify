import rateLimit from 'express-rate-limit';

export const aiRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 AI requests per user per window
  message: {
    message: 'Too many requests. Please wait a few minutes before starting another interview.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  // rate limit per logged-in user, not just IP
});

export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // prevent brute-force login attempts
  message: {
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
