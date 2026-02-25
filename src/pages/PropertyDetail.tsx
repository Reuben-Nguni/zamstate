
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyService, messageService } from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import BookingModal from '../components/BookingModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyImage {
  url: string;
  caption?: string;
}

// Fix Leaflet icon paths for production
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = isAuthenticated && user && String(property?.owner?._id || property?.owner) === String(user.id);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await propertyService.getPropertyById(id);
        setProperty(data.data || data);
        setEditStatus(data.data?.status || data.status || 'available');
      } catch (err: any) {
        setError(err.message || 'Error loading property');
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleContactClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    } else {
      setShowContactModal(true);
    }
  };

  const handleBookViewingClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleShareProperty = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this property: ${property.title} - ${property.location?.address || property.address || 'Property in Zambia'}`;
    
    const shareUrls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(text)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !isOwner) return;
    try {
      setIsEditingStatus(true);
      await propertyService.updateProperty(id, { status: editStatus });
      setProperty({ ...property, status: editStatus });
      toast.success('Property status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsEditingStatus(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!id || !isOwner || !window.confirm('Are you sure you want to delete this property?')) return;
    try {
      setDeleting(true);
      await propertyService.deleteProperty(id);
      toast.success('Property deleted');
      navigate('/properties');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete property');
      setDeleting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      setSendingMessage(true);
      await messageService.sendMessage({
        recipientId: property.owner._id || property.owner,
        propertyId: property._id || property.id,
        content: messageContent,
      });
      toast.success('Message sent successfully!');
      setShowContactModal(false);
      setMessageContent('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLoginClick = (path: string) => {
    setShowLoginPrompt(false);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4 className="text-muted">Property not found</h4>
          <Link to="/properties" className="btn btn-zambia-green mt-3">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images.map((img: any) => {
        const url = img.url || img.secure_url || img.secureUrl || img.path || img.src || img;
        return { url, caption: img.caption || '' };
      })
    : [{ url: '/placeholder-image.jpg', caption: '' }];

  const bedrooms = property.bedrooms || property.features?.bedrooms || property.features?.bedRooms;
  const bathrooms = property.bathrooms || property.features?.bathrooms || property.features?.bathRooms;
  const area = property.area || property.features?.area || property.features?.size;

  return (
    <div className="property-detail-page">
      <div className="container-fluid py-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/"><i className="fas fa-home me-1"></i>Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/properties">Properties</Link>
              </li>
              <li className="breadcrumb-item active">{property.title}</li>
            </ol>
          </nav>
        </motion.div>

        <div className="row">
          {/* Left Column - Images Gallery */}
          <div className="col-lg-8 mb-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="card mb-3 border-0 shadow-sm">
                <div className="position-relative">
                  <img
                    src={images[activeImageIndex]?.url || '/placeholder-image.jpg'}
                    alt={property.title}
                    className="card-img-top"
                    style={{ height: '500px', objectFit: 'cover' }}
                  />
                  {property.featured && (
                    <span className="badge bg-zambia-green position-absolute top-0 start-0 m-3">
                      Featured
                    </span>
                  )}
                  <span className={`badge position-absolute bottom-0 start-0 m-3 ${
                    property.status === 'available' ? 'bg-success' : 'bg-secondary'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="d-flex gap-2 overflow-auto py-2">
                  {images.map((image: PropertyImage, index: number) => (
                    <button
                      key={index}
                      className={`btn btn-link p-0 border-0 flex-shrink-0 ${activeImageIndex === index ? 'opacity-100' : 'opacity-50'}`}
                      onClick={() => setActiveImageIndex(index)}
                      style={{ width: '100px', height: '70px' }}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="rounded"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card border-0 shadow-sm mt-4"
            >
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Description</h4>
                <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
                  {property.description || 'No description available.'}
                </p>

                {/* Property Features */}
                {property.features && (
                  <div className="mt-4">
                    <h5 className="fw-bold mb-3">Features & Amenities</h5>
                    <div className="row g-3">
                      {Array.isArray(property.features) ? (
                        property.features.map((feature: string, index: number) => (
                          <div key={index} className="col-md-6 col-lg-4">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-check-circle text-success me-2"></i>
                              <span>{feature}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="row g-2">
                          {property.features.bedrooms !== undefined && (
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-bed text-success me-2"></i>
                                <span>{property.features.bedrooms} Beds</span>
                              </div>
                            </div>
                          )}
                          {property.features.bathrooms !== undefined && (
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-bath text-success me-2"></i>
                                <span>{property.features.bathrooms} Baths</span>
                              </div>
                            </div>
                          )}
                          {property.features.area !== undefined && (
                            <div className="col-6">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-ruler-combined text-success me-2"></i>
                                <span>{property.features.area} m²</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Property Location Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card border-0 shadow-sm mt-4"
            >
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">
                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                  Location
                </h4>
                <div className="mb-3">
                  <p className="mb-1 fw-semibold">{property.location?.address || property.address || 'Address not specified'}</p>
                  <p className="text-muted mb-0">
                    {property.location?.township || property.township}, {property.location?.city || property.city || 'Lusaka'}
                  </p>
                </div>
                {/* Property Location Map */}
                {isClient && property.location?.coordinates?.lat && property.location?.coordinates?.lng ? (
                  <MapContainer
                    center={[property.location.coordinates.lat, property.location.coordinates.lng]}
                    zoom={15}
                    style={{ height: '250px', width: '100%', borderRadius: '0.5rem' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    />
                    <Marker position={[property.location.coordinates.lat, property.location.coordinates.lng]}>
                      <Popup>
                        <strong>{property.title}</strong>
                        <br />
                        {property.location?.address || 'Property location'}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ height: '250px' }}
                  >
                    <div className="text-center text-muted">
                      <i className="fas fa-map-marked-alt fa-3x mb-2"></i>
                      <p>Map location not available</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Property Info & Actions */}
          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Property Title & Price */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 className="fw-bold mb-1">{property.title}</h3>
                      <p className="text-muted mb-0">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {property.township}
                      </p>
                    </div>
                  </div>

                  {/* Share Property */}
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="small fw-semibold mb-2">Share this property:</p>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-outline-success btn-md d-flex align-items-center"
                        onClick={() => handleShareProperty('whatsapp')}
                        title="Share on WhatsApp"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <i className="fab fa-whatsapp me-2"></i>
                        WhatsApp
                      </button>

                      <button
                        className="btn btn-outline-primary btn-md d-flex align-items-center"
                        onClick={() => handleShareProperty('facebook')}
                        title="Share on Facebook"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <i className="fab fa-facebook-f me-2"></i>
                        Facebook
                      </button>

                      <button
                        className="btn btn-outline-info btn-md d-flex align-items-center"
                        onClick={() => handleShareProperty('twitter')}
                        title="Share on Twitter"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <i className="fab fa-twitter me-2"></i>
                        Twitter
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-md d-flex align-items-center"
                        onClick={() => handleShareProperty('email')}
                        title="Share via Email"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Email
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h2 className="text-zambia-green fw-bold mb-0">
                      ZK {property.price?.toLocaleString() || '0'}
                    </h2>
                    <small className="text-muted">/month</small>
                  </div>

                  {/* Property Stats */}
                  <div className="row text-center mb-4">
                    {bedrooms !== undefined && bedrooms !== null && (
                      <div className="col-4 border-end">
                        <i className="fas fa-bed fa-lg text-zambia-green mb-2"></i>
                        <p className="mb-0 fw-semibold">{bedrooms}</p>
                        <small className="text-muted">Beds</small>
                      </div>
                    )}
                    {bathrooms !== undefined && bathrooms !== null && (
                      <div className="col-4 border-end">
                        <i className="fas fa-bath fa-lg text-zambia-green mb-2"></i>
                        <p className="mb-0 fw-semibold">{bathrooms}</p>
                        <small className="text-muted">Baths</small>
                      </div>
                    )}
                    {area !== undefined && area !== null && (
                      <div className="col-4">
                        <i className="fas fa-ruler-combined fa-lg text-zambia-green mb-2"></i>
                        <p className="mb-0 fw-semibold">{area}</p>
                        <small className="text-muted">m²</small>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2">
                    {isOwner ? (
                      <>
                        <button 
                          className="btn btn-warning btn-lg"
                          onClick={() => setIsEditingStatus(!isEditingStatus)}
                        >
                          <i className="fas fa-edit me-2"></i>
                          {isEditingStatus ? 'Cancel' : 'Edit Status'}
                        </button>
                        <button 
                          className="btn btn-danger btn-lg"
                          onClick={handleDeleteProperty}
                          disabled={deleting}
                        >
                          <i className="fas fa-trash me-2"></i>
                          {deleting ? 'Deleting...' : 'Delete Property'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn btn-zambia-green btn-lg"
                          onClick={handleBookViewingClick}
                        >
                          <i className="fas fa-calendar-plus me-2"></i>
                          Book a Viewing
                        </button>
                        <button 
                          className="btn btn-outline-primary btn-lg"
                          onClick={handleContactClick}
                        >
                          <i className="fas fa-envelope me-2"></i>
                          Contact Owner
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              {property.owner && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-user-tag me-2"></i>
                      Property Owner
                    </h5>
                    <div className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0" 
                        style={{ width: '70px', height: '70px', background: '#f3f3f3', overflow: 'hidden' }}
                      >
                        {property.owner.avatar ? (
                          <img src={property.owner.avatar} alt={property.owner.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="fas fa-user text-muted fa-2x"></i>
                        )}
                      </div>
                      <div>
                        <p className="fw-bold mb-0">
                          {property.owner.firstName} {property.owner.lastName}
                        </p>
                        <small className="text-muted text-capitalize">
                          {property.owner.role || 'Owner'}
                        </small>
                        {property.owner.whatsappNumber && (
                          <div className="mt-1">
                            <a 
                              href={`https://wa.me/${property.owner.whatsappNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-success text-decoration-none small"
                            >
                              <i className="fab fa-whatsapp me-1"></i>
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    {isAuthenticated && !isOwner && (
                      <button 
                        className="btn btn-outline-primary w-100"
                        onClick={handleContactClick}
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Send Message
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Property Details / Edit Status */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {isEditingStatus && isOwner ? (
                    <>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-edit me-2"></i>
                        Edit Status
                      </h5>
                      <div className="mb-3">
                        <label className="form-label">Property Status</label>
                        <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="sold">Sold</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-success" onClick={handleUpdateStatus} disabled={isEditingStatus}>
                          Save Changes
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsEditingStatus(false)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="fw-bold mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Property Details
                      </h5>
                      <ul className="list-unstyled mb-0">
                        <li className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Property Type</span>
                          <span className="fw-semibold text-capitalize">{property.type || 'N/A'}</span>
                        </li>
                        <li className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Status</span>
                          <span className={`badge ${property.status === 'available' ? 'bg-success' : 'bg-secondary'}`}>
                            {property.status}
                          </span>
                        </li>
                        {property.yearBuilt && (
                          <li className="d-flex justify-content-between py-2 border-bottom">
                            <span className="text-muted">Year Built</span>
                            <span className="fw-semibold">{property.yearBuilt}</span>
                          </li>
                        )}
                        {property.parking && (
                          <li className="d-flex justify-content-between py-2 border-bottom">
                            <span className="text-muted">Parking</span>
                            <span className="fw-semibold">{property.parking} spaces</span>
                          </li>
                        )}
                        <li className="d-flex justify-content-between py-2">
                          <span className="text-muted">Listed</span>
                          <span className="fw-semibold">
                            {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Modal for Authenticated Users */}
      {showContactModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Property Owner</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Property:</strong> {property?.title}</p>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Introduce yourself and ask about the property..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowContactModal(false)}
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
      {showLoginPrompt && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-lock me-2"></i>
                  Sign In Required
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowLoginPrompt(false)}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="fas fa-user-circle fa-4x text-muted mb-3"></i>
                <h5 className="mb-3">Please sign in to continue</h5>
                <p className="text-muted">
                  To contact property owners or book viewings, you need to have an account with ZAMSTATE.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowLoginPrompt(false)}
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

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && property && (
          <BookingModal 
            propertyId={property._id}
            propertyTitle={property.title}
            onClose={() => setShowBookingModal(false)}
            onSuccess={() => {
              toast.success('Booking request created successfully!');
              setShowBookingModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetail;

