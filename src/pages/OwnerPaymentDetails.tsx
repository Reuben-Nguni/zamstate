import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const OwnerPaymentDetails: React.FC = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ bankName: '', accountNumber: '', accountHolder: '', mobileNetwork: '', mobileNumber: '', mobileName: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // load owner profile payment details if stored on user.profile
    // For now assume user.paymentDetails exists
    if ((user as any)?.paymentDetails) {
      setForm((user as any).paymentDetails);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      // save via update profile endpoint
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentDetails: form }),
      });
      toast.success('Payment details saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'owner' && user.role !== 'agent') return <div className="container py-4">Access denied</div>;

  return (
    <div className="container py-4">
      <h4>Owner Payment Details</h4>
      <div className="card p-3">
        <div className="mb-3">
          <label className="form-label">Bank name</label>
          <input name="bankName" value={form.bankName} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Account number</label>
          <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Account holder</label>
          <input name="accountHolder" value={form.accountHolder} onChange={handleChange} className="form-control" />
        </div>
        <hr />
        <div className="mb-3">
          <label className="form-label">Mobile network</label>
          <input name="mobileNetwork" value={form.mobileNetwork} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Mobile number</label>
          <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="form-control" />
        </div>
        <div className="text-end">
          <button className="btn btn-zambia-green" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPaymentDetails;
