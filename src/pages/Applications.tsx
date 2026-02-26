import React, { useState } from 'react';
import { applicationService } from '../utils/api';
import toast from 'react-hot-toast';

const Applications: React.FC = () => {
  const [propertyId, setPropertyId] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [apps, setApps] = useState<any[]>([]);

  const handleApply = async () => {
    if (!propertyId) return toast.error('Property ID required');
    try {
      const form = new FormData();
      if (message) form.append('message', message);
      attachments.forEach((f) => form.append('attachments', f));
      await applicationService.applyToProperty(propertyId, form);
      toast.success('Application submitted');
      setMessage('');
      setAttachments([]);
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
          <div className="col-md-6">
            <input
              type="file"
              className="form-control"
              multiple
              onChange={(e) => {
                if (e.target.files) setAttachments(Array.from(e.target.files));
              }}
            />
            {attachments.length > 0 && (
              <small className="text-muted">
                {attachments.length} file{attachments.length > 1 ? 's' : ''} selected
              </small>
            )}
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
              <li key={a._id} className="list-group-item d-flex justify-content-between align-items-start">
                <div>
                  <div><strong>{a.tenant?.firstName} {a.tenant?.lastName}</strong></div>
                  <div className="small text-muted">{a.message}</div>
                  <div className="small text-muted">{new Date(a.createdAt).toLocaleString()}</div>
                  {a.attachments && a.attachments.length > 0 && (
                    <div className="mt-1">
                      {a.attachments.map((att: any, idx: number) => (
                        <a key={idx} href={att.url} target="_blank" rel="noreferrer" className="me-2 small">
                          Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <div className="small mb-1">Status: {a.status}</div>
                  {a.status === 'applied' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={async () => {
                        try {
                          await applicationService.selectApplicant(a._id);
                          toast.success('Applicant selected');
                          loadApps();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to select');
                        }
                      }}
                    >
                      Select
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Applications;
