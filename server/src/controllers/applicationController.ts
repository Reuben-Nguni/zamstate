import { Request, Response } from 'express';
import { Application } from '../models/Application.js';
import { Property } from '../models/Property.js';

export const applyToProperty = async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const { message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const existing = await Application.findOne({ property: propertyId, tenant: req.userId });
  if (existing) return res.status(400).json({ message: 'Already applied' });

  const app = new Application({ property: propertyId, tenant: req.userId, message });
  await app.save();

  // TODO: notify owner

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

  // TODO: create booking or mark tenant selected, notify tenant

  res.json({ message: 'Applicant selected', application: app });
};
