import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { paymentService, propertyService } from '../utils/api';
import PaymentFormModal from '../components/PaymentFormModal';

const TenantPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // state for opening payment modal
  const [propertyIdInput, setPropertyIdInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp: any = await paymentService.getPayments();
        console.log('getPayments response', resp);
        setPayments(resp.data || resp || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // load property info before opening modal
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

  return (
    <div className="container py-4">
      <h4>Payments</h4>
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
      {currentProperty && (
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

      <div className="card p-3">
        <h5>Your Payments</h5>
        {loading ? <p>Loading...</p> : payments.length === 0 ? <p>No payments</p> : (
          <ul className="list-group">
            {payments.map((p: any) => (
              <li key={p._id || p.paymentId} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div><strong>{p.amount}</strong> {p.currency || 'ZMW'}</div>
                  <div className="text-muted small">{p.method} • {p.status}</div>
                  {p.proofUrl && (
                    <div>
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" className="small">
                        View proof
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <small className="text-muted">{new Date(p.createdAt || p.created).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TenantPayments;
