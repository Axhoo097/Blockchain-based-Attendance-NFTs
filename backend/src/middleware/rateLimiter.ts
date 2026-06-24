import rateLimit from 'express-rate-limit';

/** General API rate limiter: 100 requests per 15 minutes */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

/** Strict limiter for AI analysis endpoint: 20 requests per 15 minutes */
export const analyzeLimiter = rateLimit({
  windowMs: 900000,
  max: 20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: 'AI analysis rate limit exceeded. Try again in 15 minutes.',
  },
});
