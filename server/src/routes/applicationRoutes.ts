import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { applyToProperty, getApplicationsForProperty, selectApplicant } from '../controllers/applicationController.js';

// simple multer config allowing any file type up to 10MB
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post('/:propertyId/apply', authenticate, upload.array('attachments', 5), applyToProperty);
router.get('/:propertyId', authenticate, getApplicationsForProperty);
router.put('/select/:id', authenticate, selectApplicant);

export default router;
