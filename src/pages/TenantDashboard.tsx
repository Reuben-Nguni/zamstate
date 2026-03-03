import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { applicationService } from '../utils/api';
import { initSocketConnection } from '../utils/socketClient';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TenantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [approvedProperties, setApprovedProperties] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approved' | 'payments' | 'applications'>('approved');

  useEffect(() => {
    fetchApprovedProperties();

    const socket = initSocketConnection(user?.id);
    // listen for status updates on applications
    socket.on('application-updated', (data: any) => {
      const { application } = data;
      if (application.tenant === user?.id) {
        if (application.status === 'selected') {
          toast.success('Your application has been approved!');
        } else if (application.status === 'rejected') {
          toast.error('Your application was rejected.');
        }
        // refresh list to pick up new approved property/payment
        fetchApprovedProperties();
      }
    });

    return () => {
      socket.off('application-updated');
    };
  }, [user]);

  const fetchApprovedProperties = async () => {
    try {
      setLoading(true);
      const resp: any = await applicationService.getTenantApprovedProperties();
      setApprovedProperties(resp.data || []);

      // also fetch all applications (all statuses)
      try {
        const allApps: any = await applicationService.getTenantAllApplications();
        console.log('Fetched all applications:', allApps);
        setAllApplications(allApps.data || []);
      } catch (err) {
        console.error('Failed to fetch all applications:', err);
      }
    } catch (err: any) {
      console.error('Failed to fetch approved properties', err);
      toast.error('Failed to load approved properties');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'tenant') {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="fas fa-lock me-2"></i>
          Only tenants can view this dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="mb-4">
          <i className="fas fa-home me-2 text-success"></i>
          My Approved Properties
        </h2>
      </motion.div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
            role="tab"
          >
            <i className="fas fa-check-circle me-2"></i>
            Approved Properties ({approvedProperties.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
            role="tab"
          >
            <i className="fas fa-money-bill me-2"></i>
            Payment Status
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
            role="tab"
          >
            <i className="fas fa-file-invoice me-2"></i>
            My Applications ({allApplications.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your applications...</p>
        </div>
      ) : activeTab === 'approved' ? (
        approvedProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card border-0 shadow-sm text-center py-5"
          >
            <div className="card-body">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <p className="text-muted mb-3">You don't have any approved properties yet.</p>
              <Link to="/properties" className="btn btn-zambia-green">
                <i className="fas fa-search me-2"></i>
                Browse Properties
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="row g-4">
            {approvedProperties.map((item, index) => {
              const { application, property, payment } = item;
            return (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="col-lg-6 col-xl-4"
              >
                <div className="card border-0 shadow-sm h-100">
                  {/* Property Image */}
                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                    <img
                      src={
                        property.images?.[0]?.url ||
                        property.images?.[0]?.secure_url ||
                        '/placeholder-image.jpg'
                      }
                      alt={property.title}
                      className="card-img-top"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                    <span className="badge bg-success position-absolute top-0 end-0 m-2">
                      <i className="fas fa-check me-1"></i>
                      Approved
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h5 className="card-title mb-2">{property.title}</h5>
                    <p className="text-muted small mb-3">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {property.location?.address || 'Property Location'}
                    </p>

                    {/* Price */}
                    <div className="mb-3">
                      <h6 className="text-zambia-green fw-bold">
                        {property.price?.toLocaleString()} {property.currency || 'ZMW'}
                      </h6>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Payment Status:</small>
                      {payment ? (
                        <span
                          className={`badge ${
                            payment.status === 'approved'
                              ? 'bg-success'
                              : payment.status === 'rejected'
                              ? 'bg-danger'
                              : 'bg-warning'
                          }`}
                        >
                          {payment.status?.toUpperCase()}
                        </span>
                      ) : (
                        <span className="badge bg-secondary">NO PAYMENT</span>
                      )}
                    </div>

                    {/* Owner Info */}
                    <div className="mb-3 p-2 bg-light rounded">
                      <small className="text-muted d-block mb-1">Owner:</small>
                      <div className="fw-bold small">
                        {property.owner?.firstName} {property.owner?.lastName}
                      </div>
                      <div className="text-muted small">{property.owner?.email}</div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/properties/${property._id}`}
                      className="btn btn-outline-success w-100"
                    >
                      <i className="fas fa-eye me-2"></i>
                      View & Make Payment
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )
      ) : activeTab === 'payments' ? (
        /* Payments Tab */
        <div className="row g-4">
          {approvedProperties.map((item, index) => {
            const { application, property, payment } = item;
            return (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="col-12"
              >
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h6 className="fw-bold mb-1">{property.title}</h6>
                        <p className="text-muted small mb-0">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {property.location?.address}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <div className="text-end">
                          <small className="text-muted d-block">Amount:</small>
                          <h6 className="text-zambia-green mb-0">
                            {payment?.amount?.toLocaleString() || property.price?.toLocaleString()}{' '}
                            {payment?.currency || property.currency || 'ZMW'}
                          </h6>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-end">
                          <small className="text-muted d-block">Status:</small>
                          {payment ? (
                            <span
                              className={`badge ${
                                payment.status === 'approved'
                                  ? 'bg-success'
                                  : payment.status === 'rejected'
                                  ? 'bg-danger'
                                  : 'bg-warning'
                              }`}
                            >
                              {payment.status?.toUpperCase()}
                            </span>
                          ) : (
                            <span className="badge bg-secondary">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    {payment && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="row small">
                          <div className="col-md-6">
                            <small className="text-muted">Method:</small>
                            <div>{payment.method}</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Reference:</small>
                            <div>{payment.reference || 'N/A'}</div>
                          </div>
                        </div>
                        {payment.proofUrl && (
                          <div className="mt-2">
                            <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                              <i className="fas fa-image me-1"></i>
                              View Proof
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audit Trail */}
                    {payment?.audit && payment.audit.length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-muted d-block mb-2 fw-bold">History:</small>
                        <ul className="list-unstyled">
                          {payment.audit.map((log: any, i: number) => (
                            <li key={i} className="text-muted small mb-1">
                              <i className="fas fa-history me-1 text-secondary"></i>
                              {log.action} - {new Date(log.at).toLocaleString()}
                              {log.note && <div className="ms-4 small text-secondary">{log.note}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Applications Tab - All applications with statuses */
        <div className="row">
          {allApplications.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info text-center py-5">
                <i className="fas fa-inbox fa-2x text-info mb-3 d-block"></i>
                <p className="mb-0">You haven't applied to any properties yet.</p>
              </div>
            </div>
          ) : (
            allApplications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="col-12 mb-3"
              >
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h6 className="fw-bold mb-1">{app.property?.title}</h6>
                        <p className="text-muted small mb-2">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {app.property?.location?.address || 'Location'}
                        </p>
                        {app.message && (
                          <div className="text-muted small border-top pt-2 mt-2">
                            <strong>Message:</strong> {app.message.substring(0, 100)}
                            {app.message.length > 100 ? '...' : ''}
                          </div>
                        )}
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">Price:</small>
                        <h6 className="text-zambia-green mb-0">
                          {app.property?.price?.toLocaleString()} {app.property?.currency || 'ZMW'}
                        </h6>
                      </div>
                      <div className="col-md-3 text-end">
                        <small className="text-muted d-block mb-2">Status:</small>
                        {app.status === 'applied' && (
                          <span className="badge bg-warning text-dark fw-semibold">
                            <i className="fas fa-hourglass-end me-1"></i>
                            Pending Review
                          </span>
                        )}
                        {app.status === 'selected' && (
                          <span className="badge bg-success fw-semibold">
                            <i className="fas fa-check-circle me-1"></i>
                            Approved
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="badge bg-danger fw-semibold">
                            <i className="fas fa-times-circle me-1"></i>
                            Rejected
                          </span>
                        )}
                        {app.status === 'withdrawn' && (
                          <span className="badge bg-secondary fw-semibold">
                            <i className="fas fa-ban me-1"></i>
                            Withdrawn
                          </span>
                        )}
                        <div className="text-muted small mt-2">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
