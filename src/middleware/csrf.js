import crypto from 'crypto';
import { COOKIE_NAME } from '../config/auth.js';

const CSRF_COOKIE = 'csrf_token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

export function csrfToken(req, res, next) {
  let token = req.cookies?.[CSRF_COOKIE];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, { httpOnly: true, maxAge: COOKIE_MAX_AGE, sameSite: 'lax' });
  }
  res.locals.csrfToken = token;
  next();
}

export function validateCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.body?._csrf || req.query?._csrf;
  const cookie = req.cookies?.[CSRF_COOKIE];
  if (!token || !cookie || token !== cookie) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
}
