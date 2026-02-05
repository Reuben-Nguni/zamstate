import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};
