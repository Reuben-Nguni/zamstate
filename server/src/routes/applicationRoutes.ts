import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { applyToProperty, getApplicationsForProperty, selectApplicant } from '../controllers/applicationController.js';

const router = Router();

router.post('/:propertyId/apply', authenticate, applyToProperty);
router.get('/:propertyId', authenticate, getApplicationsForProperty);
router.put('/select/:id', authenticate, selectApplicant);

export default router;
