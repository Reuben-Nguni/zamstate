import { Request, Response } from 'express';
import { Application } from '../models/Application.js';
import { Property } from '../models/Property.js';
import { Conversation } from '../models/Message.js';
import { Payment } from '../models/Payment.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const applyToProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const { message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const existing = await Application.findOne({ property: propertyId, tenant: req.userId });
  if (existing) return res.status(400).json({ message: 'Already applied' });

  // Process any uploaded files (multer populates req.files)
  const attachments: any[] = [];
  const files: any[] = Array.isArray((req as any).files) ? (req as any).files : [];
  if (files.length > 0) {
    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'zamstate/applications',
          resource_type: 'auto',
        });
        attachments.push({ url: result.secure_url, publicId: result.public_id });
      } catch (e) {
        console.warn('application attachment upload failed', e);
      }
      try {
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) {
        // ignore
      }
    }
  }

  const app = new Application({ property: propertyId, tenant: req.userId, message, attachments });
  await app.save();

  // notify owner via websocket if connected
  try {
    const { getIO } = await import('../utils/socket.js');
    const io = getIO();
    const ownerId = (property.owner || '').toString();
    io.to(`user-${ownerId}`).emit('new-application', { application: app });
  } catch (err) {
    // non-blocking, just log
    console.warn('socket emit new-application failed', err);
  }

  res.status(201).json({ message: 'Application submitted', application: app });
};

export const getApplicationsForProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  // Only owner or admin
  if (String(property.owner) !== String(req.userId) && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const apps = await Application.find({ property: propertyId }).populate('tenant', 'firstName lastName email phone').sort({ createdAt: -1 }).exec();
  res.json({ data: apps });
};

export const selectApplicant = async (req: Request, res: Response) => {
  const { id } = req.params; // application id
  const app = await Application.findById(id).populate('property');
  if (!app) return res.status(404).json({ message: 'Application not found' });

  const property: any = (app as any).property;
  if (!property) return res.status(404).json({ message: 'Property not found' });

  if (String(property.owner) !== String(req.userId) && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  app.status = 'selected';
  await app.save();

  // update property to reflect current tenant and status
  property.currentTenant = app.tenant;
  if (property.type === 'land' || property.status === 'sold') {
    property.status = 'sold';
  } else {
    property.status = 'rented';
  }
  await property.save();

  // notify tenant and owner about the status change
  try {
    const { getIO } = await import('../utils/socket.js');
    const io = getIO();
    const tenantId = (app.tenant || '').toString();
    const ownerId = (property.owner || '').toString();
    io.to(`user-${tenantId}`).emit('application-updated', { application: app });
    io.to(`user-${ownerId}`).emit('application-updated', { application: app });
  } catch (err) {
    console.warn('socket emit application-updated failed', err);
  }

  // create initial payment record as placeholder
  try {
    await Payment.create({
      property: property._id,
      owner: property.owner,
      tenant: app.tenant,
      amount: property.price || 0,
      currency: property.currency || 'ZMW',
      method: 'other',
      status: 'pending',
      reference: 'application-selection',
      audit: [{ action: 'created', by: req.userId, at: new Date() }],
    });
  } catch (e) {
    console.error('Failed to create initial payment record', e);
  }

  // ensure conversation exists between owner and tenant for this property
  try {
    let conv = await Conversation.findOne({
      property: property._id,
      participants: { $all: [property.owner, app.tenant] },
    });
    if (!conv) {
      conv = new Conversation({
        property: property._id,
        participants: [property.owner, app.tenant],
      });
      await conv.save();
    }
  } catch (e) {
    console.error('Failed to create conversation for selected applicant', e);
  }

  // Reject other pending applications for this property
  await Application.updateMany(
    { property: property._id, status: 'applied', _id: { $ne: id } },
    { status: 'rejected' }
  );

  res.json({ message: 'Applicant selected and approved', application: app });
};

export const rejectApplicant = async (req: Request, res: Response) => {
  const { id } = req.params; // application id
  const app = await Application.findById(id).populate('property');
  if (!app) return res.status(404).json({ message: 'Application not found' });

  const property: any = (app as any).property;
  if (!property) return res.status(404).json({ message: 'Property not found' });

  if (String(property.owner) !== String(req.userId) && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  app.status = 'rejected';
  await app.save();

  // notify tenant about rejection
  try {
    const { getIO } = await import('../utils/socket.js');
    const io = getIO();
    const tenantId = (app.tenant || '').toString();
    const ownerId = (property.owner || '').toString();
    io.to(`user-${tenantId}`).emit('application-updated', { application: app });
    io.to(`user-${ownerId}`).emit('application-updated', { application: app });
  } catch (err) {
    console.warn('socket emit application-updated (reject) failed', err);
  }

  res.json({ message: 'Applicant rejected', application: app });
};

// Tenant withdraws application
export const withdrawApplication = async (req: Request, res: Response) => {
  const { id } = req.params; // application id
  const app = await Application.findById(id);
  if (!app) return res.status(404).json({ message: 'Application not found' });

  if (String(app.tenant) !== String(req.userId)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (app.status === 'selected' || app.status === 'withdrawn') {
    return res.status(400).json({ message: 'Cannot withdraw this application' });
  }

  app.status = 'withdrawn';
  await app.save();

  res.json({ message: 'Application withdrawn', application: app });
};

// Get tenant's approved properties and payment status
export const getTenantApprovedProperties = async (req: Request, res: Response) => {
  try {
    const approvedApps = await Application.find({ tenant: req.userId, status: 'selected' })
      .populate('property')
      .populate('tenant')
      .sort({ createdAt: -1 });

    const result = [];
    for (const app of approvedApps) {
      const property: any = (app as any).property;
      if (!property) continue;

      // Get payment record for this tenant-property pair
      const payment = await Payment.findOne({
        property: property._id,
        tenant: req.userId,
      }).sort({ createdAt: -1 });

      result.push({
        application: app,
        property,
        payment,
      });
    }

    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get ALL tenant applications with all statuses
export const getTenantAllApplications = async (req: Request, res: Response) => {
  try {
    const apps = await Application.find({ tenant: req.userId })
      .populate('property', 'title location price currency')
      .sort({ createdAt: -1 });

    const result = apps.map((app: any) => ({
      _id: app._id,
      status: app.status,
      message: app.message,
      createdAt: app.createdAt,
      property: {
        _id: app.property?._id,
        title: app.property?.title,
        location: app.property?.location,
        price: app.property?.price,
        currency: app.property?.currency,
      },
    }));

    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get owner's applications across properties
export const getOwnerApplications = async (req: Request, res: Response) => {
  try {
    const properties = await Property.find({ owner: req.userId }).select('_id');
    const propertyIds = properties.map((p) => p._id);

    if (propertyIds.length === 0) {
      return res.json({ data: [] });
    }

    const apps = await Application.find({ property: { $in: propertyIds } })
      .populate('tenant', 'firstName lastName email phone avatar')
      .populate('property', 'title price')
      .sort({ createdAt: -1 });

    res.json({ data: apps });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Tenant views payment options/details of property owner
export const getPropertyPaymentOptions = async (req: Request, res: Response) => {
  const { propertyId } = req.params;

  const property = await Property.findById(propertyId).populate('owner', 'firstName lastName paymentDetails email phone');
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const owner: any = property.owner;
  if (!owner) return res.status(404).json({ message: 'Owner not found' });

  res.json({
    property: {
      _id: property._id,
      title: property.title,
      price: property.price,
      currency: property.currency,
    },
    owner: {
      _id: owner._id,
      name: `${owner.firstName} ${owner.lastName}`,
      email: owner.email,
      phone: owner.phone,
      paymentDetails: owner.paymentDetails,
    },
  });
}
