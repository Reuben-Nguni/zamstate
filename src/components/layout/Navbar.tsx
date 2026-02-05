import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/login" onClick={closeMenu}>
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/register" onClick={closeMenu}>
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
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/properties" onClick={closeMenu}>
            Properties
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/bookings" onClick={closeMenu}>
            Bookings
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/messages" onClick={closeMenu}>
            Messages
          </Link>
        </li>
      </>
    );

    // Add role-specific links
    const roleLinks = [];
    if (user?.role === 'tenant' || user?.role === 'owner') {
      roleLinks.push(
        <li className="nav-item" key="maintenance">
          <Link className="nav-link" to="/maintenance" onClick={closeMenu}>
            Maintenance
          </Link>
        </li>
      );
    }

    if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'agent') {
      roleLinks.push(
        <li className="nav-item" key="analytics">
          <Link className="nav-link" to="/analytics" onClick={closeMenu}>
            Analytics
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
    <nav className={`navbar navbar-expand-lg ${navbarClass} shadow-sm`} style={{ borderBottom: '3px solid var(--zambia-green)' }}>
      <div className="container-fluid">
        {/* Brand */}
        <Link 
          className={`navbar-brand d-flex align-items-center fw-bold fs-5 ${textClass}`} 
          to={isAuthenticated ? "/dashboard" : "/"}
          onClick={closeMenu}
        >
          <div className="bg-zambia-green text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontSize: '20px' }}>
            <i className="fas fa-home"></i>
          </div>
          ZAMSTATE
        </Link>

        {/* Flex container for right-side buttons */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Theme Toggle Button - Professional Style */}
          <button
            className="btn p-0 border-0"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{ 
              background: 'linear-gradient(90deg, #FFD700 50%, #1F2937 50%)',
              width: '60px',
              height: '44px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isDark ? 'flex-end' : 'flex-start',
              padding: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '4px',
                backgroundColor: isDark ? '#1F2937' : '#FFD700',
                transition: 'all 0.3s ease'
              }}
            />
          </button>

          {/* Mobile Hamburger Menu Button - ONLY ON SMALL SCREENS */}
          <button
            className={`btn p-2 d-lg-none`}
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            style={{ 
              fontSize: '24px',
              color: isDark ? 'white' : 'var(--zambia-green)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--zambia-green)',
              border: isDark ? '2px solid var(--zambia-green)' : 'none',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 !important',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isMenuOpen ? (
              <i className="fas fa-times"></i>
            ) : (
              <i className="fas fa-bars"></i>
            )}
          </button>
        </div>

        {/* Navigation menu - Mobile collapsible only */}
        <div 
          className={`collapse navbar-collapse d-lg-none ${isMenuOpen ? 'show' : ''}`} 
          id="navbarNav" 
          style={{ 
            marginTop: isMenuOpen ? '15px' : '0',
            backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
            padding: isMenuOpen ? '10px 12px' : '0',
            borderRadius: isMenuOpen ? '8px' : '0',
            marginLeft: '-12px',
            marginRight: '-12px',
          }}
        >
          <ul className={`navbar-nav me-auto ${isDark ? 'text-white' : 'text-dark'}`}>
            {getNavLinks()}
          </ul>

          {/* User menu - Only visible when authenticated */}
          {isAuthenticated && user && (
            <ul className={`navbar-nav mt-3 mt-lg-0 ${isDark ? 'text-white' : 'text-dark'}`}>
              <li className="nav-item dropdown">
                <a
                  className={`nav-link dropdown-toggle d-flex align-items-center ${textClass}`}
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  <div className="bg-zambia-green rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                    <i className="fas fa-user text-white" style={{ fontSize: '14px' }}></i>
                  </div>
                  <div className="d-none d-md-block">
                    <div className="fw-semibold" style={{ fontSize: '14px', lineHeight: '1.2' }}>{user.firstName}</div>
                    <small className={isDark ? 'text-secondary text-capitalize' : 'text-muted text-capitalize'} style={{ fontSize: '12px' }}>{user.role}</small>
                  </div>
                </a>
                <ul 
                  className={`dropdown-menu ${isDark ? 'bg-dark' : 'bg-light'}`}
                  aria-labelledby="userDropdown"
                  style={{ minWidth: '200px' }}
                >
                  <li>
                    <Link 
                      className={`dropdown-item ${isDark ? 'text-white' : 'text-dark'}`}
                      to="/profile"
                      onClick={closeMenu}
                      style={{ padding: '10px 16px' }}
                    >
                      <i className="fas fa-user-circle me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className={`dropdown-item ${isDark ? 'text-white' : 'text-dark'}`}
                      to="/settings"
                      onClick={closeMenu}
                      style={{ padding: '10px 16px' }}
                    >
                      <i className="fas fa-cog me-2"></i>
                      Settings
                    </Link>
                  </li>
                  <li><hr className={`dropdown-divider ${isDark ? 'border-secondary' : 'border-light'}`} style={{ margin: '8px 0' }} /></li>
                  <li>
                    <button 
                      className={`dropdown-item text-danger w-100 text-start`}
                      onClick={handleLogout}
                      style={{ padding: '10px 16px', border: 'none', background: 'none' }}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
