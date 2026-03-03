import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  property: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  amount: number;
  currency: 'ZMW' | 'USD';
  method: 'cash' | 'mobile-money' | 'bank-transfer';
  status: 'pending' | 'approved' | 'rejected';
  reference?: string;
  proofUrl?: string;
  
  // Mobile Money Details
  mobileProvider?: 'mtn' | 'airtel' | 'zamtel';
  phoneNumber?: string;
  
  // Bank Transfer Details
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  
  // Verification
  verifiedAt?: Date;
  verificationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // Tracking
  testMode: boolean;
  transactionId?: string;
  
  audit: Array<{
    action: string;
    by: mongoose.Types.ObjectId | null;
    note?: string;
    at: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['ZMW', 'USD'], default: 'ZMW' },
    method: { type: String, enum: ['cash', 'mobile-money', 'bank-transfer'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reference: { type: String },
    proofUrl: { type: String },
    
    // Mobile Money Details
    mobileProvider: { type: String, enum: ['mtn', 'airtel', 'zamtel'] },
    phoneNumber: { type: String },
    
    // Bank Transfer Details
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    
    // Verification
    verifiedAt: { type: Date },
    verificationNotes: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Tracking
    testMode: { type: Boolean, default: false },
    transactionId: { type: String },
    
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
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
