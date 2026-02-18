import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { passwordResetRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('phone').notEmpty(),
  ],
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], login);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

router.post('/request-password-reset', [body('email').isEmail()], passwordResetRateLimiter, requestPasswordReset);
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 6 })], resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', [body('email').isEmail()], resendVerification);

export default router;
