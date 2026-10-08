import express from 'express';
import passport from 'passport';
import { register, login, logout, getMe, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

// Ensure the Google Strategy is registered before any route uses it
import '../config/passport.js';

const router = express.Router();

// ── Public routes (rate limited against brute force & spam) ──
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// ── Google OAuth routes ───────────────────────────────────────
// Step 1 — Redirect browser to Google's consent screen.
// passport.initialize() is used as a one-shot middleware here (no session).
router.get(
  '/google',
  passport.initialize(),
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Step 2 — Google redirects back here; Passport verifies & populates req.user.
// On success → googleCallback sets the httpOnly cookie & redirects to frontend.
// On failure → redirect to /login?error=google_auth_failed.
router.get(
  '/google/callback',
  passport.initialize(),
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

// ── Private routes (unrestricted session lifecycle) ──
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
