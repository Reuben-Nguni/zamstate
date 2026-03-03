import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { authService } from '../utils/api';

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface MobileAccount {
  provider: 'mtn' | 'airtel' | 'zamtel' | 'other';
  number: string;
}

interface PaymentDetailsForm {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  mobileAccounts: MobileAccount[];
}

const OwnerPaymentDetails: React.FC = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState<PaymentDetailsForm>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    mobileAccounts: [],
  });
  const [saving, setSaving] = useState(false);
  const [newMobileProvider, setNewMobileProvider] = useState<'mtn' | 'airtel' | 'zamtel' | 'other'>('mtn');
  const [newMobileNumber, setNewMobileNumber] = useState('');

  // Load user's payment details when user changes
  useEffect(() => {
    if (user && (user as any)?.paymentDetails) {
      const pd = (user as any).paymentDetails;
      setForm({
        bankName: pd.bankName || '',
        accountNumber: pd.accountNumber || '',
        accountHolder: pd.accountHolder || '',
        mobileAccounts: pd.mobileAccounts || [],
      });
    }
  }, [user?.id]); // Depend on user.id to re-run when user changes

  const handleBankChange = (field: keyof BankDetails, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const addMobileAccount = () => {
    if (!newMobileNumber) return toast.error('Enter mobile number');
    const newAccount: MobileAccount = {
      provider: newMobileProvider,
      number: newMobileNumber,
    };
    setForm({
      ...form,
      mobileAccounts: [...form.mobileAccounts, newAccount],
    });
    setNewMobileNumber('');
    toast.success('Mobile account added');
  };

  const removeMobileAccount = (index: number) => {
    setForm({
      ...form,
      mobileAccounts: form.mobileAccounts.filter((_, i) => i !== index),
    });
    toast.success('Mobile account removed');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp: any = await authService.updateProfile({ paymentDetails: form });
      console.log('updateProfile response', resp);

      // Update local store with returned user
      const updatedUser = resp?.user || resp;
      if (updatedUser) {
        const { updateUser } = useAuthStore.getState();
        updateUser({
          ...updatedUser,
          paymentDetails: form, // Ensure form data is reflected
        });
      }
      toast.success('Payment details saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'agent'))
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Access denied</div>
      </div>
    );

  return (
    <div className="container py-4">
      <h4>
        <i className="fas fa-credit-card me-2"></i>
        Payment Account Details
      </h4>

      {/* Bank Details Section */}
      <div className="card p-4 mb-4">
        <h5 className="mb-3">Bank Account</h5>
        <div className="mb-3">
          <label className="form-label">Bank Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Zanaco, Standard Chartered"
            value={form.bankName}
            onChange={(e) => handleBankChange('bankName', e.target.value)}
          />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Account Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 1234567890"
              value={form.accountNumber}
              onChange={(e) => handleBankChange('accountNumber', e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Account Holder Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Legal account holder name"
              value={form.accountHolder}
              onChange={(e) => handleBankChange('accountHolder', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Money Section */}
      <div className="card p-4 mb-4">
        <h5 className="mb-3">Mobile Money Accounts</h5>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Provider</label>
            <select
              className="form-select"
              value={newMobileProvider}
              onChange={(e) =>
                setNewMobileProvider(e.target.value as 'mtn' | 'airtel' | 'zamtel' | 'other')
              }
            >
              <option value="mtn">MTN</option>
              <option value="airtel">Airtel</option>
              <option value="zamtel">Zamtel</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="e.g. 0976123456"
              value={newMobileNumber}
              onChange={(e) => setNewMobileNumber(e.target.value)}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button
              className="btn btn-outline-primary w-100"
              onClick={addMobileAccount}
              disabled={!newMobileNumber}
            >
              Add
            </button>
          </div>
        </div>

        {/* Listed Mobile Accounts */}
        {form.mobileAccounts.length > 0 && (
          <div>
            <h6>Added Accounts</h6>
            <div className="list-group">
              {form.mobileAccounts.map((acc, idx) => (
                <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{acc.provider.toUpperCase()}</strong>
                    <br />
                    <small className="text-muted">{acc.number}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeMobileAccount(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {form.mobileAccounts.length === 0 && (
          <p className="text-muted mb-0">No mobile accounts added yet</p>
        )}
      </div>

      {/* Save Button */}
      <div className="d-flex gap-2">
        <button
          className="btn btn-zambia-green"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Payment Details'}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            // Reset form to user's current data
            if (user && (user as any)?.paymentDetails) {
              const pd = (user as any).paymentDetails;
              setForm({
                bankName: pd.bankName || '',
                accountNumber: pd.accountNumber || '',
                accountHolder: pd.accountHolder || '',
                mobileAccounts: pd.mobileAccounts || [],
              });
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default OwnerPaymentDetails;
