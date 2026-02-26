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

  // TODO: notify owner (e.g. send email or socket event)

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

  res.json({ message: 'Applicant selected', application: app });
};
