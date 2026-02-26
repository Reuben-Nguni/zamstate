import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { createPayment, getPayments, verifyPayment, getPaymentAudit } from '../controllers/paymentController.js';

// allow proof uploads
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post('/', authenticate, upload.single('proof'), createPayment);
router.get('/', authenticate, getPayments);
router.put('/:id/verify', authenticate, verifyPayment);
router.get('/:id/audit', authenticate, getPaymentAudit);

export default router;
