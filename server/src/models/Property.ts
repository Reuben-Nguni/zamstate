import { Schema, model, Types } from 'mongoose';

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ZMW', 'USD'],
      default: 'ZMW',
    },
    type: {
      type: String,
      enum: ['apartment', 'house', 'office', 'land', 'commercial'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'sold', 'maintenance'],
      default: 'available',
    },
    location: {
      address: String,
      township: String,
      city: String,
      province: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    features: {
      bedrooms: Number,
      bathrooms: Number,
      area: Number,
      parking: Boolean,
      furnished: Boolean,
      petsAllowed: Boolean,
      utilities: [String],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    videos: [
      {
        url: String,
        publicId: String,
      },
    ],
    floorPlans: [
      {
        url: String,
        publicId: String,
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    currentTenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Property = model('Property', propertySchema);
