import mongoose, { Schema, Document } from 'mongoose';

export interface IRental extends Document {
  property: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  rentAmount: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'pending' | 'ended' | 'terminated';
  lease?: string; // URL to lease document
  depositAmount?: number;
  depositPaid: boolean;
  depositRefundedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rentalSchema = new Schema<IRental>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      description: 'The property being rented',
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'The tenant renting the property',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'The property owner',
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
      description: 'Monthly rent amount',
    },
    currency: {
      type: String,
      default: 'ZMW',
      enum: ['ZMW', 'USD'],
      description: 'Rent currency',
    },
    startDate: {
      type: Date,
      required: true,
      description: 'When the tenant moved in',
    },
    endDate: {
      type: Date,
      description: 'When the tenant is expected to move out (lease end date)',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'ended', 'terminated'],
      default: 'active',
      required: true,
      description: 'Current status of the rental',
    },
    lease: {
      type: String,
      description: 'URL to lease agreement document',
    },
    depositAmount: {
      type: Number,
      min: 0,
      description: 'Security deposit amount',
    },
    depositPaid: {
      type: Boolean,
      default: false,
      description: 'Whether the deposit has been received',
    },
    depositRefundedDate: {
      type: Date,
      description: 'Date when deposit was refunded to tenant',
    },
    notes: {
      type: String,
      description: 'Additional notes about the rental',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
rentalSchema.index({ property: 1, owner: 1 });
rentalSchema.index({ tenant: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ startDate: -1 });

export const Rental = mongoose.model<IRental>('Rental', rentalSchema);
