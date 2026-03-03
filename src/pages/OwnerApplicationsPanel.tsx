import React, { useState, useEffect } from 'react';
import { initSocketConnection } from '../utils/socketClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { applicationService } from '../utils/api';
import { useAuthStore } from '../stores/authStore';

interface Application {
  _id: string;
  tenant: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  property: {
    _id: string;
    title: string;
    price: number;
    location: string;
  };
  status: 'applied' | 'selected' | 'rejected' | 'withdrawn';
  message: string;
  attachments: Array<{
    filename: string;
    url: string;
  }>;
  createdAt: string;
}

const OwnerApplicationsPanel: React.FC = () => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'reviewed'>('pending');
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();

    // initialize socket and listen for real-time updates
    const socket = initSocketConnection(user?.id);

    socket.on('new-application', () => {
      toast.success('New tenant application received');
      fetchApplications();
    });

    socket.on('application-updated', () => {
      // refresh list to pick up changes (status updates, etc.)
      fetchApplications();
    });

    return () => {
      socket.off('new-application');
      socket.off('application-updated');
    };
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getOwnerApplications();
      setApplications(data);
    } catch (err: any) {
      toast.error('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActingOnId(applicationId);
      await applicationService.selectApplicant(applicationId);
      toast.success('Applicant approved! Payment has been initiated.');
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'selected' } : app
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve applicant');
    } finally {
      setActingOnId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setActingOnId(applicationId);
      await applicationService.rejectApplicant(applicationId);
      toast.success('Application rejected');
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'rejected' } : app
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject applicant');
    } finally {
      setActingOnId(null);
    }
  };

  const pendingApps = applications.filter((app) => app.status === 'applied');
  const reviewedApps = applications.filter((app) => ['selected', 'rejected', 'withdrawn'].includes(app.status));

  const displayApps = selectedTab === 'pending' ? pendingApps : reviewedApps;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading applications...</span>
        </div>
        <p className="mt-3 text-muted">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="fw-bold mb-2">
          <i className="fas fa-user-check me-3 text-primary"></i>
          Tenant Applications
        </h1>
        <p className="text-muted">Review and manage applications from interested tenants</p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs border-bottom" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold ${selectedTab === 'pending' ? 'active' : ''}`}
              onClick={() => setSelectedTab('pending')}
              type="button"
              role="tab"
              aria-selected={selectedTab === 'pending'}
            >
              <i className="fas fa-inbox me-2 text-warning"></i>
              Pending Applications
              <span className="badge bg-warning text-dark ms-2">{pendingApps.length}</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold ${selectedTab === 'reviewed' ? 'active' : ''}`}
              onClick={() => setSelectedTab('reviewed')}
              type="button"
              role="tab"
              aria-selected={selectedTab === 'reviewed'}
            >
              <i className="fas fa-check-double me-2 text-success"></i>
              Reviewed Applications
              <span className="badge bg-success ms-2">{reviewedApps.length}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Applications List */}
      {displayApps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5"
        >
          <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
          <p className="text-muted">
            {selectedTab === 'pending'
              ? 'No pending applications at the moment'
              : 'No reviewed applications'}
          </p>
        </motion.div>
      ) : (
        <div className="row g-3">
          {displayApps.map((app, idx) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="col-12"
            >
              <div className="card border-0 shadow-sm hover-shadow-lg transition">
                <div className="card-body">
                  <div className="row align-items-start">
                    {/* Tenant Info */}
                    <div className="col-md-6 col-lg-4">
                      <div className="d-flex align-items-center mb-3">
                        {app.tenant.avatar ? (
                          <img
                            src={app.tenant.avatar}
                            alt={app.tenant.name}
                            className="rounded-circle me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="rounded-circle bg-light me-3 d-flex align-items-center justify-content-center"
                               style={{ width: '50px', height: '50px' }}>
                            <i className="fas fa-user text-muted"></i>
                          </div>
                        )}
                        <div>
                          <h6 className="mb-1 fw-bold">{app.tenant.name}</h6>
                          <small className="text-muted">{app.tenant.email}</small>
                          <br />
                          <small className="text-muted">{app.tenant.phone}</small>
                        </div>
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="col-md-6 col-lg-4">
                      <h6 className="fw-bold mb-1">
                        <i className="fas fa-home me-2 text-primary"></i>
                        {app.property.title}
                      </h6>
                      <small className="text-muted d-block">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {app.property.location}
                      </small>
                      <small className="text-muted d-block">
                        <i className="fas fa-money-bill-wave me-1 text-success"></i>
                        ZMW {app.property.price.toLocaleString()}
                      </small>
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar me-1"></i>
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    {/* Status Badge and Actions */}
                    <div className="col-md-12 col-lg-4 text-lg-end">
                      {/* Status Badge */}
                      <div className="mb-3">
                        {app.status === 'applied' && (
                          <span className="badge bg-warning text-dark">
                            <i className="fas fa-hourglass-end me-1"></i>
                            Pending Review
                          </span>
                        )}
                        {app.status === 'selected' && (
                          <span className="badge bg-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Approved
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="badge bg-danger">
                            <i className="fas fa-times-circle me-1"></i>
                            Rejected
                          </span>
                        )}
                        {app.status === 'withdrawn' && (
                          <span className="badge bg-secondary">
                            <i className="fas fa-ban me-1"></i>
                            Withdrawn
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {app.status === 'applied' && (
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-sm btn-zambia-green"
                            onClick={() => handleApprove(app._id)}
                            disabled={actingOnId !== null}
                          >
                            {actingOnId === app._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check me-1"></i>
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleReject(app._id)}
                            disabled={actingOnId !== null}
                          >
                            {actingOnId === app._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-times me-1"></i>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Applicant Message */}
                  <hr className="my-3" />
                  <div className="bg-light p-3 rounded mb-3">
                    <h6 className="fw-bold mb-2">
                      <i className="fas fa-comment me-2 text-info"></i>
                      Applicant Message
                    </h6>
                    <p className="mb-0 text-muted">{app.message}</p>
                  </div>

                  {/* Attachments */}
                  {app.attachments && app.attachments.length > 0 && (
                    <div className="row g-2 mt-2">
                      {app.attachments.map((attachment, i) => (
                        <div key={i} className="col-auto">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="fas fa-download me-1"></i>
                            {attachment.filename}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerApplicationsPanel;
