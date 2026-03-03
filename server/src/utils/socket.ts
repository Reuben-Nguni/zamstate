import { Server as SocketIOServer } from 'socket.io';
import { User } from '../models/User.js';

let io: SocketIOServer | null = null;
export const connectedUsers = new Map<string, string>(); // userId -> socketId

// initialize socket server on http.Server instance
export const initSocket = (server: any) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? true
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('🟢 New user connected:', socket.id);

    // User joins specific rooms
    socket.on('join-conversation', (conversationId: string, userId: string) => {
      connectedUsers.set(userId, socket.id);
      socket.join(`conversation-${conversationId}`);
      socket.join(`user-${userId}`);
      socket.emit('connection-status', { status: 'connected' });

      // track online status in DB
      try {
        User.findByIdAndUpdate(userId, { online: true }, { new: true }).exec();
        io?.emit('user-online', { userId });
      } catch (err) {
        console.warn('Failed to mark user online:', err);
      }

      console.log(`✅ User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('send-message', (data: any) => {
      const { conversationId, message } = data;
      io?.to(`conversation-${conversationId}`).emit('receive-message', {
        ...message,
        timestamp: new Date().toISOString(),
      });
      console.log(`📨 Message sent in conversation ${conversationId}`);
    });

    socket.on('new-booking', (bookingData: any) => {
      const ownerId = bookingData.ownerId;
      if (connectedUsers.has(ownerId)) {
        io?.to(`user-${ownerId}`).emit('booking-request', bookingData);
        console.log(`🔔 Booking notification sent to owner ${ownerId}`);
      }
    });

    socket.on('typing', (data: any) => {
      const { conversationId, userId } = data;
      socket.broadcast.to(`conversation-${conversationId}`).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (data: any) => {
      const { conversationId, userId } = data;
      socket.broadcast.to(`conversation-${conversationId}`).emit('user-stop-typing', { userId });
    });

    socket.on('user-connected', async (data: any) => {
      const { userId } = data || {};
      if (!userId) return;
      connectedUsers.set(userId, socket.id);
      socket.join(`user-${userId}`);
      try {
        await User.findByIdAndUpdate(userId, { online: true }).exec();
        io?.emit('user-online', { userId });
      } catch (err) {
        console.warn('Failed to mark user online on user-connected:', err);
      }
      console.log(`🔵 user-connected event for user ${userId}`);
    });

    socket.on('disconnect', () => {
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          connectedUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        const lastSeen = new Date();
        try {
          User.findByIdAndUpdate(disconnectedUserId, { online: false, lastSeen }, { new: true }).exec();
          io?.emit('user-offline', { userId: disconnectedUserId, lastSeen: lastSeen.toISOString() });
        } catch (err) {
          console.warn('Failed to mark user offline:', err);
        }
        console.log(`🔴 User disconnected: ${socket.id} (user ${disconnectedUserId})`);
      } else {
        console.log('🔴 Socket disconnected:', socket.id);
      }
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized.');
  return io;
};
