import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('settings_notifications');
    if (saved !== null) setNotifications(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('settings_notifications', String(notifications));
  }, [notifications]);

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Settings</h5>
        </div>
        <div className="card-body">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="notifToggle" checked={notifications} onChange={() => setNotifications(s => !s)} />
            <label className="form-check-label" htmlFor="notifToggle">Enable notifications</label>
          </div>
          <hr />
          <p className="text-muted">Profile: {user?.firstName} {user?.lastName}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
