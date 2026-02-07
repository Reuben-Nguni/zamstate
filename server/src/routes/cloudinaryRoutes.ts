import { Router, Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const router = Router();

// Multer memory storage - we stream the buffer to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Check Cloudinary connectivity and credentials by listing one resource
router.get('/check', async (req: Request, res: Response) => {
  try {
    // Attempt to list a single resource to validate credentials
    const result = await cloudinary.api.resources({ max_results: 1 });
    return res.json({ ok: true, message: 'Cloudinary OK', info: { count: result.resources.length } });
  } catch (error: any) {
    console.error('Cloudinary check failed:', error.message || error);
    return res.status(500).json({ ok: false, message: 'Cloudinary check failed', error: error.message || error });
  }
});

// Upload an image (avatar or other) via multipart/form-data (field name: file)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file provided' });

    const buffer = req.file.buffer;
    // Convert buffer to data URI so we can upload without writing to disk
    const base64 = buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'zamstate/avatars',
      resource_type: 'image',
      overwrite: true,
    });

    return res.json({ ok: true, url: result.secure_url, publicId: result.public_id });
  } catch (error: any) {
    console.error('Upload failed:', error.message || error);
    return res.status(500).json({ ok: false, message: 'Upload failed', error: error.message || error });
  }
});

export default router;
