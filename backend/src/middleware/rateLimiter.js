import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes.
 * Limits each IP to 10 requests per 15-minute window.
 * Applied only to /api/auth/* to prevent brute-force attacks.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
});

export { authRateLimiter };
