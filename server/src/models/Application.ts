import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  property: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  message?: string;
  status: 'applied' | 'withdrawn' | 'selected' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['applied', 'withdrawn', 'selected', 'rejected'], default: 'applied' },
  },
  { timestamps: true }
);

applicationSchema.index({ property: 1, tenant: 1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
