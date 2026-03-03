import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { applicationService } from '../utils/api';

interface TenantApplyModalProps {
  show: boolean;
  onHide: () => void;
  propertyId: string;
  propertyTitle: string;
}

const TenantApplyModal: React.FC<TenantApplyModalProps> = ({
  show,
  onHide,
  propertyId,
  propertyTitle,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [applying, setApplying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write a message about yourself');
      return;
    }

    try {
      setApplying(true);
      const form = new FormData();
      form.append('message', message);
      attachments.forEach((file) => form.append('attachments', file));

      await applicationService.applyToProperty(propertyId, form);
      toast.success('Application submitted successfully!');
      setMessage('');
      setAttachments([]);
      onHide();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0">
        <Modal.Title>
          <i className="fas fa-file-signature me-2 text-success"></i>
          Apply to: {propertyTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <form onSubmit={handleSubmit}>
          {/* Message about yourself */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              <i className="fas fa-pen me-2 text-primary"></i>
              Tell the owner about yourself
            </label>
            <textarea
              className="form-control"
              rows={5}
              placeholder="Introduce yourself, mention your profession, family situation, or why you're interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={applying}
            />
            <small className="text-muted d-block mt-2">
              This helps the owner understand your background and intentions.
            </small>
          </div>

          {/* File attachments */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              <i className="fas fa-paperclip me-2 text-primary"></i>
              Attachments (Optional)
            </label>
            <div className="input-group mb-3">
              <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
                disabled={applying}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>
            <small className="text-muted d-block mb-2">
              Upload CV, ID copy, employment letter, references, etc. (Max 5 files)
            </small>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="mb-3">
                <h6 className="text-muted">Attachments:</h6>
                <ul className="list-unstyled">
                  {attachments.map((file, index) => (
                    <li key={index} className="mb-2 d-flex justify-content-between align-items-center">
                      <span className="text-truncate">
                        <i className="fas fa-file me-2 text-secondary"></i>
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeAttachment(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-zambia-green btn-lg"
              disabled={applying || !message.trim()}
            >
              {applying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Application
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onHide}
              disabled={applying}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default TenantApplyModal;
