import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME } from '../config/auth.js';
import User from '../models/User.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendPasswordReset } from '../services/email.js';

export async function showLogin(req, res) {
  if (req.user) {
    return res.redirect(`/${req.user.role}`);
  }
  res.render('auth/login', { error: null });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.render('auth/login', { error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect(`/${user.role}`);
}

export async function showRegister(req, res) {
  if (req.user) return res.redirect('/player');
  res.render('auth/register', { error: null });
}

export async function register(req, res) {
  const { email, password, firstName, lastName, middleName, dateOfBirth } = req.body;
  const existing = await User.findOne({ email: email?.toLowerCase() });
  if (existing) {
    return res.render('auth/register', { error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: 'player',
    firstName,
    lastName,
    middleName: middleName || '',
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
  });
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.cookie(COOKIE_NAME, token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.redirect('/player');
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/');
}

export async function showForgotPassword(req, res) {
  res.render('auth/forgot-password', { error: null, success: null });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.render('auth/forgot-password', { error: null, success: 'If that email exists, a reset link was sent.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  await PasswordReset.create({
    user: user._id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  await sendPasswordReset(user.email, `${baseUrl}/reset-password/${token}`);
  res.render('auth/forgot-password', { error: null, success: 'If that email exists, a reset link was sent.' });
}

export async function showResetPassword(req, res) {
  const reset = await PasswordReset.findOne({ token: req.params.token }).populate('user');
  if (!reset || reset.expiresAt < new Date()) {
    return res.render('auth/reset-password', { error: 'Invalid or expired link', valid: false });
  }
  res.render('auth/reset-password', { token: req.params.token, error: null, valid: true });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  const reset = await PasswordReset.findOne({ token }).populate('user');
  if (!reset || reset.expiresAt < new Date()) {
    return res.render('auth/reset-password', { token, error: 'Invalid or expired link', valid: false });
  }
  if (!password || password.length < 6) {
    return res.render('auth/reset-password', { token, error: 'Password must be at least 6 characters', valid: true });
  }
  await User.findByIdAndUpdate(reset.user._id, { passwordHash: await bcrypt.hash(password, 10) });
  await PasswordReset.deleteOne({ token });
  res.render('auth/reset-password', { token: null, error: null, valid: true, success: true });
}
