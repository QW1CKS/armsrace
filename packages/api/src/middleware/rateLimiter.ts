import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // localhost only, generous limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
