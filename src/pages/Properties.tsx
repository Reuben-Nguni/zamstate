import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService, messageService } from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import MapView from '../components/MapView';

const Properties: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTownship, setSelectedTownship] = useState('all');

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactModal, setContactModal] = useState<{ show: boolean; property: any }>({ show: false, property: null });
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Modal for login prompt when guest tries to contact/book
  const [loginPromptModal, setLoginPromptModal] = useState<{ show: boolean; action: string }>({ show: false, action: '' });

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (!contactModal.property || !messageContent.trim()) return;

    try {
      setSendingMessage(true);
      await messageService.sendMessage({
        recipientId: contactModal.property.owner._id || contactModal.property.owner,
        propertyId: contactModal.property._id || contactModal.property.id,
        content: messageContent,
      });
      toast.success('Message sent successfully!');
      setContactModal({ show: false, property: null });
      setMessageContent('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle guest actions (contact/book viewing) - show login prompt
  const handleGuestAction = (action: string) => {
    setLoginPromptModal({ show: true, action });
  };

  // Navigate to login/register
  const handleLoginClick = (path: string) => {
    setLoginPromptModal({ show: false, action: '' });
    navigate(path);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getProperties();
        setProperties(data.data || data);
      } catch (err: any) {
        setError(err.message || 'Error loading properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'house', label: 'Houses' },
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

  const filteredProperties = properties.filter((property) => {
    const title = (property.title || '').toString().toLowerCase();
    const township = (property.location?.township || property.township || '').toString().toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || township.includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesTownship = selectedTownship === 'all' || township === selectedTownship.toLowerCase();

    return matchesSearch && matchesType && matchesTownship;
  });

  const PropertyCard = ({ property }: { property: typeof properties[0] }) => (
    <motion.div
      className="col-lg-4 col-md-6 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card property-card h-100">
        <div className="position-relative">
          <img
            src={property.images && property.images.length > 0 ? property.images[0].url || property.images[0] : '/placeholder-image.jpg'}
            alt={property.title}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {property.featured && (
            <span className="badge bg-zambia-green position-absolute top-0 end-0 m-2">
              Featured
            </span>
          )}
          <span className={`badge position-absolute bottom-0 start-0 m-2 ${
            property.status === 'available' ? 'bg-success' : 'bg-secondary'
          }`}>
            {property.status}
          </span>
        </div>
        <div className="card-body">
          <h5 className="card-title">{property.title}</h5>
          <div className="d-flex align-items-center mb-2">
            <h4 className="text-zambia-green mb-0 me-1">
              ZK {property.price.toLocaleString()}
            </h4>
            <small className="text-muted">/month</small>
          </div>
          <div className="property-details mb-3">
            <small className="text-muted d-block">
              <i className="fas fa-bed me-1"></i>{property.bedrooms} beds •
              <i className="fas fa-bath ms-2 me-1"></i>{property.bathrooms} baths •
              <i className="fas fa-ruler-combined ms-2 me-1"></i>{property.area} m²
            </small>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="fas fa-map-marker-alt me-1"></i>
              {property.township}
            </small>
            <div className="btn-group btn-group-sm">
<Link to={`/properties/${property._id || property.id}`} className="btn btn-outline-primary btn-sm">
                <i className="fas fa-eye me-1"></i>View
              </Link>
              {isAuthenticated ? (
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => setContactModal({ show: true, property })}
                >
                  <i className="fas fa-envelope me-1"></i>Contact
                </button>
              ) : (
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => handleGuestAction('contact')}
                >
                  <i className="fas fa-envelope me-1"></i>Contact
                </button>
              )}
              {isAuthenticated && (
                <>
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-outline-danger btn-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const PropertyListItem = ({ property }: { property: typeof properties[0] }) => (
    <motion.div
      className="col-12 mb-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card property-list-item">
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={property.images && property.images.length > 0 ? property.images[0].url || property.images[0] : '/placeholder-image.jpg'}
              alt={property.title}
              className="img-fluid rounded-start h-100"
              style={{ objectFit: 'cover', minHeight: '150px' }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h5 className="card-title">{property.title}</h5>
                  <p className="card-text text-muted mb-2">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {property.township}
                  </p>
                  <div className="property-details mb-2">
                    <small className="text-muted">
                      <i className="fas fa-bed me-1"></i>{property.bedrooms} beds •
                      <i className="fas fa-bath ms-2 me-1"></i>{property.bathrooms} baths •
                      <i className="fas fa-ruler-combined ms-2 me-1"></i>{property.area} m²
                    </small>
                  </div>
                </div>
                <div className="text-end">
                  <h4 className="text-zambia-green mb-1">
                    ZK {property.price.toLocaleString()}
                  </h4>
                  <small className="text-muted">/month</small>
                  <div className="mt-2">
                    <span className={`badge ${
                      property.status === 'available' ? 'bg-success' : 'bg-secondary'
                    }`}>
                      {property.status}
                    </span>
                    {property.featured && (
                      <span className="badge bg-zambia-green ms-1">Featured</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="btn-group">
<Link to={`/properties/${property._id || property.id}`} className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-eye me-1"></i>View
                  </Link>
                  {isAuthenticated ? (
                    <button className="btn btn-outline-success btn-sm">
                      <i className="fas fa-calendar-plus me-1"></i>Book Viewing
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleGuestAction('book')}
                    >
                      <i className="fas fa-calendar-plus me-1"></i>Book Viewing
                    </button>
                  )}
                  {isAuthenticated ? (
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => setContactModal({ show: true, property })}
                    >
                      <i className="fas fa-envelope me-1"></i>Contact
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => handleGuestAction('contact')}
                    >
                      <i className="fas fa-envelope me-1"></i>Contact
                    </button>
                  )}
                </div>
                {isAuthenticated && (
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-outline-danger">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="properties-page">
        <div className="container-fluid py-4 text-center">
          <div className="spinner-border text-zambia-green" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="container-fluid py-4">
        {/* Header */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1">Properties</h1>
                <p className="text-muted mb-0">
                  {isAuthenticated 
                    ? 'Manage your property listings and discover new opportunities.'
                    : 'Discover properties across Zambia. Find your perfect home or business space.'}
                </p>
              </div>
              {isAuthenticated && (
                <div className="d-flex gap-2">
                  <Link to="/properties/add" className="btn btn-zambia-green">
                    <i className="fas fa-plus me-2"></i>
                    Add Property
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="col-12">
            <MapView />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={selectedTownship}
                      onChange={(e) => setSelectedTownship(e.target.value)}
                    >
                      {townships.map(township => (
                        <option key={township.value} value={township.value}>
                          {township.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <div className="btn-group w-100">
                      <button
                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('grid')}
                      >
                        <i className="fas fa-th"></i>
                      </button>
                      <button
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <i className="fas fa-list"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          className="row mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="col-12">
            {loading ? (
              <p className="text-muted mb-0">Loading properties...</p>
            ) : error ? (
              <p className="text-danger mb-0">{error}</p>
            ) : (
              <p className="text-muted mb-0">Showing {filteredProperties.length} of {properties.length} properties</p>
            )}
          </div>
        </motion.div>

        {/* Properties Grid/List */}
        <motion.div
          className="row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              viewMode === 'grid' ? (
                <PropertyCard key={property._id || property.id} property={property} />
              ) : (
                <PropertyListItem key={property._id || property.id} property={property} />
              )
            ))
          ) : (
            <div className="col-12">
              <div className="text-center py-5">
                <i className="fas fa-home fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">No properties found</h4>
                <p className="text-muted">Try adjusting your search criteria.</p>
                {isAuthenticated && (
                  <Link to="/properties/add" className="btn btn-zambia-green">
                    <i className="fas fa-plus me-2"></i>
                    Add Property
                  </Link>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Contact Modal for Authenticated Users */}
      {contactModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Property Owner</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setContactModal({ show: false, property: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Property:</strong> {contactModal.property?.title}</p>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Enter your message..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setContactModal({ show: false, property: null })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal for Guests */}
      {loginPromptModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-lock me-2"></i>
                  {loginPromptModal.action === 'book' ? 'Book a Viewing' : 'Contact Property Owner'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setLoginPromptModal({ show: false, action: '' })}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="fas fa-user-circle fa-4x text-muted mb-3"></i>
                <h5 className="mb-3">Please sign in to continue</h5>
                <p className="text-muted">
                  {loginPromptModal.action === 'book' 
                    ? 'To book a property viewing, you need to have an account with ZAMSTATE.'
                    : 'To contact property owners, you need to have an account with ZAMSTATE.'}
                </p>
                <p className="text-muted">
                  Don't have an account? Join thousands of Zambians finding their perfect property!
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setLoginPromptModal({ show: false, action: '' })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  onClick={() => handleLoginClick('/login')}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleLoginClick('/register')}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;

