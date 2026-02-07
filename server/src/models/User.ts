import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['tenant', 'owner', 'agent', 'investor', 'admin'],
      default: 'tenant',
    },
    avatar: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    bio: String,
    verified_at: Date,
    online: {
      type: Boolean,
      default: false,
    },
    lastSeen: Date,
  },
  { timestamps: true }
);

export const User = model('User', userSchema);
