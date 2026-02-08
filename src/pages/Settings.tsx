import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { requestNotificationPermission, subscribePush, showLocalNotification } from '../utils/notifications';
import { registerServiceWorker } from '../registerServiceWorker';

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

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service workers are not supported in this browser');
      return;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      alert('Notifications permission not granted');
      return;
    }

    const reg = await registerServiceWorker();
    if (!reg) {
      alert('Service worker registration failed');
      return;
    }

    const sub = await subscribePush(reg as any);
    if (sub) {
      showLocalNotification('ZAMSTATE', 'Push enabled successfully', reg as any);
      alert('Push subscription created (send subscription to server to push)');
    } else {
      alert('Failed to create push subscription');
    }
  };

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
          <div className="mt-3">
            <button className="btn btn-sm btn-outline-primary me-2" onClick={handleEnablePush}>Enable Push Notifications</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => showLocalNotification('Test', 'This is a test notification')}>Send Test Notification</button>
          </div>
          <hr />
          <p className="text-muted">Profile: {user?.firstName} {user?.lastName}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
