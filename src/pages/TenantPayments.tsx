import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { paymentService, propertyService } from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import PaymentFormModal from '../components/PaymentFormModal';

const TenantPayments: React.FC = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningPaymentId, setActioningPaymentId] = useState<string | null>(null);

  // state for opening payment modal (tenants only)
  const [propertyIdInput, setPropertyIdInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const resp: any = await paymentService.getPayments();
      console.log('getPayments response', resp);
      setPayments(resp.data || resp || []);
    } catch (err) {
      console.warn(err);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // load property info before opening modal (tenants only)
  const openModalForProperty = async () => {
    if (!propertyIdInput) return toast.error('Enter property ID');
    try {
      setPropertyLoading(true);
      const resp: any = await propertyService.getPropertyById(propertyIdInput);
      const prop = resp.data || resp.property || resp;
      if (!prop || !prop._id) throw new Error('Property not found');
      setCurrentProperty(prop);
      setModalVisible(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load property');
    } finally {
      setPropertyLoading(false);
    }
  };

  const handlePaymentSuccess = (payment: any) => {
    setPayments((p) => [payment, ...p]);
    setModalVisible(false);
    setPropertyIdInput('');
    setCurrentProperty(null);
  };

  // Owner approve or reject payment
  const handleApprovePayment = async (paymentId: string) => {
    setActioningPaymentId(paymentId);
    try {
      await paymentService.verifyPayment(paymentId, 'verified');
      toast.success('Payment approved');
      // Update local state
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: 'verified' } : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve payment');
    } finally {
      setActioningPaymentId(null);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    setActioningPaymentId(paymentId);
    try {
      await paymentService.verifyPayment(paymentId, 'rejected');
      toast.success('Payment rejected');
      // Update local state
      setPayments((prev) =>
        prev.map((p) =>
          p._id === paymentId ? { ...p, status: 'rejected' } : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject payment');
    } finally {
      setActioningPaymentId(null);
    }
  };

  const isOwner = user?.role === 'owner' || user?.role === 'agent';
  const isTenant = user?.role === 'tenant';

  return (
    <div className="container py-4">
      <h4>
        {isOwner ? (
          <>
            <i className="fas fa-money-bill me-2 text-success"></i>
            Incoming Payments
          </>
        ) : (
          <>
            <i className="fas fa-credit-card me-2 text-primary"></i>
            My Payment History
          </>
        )}
      </h4>

      {/* Tenant: Show "Pay Property" form */}
      {isTenant && (
        <div className="card p-3 mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Property ID</label>
              <input
                className="form-control"
                placeholder="e.g. 635df12abc..."
                value={propertyIdInput}
                onChange={(e) => setPropertyIdInput(e.target.value)}
                disabled={propertyLoading}
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-zambia-green w-100"
                onClick={openModalForProperty}
                disabled={propertyLoading || !propertyIdInput}
              >
                {propertyLoading ? 'Loading...' : 'Pay Property'}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentProperty && isTenant && (
        <PaymentFormModal
          show={modalVisible}
          onHide={() => setModalVisible(false)}
          propertyId={currentProperty._id}
          propertyTitle={currentProperty.title || ''}
          propertyPrice={currentProperty.price || 0}
          ownerPaymentDetails={currentProperty.owner?.paymentDetails || {}}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payments list */}
      <div className="card p-3">
        <h5>
          {isOwner
            ? 'Payments Received from Tenants'
            : 'Your submitted payments'}
        </h5>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-muted">
            {isOwner
              ? 'No payment received yet'
              : 'No payments submitted'}
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  {isOwner && <th>Tenant</th>}
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Proof</th>
                  {isOwner && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p._id || p.paymentId}>
                    {isOwner && (
                      <td>
                        <small>{p.tenant?.firstName} {p.tenant?.lastName}</small>
                      </td>
                    )}
                    <td>
                      <small>{p.property?.title || 'N/A'}</small>
                    </td>
                    <td>
                      <strong>{p.amount}</strong> {p.currency || 'ZMW'}
                    </td>
                    <td>
                      <small>{p.method}</small>
                    </td>
                    <td>
                      <small>
                        <span
                          className={`badge ${
                            p.status === 'verified'
                              ? 'bg-success'
                              : p.status === 'rejected'
                              ? 'bg-danger'
                              : 'bg-warning'
                          }`}
                        >
                          {p.status}
                        </span>
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(p.createdAt || p.created).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      {p.proofUrl ? (
                        <a
                          href={p.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="small btn btn-sm btn-outline-primary"
                        >
                          View
                        </a>
                      ) : (
                        <small className="text-muted">—</small>
                      )}
                    </td>
                    {isOwner && (
                      <td>
                        {p.status === 'pending' ? (
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprovePayment(p._id)}
                              disabled={actioningPaymentId === p._id}
                              title="Approve payment"
                            >
                              {actioningPaymentId === p._id ? '...' : '✓'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectPayment(p._id)}
                              disabled={actioningPaymentId === p._id}
                              title="Reject payment"
                            >
                              {actioningPaymentId === p._id ? '...' : '✕'}
                            </button>
                          </div>
                        ) : (
                          <small className="text-muted">—</small>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantPayments;
