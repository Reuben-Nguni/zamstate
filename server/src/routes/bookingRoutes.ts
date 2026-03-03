import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Property } from '../models/Property.js';
import { getIO } from '../utils/socket.js';

const router = express.Router();

// Get all bookings for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'tenant') {
      filter = { tenant: userId };
    } else if (userRole === 'owner' || userRole === 'agent') {
      // Owners and agents can see bookings for their properties
      filter = { 'property.owner': userId };
    }

    const bookings = await Booking.find(filter)
      .populate('property', 'title address images')
      .populate('tenant', 'firstName lastName email phone')
      .populate('agent', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title address images')
      .populate('tenant', 'firstName lastName email phone')
      .populate('agent', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', authenticate, async (req, res) => {
    try {
      const { property, date, time, notes } = req.body;
      const tenant = req.user.id;

      const booking = new Booking({
        property,
        tenant,
        date,
        time,
        notes,
      });

      await booking.save();
      await booking.populate('property', 'title address images owner');
      await booking.populate('tenant', 'firstName lastName email phone');

      // Emit socket event to all connected users (booking created)
      const io = getIO();
      io.emit('new-booking-created', booking);
      console.log('📘 Socket: new-booking-created event emitted');

      // Also notify the property owner
      const propertyOwner = (booking.property as any)?.owner;
      if (propertyOwner) {
        io.to(`user-${propertyOwner}`).emit('booking-request', {
          bookingId: booking._id,
          property: booking.property,
          tenant: booking.tenant,
          date,
          time,
        });
        console.log(`📘 Socket: booking-request sent to owner ${propertyOwner}`);
      }

      res.status(201).json({ booking });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update booking
router.put('/:id', authenticate, async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Only allow updates by owner/agent or the tenant
      if (req.user.role !== 'owner' && req.user.role !== 'agent' && booking.tenant.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updates = req.body;
      const oldStatus = booking.status;
      Object.assign(booking, updates);

      await booking.save();
      await booking.populate('property', 'title address images');
      await booking.populate('tenant', 'firstName lastName email phone');
      await booking.populate('agent', 'firstName lastName email phone');

      // Emit socket event if status changed
      if (oldStatus !== booking.status) {
        const io = getIO();
        io.emit('booking-status-updated', {
          bookingId: booking._id,
          status: booking.status,
          oldStatus,
        });
        console.log(`📘 Socket: booking-status-updated - ${oldStatus} -> ${booking.status}`);
      }

      res.json({ booking });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only tenant who created it can delete
    if (booking.tenant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;