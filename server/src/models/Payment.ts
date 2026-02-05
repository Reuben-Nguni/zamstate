import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ZMW', 'USD'],
      default: 'ZMW',
    },
    type: {
      type: String,
      enum: ['rent', 'deposit', 'commission', 'maintenance', 'other'],
      required: true,
    },
    method: {
      type: String,
      enum: ['mobile_money', 'bank_transfer', 'card', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    reference: String,
    description: String,
    payer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    maintenance: {
      type: Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
    },
    completedAt: Date,
  },
  { timestamps: true }
);

export const Payment = model('Payment', paymentSchema);
