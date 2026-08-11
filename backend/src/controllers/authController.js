import * as authService from '../services/authService.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }

  const { name, email, password } = parsed.data;

  try {
    const user = await authService.register({ name, email, password });
    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.message === 'Email already in use') {
      res.status(409);
    }
    throw err;
  }
});

// ─────────────────────────────────────────────
// @desc    Authenticate user & set cookie
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }

  const { email, password } = parsed.data;

  try {
    const user = await authService.login({ email, password });
    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.message === 'Invalid email or password') {
      res.status(401);
    }
    throw err;
  }
});

// ─────────────────────────────────────────────
// @desc    Logout — clear cookie
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // immediately expire the cookie
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is already attached by authMiddleware (no password)
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export { register, login, logout, getMe };

