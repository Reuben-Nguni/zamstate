import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../utils/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    try {
      setLoading(true);
      await authService.requestPasswordReset({ email });
      toast.success('If the email exists, a reset link was sent');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h3>Forgot your password?</h3>
          <p className="text-muted">Enter your email and we'll send a password reset link.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-zambia-green" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
