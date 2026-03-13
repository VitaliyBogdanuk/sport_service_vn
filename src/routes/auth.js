import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { optionalAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { validateCsrf } from '../middleware/csrf.js';

const router = Router();

router.get('/login', optionalAuth, authController.showLogin);
router.post('/login', loginLimiter, validateCsrf, authController.login);
router.get('/register', optionalAuth, authController.showRegister);
router.post('/register', loginLimiter, validateCsrf, authController.register);
router.get('/logout', authController.logout);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', validateCsrf, authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password', validateCsrf, authController.resetPassword);

export default router;
