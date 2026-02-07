import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { User } from './models/User.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true // Allow all in production
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);

  // User joins a specific room (e.g., conversation room)
  socket.on('join-conversation', (conversationId: string, userId: string) => {
    // track socket for the user and join both conversation and personal rooms
    connectedUsers.set(userId, socket.id);
    socket.join(`conversation-${conversationId}`);
    socket.join(`user-${userId}`);
    socket.emit('connection-status', { status: 'connected' });

    // mark user as online in DB and broadcast presence
    try {
      User.findByIdAndUpdate(userId, { online: true }, { new: true }).exec();
      io.emit('user-online', { userId });
    } catch (err) {
      console.warn('Failed to mark user online:', err);
    }

    console.log(`✅ User ${userId} joined conversation ${conversationId}`);
  });

  // Send message event
  socket.on('send-message', (data: any) => {
    const { conversationId, message } = data;
    
    // Emit to all users in the conversation room
    io.to(`conversation-${conversationId}`).emit('receive-message', {
      ...message,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`📨 Message sent in conversation ${conversationId}`);
  });

  // Booking event
  socket.on('new-booking', (bookingData: any) => {
    // Notify property owner
    const ownerId = bookingData.ownerId;
    if (connectedUsers.has(ownerId)) {
      io.to(`user-${ownerId}`).emit('booking-request', bookingData);
      console.log(`🔔 Booking notification sent to owner ${ownerId}`);
    }
  });

  // User typing indicator
  socket.on('typing', (data: any) => {
    const { conversationId, userId } = data;
    socket.broadcast.to(`conversation-${conversationId}`).emit('user-typing', { userId });
  });

  // Stop typing indicator
  socket.on('stop-typing', (data: any) => {
    const { conversationId, userId } = data;
    socket.broadcast.to(`conversation-${conversationId}`).emit('user-stop-typing', { userId });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    // Remove user from connected users map
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
        io.emit('user-offline', { userId: disconnectedUserId, lastSeen: lastSeen.toISOString() });
      } catch (err) {
        console.warn('Failed to mark user offline:', err);
      }
      console.log(`🔴 User disconnected: ${socket.id} (user ${disconnectedUserId})`);
    } else {
      console.log('🔴 Socket disconnected:', socket.id);
    }
  });
});

// Middleware
// Configure CORS to allow origins from env or fallbacks
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
const allowAll = process.env.CORS_ALLOW_ALL === 'true' || process.env.NODE_ENV === 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In production or when CORS_ALLOW_ALL is set, allow all origins
    if (allowAll) {
      return callback(null, true);
    }
    
    // Otherwise check against allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Log warning but don't error - allow it anyway for production resilience
    console.warn(`CORS request from origin: ${origin}`);
    return callback(null, true); // Allow anyway in case of misconfiguration
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maintenance-requests', maintenanceRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export io for use in other modules if needed
export { io };

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✨ WebSocket (Socket.IO) server listening for real-time connections`);
  console.log(`CORS configured. allowAll=${allowAll}. allowedOrigins=${allowAll ? 'ALL' : allowedOrigins.join(',')}`);
});
