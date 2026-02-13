import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { rentalService, propertyService, userService } from '../utils/api';

interface RentalData {
  _id: string;
  property: { _id: string; title: string };
  tenant: { firstName: string; lastName: string };
  rentAmount: number;
  currency: string;
  depositAmount?: number;
  depositPaid?: boolean;
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'ended' | 'terminated';
}

interface SummaryData {
  totalActiveRentals: number;
  totalRentAmount: number;
  totalDepositsReceived: number;
  endedRentals: number;
  terminatedRentals: number;
  properties: number;
}

interface FormData {
  propertyId: string;
  tenantId: string;
  rentAmount: string;
  currency: string;
  startDate: string;
  endDate: string;
  depositAmount: string;
  depositPaid: boolean;
  notes: string;
}

const OwnerRentals: React.FC = () => {
  const [rentals, setRentals] = useState<RentalData[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalActiveRentals: 0,
    totalRentAmount: 0,
    totalDepositsReceived: 0,
    endedRentals: 0,
    terminatedRentals: 0,
    properties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'ended'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    propertyId: '',
    tenantId: '',
    rentAmount: '',
    currency: 'ZMW',
    startDate: '',
    endDate: '',
    depositAmount: '',
    depositPaid: false,
    notes: '',
  });

  // Fetch properties and rentals on mount
  useEffect(() => {
    fetchProperties();
    fetchTenants();
    fetchRentalsData();
  }, []);

  // Refetch rentals when filter changes
  useEffect(() => {
    fetchRentalsData();
  }, [filter]);

  // Fetch owner's properties
  const fetchProperties = async () => {
    try {
      const response = await propertyService.getOwnerProperties();
      setProperties(response?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch properties:', error);
    }
  };

  // Fetch available tenants
  const fetchTenants = async () => {
    try {
      const response = await userService.getTenants();
      setTenants(response?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  // Fetch rentals based on current filter
  const fetchRentalsData = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const filterParams = filter !== 'all' ? { status: filter } : {};
      
      // Get rentals list and summary in parallel for better performance
      const [rentalsRes, summaryRes] = await Promise.all([
        rentalService.getOwnerRentals(filterParams),
        rentalService.getRentalSummary(),
      ]);

      setRentals(rentalsRes?.data || []);
      setSummary(summaryRes?.summary || {});
    } catch (error: any) {
      console.error('Failed to fetch rentals:', error);
      toast.error(error?.message || 'Failed to load rentals');
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle form submission to create new rental
  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.propertyId || !formData.tenantId || !formData.rentAmount || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await rentalService.createRental({
        propertyId: formData.propertyId,
        tenantId: formData.tenantId,
        rentAmount: parseFloat(formData.rentAmount),
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : undefined,
        depositPaid: formData.depositPaid,
        notes: formData.notes,
      });
      
      toast.success('Rental created successfully');
      
      // Reset form and refresh data
      setFormData({
        propertyId: '',
        tenantId: '',
        rentAmount: '',
        currency: 'ZMW',
        startDate: '',
        endDate: '',
        depositAmount: '',
        depositPaid: false,
        notes: '',
      });
      setShowAddForm(false);
      await fetchRentalsData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create rental');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle ending an active rental
  const handleEndRental = async (rentalId: string) => {
    try {
      await rentalService.endRental(rentalId);
      toast.success('Rental ended successfully');
      await fetchRentalsData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to end rental');
    }
  };

  // Handle deleting a rental record
  const handleDelete = async (rentalId: string) => {
    if (!window.confirm('Are you sure you want to delete this rental record? This action cannot be undone.')) {
      return;
    }
    
    try {
      await rentalService.deleteRental(rentalId);
      toast.success('Rental deleted successfully');
      await fetchRentalsData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete rental');
    }
  };

  // Get badge styling based on rental status
  const getStatusBadge = (status: string): string => {
    const badgeMap: Record<string, string> = {
      active: 'bg-success',
      pending: 'bg-warning',
      ended: 'bg-secondary',
      terminated: 'bg-danger',
    };
    return badgeMap[status] || 'bg-secondary';
  };

  return (
    <div className="owner-rentals-page">
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
                <h1 className="h3 mb-1">Rental Management</h1>
                <p className="text-muted mb-0">Track and manage tenant rentals</p>
              </div>
              <button
                className="btn btn-zambia-green"
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>
                {showAddForm ? 'Cancel' : 'New Rental'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add Rental Form */}
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
                  <h5 className="card-title mb-4">Create New Rental</h5>
                  <form onSubmit={handleCreateRental}>
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

                      {/* Tenant Selection */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tenant *</label>
                        <select
                          className="form-select"
                          name="tenantId"
                          value={formData.tenantId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a tenant...</option>
                          {tenants.map(tenant => (
                            <option key={tenant._id} value={tenant._id}>
                              {tenant.firstName} {tenant.lastName} ({tenant.email})
                            </option>
                          ))}
                        </select>
                        {tenants.length === 0 && (
                          <small className="text-warning d-block mt-1">
                            <i className="fas fa-info-circle me-1"></i>
                            No tenants available. Create tenant accounts first.
                          </small>
                        )}
                      </div>

                      {/* Monthly Rent */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Monthly Rent Amount *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="rentAmount"
                          placeholder="0.00"
                          value={formData.rentAmount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Currency */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Currency</label>
                        <select
                          className="form-select"
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                        >
                          <option value="ZMW">ZMW (Zambian Kwacha)</option>
                          <option value="USD">USD (US Dollar)</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* End Date */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">End Date (Optional)</label>
                        <input
                          type="date"
                          className="form-control"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                      </div>

                      {/* Deposit Amount */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Deposit Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          name="depositAmount"
                          placeholder="0.00"
                          value={formData.depositAmount}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Deposit Paid */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">&nbsp;</label>
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="depositPaid"
                            name="depositPaid"
                            checked={formData.depositPaid}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="depositPaid">
                            Deposit received
                          </label>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          name="notes"
                          placeholder="Any additional notes..."
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
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
                              Create Rental
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

        {/* Summary Statistics Cards */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Active Rentals Card */}
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Active Rentals</h6>
                <h3 className="mb-1 text-success fw-bold">{summary.totalActiveRentals}</h3>
                <small className="text-muted">
                  <i className="fas fa-money-bill-wave me-1"></i>
                  Monthly rent: ZK {(summary.totalRentAmount || 0).toLocaleString()}
                </small>
              </div>
            </div>
          </div>

          {/* Deposits Received Card */}
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Deposits Received</h6>
                <h3 className="mb-1 text-primary fw-bold">ZK {(summary.totalDepositsReceived || 0).toLocaleString()}</h3>
                <small className="text-muted">
                  <i className="fas fa-home me-1"></i>
                  From {summary.totalActiveRentals} active rentals
                </small>
              </div>
            </div>
          </div>

          {/* Properties Rented Card */}
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Properties Rented</h6>
                <h3 className="mb-1 fw-bold">{summary.properties}</h3>
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {summary.endedRentals} ended, {summary.terminatedRentals} terminated
                </small>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="col-12">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${filter === 'active' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('active')}
                disabled={loading}
              >
                <i className="fas fa-check-circle me-1"></i>
                Active
              </button>
              <button
                type="button"
                className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('pending')}
                disabled={loading}
              >
                <i className="fas fa-clock me-1"></i>
                Pending
              </button>
              <button
                type="button"
                className={`btn ${filter === 'ended' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('ended')}
                disabled={loading}
              >
                <i className="fas fa-door-open me-1"></i>
                Ended
              </button>
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-zambia-green' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('all')}
                disabled={loading}
              >
                <i className="fas fa-list me-1"></i>
                All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-zambia-green" role="status">
              <span className="visually-hidden">Loading rentals...</span>
            </div>
            <p className="text-muted mt-3">Loading your rental data...</p>
          </div>
        ) : rentals.length === 0 ? (
          /* Empty State */
          <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body text-center py-5">
              <i className="fas fa-home fa-3x text-muted mb-3 d-block"></i>
              <h5 className="fw-semibold">No rentals found</h5>
              <p className="text-muted mb-0">Create your first rental to get started</p>
            </div>
          </motion.div>
        ) : (
          /* Rentals Grid */
          <motion.div
            className="row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {rentals.map((rental, index) => (
              <div key={rental._id} className="col-lg-6 mb-3">
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
                          <i className="fas fa-building me-2 text-zambia-green"></i>
                          {rental.property?.title}
                        </h5>
                        <p className="text-muted small mb-0">
                          <i className="fas fa-user me-1"></i>
                          {rental.tenant?.firstName} {rental.tenant?.lastName}
                        </p>
                      </div>
                      <span className={`badge ${getStatusBadge(rental.status)} ms-2`}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">Monthly Rent</small>
                        <h6 className="mb-0 text-success fw-semibold">
                          ZK {rental.rentAmount.toLocaleString()}
                        </h6>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">Deposit Status</small>
                        <h6 className={`mb-0 fw-semibold ${rental.depositPaid ? 'text-success' : 'text-danger'}`}>
                          {rental.depositPaid ? '✓ Received' : '✗ Pending'}
                        </h6>
                        {rental.depositAmount && (
                          <small className="text-muted d-block">
                            ZK {rental.depositAmount.toLocaleString()}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 pb-3 border-bottom">
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar me-1"></i>
                        Started: {new Date(rental.startDate).toLocaleDateString()}
                      </small>
                      {rental.endDate && (
                        <small className="text-muted d-block">
                          <i className="fas fa-calendar-alt me-1"></i>
                          Ends: {new Date(rental.endDate).toLocaleDateString()}
                        </small>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      {rental.status === 'active' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEndRental(rental._id)}
                          disabled={loading}
                        >
                          <i className="fas fa-door-open me-1"></i>
                          End Rental
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(rental._id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Delete Record
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

export default OwnerRentals;
