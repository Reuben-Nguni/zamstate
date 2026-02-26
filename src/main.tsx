import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/main.scss'
import { registerServiceWorker } from './registerServiceWorker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Service worker registration is now manual to avoid caching/navigation issues.
// Users can enable it from the Settings page if they need push notifications.
// (previously we auto-registered in both DEV and PROD, which caused stale
// builds and forced full page refreshes when navigating.)
//
// If you do want to re-enable automatic registration uncomment below.
/*
if (import.meta.env.PROD) {
  registerServiceWorker().catch(() => {});
}
*/
