import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createPayment, getPayments, verifyPayment, getPaymentAudit } from '../controllers/paymentController.js';

const router = Router();

router.post('/', authenticate, createPayment);
router.get('/', authenticate, getPayments);
router.put('/:id/verify', authenticate, verifyPayment);
router.get('/:id/audit', authenticate, getPaymentAudit);

export default router;
