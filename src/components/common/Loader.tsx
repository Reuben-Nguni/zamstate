import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, message = 'Loading...' }) => {
  const loaderContent = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="spinner-border text-zambia-green mb-3"
        style={{ width: '3rem', height: '3rem' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </motion.div>
      {message && <p className="text-muted">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }}
      >
        {loaderContent}
      </div>
    );
  }

  return <div className="d-flex align-items-center justify-content-center py-5">{loaderContent}</div>;
};

export default Loader;
