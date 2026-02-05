import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'file'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        publicId: String,
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export const Message = model('Message', messageSchema);

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

export const Conversation = model('Conversation', conversationSchema);
