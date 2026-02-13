import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  getUserApprovalStatus,
  deleteUser,
} from '../controllers/adminController.js';

const router = Router();

// Middleware to check if user is admin
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get user approval status (any authenticated user)
router.get('/approval-status', authenticate, getUserApprovalStatus);

// Admin routes (require admin role)
router.get('/users', authenticate, adminOnly, getAllUsers);
router.get('/users/pending', authenticate, adminOnly, getPendingUsers);
router.put('/users/:userId/approve', authenticate, adminOnly, approveUser);
router.put('/users/:userId/reject', authenticate, adminOnly, rejectUser);
router.delete('/users/:userId', authenticate, adminOnly, deleteUser);

export default router;
