import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createExpense,
  getExpensesByProperty,
  getOwnerExpenses,
  updateExpense,
  markExpenseAsPaid,
  deleteExpense,
  getExpenseSummary,
} from '../controllers/expenseController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new expense
router.post('/', createExpense);

// Get expense summary/analytics (must be BEFORE :expenseId route to avoid conflicts)
router.get('/summary', getExpenseSummary);

// Get expenses for specific property (must be BEFORE :expenseId route)
router.get('/property/:propertyId', getExpensesByProperty);

// Get all expenses for owner (across all properties)
router.get('/', getOwnerExpenses);

// Update expense
router.put('/:expenseId', updateExpense);

// Mark expense as paid
router.put('/:expenseId/pay', markExpenseAsPaid);

// Delete expense
router.delete('/:expenseId', deleteExpense);

export default router;
