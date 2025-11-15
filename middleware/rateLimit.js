// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const createOrgLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 org creations per window
  message: {
    success: false,
    message: 'Too many organization creation attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.',
  },
});