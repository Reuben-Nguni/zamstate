import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure CORS to allow origins from env or fallbacks
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'http://localhost:5174'];
const allowAll = process.env.CORS_ALLOW_ALL === 'true';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow non-browser requests like curl, server-to-server
      return callback(null, true);
    }
    if (allowAll) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
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
app.use('/api/maintenance-requests', maintenanceRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`CORS configured. allowAll=${allowAll}. allowedOrigins=${allowAll ? 'ALL' : allowedOrigins.join(',')}`);
});
