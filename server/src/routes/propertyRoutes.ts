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
import path from 'path';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = /image\//;
    if (mimeAllowed.test(file.mimetype) && allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
    }
  },
});
const router = Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Debug endpoint to inspect multipart upload without auth
router.post('/debug-upload', upload.array('images', 12), (req, res) => {
  res.json({ files: (req as any).files || null, body: req.body });
});

router.post('/', authenticate, authorize('admin', 'owner', 'agent'), upload.array('images', 12), createProperty);
router.put('/:id', authenticate, upload.array('images', 12), updateProperty);
router.delete('/:id', authenticate, deleteProperty);

router.get('/:id/bookings', getPropertyBookings);

export default router;
