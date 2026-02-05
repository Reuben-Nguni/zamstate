import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light mt-auto">
      <div className="container py-5">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-zambia-green text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                <strong>ZS</strong>
              </div>
              <span className="fw-bold text-zambia-green">ZAMSTATE</span>
            </div>
            <p className="mb-3">
              Zambia's premier AI-powered real estate management platform.
              Connecting tenants, owners, agents, and investors in a transparent,
              trusted ecosystem.
            </p>
            <div className="d-flex">
              <a href="#" className="text-light me-3" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-light me-3" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light me-3" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="text-light" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/properties" className="text-light text-decoration-none">Properties</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="mb-3">Services</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/services/property-management" className="text-light text-decoration-none">Property Management</Link>
              </li>
              <li className="mb-2">
                <Link to="/services/real-estate-agents" className="text-light text-decoration-none">Real Estate Agents</Link>
              </li>
              <li className="mb-2">
                <Link to="/services/investment" className="text-light text-decoration-none">Investment Services</Link>
              </li>
              <li className="mb-2">
                <Link to="/services/maintenance" className="text-light text-decoration-none">Maintenance</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="mb-3">Contact Info</h5>
            <div className="d-flex align-items-start mb-2">
              <i className="fas fa-map-marker-alt me-3 mt-1"></i>
              <div>
                <p className="mb-0">Lusaka, Zambia</p>
                <small className="text-muted">123 Real Estate Avenue</small>
              </div>
            </div>
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-phone me-3"></i>
              <a href="tel:+260211234567" className="text-light text-decoration-none">+260 211 234 567</a>
            </div>
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-envelope me-3"></i>
              <a href="mailto:info@zamstate.com" className="text-light text-decoration-none">info@zamstate.com</a>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-clock me-3"></i>
              <span>Mon - Fri: 8:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2024 ZAMSTATE. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/privacy" className="text-light text-decoration-none me-3">Privacy Policy</Link>
            <Link to="/terms" className="text-light text-decoration-none">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
