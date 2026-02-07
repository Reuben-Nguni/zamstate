import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../utils/api';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await authService.getProfile();
        const u = res.user || res.data || res;
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '', avatar: u.avatar || '' });
      } catch (err) {
        console.warn('Failed to load profile', err);
      }
    };
    fetch();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      const u = res.user || res.data || res;
      updateUser(u);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">My Profile</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First name</label>
              <input name="firstName" className="form-control" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Last name</label>
              <input name="lastName" className="form-control" value={form.lastName} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Avatar URL</label>
              <input name="avatar" className="form-control" value={form.avatar} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={() => window.location.reload()} disabled={saving}>Cancel</button>
          <button className="btn btn-zambia-green text-white" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
