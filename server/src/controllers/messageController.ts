import { Request, Response } from 'express';
import { Message, Conversation } from '../models/Message.js';
import { User } from '../models/User.js';
import emailServiceModule from '../services/emailService.js';
const emailService = emailServiceModule;

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { recipientId, propertyId, content } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
      property: propertyId,
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        property: propertyId,
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: req.userId,
      content,
    });

    await message.save();
    await message.populate('sender');

    // Send email notification to recipient about new inquiry/message
    try {
      const recipient = await User.findById(recipientId);
      if (recipient && recipient.email) {
        const sender: any = message.sender;
        const inquiry = { name: sender.firstName || 'User', email: sender.email || '', message: content };
        await emailService.sendPropertyInquiryEmail(recipient.email, inquiry);
      }
    } catch (err) {
      console.error('[MessageController] failed to send inquiry email', err);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('sender')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate('participants', 'firstName lastName email')
      .populate('property', 'title')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};