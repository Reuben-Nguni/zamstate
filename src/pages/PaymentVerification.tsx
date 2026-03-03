import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Payment {
  _id: string;
  property: {
    _id: string;
    title: string;
    price: number;
    location: string;
  };
  tenant: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  amount: number;
  currency: string;
  method: string;
  reference?: string;
  proofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  verificationNotes?: string;
  auditTrail: Array<{
    action: string;
    actor: string;
    timestamp: string;
    notes?: string;
  }>;
}

const PaymentVerification: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'verified'>('pending');
  const [actingOnId, setActingOnId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Assuming there's a method to get payments for owner
      // const data = await applicationService.getOwnerPayments();
      // For now, we'll fetch from a hypothetical endpoint
      const resp = await fetch('/api/payments/owner', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!resp.ok) throw new Error('Failed to fetch payments');
      const data = await resp.json();
      setPayments(data);
    } catch (err: any) {
      toast.error('Failed to load payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      setActingOnId(paymentId);
      const notes = verificationNotes[paymentId] || '';
      
      const resp = await fetch(`/api/payments/${paymentId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ verificationNotes: notes }),
      });

      if (!resp.ok) throw new Error('Failed to approve payment');
      
      toast.success('Payment approved!');
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId
            ? {
                ...p,
                status: 'approved',
                verifiedAt: new Date().toISOString(),
                verificationNotes: notes,
              }
            : p
        )
      );
      setVerificationNotes((prev) => ({ ...prev, [paymentId]: '' }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve payment');
    } finally {
      setActingOnId(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      setActingOnId(paymentId);
      const notes = verificationNotes[paymentId];
      
      if (!notes) {
        toast.error('Please provide a reason for rejection');
        setActingOnId(null);
        return;
      }

      const resp = await fetch(`/api/payments/${paymentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ verificationNotes: notes }),
      });

      if (!resp.ok) throw new Error('Failed to reject payment');
      
      toast.success('Payment rejected');
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId
            ? {
                ...p,
                status: 'rejected',
                verifiedAt: new Date().toISOString(),
                verificationNotes: notes,
              }
            : p
        )
      );
      setVerificationNotes((prev) => ({ ...prev, [paymentId]: '' }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject payment');
    } finally {
      setActingOnId(null);
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const verifiedPayments = payments.filter((p) => p.status !== 'pending');

  const displayPayments = selectedTab === 'pending' ? pendingPayments : verifiedPayments;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading payments...</span>
        </div>
        <p className="mt-3 text-muted">Loading payment submissions...</p>
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
          <i className="fas fa-receipt me-3 text-success"></i>
          Payment Verification
        </h1>
        <p className="text-muted">Review and approve tenant payment submissions</p>
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
              <i className="fas fa-clock me-2 text-warning"></i>
              Pending Verification
              <span className="badge bg-warning text-dark ms-2">{pendingPayments.length}</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link fw-bold ${selectedTab === 'verified' ? 'active' : ''}`}
              onClick={() => setSelectedTab('verified')}
              type="button"
              role="tab"
              aria-selected={selectedTab === 'verified'}
            >
              <i className="fas fa-check-circle me-2 text-success"></i>
              Verified
              <span className="badge bg-success ms-2">{verifiedPayments.length}</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Payments List */}
      {displayPayments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5"
        >
          <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
          <p className="text-muted">
            {selectedTab === 'pending'
              ? 'No pending payment submissions'
              : 'No verified payments'}
          </p>
        </motion.div>
      ) : (
        <div className="row g-3">
          {displayPayments.map((payment, idx) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="col-12"
            >
              <div className="card border-0 shadow-sm hover-shadow-lg transition">
                <div className="card-body">
                  <div className="row align-items-start mb-3">
                    {/* Tenant & Property Info */}
                    <div className="col-md-6 col-lg-4">
                      <div className="d-flex align-items-center mb-3">
                        {payment.tenant.avatar ? (
                          <img
                            src={payment.tenant.avatar}
                            alt={payment.tenant.name}
                            className="rounded-circle me-3"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-light me-3 d-flex align-items-center justify-content-center"
                            style={{ width: '45px', height: '45px' }}
                          >
                            <i className="fas fa-user text-muted"></i>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{payment.tenant.name}</h6>
                          <small className="text-muted">{payment.tenant.email}</small>
                        </div>
                      </div>
                      <h6 className="fw-bold mb-1">
                        <i className="fas fa-home me-2 text-primary"></i>
                        {payment.property.title}
                      </h6>
                      <small className="text-muted d-block">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {payment.property.location}
                      </small>
                    </div>

                    {/* Payment Details */}
                    <div className="col-md-6 col-lg-3">
                      <h6 className="fw-bold text-success mb-2">
                        <i className="fas fa-coins me-2"></i>
                        {payment.amount.toLocaleString()} {payment.currency}
                      </h6>
                      <small className="text-muted d-block">
                        <i className="fas fa-credit-card me-1"></i>
                        {payment.method === 'mobile-money' ? '📱 Mobile Money' : payment.method}
                      </small>
                      {payment.reference && (
                        <small className="text-muted d-block">
                          <i className="fas fa-hashtag me-1"></i>
                          Ref: {payment.reference}
                        </small>
                      )}
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar me-1"></i>
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </small>
                    </div>

                    {/* Status & Actions */}
                    <div className="col-md-12 col-lg-5">
                      <div className="mb-3">
                        {payment.status === 'pending' && (
                          <span className="badge bg-warning text-dark">
                            <i className="fas fa-hourglass-end me-1"></i>
                            Pending Verification
                          </span>
                        )}
                        {payment.status === 'approved' && (
                          <span className="badge bg-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Approved
                          </span>
                        )}
                        {payment.status === 'rejected' && (
                          <span className="badge bg-danger">
                            <i className="fas fa-times-circle me-1"></i>
                            Rejected
                          </span>
                        )}
                      </div>

                      {payment.status === 'pending' && (
                        <div className="mb-2">
                          <label className="form-label small fw-bold">Verification Notes</label>
                          <textarea
                            className="form-control form-control-sm"
                            placeholder="Add notes or reason for decision..."
                            rows={2}
                            value={verificationNotes[payment._id] || ''}
                            onChange={(e) =>
                              setVerificationNotes((prev) => ({
                                ...prev,
                                [payment._id]: e.target.value,
                              }))
                            }
                            disabled={actingOnId !== null}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proof */}
                  {payment.proofUrl && (
                    <>
                      <hr className="my-3" />
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="fw-bold mb-2">
                            <i className="fas fa-image me-2"></i>
                            Payment Proof
                          </h6>
                          <img
                            src={payment.proofUrl}
                            alt="Payment proof"
                            className="img-fluid rounded"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                          />
                          <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                            <i className="fas fa-external-link-alt me-1"></i>
                            View Original
                          </a>
                        </div>
                        <div className="col-md-6">
                          {payment.verificationNotes && (
                            <div className="bg-light p-3 rounded">
                              <h6 className="fw-bold mb-2">
                                <i className="fas fa-sticky-note me-2 text-info"></i>
                                Notes
                              </h6>
                              <p className="mb-0 text-muted small">{payment.verificationNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Audit Trail */}
                  {payment.auditTrail && payment.auditTrail.length > 0 && (
                    <>
                      <hr className="my-3" />
                      <div>
                        <h6 className="fw-bold mb-3">
                          <i className="fas fa-history me-2 text-info"></i>
                          Activity History
                        </h6>
                        <div className="timeline">
                          {payment.auditTrail.map((entry, i) => (
                            <div key={i} className="timeline-item mb-2">
                              <small className="d-block text-muted">
                                <i className="fas fa-circle text-primary" style={{ fontSize: '0.5rem' }}></i>
                                {' '}
                                <strong>{entry.action}</strong>
                                {' '}
                                by {entry.actor}
                                <br />
                                <span className="ms-3">{new Date(entry.timestamp).toLocaleString()}</span>
                              </small>
                              {entry.notes && (
                                <small className="d-block text-muted ms-3 mt-1">{entry.notes}</small>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  {payment.status === 'pending' && (
                    <>
                      <hr className="my-3" />
                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            className="btn btn-zambia-green btn-sm w-100"
                            onClick={() => handleApprovePayment(payment._id)}
                            disabled={actingOnId !== null}
                          >
                            {actingOnId === payment._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Approving...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check-circle me-1"></i>
                                Approve
                              </>
                            )}
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={() => handleRejectPayment(payment._id)}
                            disabled={actingOnId !== null || !verificationNotes[payment._id]}
                          >
                            {actingOnId === payment._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-times-circle me-1"></i>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
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

export default PaymentVerification;
