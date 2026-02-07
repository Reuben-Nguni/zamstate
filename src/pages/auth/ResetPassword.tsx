import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../utils/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error("Passwords don't match");

    try {
      setLoading(true);
      await authService.resetPassword({ token, password });
      toast.success('Password updated. Please login');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h3>Reset your password</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-control" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <button className="btn btn-zambia-green" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
