import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

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

export default router;
