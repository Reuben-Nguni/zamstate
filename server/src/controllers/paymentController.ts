import { Request, Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import PaymentGateway from '../services/paymentGateway.js';
import fs from 'fs';
import mongoose from 'mongoose';

// Tenant submits a payment request/proof
export const createPayment = async (req: Request, res: Response) => {
  const {
    propertyId,
    amount,
    currency,
    method,
    reference,
    mobileProvider,
    phoneNumber,
    bankName,
    accountNumber,
    accountHolderName,
  } = req.body;

  // accept proofUrl or file uploaded via multer
  let proofUrl = (req as any).body?.proofUrl || null;

  // if multer stored a file, upload to cloudinary
  const file: any = (req as any).file;
  if (file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'zamstate/payments',
        resource_type: 'auto',
      });
      proofUrl = result.secure_url;
    } catch (e) {
      console.warn('payment proof upload failed', e);
    }
    try {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (_e) {
      // ignore
    }
  }

  // Validate required fields
  if (!propertyId || !amount || !method) {
    return res.status(400).json({ message: 'propertyId, amount and method are required' });
  }

  // Get property to verify ownership
  const property = await Property.findById(propertyId);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  const ownerId = property.owner;

  // Build payment object with all details
  const paymentData: any = {
    property: property._id,
    owner: ownerId,
    tenant: req.userId,
    amount,
    currency: currency || 'ZMW',
    method,
    reference,
    proofUrl,
    testMode: false,
    audit: [{ action: 'submitted', by: req.userId || null }],
  };

  // Store mobile money details if provided
  if (method === 'mobile-money') {
    paymentData.mobileProvider = mobileProvider;
    paymentData.phoneNumber = phoneNumber;
  }

  // Store bank transfer details if provided
  if (method === 'bank-transfer') {
    paymentData.bankName = bankName;
    paymentData.accountNumber = accountNumber;
    paymentData.accountHolderName = accountHolderName;
  }

  const payment = new Payment(paymentData);

  console.log('[PaymentController] creating payment', {
    property: propertyId,
    tenant: req.userId,
    owner: ownerId,
    amount,
    currency,
    method,
    testMode: false,
  });

  await payment.save();

  console.log('[PaymentController] payment saved id=', payment._id);

  // TODO: emit socket event to owner, send email notification

  res.status(201).json({ message: 'Payment submitted', payment });
};

// Get payments for owner or tenant
export const getPayments = async (req: Request, res: Response) => {
  const { propertyId, status, paymentId } = req.query;
  const filters: any = {};

  // Role-based filtering
  if (req.user && req.user.role === 'owner') {
    filters.owner = req.userId;
  }
  if (req.user && req.user.role === 'tenant') {
    filters.tenant = req.userId;
  }

  // Additional filters
  if (propertyId) filters.property = propertyId;
  if (status) filters.status = status;
  if (paymentId) filters._id = paymentId;

  try {
    const payments = await Payment.find(filters)
      .sort({ createdAt: -1 })
      .populate('tenant', 'firstName lastName email phone avatar role')
      .populate('owner', 'firstName lastName email phone avatar role')
      .populate('property', 'title price location')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('audit.by', 'firstName lastName email')
      .exec();

    console.log('[PaymentController] fetched payments', {
      count: payments.length,
      role: req.user?.role,
      filters,
    });

    res.json({ data: payments });
  } catch (error: any) {
    console.error('[PaymentController] fetch payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

// Owner verifies (approve/reject) a payment
export const verifyPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  // Only property owner can verify
  const property = await Property.findById(payment.property);
  if (!property) return res.status(404).json({ message: 'Property not found' });

  if (String(property.owner) !== String(req.userId) && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to verify this payment' });
  }

  // Update payment status
  payment.status = status as any;
  payment.verifiedAt = new Date();
  payment.verifiedBy = new mongoose.Types.ObjectId(req.userId);
  if (note) {
    payment.verificationNotes = note;
  }

  // Add audit entry
  payment.audit.push({
    action: status,
    by: req.userId || null,
    note: note || `Payment ${status} by owner`,
    at: new Date(),
  } as any);

  await payment.save();

  console.log('[PaymentController] Payment verified', {
    paymentId: payment._id,
    status,
    verifiedBy: req.userId,
  });

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

// Process sandbox/test payment
export const processSandboxPayment = async (req: Request, res: Response) => {
  const { paymentId, amount, currency, method, provider, phone, accountNumber, bankName, accountHolderName, reference } = req.body;

  // Validate amount
  const amountCheck = PaymentGateway.validateAmount(amount);
  if (!amountCheck.valid) {
    return res.status(400).json({ message: amountCheck.message });
  }

  // Validate currency
  const currencyCheck = PaymentGateway.validateCurrency(currency);
  if (!currencyCheck.valid) {
    return res.status(400).json({ message: currencyCheck.message });
  }

  try {
    // Process payment through sandbox
    const paymentResponse = await PaymentGateway.processPayment({
      paymentId,
      amount,
      currency,
      method,
      provider,
      phone,
      reference,
      accountHolderName,
      accountNumber,
      bankName,
    });

    // Update the payment record with all details and mark as processed
    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Update payment with all collected details
      payment.amount = amount;
      payment.currency = currency;
      payment.method = method;
      payment.reference = paymentResponse.transactionId;
      payment.testMode = true;
      payment.transactionId = paymentResponse.transactionId;

      // Store method-specific details
      if (method === 'mobile-money') {
        payment.mobileProvider = provider as any;
        payment.phoneNumber = phone;
      } else if (method === 'bank-transfer') {
        payment.bankName = bankName;
        payment.accountNumber = accountNumber;
        payment.accountHolderName = accountHolderName;
      }

      // Auto-approve sandbox payments
      if (paymentResponse.success) {
        payment.status = 'approved';
        payment.verifiedAt = new Date();
        payment.verifiedBy = new mongoose.Types.ObjectId(req.userId);
      }

      // Add audit entry
      payment.audit.push({
        action: 'sandbox-processed',
        by: req.userId || null,
        note: paymentResponse.message,
        at: new Date(),
      } as any);

      // Save updated payment
      await payment.save();

      console.log('[PaymentController] Sandbox payment processed', {
        paymentId: payment._id,
        transactionId: paymentResponse.transactionId,
        status: payment.status,
        testMode: true,
      });
    }

    res.status(200).json({
      success: paymentResponse.success,
      transactionId: paymentResponse.transactionId,
      status: paymentResponse.status,
      message: paymentResponse.message,
      testMode: paymentResponse.testMode,
    });
  } catch (error: any) {
    console.error('[PaymentController] Sandbox payment error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// Get test payment providers (for UI reference)
export const getTestProviders = async (req: Request, res: Response) => {
  try {
    const providers = PaymentGateway.getTestProviders();
    res.json(providers);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch providers', error: error.message });
  }
};

