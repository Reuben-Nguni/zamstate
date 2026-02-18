import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService, userService } from '../utils/api';
import resizeAndCropFile, { blobToFile } from '../utils/image';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { updateUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', whatsappNumber: '', avatar: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await authService.getProfile();
        const u = res.user || res.data || res;
        setForm({ 
          firstName: u.firstName || '', 
          lastName: u.lastName || '', 
          phone: u.phone || '', 
          whatsappNumber: u.whatsappNumber || '',
          avatar: u.avatar || '' 
        });
      } catch (err) {
        console.warn('Failed to load profile', err);
      }
    };
    fetch();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

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

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  const handleUpdateEmail = async () => {
    const { newEmail, password } = emailForm;

    if (!newEmail || !password) {
      toast.error('Email and password are required');
      return;
    }

    if (!newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setUpdatingEmail(true);
    try {
      await authService.updateEmail(newEmail, password);
      toast.success('Email updated successfully');
      const res = await authService.getProfile();
      const u = res.user || res.data || res;
      setForm({ ...form });
      updateUser(u);
      setEmailForm({ newEmail: '', password: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email');
    } finally {
      setUpdatingEmail(false);
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
              <label className="form-label">
                <i className="fab fa-whatsapp me-2" style={{ color: '#25D366' }}></i>
                WhatsApp Number (Optional)
              </label>
              <input 
                name="whatsappNumber" 
                className="form-control" 
                placeholder="+1234567890"
                value={form.whatsappNumber} 
                onChange={handleChange} 
              />
              <small className="text-muted">Include country code (e.g., +260 for Zambia)</small>
            </div>
            <div className="col-md-6">
              <label className="form-label">Avatar</label>
              <div className="d-flex gap-2 align-items-center">
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#f3f3f3' }}>
                  {form.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      // crop and resize to 512x512 square before upload
                      const blob = await resizeAndCropFile(file, 512);
                      const f = blobToFile(blob, file.name || 'avatar.jpg');
                      const fd = new FormData();
                      fd.append('file', f);
                      const res: any = await userService.uploadAvatar(fd);
                      const url = res.url || res.data?.url || res.secure_url;
                      if (url) setForm({ ...form, avatar: url });
                      toast.success('Avatar uploaded');
                    } catch (err: any) {
                      console.error('Upload error', err);
                      toast.error(err.message || 'Upload failed');
                    } finally {
                      setUploading(false);
                    }
                  }} />
                  <div className="mt-1">
                    <small className="text-muted">{uploading ? 'Uploading...' : 'Choose an image to upload'}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={() => window.location.reload()} disabled={saving}>Cancel</button>
          <button className="btn btn-zambia-green text-white" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {/* Update Email Card */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Update Email</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">New Email Address</label>
              <input 
                type="email" 
                name="newEmail" 
                className="form-control" 
                value={emailForm.newEmail} 
                onChange={handleEmailChange}
                placeholder="Enter your new email address"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                value={emailForm.password} 
                onChange={handleEmailChange}
                placeholder="Enter your password to confirm"
              />
              <small className="text-muted">We need your password to confirm this change</small>
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={() => setEmailForm({ newEmail: '', password: '' })} disabled={updatingEmail}>Cancel</button>
          <button className="btn btn-zambia-green text-white" onClick={handleUpdateEmail} disabled={updatingEmail}>{updatingEmail ? 'Updating...' : 'Update Email'}</button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Change Password</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                className="form-control" 
                value={passwordForm.currentPassword} 
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                className="form-control" 
                value={passwordForm.newPassword} 
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                className="form-control" 
                value={passwordForm.confirmPassword} 
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button className="btn btn-secondary me-2" onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })} disabled={changingPassword}>Cancel</button>
          <button className="btn btn-zambia-green text-white" onClick={handleChangePassword} disabled={changingPassword}>{changingPassword ? 'Changing...' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
