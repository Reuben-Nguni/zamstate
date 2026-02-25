import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  property: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash' | 'mobile-money' | 'bank-transfer' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reference?: string;
  proofUrl?: string;
  audit: Array<{ action: string; by: mongoose.Types.ObjectId | null; note?: string; at: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'ZMW' },
    method: { type: String, enum: ['cash', 'mobile-money', 'bank-transfer', 'other'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reference: { type: String },
    proofUrl: { type: String },
    audit: [
      {
        action: { type: String, required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

paymentSchema.index({ property: 1, owner: 1, tenant: 1, status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
