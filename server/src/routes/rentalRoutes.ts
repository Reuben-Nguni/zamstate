import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createRental,
  getRentalsByProperty,
  getOwnerRentals,
  updateRental,
  endRental,
  deleteRental,
  getRentalSummary,
} from '../controllers/rentalController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new rental
router.post('/', createRental);

// Get all rentals for owner (across all properties)
router.get('/', getOwnerRentals);

// Get rental summary
router.get('/summary', getRentalSummary);

// Get rentals for specific property
router.get('/property/:propertyId', getRentalsByProperty);

// Update rental
router.put('/:rentalId', updateRental);

// End rental
router.put('/:rentalId/end', endRental);

// Delete rental
router.delete('/:rentalId', deleteRental);

export default router;
