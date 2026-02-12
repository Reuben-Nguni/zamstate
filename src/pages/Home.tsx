import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const features = [
    {
      icon: 'fas fa-home',
      title: 'Property Management',
      description: 'Comprehensive property listing and management system'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Smart Bookings',
      description: 'AI-powered booking system with automated scheduling'
    },
    {
      icon: 'fas fa-comments',
      title: 'Real-time Messaging',
      description: 'Seamless communication between tenants and landlords'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Analytics & Insights',
      description: 'Data-driven insights for better decision making'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile First',
      description: 'Optimized for mobile devices across Zambia'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure & Trusted',
      description: 'Enterprise-grade security and reliability'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Properties Listed' },
    { number: '50,000+', label: 'Happy Tenants' },
    { number: '1,000+', label: 'Property Owners' },
    { number: '500+', label: 'Real Estate Agents' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-zambia-green text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-4 fw-bold mb-4">
                  Zambia's Premier <br />
                  <span className="text-warning">Real Estate Platform</span>
                </h1>
                <p className="lead mb-4">
                  Discover, manage, and invest in properties across Zambia with our
                  AI-powered platform designed for tenants, owners, agents, and investors.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/properties" className="btn btn-light btn-lg">
                    <i className="fas fa-search me-2"></i>
                    Browse Properties
                  </Link>
                  <Link to="/register" className="btn btn-outline-light btn-lg">
                    <i className="fas fa-user-plus me-2"></i>
                    Join ZAMSTATE
                  </Link>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="text-center">
                  <i className="fas fa-building display-1 text-white-50"></i>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image & Tagline Section */}
      <section className="hero-image-section py-5 bg-gradient-section w-100">
        <div className="w-100 position-relative">
          <div className="row align-items-center justify-content-center h-100 mx-0">
            <div className="col-12 text-center px-0 position-relative hero-image-container">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="hero-image-wrapper"
              >
                <img
                  src="/house-key.jpg"
                  alt="House and Key"
                  className="img-fluid hero-key-image"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="col-md-3 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="stat-card">
                  <h2 className="text-zambia-green fw-bold mb-2">{stat.number}</h2>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-zambia-green mb-3">
              Why Choose ZAMSTATE?
            </h2>
            <p className="lead text-muted">
              Experience the future of real estate management in Zambia
            </p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-card card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="feature-icon mb-3">
                      <i className={`${feature.icon} fa-3x text-zambia-green`}></i>
                    </div>
                    <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-zambia-green text-white py-5">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="display-5 fw-bold mb-3">
              Ready to Transform Your Real Estate Experience?
            </h2>
            <p className="lead mb-4">
              Join thousands of Zambians who trust ZAMSTATE for their property needs
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="btn btn-light btn-lg">
                <i className="fas fa-rocket me-2"></i>
                Get Started Today
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                <i className="fas fa-sign-in-alt me-2"></i>
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
