import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/main.scss'
import { unregisterServiceWorker } from './registerServiceWorker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Service worker registration is now manual to avoid caching/navigation issues.
// Users can enable it from the Settings page if they need push notifications.
// We also explicitly unregister any previously-installed worker on every load,
// ensuring users aren't stuck on an old version that forces full-page reloads.
//
// If you do want to re-enable automatic registration uncomment below.
/*
if (import.meta.env.PROD) {
  registerServiceWorker().catch(() => {});
}
*/

// always attempt to remove stale worker (no-op if none installed)
unregisterServiceWorker().catch(() => {});
