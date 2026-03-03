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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = req.user.role;
    const userPermissions: string[] = (req.user.permissions && Array.isArray(req.user.permissions)) ? req.user.permissions : [];

    // Allow if role matches
    if (roles.includes(userRole)) return next();

    // Allow if any permission matches one of the provided values
    for (const r of roles) {
      if (userPermissions.includes(r)) return next();
    }

    // Admin override
    if (userRole === 'admin') return next();

    return res.status(403).json({ message: 'Access denied' });
  };
};

export const hasPermission = (user: any, perm: string) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms: string[] = (user.permissions && Array.isArray(user.permissions)) ? user.permissions : [];
  return perms.includes(perm);
};
