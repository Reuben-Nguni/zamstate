import { Schema, model } from 'mongoose';

const maintenanceRequestSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    category: String,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    estimatedCost: Number,
    actualCost: Number,
    completedAt: Date,
  },
  { timestamps: true }
);

export const MaintenanceRequest = model('MaintenanceRequest', maintenanceRequestSchema);
