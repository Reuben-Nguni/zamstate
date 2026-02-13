import { Request, Response } from 'express';
import { Rental } from '../models/Rental.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';

// Create new rental
export const createRental = async (req: Request, res: Response) => {
  try {
    const { propertyId, tenantId, rentAmount, currency, startDate, endDate, depositAmount, lease, notes } = req.body;
    const userId = (req as any).user?.id;

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only create rentals for your own properties' });
    }

    // Verify tenant exists
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const rental = new Rental({
      property: propertyId,
      tenant: tenantId,
      owner: userId,
      rentAmount,
      currency: currency || 'ZMW',
      startDate,
      endDate,
      depositAmount,
      lease,
      notes,
      status: 'active',
    });

    await rental.save();
    await rental.populate([
      { path: 'property', select: 'title' },
      { path: 'tenant', select: 'firstName lastName email phone' },
    ]);

    res.status(201).json({ message: 'Rental created successfully', data: rental });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get rentals for a property
export const getRentalsByProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { status } = req.query;
    const userId = (req as any).user?.id;

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only view rentals for your own properties' });
    }

    const filter: any = { property: propertyId };
    if (status) filter.status = status;

    const rentals = await Rental.find(filter)
      .populate('property', 'title')
      .populate('tenant', 'firstName lastName email phone')
      .sort('-startDate');

    res.json({ data: rentals });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all rentals for owner (across all properties)
export const getOwnerRentals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { status } = req.query;

    const filter: any = { owner: userId };
    if (status) filter.status = status;

    const rentals = await Rental.find(filter)
      .populate('property', 'title location')
      .populate('tenant', 'firstName lastName email phone')
      .sort('-startDate');

    // Count by status
    const statusCount = {
      active: rentals.filter(r => r.status === 'active').length,
      pending: rentals.filter(r => r.status === 'pending').length,
      ended: rentals.filter(r => r.status === 'ended').length,
      terminated: rentals.filter(r => r.status === 'terminated').length,
    };

    res.json({ data: rentals, statusCount });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update rental
export const updateRental = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const userId = (req as any).user?.id;
    const { rentAmount, currency, endDate, depositAmount, depositPaid, status, lease, notes } = req.body;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own rentals' });
    }

    // Update fields
    if (rentAmount !== undefined) rental.rentAmount = rentAmount;
    if (currency) rental.currency = currency;
    if (endDate) rental.endDate = endDate;
    if (depositAmount !== undefined) rental.depositAmount = depositAmount;
    if (depositPaid !== undefined) rental.depositPaid = depositPaid;
    if (status) rental.status = status;
    if (lease) rental.lease = lease;
    if (notes) rental.notes = notes;

    await rental.save();
    await rental.populate([
      { path: 'property', select: 'title' },
      { path: 'tenant', select: 'firstName lastName email phone' },
    ]);

    res.json({ message: 'Rental updated successfully', data: rental });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// End rental
export const endRental = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const { depositRefundedDate } = req.body;
    const userId = (req as any).user?.id;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only end your own rentals' });
    }

    rental.status = 'ended';
    if (depositRefundedDate) {
      rental.depositRefundedDate = new Date(depositRefundedDate);
    }

    await rental.save();

    res.json({ message: 'Rental ended successfully', data: rental });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete rental
export const deleteRental = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const userId = (req as any).user?.id;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own rentals' });
    }

    await Rental.findByIdAndDelete(rentalId);

    res.json({ message: 'Rental deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get rental summary
export const getRentalSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const rentals = await Rental.find({ owner: userId })
      .populate('property', 'title')
      .populate('tenant', 'firstName lastName');

    const summary = {
      totalActiveRentals: rentals.filter(r => r.status === 'active').length,
      totalRentAmount: rentals
        .filter(r => r.status === 'active')
        .reduce((sum, r) => sum + r.rentAmount, 0),
      totalDepositsReceived: rentals
        .filter(r => r.depositPaid)
        .reduce((sum, r) => sum + (r.depositAmount || 0), 0),
      endedRentals: rentals.filter(r => r.status === 'ended').length,
      terminatedRentals: rentals.filter(r => r.status === 'terminated').length,
      properties: Array.from(new Set(rentals.map(r => r.property._id.toString()))).length,
    };

    res.json({ data: rentals, summary });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
