import { Request, Response } from 'express';
import { Property } from '../models/Property.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import emailServiceModule from '../services/emailService.js';
const emailService = emailServiceModule;
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export const createProperty = async (req: Request, res: Response) => {
  try {
    // Check if user is approved to post properties
    const user = await User.findById((req as any).user?.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Only admins and approved users can post properties
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'You are not approved to post properties. Please wait for admin approval.' 
      });
    }

    // Debug logging to help diagnose missing files
    console.log('==== createProperty request ====');
    console.log('req.files:', Array.isArray((req as any).files) ? (req as any).files.length : typeof (req as any).files);
    console.log('req.body keys:', Object.keys(req.body || {}));

    // Debug: log summary to console only (no persistent file writes)
    // debug summary removed

    const { title, description, price, currency, type, location, features, status } = req.body;

    // parse location and features if they're JSON strings
    let parsedLocation: any = {};
    if (location) {
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        parsedLocation = {};
      }
    }

    let parsedFeatures: any = {};
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        parsedFeatures = {};
      }
    }

    const images: any[] = [];

    // Multer will set req.files as an array when using upload.array('images')
    const files: any[] = Array.isArray((req as any).files) ? (req as any).files : [];

    if (files.length > 0) {
      console.log('[createProperty] processing', files.length, 'file(s)');
      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'zamstate/properties',
            resource_type: 'auto',
          });

          images.push({ url: result.secure_url, publicId: result.public_id });
          console.log('[createProperty] uploaded', result.secure_url);
        } catch (uploadError: any) {
          console.error('[createProperty] cloudinary upload failed:', uploadError?.message || uploadError);
        }

        // remove temp file if exists
        try {
          if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (e) {
          console.warn('[createProperty] failed to unlink temp file', e);
        }
      }
    } else {
      console.log('[createProperty] no files found in req.files');
    }

    // Console-only summary after processing
    // image summary removed

    const property = new Property({
      title,
      description,
      price,
      currency,
      type,
      status: status || 'available',
      location: parsedLocation,
      features: parsedFeatures,
      images,
      owner: req.userId,
    });

    await property.save();
    await property.populate('owner');

    // Notify admins about new listing
    try {
      const admins = await User.find({ role: 'admin' });
      const adminEmails = admins.map((a: any) => a.email).filter(Boolean);
      const propForEmail: any = property.toObject ? property.toObject() : property;
      const owner: any = propForEmail.owner;
      propForEmail.ownerName = (owner?.firstName || '') + ' ' + (owner?.lastName || '');
      await emailService.sendNewPropertyNotification(adminEmails, propForEmail);
    } catch (err) {
      console.error('[createProperty] failed to notify admins', err);
    }

    res.status(201).json({ message: 'Property created successfully', property });
  } catch (error: any) {
    console.error('[createProperty] error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type, township, priceMin, priceMax, sortBy } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};

    if (type) filter.type = type;
    if (township) filter['location.township'] = township;
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    const sortOptions: any = {};
    if (sortBy === 'price_asc') sortOptions.price = 1;
    if (sortBy === 'price_desc') sortOptions.price = -1;
    if (sortBy === 'date_desc') sortOptions.createdAt = -1;
    if (sortBy === 'date_asc') sortOptions.createdAt = 1;

    const properties = await Property.find(filter)
      .populate('owner')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(filter);

    // Sanitize properties based on requester role
    const sanitized = properties.map((p: any) => sanitizePropertyForRole(p, req));

    res.json({
      data: sanitized,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner agent');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const sanitized = sanitizePropertyForRole(property, req);
    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to remove admin-only or sensitive fields based on requester role
function sanitizePropertyForRole(property: any, req: Request) {
  if (!property) return property;

  const obj = property.toObject ? property.toObject() : property;

  const requesterRole = req.user?.role || 'guest';
  const requesterId = req.userId;

  // If requester is admin or the owner or agent, return full object
  if (requesterRole === 'admin' || String(obj.owner?._id) === String(requesterId) || String(obj.agent?._id) === String(requesterId)) {
    return obj;
  }

  // For tenants and guests: remove sensitive owner contact details
  if (obj.owner) {
    delete obj.owner.email;
    delete obj.owner.phone;
    delete obj.owner.verified_at;
    // keep name only
  }

  // Optionally hide internal fields
  delete obj.__v;

  return obj;
}

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;

    // Handle new image uploads
    if (req.files && Array.isArray(req.files)) {
      const images = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'zamstate/properties',
        });
        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      // Delete old images
      if (property.images && property.images.length > 0) {
        for (const img of property.images) {
          if (img.publicId) {
            await cloudinary.uploader.destroy(img.publicId);
          }
        }
      }

      updates.images = images;
    }

    Object.assign(property, updates);
    await property.save();

    res.json({ message: 'Property updated', property });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const img of property.images) {
        if (img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ property: req.params.id }).populate('tenant');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
