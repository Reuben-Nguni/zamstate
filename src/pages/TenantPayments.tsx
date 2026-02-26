import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { paymentService } from '../utils/api';

const TenantPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ propertyId: '', amount: '', method: 'mobile-money', reference: '' });
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp: any = await paymentService.getPayments();
        setPayments(resp.data || resp || []);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.propertyId || !form.amount) return toast.error('Property and amount required');
    try {
      let resp: any;
      if (proofFile) {
        const formData = new FormData();
        formData.append('propertyId', form.propertyId);
        formData.append('amount', String(Number(form.amount)));
        formData.append('method', form.method);
        if (form.reference) formData.append('reference', form.reference);
        formData.append('proof', proofFile);
        resp = await paymentService.createPayment(formData);
      } else {
        resp = await paymentService.createPayment({ propertyId: form.propertyId, amount: Number(form.amount), method: form.method, reference: form.reference });
      }
      toast.success('Payment submitted');
      setPayments((p) => [resp.payment || resp.data || resp, ...p]);
      setProofFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit payment');
    }
  };

  return (
    <div className="container py-4">
      <h4>Payments</h4>
      <div className="card p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Property ID</label>
            <input name="propertyId" value={form.propertyId} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-2">
            <label className="form-label">Amount</label>
            <input name="amount" value={form.amount} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Method</label>
            <select name="method" value={form.method} onChange={handleChange} className="form-select">
              <option value="mobile-money">Mobile Money</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Reference</label>
            <input name="reference" value={form.reference} onChange={handleChange} className="form-control" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Proof (optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProofFile(e.target.files[0]);
                } else {
                  setProofFile(null);
                }
              }}
            />
          </div>
        </div>
        <div className="text-end mt-3">
          <button className="btn btn-zambia-green" onClick={handleSubmit}>Submit Payment</button>
        </div>
      </div>

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
