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
  const [township, setTownship] = useState('Kabulonga');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add a property');
      navigate('/login');
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
      formData.append('location', JSON.stringify({ township }));

      if (files && files.length > 0) {
        Array.from(files).forEach((file) => formData.append('images', file));
      }

      const res = await propertyService.createProperty(formData);
      toast.success('Property created');
      navigate(`/properties`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h2>Add Property</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">Price</label>
            <input type="number" className="form-control" value={price as any} onChange={(e) => setPrice(Number(e.target.value))} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Currency</label>
            <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option key="ZMW" value="ZMW">ZMW</option>
              <option key="USD" value="USD">USD</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option key="apartment" value="apartment">Apartment</option>
              <option key="house" value="house">House</option>
              <option key="office" value="office">Office</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Township</label>
          <input className="form-control" value={township} onChange={(e) => setTownship(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Images and Videos</label>
          <input className="form-control" type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(e.target.files)} />
        </div>

        <button className="btn btn-zambia-green" type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Property'}
        </button>
      </form>
    </div>
  );
};

export default PropertyAdd;
