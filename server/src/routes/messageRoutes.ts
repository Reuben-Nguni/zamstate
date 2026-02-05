import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getConversations,
} from '../controllers/messageController.js';

const router = Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:conversationId/messages', authenticate, getMessages);

export default router;