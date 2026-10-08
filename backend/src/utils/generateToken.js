import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT and sets it as an httpOnly cookie on the response.
 * @param {import('express').Response} res
 * @param {string} userId
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,                                         // not accessible via JS
    secure: env.NODE_ENV === 'production',                  // HTTPS only in prod
    sameSite: 'lax',                                       // allows OAuth redirect; still blocks cross-site POST CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,                       // 7 days in ms
  });
};

export default generateToken;
