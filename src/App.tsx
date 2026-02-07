import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerified from './pages/EmailVerified';
import Properties from './pages/Properties';
import PropertyAdd from './pages/PropertyAdd';
import PropertyDetail from './pages/PropertyDetail';
import Bookings from './pages/Bookings';
import RealTimeMessages from './pages/RealTimeMessages';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Stores
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/common/ProtectedRoute';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  const { user } = useAuthStore();
  useAuthStore();

  useEffect(() => {
    // connect socket and announce presence for the logged-in user
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('user-connected', { userId: user.id });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verified" element={<EmailVerified />} />
<Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route
                path="/properties/add"
                element={
                  <ProtectedRoute>
                    <PropertyAdd />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <RealTimeMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute requiredRoles={['tenant', 'owner']}>
                    <Maintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'owner', 'agent']}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
