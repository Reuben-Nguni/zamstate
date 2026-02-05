import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { MaintenanceRequest } from '../models/MaintenanceRequest.js';

const router = express.Router();

// Get all maintenance requests for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'tenant') {
      filter = { tenant: userId };
    } else if (userRole === 'owner' || userRole === 'agent') {
      // Owners and agents can see requests for their properties
      filter = { 'property.owner': userId };
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate('property', 'title address')
      .populate('tenant', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single maintenance request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('property', 'title address')
      .populate('tenant', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create maintenance request
router.post('/', authenticate, async (req, res) => {
    try {
      const { property, title, description, priority, category } = req.body;
      const tenant = req.user.id;

      const request = new MaintenanceRequest({
        property,
        tenant,
        title,
        description,
        priority: priority || 'medium',
        category,
      });

      await request.save();
      await request.populate('property', 'title address');
      await request.populate('tenant', 'firstName lastName email');

      res.status(201).json({ request });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update maintenance request
router.put('/:id', authenticate, async (req, res) => {
    try {
      const request = await MaintenanceRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: 'Maintenance request not found' });
      }

      // Only allow updates by owner/agent or assigned person
      if (req.user.role !== 'owner' && req.user.role !== 'agent' && request.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updates = req.body;
      Object.assign(request, updates);

      if (updates.status === 'completed') {
        request.completedAt = new Date();
      }

      await request.save();
      await request.populate('property', 'title address');
      await request.populate('tenant', 'firstName lastName email');
      await request.populate('assignedTo', 'firstName lastName');

      res.json({ request });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete maintenance request
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Only tenant who created it can delete
    if (request.tenant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Maintenance request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;