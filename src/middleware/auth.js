import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';
import User from '../models/User.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token || req.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) return res.redirect('/login');
        req.user = user;
        next();
      })
      .catch(() => res.redirect('/login'));
  } catch {
    res.clearCookie('auth_token');
    return res.redirect('/login');
  }
}

export function optionalAuth(req, res, next) {
  const token = req.cookies?.auth_token || req.headers?.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        req.user = user || undefined;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
