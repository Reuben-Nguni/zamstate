import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CONTACT_EMAIL = 'ngunireubenjr@gmail.com';
const PHONES = ['+2600970067982', '+260769963307', '+260774488025'];

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() && !message.trim()) {
      toast.error('Please enter a subject or message');
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Opening mail client...');
    window.location.href = mailto;
  };

  return (
    <div className="container-fluid py-5">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4">
            <h2 className="fw-bold mb-3">Contact Us</h2>
            <p className="text-muted">Have questions or need help listing your property? Send us a message using the form and we'll get back to you.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="mb-3">
                <label className="form-label">Your Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message here..."></textarea>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-zambia-green">Send Message</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); }}>Clear</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h4 className="fw-semibold mb-3">Other ways to reach us</h4>
            <p className="mb-2">Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
            <div className="mb-3">
              <p className="mb-1 fw-semibold">Phone</p>
              {PHONES.map((p) => (
                <p key={p} className="mb-1"><a href={`tel:${p.replace(/\s+/g, '')}`}>{p}</a></p>
              ))}
            </div>

            <div className="mt-4">
              <h6 className="fw-semibold">Office</h6>
              <p className="text-muted">Lusaka, Zambia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

