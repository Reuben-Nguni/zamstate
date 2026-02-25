import React, { useState } from 'react';
import logo from '../../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/" onClick={closeMenu}>
              <i className="fas fa-home me-1"></i>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/properties" onClick={closeMenu}>
              <i className="fas fa-building me-1"></i>
              Properties
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/login" onClick={closeMenu}>
              <i className="fas fa-sign-in-alt me-1"></i>
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link className="btn btn-zambia-green text-white ms-lg-2 mt-2 mt-lg-0" to="/register" onClick={closeMenu} style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>
              <i className="fas fa-user-plus me-1"></i>
              Register
            </Link>
          </li>
        </>
      );
    }

    const baseLinks = (
      <>
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard" onClick={closeMenu}>
            <i className="fas fa-tachometer-alt me-1"></i>
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/properties" onClick={closeMenu}>
            <i className="fas fa-building me-1"></i>
            Properties
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/bookings" onClick={closeMenu}>
            <i className="fas fa-calendar-check me-1"></i>
            Bookings
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/messages" onClick={closeMenu}>
            <i className="fas fa-comments me-1"></i>
            Messages
          </Link>
        </li>
        {/* About and Contact intentionally omitted from navbar */}
      </>
    );

    // Add role-specific links
    const roleLinks = [];
    if (user?.role === 'tenant' || user?.role === 'owner') {
      roleLinks.push(
        <li className="nav-item" key="maintenance">
          <Link className="nav-link" to="/maintenance" onClick={closeMenu}>
            <i className="fas fa-tools me-1"></i>
            Maintenance
          </Link>
        </li>
      );
    }

    // payments for tenants and owners
    if (user?.role === 'tenant') {
      roleLinks.push(
        <li className="nav-item" key="tenant-payments">
          <Link className="nav-link" to="/tenant/payments" onClick={closeMenu}>
            <i className="fas fa-credit-card me-1"></i>
            Payments
          </Link>
        </li>
      );
    }
    if (user?.role === 'owner') {
      roleLinks.push(
        <li className="nav-item" key="owner-payments">
          <Link className="nav-link" to="/owner/payment-details" onClick={closeMenu}>
            <i className="fas fa-credit-card me-1"></i>
            Payments
          </Link>
        </li>
      );
    }

    if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'agent') {
      roleLinks.push(
        <li className="nav-item" key="analytics">
          <Link className="nav-link" to="/analytics" onClick={closeMenu}>
            <i className="fas fa-chart-line me-1"></i>
            Analytics
          </Link>
        </li>
      );
    }

    if (user?.role === 'admin') {
      roleLinks.push(
        <li className="nav-item" key="user-management">
          <Link className="nav-link" to="/admin/users" onClick={closeMenu}>
            <i className="fas fa-users-cog me-1"></i>
            User Management
          </Link>
        </li>
      );
    }

    return (
      <>
        {baseLinks}
        {roleLinks}
      </>
    );
  };

  const isDark = theme === 'dark';
  const navbarClass = isDark ? 'navbar-dark bg-dark' : 'navbar-light bg-white';
  const textClass = isDark ? 'text-white' : 'text-dark';

  return (
    <nav 
      className={`navbar navbar-expand-lg ${navbarClass} shadow-sm`}
      style={{ 
        borderBottom: '3px solid var(--zambia-green)',
        zIndex: 1000
      }}
    >
      <div className="container-fluid">
        {/* Brand - Left side */}
        <Link 
          className={`navbar-brand d-flex align-items-center fw-bold fs-5 ${textClass}`}
          to={isAuthenticated ? "/dashboard" : "/"}
          onClick={closeMenu}
        >
          <img src={logo} alt="logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
          ZAMSTATE
        </Link>

        {/* Mobile Hamburger Menu Button */}
        <button
          className={`navbar-toggler ms-auto ${isDark ? 'border-white' : ''}`}
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          style={{
            padding: '0.5rem',
            borderRadius: '8px'
          }}
        >
          <span className={`navbar-toggler-icon ${isDark ? 'navbar-toggler-icon-white' : ''}`}></span>
        </button>

        {/* Navigation Links - Collapsible */}
        <div 
          className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className={`navbar-nav ${isDark ? 'me-auto text-white' : 'me-auto'} align-items-lg-center`}>
            {getNavLinks()}
          </ul>

          {/* Small-screen controls inside the same collapse so hamburger stays right */} 
          <div className="d-lg-none w-100 mt-2">
            <div className="d-flex flex-column p-2 border-top">
              <div className="d-flex align-items-center gap-2 mb-2">
                <button
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center"
                  onClick={toggleTheme}
                >
                  {isDark ? <i className="fas fa-moon me-2"></i> : <i className="fas fa-sun me-2"></i>}
                  Theme
                </button>
              </div>

              {isAuthenticated && user && (
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '50%' }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-zambia-green d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%' }}>
                        <i className="fas fa-user text-white"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <Link to="/profile" className="d-block" onClick={closeMenu}>Profile</Link>
                    <Link to="/settings" className="d-block" onClick={closeMenu}>Settings</Link>
                    <button className="btn btn-link text-danger p-0 mt-1" onClick={() => { handleLogout(); closeMenu(); }}>Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Theme Toggle and User Actions (large screens) */}
        <div className={`d-none d-lg-flex align-items-center gap-2 ${isDark ? 'text-white' : ''} mt-3 mt-lg-0`}> 
          <button
            className={`btn d-inline-flex align-items-center justify-content-center ${isDark ? 'text-warning' : 'text-primary'}`}
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{ 
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 215, 0, 0.15)' : 'rgba(31, 41, 55, 0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '20px'
            }}
          >
            {isDark ? (
              <i className="fas fa-moon"></i>
            ) : (
              <i className="fas fa-sun"></i>
            )}
          </button>

          {/* User dropdown - Only visible when authenticated */}
          {isAuthenticated && user && (
            <div className="dropdown" style={{ position: 'relative' }}>
              <button
                className={`btn d-flex align-items-center gap-2 ${textClass}`}
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none'
                }}
              >
                <div style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-zambia-green rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <i className="fas fa-user text-white" style={{ fontSize: '14px' }}></i>
                    </div>
                  )}
                </div>
                <span className="d-none d-lg-inline fw-semibold">{user.firstName}</span>
                <i className="fas fa-chevron-down ms-2"></i>
              </button>
              {isUserMenuOpen && (
                <ul 
                  className={`dropdown-menu dropdown-menu-end show ${isDark ? 'bg-dark' : 'bg-light'}`}
                  style={{ minWidth: '200px', position: 'absolute', top: '100%', right: 0, zIndex: 2000 }}
                >
                  <li>
                    <Link 
                      className={`dropdown-item ${isDark ? 'text-white' : 'text-dark'}`}
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-user-circle me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className={`dropdown-item ${isDark ? 'text-white' : 'text-dark'}`}
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fas fa-cog me-2"></i>
                      Settings
                    </Link>
                  </li>
                  <li><hr className={`dropdown-divider ${isDark ? 'border-secondary' : 'border-light'}`} /></li>
                  <li>
                    <button 
                      className={`dropdown-item text-danger w-100 text-start`}
                      onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                      style={{ padding: '10px 16px', border: 'none', background: 'none' }}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

