import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for sensitive authentication routes (login & register).
 * Limits each IP to 10 requests per 15-minute window by default.
 * Configurable via AUTH_RATE_LIMIT_WINDOW_MS and AUTH_RATE_LIMIT_MAX environment variables.
 */
const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
});

export { authRateLimiter };
