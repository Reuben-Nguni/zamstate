import React, { useState } from 'react';
import { applicationService } from '../utils/api';
import toast from 'react-hot-toast';

const Applications: React.FC = () => {
  const [propertyId, setPropertyId] = useState('');
  const [message, setMessage] = useState('');
  const [apps, setApps] = useState<any[]>([]);

  const handleApply = async () => {
    if (!propertyId) return toast.error('Property ID required');
    try {
      await applicationService.applyToProperty(propertyId, message);
      toast.success('Application submitted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply');
    }
  };

  const loadApps = async () => {
    if (!propertyId) return;
    try {
      const resp: any = await applicationService.getApplicationsForProperty(propertyId);
      setApps(resp.data || resp || []);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="container py-4">
      <h4>Applications</h4>
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-zambia-green" onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="d-flex justify-content-between mb-2">
          <h5>Applicants</h5>
          <div>
            <button className="btn btn-sm btn-outline-secondary" onClick={loadApps}>Load</button>
          </div>
        </div>
        {apps.length === 0 ? <p className="text-muted">No applicants loaded</p> : (
          <ul className="list-group">
            {apps.map(a => (
              <li key={a._id} className="list-group-item">
                <div><strong>{a.tenant?.firstName} {a.tenant?.lastName}</strong></div>
                <div className="small text-muted">{a.message}</div>
                <div className="small text-muted">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Applications;
