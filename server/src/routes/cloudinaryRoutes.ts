import { Router, Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';

const router = Router();

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

export default router;
