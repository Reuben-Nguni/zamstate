import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter per key (email or IP). For production, use Redis.
const attempts: Record<string, { count: number; firstSeen: number }> = {};
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5;

export const passwordResetRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = (req.body.email || req.ip || 'unknown').toString().toLowerCase();
  const now = Date.now();
  const entry = attempts[key];
  if (!entry) {
    attempts[key] = { count: 1, firstSeen: now };
    return next();
  }
  if (now - entry.firstSeen > WINDOW_MS) {
    attempts[key] = { count: 1, firstSeen: now };
    return next();
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ message: 'Too many requests. Try again later.' });
  }
  entry.count += 1;
  return next();
};

export default passwordResetRateLimiter;
