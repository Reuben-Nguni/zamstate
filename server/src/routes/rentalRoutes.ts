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

// Get rental summary (must be BEFORE :rentalId route to avoid route conflicts)
router.get('/summary', getRentalSummary);

// Get rentals for specific property (must be BEFORE :rentalId route)
router.get('/property/:propertyId', getRentalsByProperty);

// Get all rentals for owner (across all properties)
router.get('/', getOwnerRentals);

// Update rental
router.put('/:rentalId', updateRental);

// End rental
router.put('/:rentalId/end', endRental);

// Delete rental
router.delete('/:rentalId', deleteRental);

export default router;
