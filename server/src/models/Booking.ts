import { Schema, model } from 'mongoose';

const bookingSchema = new Schema(
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
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    time: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: String,
  },
  { timestamps: true }
);

export const Booking = model('Booking', bookingSchema);
