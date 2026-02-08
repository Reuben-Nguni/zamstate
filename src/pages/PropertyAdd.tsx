import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyService } from '../utils/api';
import { useAuthStore } from '../stores/authStore';

const PropertyAdd: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('ZMW');
  const [type, setType] = useState('apartment');
  const [status, setStatus] = useState('available');
  const [address, setAddress] = useState('');
  const [township, setTownship] = useState('Kabulonga');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
      const previews: string[] = [];
      Array.from(selectedFiles).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === selectedFiles.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    toast.success('Image removed from preview');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add a property');
      navigate('/login');
      return;
    }

    if (!files || files.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', String(price));
      formData.append('currency', currency);
      formData.append('type', type);
      formData.append('status', status);
      formData.append('location', JSON.stringify({ 
        address,
        township 
      }));
      formData.append('features', JSON.stringify({
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area: area ? Number(area) : undefined,
      }));

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => formData.append('images', file));
      }

      await propertyService.createProperty(formData);
      toast.success('Property posted successfully!');
      navigate(`/properties`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="property-add-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <h2 className="fw-bold mb-1 text-zambia-green">
                  <i className="fas fa-home me-2"></i>
                  Post Your Property
                </h2>
                <p className="text-muted mb-4">Fill in the details below to list your estate</p>

                <form onSubmit={onSubmit}>
                  {/* Basic Info */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Basic Information
                    </h5>
                    
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Property Title</label>
                      <input 
                        type="text"
                        className="form-control form-control-lg" 
                        placeholder="e.g., Beautiful 3-Bedroom Apartment in Kabulonga"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea 
                        className="form-control form-control-lg" 
                        rows={4}
                        placeholder="Describe your property, amenities, and features..."
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Price</label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text fw-bold">{currency}</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            placeholder="0.00"
                            value={price as any} 
                            onChange={(e) => setPrice(Number(e.target.value))} 
                            required 
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Currency</label>
                        <select className="form-select form-select-lg" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                          <option value="ZMW">ZMW (Kwacha)</option>
                          <option value="USD">USD (Dollars)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-building me-2"></i>
                      Property Details
                    </h5>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Property Type</label>
                        <select className="form-select form-select-lg" value={type} onChange={(e) => setType(e.target.value)}>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="office">Office</option>
                          <option value="land">Land</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Status</label>
                        <select className="form-select form-select-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="sold">Sold</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-bed me-1 text-zambia-green"></i>
                          Bedrooms
                        </label>
                        <input 
                          type="number" 
                          className="form-control form-control-lg" 
                          placeholder="0"
                          value={bedrooms as any} 
                          onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-bath me-1 text-zambia-green"></i>
                          Bathrooms
                        </label>
                        <input 
                          type="number" 
                          className="form-control form-control-lg" 
                          placeholder="0"
                          value={bathrooms as any} 
                          onChange={(e) => setBathrooms(e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">
                          <i className="fas fa-ruler-combined me-1 text-zambia-green"></i>
                          Area (m²)
                        </label>
                        <input 
                          type="number" 
                          className="form-control form-control-lg" 
                          placeholder="0"
                          value={area as any} 
                          onChange={(e) => setArea(e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Location
                    </h5>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Address</label>
                      <input 
                        type="text"
                        className="form-control form-control-lg" 
                        placeholder="e.g., 123 Main Street"
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Township/Area</label>
                      <input 
                        type="text"
                        className="form-control form-control-lg" 
                        placeholder="e.g., Kabulonga, Northmead, Chilenje..."
                        value={township} 
                        onChange={(e) => setTownship(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  {/* Images Upload */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-images me-2"></i>
                      Upload Photos (1-12 images)
                    </h5>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Select Images</label>
                      <input 
                        className="form-control form-control-lg" 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                      <small className="text-muted d-block mt-2">
                        <i className="fas fa-info-circle me-1"></i>
                        Supported formats: JPG, PNG, WebP. Max 12 images.
                      </small>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Photo Preview ({imagePreviews.length})</label>
                        <div className="row g-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col-md-3 col-sm-4 col-6">
                              <div className="position-relative border rounded overflow-hidden bg-light" style={{ paddingBottom: '100%' }}>
                                <img 
                                  src={preview} 
                                  alt={`Preview ${index + 1}`}
                                  className="position-absolute top-0 start-0 w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                  onClick={() => removeImage(index)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-zambia-green btn-lg fw-bold" 
                      type="submit" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Posting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle me-2"></i>
                          Post Property
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAdd;
