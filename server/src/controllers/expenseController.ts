import { Request, Response } from 'express';
import { Expense } from '../models/Expense.js';
import { Property } from '../models/Property.js';

// Create new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { propertyId, title, description, amount, category, date, dueDate, notes, receipt } = req.body;
    const userId = (req as any).user?.id;

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only add expenses to your own properties' });
    }

    const expense = new Expense({
      property: propertyId,
      owner: userId,
      title,
      description,
      amount,
      category,
      date: date || new Date(),
      dueDate,
      notes,
      receipt,
    });

    await expense.save();
    await expense.populate('property', 'title');

    res.status(201).json({ message: 'Expense created successfully', data: expense });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get expenses for a property
export const getExpensesByProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { category, isPaid, sortBy = '-date' } = req.query;
    const userId = (req as any).user?.id;

    // Verify property ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only view expenses for your own properties' });
    }

    // Build filter
    const filter: any = { property: propertyId };
    if (category) filter.category = category;
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';

    const expenses = await Expense.find(filter)
      .populate('property', 'title')
      .sort(sortBy as string);

    // Calculate totals
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
    const unpaidAmount = expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

    res.json({
      data: expenses,
      stats: {
        total: expenses.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses for owner (across all properties)
export const getOwnerExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { category, isPaid, sortBy = '-date' } = req.query;

    // Build filter
    const filter: any = { owner: userId };
    if (category) filter.category = category;
    if (isPaid !== undefined) filter.isPaid = isPaid === 'true';

    const expenses = await Expense.find(filter)
      .populate('property', 'title')
      .populate('owner', 'firstName lastName')
      .sort(sortBy as string);

    // Calculate totals
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidAmount = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
    const unpaidAmount = expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

    res.json({
      data: expenses,
      stats: {
        total: expenses.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const userId = (req as any).user?.id;
    const { title, description, amount, category, date, dueDate, isPaid, paidDate, paymentMethod, notes, receipt } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own expenses' });
    }

    // Update fields
    if (title) expense.title = title;
    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = amount;
    if (category) expense.category = category;
    if (date) expense.date = date;
    if (dueDate) expense.dueDate = dueDate;
    if (isPaid !== undefined) {
      expense.isPaid = isPaid;
      if (isPaid && !expense.paidDate) {
        expense.paidDate = new Date();
      }
    }
    if (paidDate) expense.paidDate = paidDate;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (notes) expense.notes = notes;
    if (receipt) expense.receipt = receipt;

    await expense.save();
    await expense.populate('property', 'title');

    res.json({ message: 'Expense updated successfully', data: expense });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark expense as paid
export const markExpenseAsPaid = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const { paymentMethod } = req.body;
    const userId = (req as any).user?.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only mark your own expenses as paid' });
    }

    expense.isPaid = true;
    expense.paidDate = new Date();
    if (paymentMethod) expense.paymentMethod = paymentMethod;

    await expense.save();

    res.json({ message: 'Expense marked as paid', data: expense });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const userId = (req as any).user?.id;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own expenses' });
    }

    await Expense.findByIdAndDelete(expenseId);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get expense summary/analytics
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { month, year } = req.query;

    // Build date filter if month/year provided
    const filter: any = { owner: userId };
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(filter);

    // Group by category
    const byCategory: any = {};
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = { total: 0, count: 0, paid: 0, unpaid: 0 };
      }
      byCategory[exp.category].total += exp.amount;
      byCategory[exp.category].count += 1;
      if (exp.isPaid) {
        byCategory[exp.category].paid += exp.amount;
      } else {
        byCategory[exp.category].unpaid += exp.amount;
      }
    });

    res.json({
      summary: {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
        paidAmount: expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0),
        unpaidAmount: expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0),
        byCategory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
