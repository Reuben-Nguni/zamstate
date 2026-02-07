import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const EmailVerified: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          {status === 'success' ? (
            <>
              <h3>Email verified</h3>
              <p>Your email has been successfully verified. You can now <Link to="/login">login</Link>.</p>
            </>
          ) : (
            <>
              <h3>Verification failed</h3>
              <p>{message || 'We could not verify your email.'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
