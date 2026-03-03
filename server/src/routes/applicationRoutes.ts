import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  applyToProperty,
  getApplicationsForProperty,
  selectApplicant,
  rejectApplicant,
  withdrawApplication,
  getTenantApprovedProperties,
  getTenantAllApplications,
  getOwnerApplications,
  getPropertyPaymentOptions,
} from '../controllers/applicationController.js';

// simple multer config allowing any file type up to 10MB
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// Tenant applies to property
router.post('/:propertyId/apply', authenticate, authorize('tenant'), upload.array('attachments', 5), applyToProperty);

// Tenant views their approved properties and payment status (must come before /:propertyId)
router.get('/tenant/approved-properties', authenticate, authorize('tenant'), getTenantApprovedProperties);

// Tenant views ALL their applications with all statuses (must come before /:propertyId)
router.get('/tenant/all-applications', authenticate, authorize('tenant'), getTenantAllApplications);

// Owner (and agents acting on their behalf) views all applications across their properties
// must come before /:propertyId
router.get('/owner/all-applications', authenticate, authorize('owner', 'agent'), getOwnerApplications);

// Get property's pending/selected applications (owner/admin only)
router.get('/:propertyId', authenticate, getApplicationsForProperty);

// Owner selects/approves an applicant
router.patch('/:id/select', authenticate, selectApplicant);

// Owner rejects an applicant
router.patch('/:id/reject', authenticate, rejectApplicant);

// Tenant withdraws their application
router.delete('/:id/withdraw', authenticate, withdrawApplication);

// Tenant views payment options for approved property
router.get('/:propertyId/payment-options', authenticate, getPropertyPaymentOptions);

export default router;
