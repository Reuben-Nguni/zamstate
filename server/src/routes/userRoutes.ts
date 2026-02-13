import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPresence, getTenants } from '../controllers/userController.js';

const router = Router();

// Returns a list of users with `online` and `lastSeen` for presence
router.get('/presence', authenticate, getPresence);

// Get all tenants (for rental creation)
router.get('/tenants', authenticate, getTenants);

export default router;
