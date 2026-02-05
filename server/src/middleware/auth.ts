import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
