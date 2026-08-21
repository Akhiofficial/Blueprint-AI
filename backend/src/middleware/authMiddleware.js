import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);
  // Attach user to request (without password)
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized — user not found');
  }

  next();
});

export { protect };
