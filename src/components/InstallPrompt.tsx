import React, { useEffect, useState } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handler(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const onInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    } else {
      // user dismissed
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 4000 }}>
      <div className="card shadow-sm p-3" style={{ minWidth: 260 }}>
        <div className="d-flex align-items-start">
          <div className="me-2">
            <img src="/assets/logo.png" alt="logo" style={{ width: 44, height: 44 }} />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold">Install ZAMSTATE</div>
            <div className="small text-muted">Install the app for faster access and improved notifications.</div>
            <div className="mt-2 d-flex gap-2">
              <button className="btn btn-zambia-green btn-sm" onClick={onInstallClick}>Install</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setVisible(false)}>Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
