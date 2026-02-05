import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../utils/api';

const Bookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust endpoint as needed
        const response = await apiClient('/bookings');
        setBookings(response.bookings || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: 'bg-success',
      pending: 'bg-warning',
      cancelled: 'bg-danger',
      completed: 'bg-info'
    };
    return `badge ${statusClasses[status as keyof typeof statusClasses] || 'bg-secondary'}`;
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return booking.status === 'confirmed' || booking.status === 'pending';
    if (activeTab === 'past') return booking.status === 'completed' || booking.status === 'cancelled';
    return true;
  });

  return (
    <div className="bookings-page">
      <div className="container-fluid py-4">
        {loading && <div>Loading bookings...</div>}
        {error && <div className="text-danger">{error}</div>}
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">My Bookings</h1>
                <p className="text-muted">Manage your property viewings and appointments</p>
              </div>
              <button className="btn btn-zambia-green">
                <i className="fas fa-plus me-2"></i>
                New Booking
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-zambia-green mb-2">
                  <i className="fas fa-calendar-check fa-2x"></i>
                </div>
                <h4 className="mb-1">12</h4>
                <small className="text-muted">Total Bookings</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-success mb-2">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
                <h4 className="mb-1">8</h4>
                <small className="text-muted">Upcoming</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-warning mb-2">
                  <i className="fas fa-hourglass-half fa-2x"></i>
                </div>
                <h4 className="mb-1">3</h4>
                <small className="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-info mb-2">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
                <h4 className="mb-1">4</h4>
                <small className="text-muted">Completed</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 ${activeTab === 'upcoming' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      <i className="fas fa-calendar-alt me-2"></i>
                      Upcoming
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 ${activeTab === 'past' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('past')}
                    >
                      <i className="fas fa-history me-2"></i>
                      Past
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 ${activeTab === 'all' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('all')}
                    >
                      <i className="fas fa-list me-2"></i>
                      All Bookings
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No bookings found</h5>
                    <p className="text-muted">You don't have any {activeTab} bookings at the moment.</p>
                  </div>
                ) : (
                  <div className="row">
                    {filteredBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        className="col-12 mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="card border-0 shadow-sm hover-lift">
                          <div className="card-body">
                            <div className="row align-items-center">
                              <div className="col-md-2 text-center mb-3 mb-md-0">
                                <div className="booking-date">
                                  <div className="date-circle bg-zambia-green text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                                    <div>
                                      <div className="fw-bold fs-5">{new Date(booking.date).getDate()}</div>
                                      <small>{new Date(booking.date).toLocaleDateString('en-US', {month: 'short'})}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-md-6">
                                <h6 className="card-title mb-2">{booking.property}</h6>
                                <div className="booking-details text-muted small">
                                  <div className="mb-1">
                                    <i className="fas fa-clock me-2"></i>
                                    {booking.time} on {new Date(booking.date).toLocaleDateString()}
                                  </div>
                                  <div className="mb-1">
                                    <i className="fas fa-user-tie me-2"></i>
                                    Agent: {booking.agent}
                                  </div>
                                  <div>
                                    <i className={`fas ${booking.type === 'viewing' ? 'fa-eye' : 'fa-handshake'} me-2`}></i>
                                    {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                                  </div>
                                </div>
                              </div>

                              <div className="col-md-2 text-center mb-3 mb-md-0">
                                <span className={getStatusBadge(booking.status)}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>

                              <div className="col-md-2 text-end">
                                <div className="btn-group" role="group">
                                  <button className="btn btn-outline-zambia-green btn-sm">
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  <button className="btn btn-outline-zambia-green btn-sm">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  {booking.status === 'pending' && (
                                    <button className="btn btn-outline-danger btn-sm">
                                      <i className="fas fa-times"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
