import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (rate limited against brute force & spam)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Private routes (unrestricted session lifecycle)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
