import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

interface BookingModalProps {
  propertyId?: string;
  propertyTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ propertyId: initialPropertyId, propertyTitle: initialPropertyTitle, onClose, onSuccess }) => {
  const [propertyId, setPropertyId] = useState(initialPropertyId || '');
  const [propertyTitle, setPropertyTitle] = useState(initialPropertyTitle || '');
  const [properties, setProperties] = useState<any[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(!initialPropertyId);

  useEffect(() => {
    if (!initialPropertyId) {
      // Fetch available properties
      const fetchProperties = async () => {
        try {
          const response = await apiClient('/properties');
          setProperties(response.properties || []);
        } catch (err) {
          console.warn('Failed to fetch properties:', err);
        } finally {
          setLoadingProperties(false);
        }
      };
      fetchProperties();
    }
  }, [initialPropertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    if (!propertyId) {
      toast.error('Please select a property');
      return;
    }

    try {
      setLoading(true);
      const bookingDate = new Date(date);
      bookingDate.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]));

      await apiClient('/bookings', {
        method: 'POST',
        body: {
          property: propertyId,
          date: bookingDate.toISOString(),
          time,
          notes,
        },
      });

      toast.success('Booking request sent! The owner will confirm shortly.');
      setDate('');
      setTime('10:00');
      setNotes('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setPropertyId(selectedId);
    
    const selected = properties.find(p => p._id === selectedId);
    if (selected) {
      setPropertyTitle(selected.title);
    }
  };

  return (
    <motion.div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title">
              <i className="fas fa-calendar-plus me-2 text-zambia-green"></i>
              Book a Viewing
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {!initialPropertyId && (
                <div className="mb-3">
                  <label htmlFor="propertySelect" className="form-label fw-semibold">
                    <i className="fas fa-home me-1 text-zambia-green"></i>
                    Select Property
                  </label>
                  {loadingProperties ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <select
                      className="form-select form-select-lg"
                      id="propertySelect"
                      value={propertyId}
                      onChange={handlePropertyChange}
                      required
                    >
                      <option value="">Choose a property...</option>
                      {properties.map(prop => (
                        <option key={prop._id} value={prop._id}>
                          {prop.title} - {prop.location}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {propertyTitle && (
                <div className="alert alert-light border-0 mb-4">
                  <strong>Selected Property:</strong> {propertyTitle}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="bookingDate" className="form-label fw-semibold">
                  <i className="fas fa-calendar me-1 text-zambia-green"></i>
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  id="bookingDate"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="bookingTime" className="form-label fw-semibold">
                  <i className="fas fa-clock me-1 text-zambia-green"></i>
                  Preferred Time
                </label>
                <input
                  type="time"
                  className="form-control form-control-lg"
                  id="bookingTime"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="bookingNotes" className="form-label fw-semibold">
                  <i className="fas fa-comment me-1 text-zambia-green"></i>
                  Notes (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="bookingNotes"
                  rows={3}
                  placeholder="Add any special requests or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <small className="text-muted">e.g., "I'm interested in the master bedroom" or "Can we view on a weekend?"</small>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-zambia-green btn-lg"
                  disabled={loading || loadingProperties || !propertyId}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      Send Booking Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
