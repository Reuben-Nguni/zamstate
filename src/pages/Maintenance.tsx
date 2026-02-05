import React, { useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../utils/api';

const Maintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust endpoint as needed
        const response = await apiClient('/maintenance-requests');
        setRequests(response.requests || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch maintenance requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-warning',
      in_progress: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };
    return `badge ${statusClasses[status as keyof typeof statusClasses] || 'bg-secondary'}`;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'bg-success',
      medium: 'bg-warning',
      high: 'bg-danger'
    };
    return `badge ${priorityClasses[priority as keyof typeof priorityClasses] || 'bg-secondary'}`;
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'active') return request.status === 'pending' || request.status === 'in_progress';
    if (activeTab === 'completed') return request.status === 'completed';
    if (activeTab === 'cancelled') return request.status === 'cancelled';
    return true;
  });

  return (
    <div className="maintenance-page">
      {loading && <div>Loading maintenance requests...</div>}
      {error && <div className="text-danger">{error}</div>}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">Maintenance Requests</h1>
                <p className="text-muted">Report and track property maintenance issues</p>
              </div>
              <button
                className="btn btn-zambia-green"
                onClick={() => setShowNewRequestModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                New Request
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-danger mb-2">
                  <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
                <h4 className="mb-1">3</h4>
                <small className="text-muted">Active Requests</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-info mb-2">
                  <i className="fas fa-tools fa-2x"></i>
                </div>
                <h4 className="mb-1">1</h4>
                <small className="text-muted">In Progress</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-warning mb-2">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
                <h4 className="mb-1">2</h4>
                <small className="text-muted">Pending</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-success mb-2">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
                <h4 className="mb-1">8</h4>
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
                      className={`nav-link border-0 ${activeTab === 'active' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('active')}
                    >
                      <i className="fas fa-wrench me-2"></i>
                      Active
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 ${activeTab === 'completed' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('completed')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Completed
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 ${activeTab === 'all' ? 'active text-zambia-green fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab('all')}
                    >
                      <i className="fas fa-list me-2"></i>
                      All Requests
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-tools fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No maintenance requests found</h5>
                    <p className="text-muted">You don't have any {activeTab} maintenance requests at the moment.</p>
                  </div>
                ) : (
                  <div className="row">
                    {filteredRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        className="col-12 mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="card border-0 shadow-sm hover-lift">
                          <div className="card-body">
                            <div className="row align-items-center">
                              <div className="col-md-1 text-center mb-3 mb-md-0">
                                <div className={`priority-indicator ${request.priority}`}>
                                  <i className={`fas ${request.priority === 'high' ? 'fa-exclamation-triangle' : request.priority === 'medium' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
                                </div>
                              </div>

                              <div className="col-md-5">
                                <h6 className="card-title mb-2">{request.title}</h6>
                                <div className="request-details text-muted small">
                                  <div className="mb-1">
                                    <i className="fas fa-tag me-2"></i>
                                    {request.category}
                                  </div>
                                  <div className="mb-1">
                                    <i className="fas fa-calendar me-2"></i>
                                    Submitted: {new Date(request.dateSubmitted).toLocaleDateString()}
                                  </div>
                                  {request.assignedTo && (
                                    <div>
                                      <i className="fas fa-user-cog me-2"></i>
                                      Assigned to: {request.assignedTo}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="col-md-3">
                                <div className="mb-2">
                                  <span className={getStatusBadge(request.status)}>
                                    {request.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </span>
                                </div>
                                <div>
                                  <span className={getPriorityBadge(request.priority)}>
                                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                                  </span>
                                </div>
                                {request.estimatedCompletion && (
                                  <div className="text-muted small mt-1">
                                    Est. completion: {new Date(request.estimatedCompletion).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="col-md-3 text-end">
                                <div className="btn-group-vertical" role="group">
                                  <button className="btn btn-outline-zambia-green btn-sm mb-1">
                                    <i className="fas fa-eye me-1"></i>
                                    View Details
                                  </button>
                                  {request.status === 'pending' && (
                                    <button className="btn btn-outline-danger btn-sm">
                                      <i className="fas fa-times me-1"></i>
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expandable description */}
                            <div className="card-footer bg-light border-0">
                              <small className="text-muted">
                                <strong>Description:</strong> {request.description}
                              </small>
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

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Maintenance Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNewRequestModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <select className="form-select">
                        <option>Plumbing</option>
                        <option>Electrical</option>
                        <option>HVAC</option>
                        <option>Structural</option>
                        <option>Appliance</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select className="form-select">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control" placeholder="Brief description of the issue" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Detailed description of the maintenance issue"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload Photos (Optional)</label>
                    <input type="file" className="form-control" multiple accept="image/*" />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewRequestModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-zambia-green">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
