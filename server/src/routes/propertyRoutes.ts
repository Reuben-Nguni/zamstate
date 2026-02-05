import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyBookings,
} from '../controllers/propertyController.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);

router.post('/', authenticate, authorize('admin'), upload.array('images'), createProperty);
router.put('/:id', authenticate, upload.array('images'), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

router.get('/:id/bookings', getPropertyBookings);

export default router;
