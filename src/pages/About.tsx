import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="card border-0 shadow-sm p-4">
        <h2 className="fw-bold mb-3">About ZAMSTATE</h2>
        <p className="text-muted">ZAMSTATE helps people find and manage rental properties across Zambia. We connect tenants, owners and agents with a simple experience for listings, bookings and messaging.</p>
        <p className="text-muted">If you'd like to learn more, reach out via our contact page.</p>
        <Link to="/contact" className="btn btn-zambia-green mt-3">Contact Us</Link>
      </div>
    </div>
  );
};

export default About;
