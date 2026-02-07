import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPresence } from '../controllers/userController.js';

const router = Router();

// Returns a list of users with `online` and `lastSeen` for presence
router.get('/presence', authenticate, getPresence);

export default router;
