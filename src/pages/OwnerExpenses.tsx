import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { expenseService, propertyService } from '../utils/api';

interface ExpenseData {
  _id: string;
  property: { _id: string; title: string };
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  dueDate?: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
}

interface FormData {
  propertyId: string;
  title: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  dueDate: string;
  notes: string;
}

interface StatsData {
  total: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'property-tax', label: 'Property Tax' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
];

const OwnerExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    propertyId: '',
    title: '',
    description: '',
    amount: '',
    category: 'maintenance',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  // Fetch properties and expenses on mount
  useEffect(() => {
    fetchProperties();
    fetchExpenses();
  }, []);

  // Refetch expenses when filters change
  useEffect(() => {
    fetchExpenses();
  }, [filter, categoryFilter]);

  // Fetch owner's properties
  const fetchProperties = async () => {
    try {
      const response = await propertyService.getOwnerProperties();
      setProperties(response?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (filter !== 'all') {
        filterParams.isPaid = filter === 'paid';
      }
      if (categoryFilter) {
        filterParams.category = categoryFilter;
      }

      const response = await expenseService.getOwnerExpenses(filterParams);
      setExpenses(response?.data || []);
      setStats(response?.stats || {});
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      toast.error(error?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission to create new expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.propertyId || !formData.title || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await expenseService.createExpense({
        propertyId: formData.propertyId,
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes,
      });
      
      toast.success('Expense created successfully');
      
      // Reset form and refresh data
      setFormData({
        propertyId: '',
        title: '',
        description: '',
        amount: '',
        category: 'maintenance',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      });
      setShowAddForm(false);
      await fetchExpenses();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (expenseId: string) => {
    try {
      await expenseService.markExpenseAsPaid(expenseId);
      toast.success('Expense marked as paid');
      fetchExpenses();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark as paid');
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(expenseId);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete expense');
    }
  };

  const getCategoryBadge = (category: string): string => {
    const badgeMap: Record<string, string> = {
      maintenance: 'bg-info',
      utilities: 'bg-primary',
      repairs: 'bg-warning',
      'property-tax': 'bg-danger',
      insurance: 'bg-success',
      cleaning: 'bg-secondary',
      other: 'bg-dark',
    };
    return badgeMap[category] || 'bg-secondary';
  };

  const getCategoryLabel = (category: string): string => {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div className="owner-expenses-page">
      <div className="container-fluid py-4">
        {/* Header Section */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">Expense Management</h1>
                <p className="text-muted mb-0">Track and manage property expenses</p>
              </div>
              <button
                className="btn btn-zambia-green"
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                {showAddForm ? 'Cancel' : 'New Expense'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add Expense Form */}
        {showAddForm && (
          <motion.div
            className="row mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="col-12">
              <div className="card border-0 shadow-sm bg-light">
                <div className="card-body">
                  <h5 className="card-title mb-4">Create New Expense</h5>
                  <form onSubmit={handleCreateExpense}>
                    <div className="row">
                      {/* Property Selection */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Property *</label>
                        <select
                          className="form-select"
                          name="propertyId"
                          value={formData.propertyId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a property...</option>
                          {properties.map(prop => (
                            <option key={prop._id} value={prop._id}>
                              {prop.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          {EXPENSE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Expense Title */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Expense Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          placeholder="e.g., Plumbing repair"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Amount */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Amount (ZMW) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="amount"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Date */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Due Date */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Due Date (Optional)</label>
                        <input
                          type="date"
                          className="form-control"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Description */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          placeholder="Expense details..."
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>

                      {/* Notes */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          name="notes"
                          placeholder="Additional notes..."
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={2}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-zambia-green"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Create Expense
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Stats */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Total Expenses</h6>
                <h3 className="mb-1">ZK {(stats.totalAmount || 0).toLocaleString()}</h3>
                <small className="text-muted">{stats.total} expenses</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Paid</h6>
                <h3 className="mb-1 text-success">ZK {(stats.paidAmount || 0).toLocaleString()}</h3>
                <small className="text-muted">Completed</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Unpaid</h6>
                <h3 className="mb-1 text-danger">ZK {(stats.unpaidAmount || 0).toLocaleString()}</h3>
                <small className="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-1">Count</h6>
                <h3 className="mb-1">{stats.total}</h3>
                <small className="text-muted">Total records</small>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="col-md-4 mb-3">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${filter === 'all' ? 'btn-zambia-green' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('all')}
                disabled={loading}
              >
                <i className="fas fa-list me-1"></i>
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'paid' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('paid')}
                disabled={loading}
              >
                <i className="fas fa-check me-1"></i>
                Paid
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filter === 'unpaid' ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('unpaid')}
                disabled={loading}
              >
                <i className="fas fa-hourglass me-1"></i>
                Unpaid
              </button>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={loading}
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-zambia-green" role="status">
              <span className="visually-hidden">Loading expenses...</span>
            </div>
            <p className="text-muted mt-3">Loading your expense data...</p>
          </div>
        ) : expenses.length === 0 ? (
          /* Empty State */
          <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body text-center py-5">
              <i className="fas fa-file-invoice-dollar fa-3x text-muted mb-3 d-block"></i>
              <h5 className="fw-semibold">No expenses found</h5>
              <p className="text-muted mb-0">Create your first expense to get started</p>
            </div>
          </motion.div>
        ) : (
          /* Expenses Grid */
          <motion.div
            className="row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {expenses.map((expense, index) => (
              <div key={expense._id} className="col-lg-6 mb-3">
                <motion.div
                  className="card border-0 shadow-sm h-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1">
                          <i className="fas fa-receipt me-2 text-zambia-green"></i>
                          {expense.title}
                        </h5>
                        <p className="text-muted small mb-0">
                          <i className="fas fa-building me-1"></i>
                          {expense.property?.title}
                        </p>
                      </div>
                      <span className={`badge ${getCategoryBadge(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </div>

                    {expense.description && (
                      <p className="text-muted small mb-3">{expense.description}</p>
                    )}

                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">Amount</small>
                        <h6 className="mb-0 text-success fw-semibold">
                          ZK {expense.amount.toLocaleString()}
                        </h6>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Status</small>
                        <h6 className={`mb-0 fw-semibold ${expense.isPaid ? 'text-success' : 'text-danger'}`}>
                          {expense.isPaid ? '✓ Paid' : '✗ Unpaid'}
                        </h6>
                      </div>
                    </div>

                    <div className="mb-3 pb-3 border-bottom">
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar me-1"></i>
                        Date: {new Date(expense.date).toLocaleDateString()}
                      </small>
                      {expense.dueDate && (
                        <small className="text-muted d-block">
                          <i className="fas fa-calendar-check me-1"></i>
                          Due: {new Date(expense.dueDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      {!expense.isPaid && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleMarkPaid(expense._id)}
                          disabled={loading}
                        >
                          <i className="fas fa-check me-1"></i>
                          Mark as Paid
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(expense._id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OwnerExpenses;
