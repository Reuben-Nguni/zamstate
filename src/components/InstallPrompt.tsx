import React, { useEffect, useState } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handler(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = window.localStorage.getItem('pwa-install-dismissed');
      if (dismissed !== '1') setVisible(true);
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
      window.localStorage.setItem('pwa-install-dismissed', '1');
    }
  };

  // iOS fallback: show instructions for adding to home screen
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = () => ('standalone' in window && (window as any).standalone);

  if (!visible && isIos() && !isInStandaloneMode()) {
    // show small prompt for iOS users (do not block UI)
    return (
      <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 4000 }}>
        <div className="card shadow-sm p-3" style={{ minWidth: 240 }}>
          <div className="fw-semibold">Install ZAMSTATE</div>
          <div className="small text-muted mt-1">Tap the share button and choose "Add to Home Screen" for best experience on iOS.</div>
          <div className="mt-2 text-end">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => window.localStorage.setItem('pwa-install-dismissed', '1')}>OK</button>
          </div>
        </div>
      </div>
    );
  }

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
