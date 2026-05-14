import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { propertyService } from '../utils/api';
import MapView from '../components/MapView';

const Home: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTownship, setSelectedTownship] = useState('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [homeViewMode, setHomeViewMode] = useState<'grid' | 'map'>('grid');

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'house', label: 'Houses' },
    { value: 'boarding-house', label: 'Boarding Houses' },
    { value: 'office', label: 'Offices' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const townships = [
    { value: 'all', label: 'All Townships' },
    { value: 'kabulonga', label: 'Kabulonga' },
    { value: 'roma', label: 'Roma' },
    { value: 'cbd', label: 'CBD' },
    { value: 'woodlands', label: 'Woodlands' },
    { value: 'kalundu', label: 'Kalundu' },
  ];

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      setLoadingProperties(true);
      try {
        const response = await propertyService.getProperties({ limit: 8, sortBy: 'date_desc' });
        setFeaturedProperties(response.data || response || []);
      } catch (err: any) {
        setHomeError(err.message || 'Unable to load featured properties');
      } finally {
        setLoadingProperties(false);
      }
    };

    loadFeaturedProperties();
  }, []);

  const filteredListings = featuredProperties.filter((property) => {
    const title = (property.title || '').toString().toLowerCase();
    const township = (property.location?.township || property.township || '').toString().toLowerCase();
    const price = Number(property.price || 0);
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || township.includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesTownship = selectedTownship === 'all' || township === selectedTownship.toLowerCase();
    const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);
    return matchesSearch && matchesType && matchesTownship && matchesMinPrice && matchesMaxPrice;
  });

  const PropertyPreviewCard = ({ property }: { property: any }) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <div className="card property-preview-card h-100 shadow-sm">
        <img
          src={property.images && property.images.length > 0 ? property.images[0].url || property.images[0] : '/placeholder-image.jpg'}
          alt={property.title}
          className="card-img-top"
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h5 className="card-title mb-2">{property.title || property.type || 'Property'}</h5>
          <p className="card-text text-muted mb-2">
            ZK {property.price ? Number(property.price).toLocaleString() : 'N/A'} / month
          </p>
          <p className="card-text text-muted small mb-3">
            {property.township || property.location?.township || 'Unknown location'}
          </p>
          <Link to={`/properties/${property._id || property.id}`} className="btn btn-zambia-green btn-sm w-100">
            View Property
          </Link>
        </div>
      </div>
    </div>
  );

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

      {/* Search & Filter Section */}
      <section className="search-filter-section py-5 bg-light">
        <div className="container">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by location or title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Type</label>
                  <select
                    className="form-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Township</label>
                  <select
                    className="form-select"
                    value={selectedTownship}
                    onChange={(e) => setSelectedTownship(e.target.value)}
                  >
                    {townships.map((township) => (
                      <option key={township.value} value={township.value}>
                        {township.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Min Price</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    placeholder="ZK 0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Max Price</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    placeholder="ZK 0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <p className="mb-0 text-muted">Showing {filteredListings.length} of {featuredProperties.length} featured properties based on your filter.</p>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm ${homeViewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setHomeViewMode('grid')}
                      title="Grid View"
                    >
                      <i className="fas fa-th me-1"></i>Grid
                    </button>
                    <button
                      className={`btn btn-sm ${homeViewMode === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setHomeViewMode('map')}
                      title="Map View"
                    >
                      <i className="fas fa-map me-1"></i>Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="featured-listings-section py-5 bg-white">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="display-6 fw-bold text-zambia-green mb-1">Featured Listings</h2>
              <p className="text-muted mb-0">Browse the newest properties, including boarding houses, homes and commercial spaces.</p>
            </div>
            <Link to="/properties" className="btn btn-outline-zambia-green">
              View All Properties
            </Link>
          </div>

          {homeViewMode === 'map' ? (
            // Map View
            <div style={{ height: '450px', marginBottom: '30px' }}>
              <MapView properties={filteredListings} height={450} hideHeader={true} />
            </div>
          ) : (
            // Grid View
            <div className="row">
              {loadingProperties ? (
                <div className="col-12 text-center py-4">
                  <div className="spinner-border text-zambia-green" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : homeError ? (
                <div className="col-12 text-center py-4 text-danger">{homeError}</div>
              ) : filteredListings.length > 0 ? (
                filteredListings.map((property) => (
                  <PropertyPreviewCard key={property._id || property.id} property={property} />
                ))
              ) : (
                <div className="col-12 text-center py-4 text-muted">
                  No featured listings match your filters.
                </div>
              )}
            </div>
          )}
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
