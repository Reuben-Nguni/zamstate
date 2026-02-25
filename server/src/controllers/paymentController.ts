import { Request, Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';

// Tenant submits a payment request/proof
export const createPayment = async (req: Request, res: Response) => {
  const { propertyId, amount, currency, method, reference } = req.body;
  const proofUrl = (req as any).body?.proofUrl || null; // accept proofUrl or file handling elsewhere

  if (!propertyId || !amount || !method) {
    return res.status(400).json({ message: 'propertyId, amount and method are required' });
  }

  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const ownerId = property.owner;

  const payment = new Payment({
    property: property._id,
    owner: ownerId,
    tenant: req.userId,
    amount,
    currency: currency || 'ZMW',
    method,
    reference,
    proofUrl,
    audit: [{ action: 'submitted', by: req.userId || null }],
  });

  await payment.save();

  // TODO: emit socket event to owner, send email notification

  res.status(201).json({ message: 'Payment submitted', payment });
};

// Get payments for owner or tenant
export const getPayments = async (req: Request, res: Response) => {
  const { propertyId, status } = req.query;
  const filters: any = {};
  if (req.user && req.user.role === 'owner') {
    filters.owner = req.userId;
  }
  if (req.user && req.user.role === 'tenant') {
    filters.tenant = req.userId;
  }
  if (propertyId) filters.property = propertyId;
  if (status) filters.status = status;

  const payments = await Payment.find(filters).sort({ createdAt: -1 }).populate('tenant', 'firstName lastName email').populate('owner', 'firstName lastName email').exec();
  res.json({ data: payments });
};

// Owner verifies (approve/reject) a payment
export const verifyPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  // Only property owner can verify
  const property = await Property.findById(payment.property);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  if (String(property.owner) !== String(req.userId) && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to verify this payment' });
  }

  payment.status = status as any;
  payment.audit.push({ action: status, by: req.userId || null, note, at: new Date() } as any);
  await payment.save();

  // TODO: notify tenant via socket/email

  res.json({ message: `Payment ${status}`, payment });
};

// Get audit for a payment
export const getPaymentAudit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = await Payment.findById(id).select('audit');
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json({ audit: payment.audit || [] });
};
