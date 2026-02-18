import { Request, Response } from 'express';
import { User } from '../models/User.js';
import {
  generateToken,
  generateActionToken,
  verifyActionToken,
  hashPassword,
  comparePassword,
} from '../utils/jwt.js';
import { validationResult } from 'express-validator';
import emailServiceModule from '../services/emailService.js';
const emailService = emailServiceModule;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'tenant',
    });

    await user.save();

    // Send verification email (token expires in 10 min) and store token
    const verifyToken = generateActionToken(user._id.toString(), 'verify', '10m');
    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    // Determine base URL from request origin (falls back to configured CLIENT_URL)
    const baseUrl = req.get('origin') || CLIENT_URL;

    // Send verification and welcome emails asynchronously (don't wait)
    emailService.sendVerificationEmail(user, verifyToken, baseUrl).catch((err: any) => {
      console.error('[Auth] Failed to send verification email:', err?.message || err);
    });
    emailService.sendWelcomeEmail(user, baseUrl).catch((err: any) => {
      console.error('[Auth] Failed to send welcome email:', err?.message || err);
    });

    // Generate auth token for immediate use (optional)
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    // Always return 200 to avoid user enumeration
    if (!user) return res.json({ message: 'If the email exists, a reset link was sent.' });

    const resetToken = generateActionToken(user._id.toString(), 'reset', '15m');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Use request origin if available so links point to the frontend that initiated the request
    const baseUrl = req.get('origin') || CLIENT_URL;
    // Send email asynchronously (don't wait for it)
    emailService.sendPasswordResetEmail(user, resetToken, baseUrl).catch((err: any) => {
      console.error('[Auth] Failed to send password reset email:', err?.message || err);
    });

    return res.json({ message: 'If the email exists, a reset link was sent.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

    const payload = verifyActionToken(token);
    if (!payload || payload.type !== 'reset') return res.status(400).json({ message: 'Invalid token' });

    const user = await User.findById(payload.userId).select('+password');
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Verify token matches stored and not expired
    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Invalid or already used token' });
    }
    if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined as any;
    user.resetPasswordExpires = undefined as any;
    await user.save();

    try {
      await emailService.sendPasswordResetConfirmation(user);
    } catch (err) {
      console.error('Failed sending reset confirmation', err);
    }

    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = (req.query.token as string) || req.body.token;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const payload = verifyActionToken(token);
    if (!payload || payload.type !== 'verify') return res.status(400).json({ message: 'Invalid token' });

    const user = await User.findById(payload.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Ensure token matches stored token and not expired
    if (!user.emailVerificationToken || user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid or already used token' });
    }
    if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    user.isVerified = true;
    user.verified_at = new Date();
    user.emailVerificationToken = undefined as any;
    user.emailVerificationExpires = undefined as any;
    await user.save();

    // Send welcome email asynchronously (don't wait)
    const welcomeBase = req.get('origin') || CLIENT_URL;
    emailService.sendWelcomeEmail(user, welcomeBase).catch((err: any) => {
      console.error('[Auth] Failed to send welcome email:', err?.message || err);
    });

    // Redirect to frontend confirmation page if available
    const redirectUrl = `${CLIENT_URL}/email-verified?status=success`;
    return res.redirect(302, redirectUrl);
  } catch (error: any) {
    const redirectUrl = `${CLIENT_URL}/email-verified?status=error&message=${encodeURIComponent(error.message)}`;
    return res.redirect(302, redirectUrl);
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.json({ message: 'User already verified' });

    const verifyToken = generateActionToken(user._id.toString(), 'verify', '10m');
    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    const baseUrl = req.get('origin') || CLIENT_URL;
    // Send email asynchronously (don't wait)
    emailService.sendVerificationEmail(user, verifyToken, baseUrl).catch((err: any) => {
      console.error('[Auth] Failed to send verification email:', err?.message || err);
    });

    return res.json({ message: 'Verification email sent' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, avatar, whatsappNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phone, avatar, whatsappNumber },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password field
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Send confirmation email asynchronously
    emailService.sendPasswordResetConfirmation(user).catch((err: any) => {
      console.error('[Auth] Failed to send password change confirmation:', err?.message || err);
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: 'New email and password required' });
    }

    if (!newEmail.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Get user with password field
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    user.email = newEmail;
    user.isVerified = false;
    user.emailVerificationToken = undefined as any;
    user.emailVerificationExpires = undefined as any;
    await user.save();

    // Send verification email to new email address
    const verifyToken = generateActionToken(user._id.toString(), 'verify', '10m');
    user.emailVerificationToken = verifyToken;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const baseUrl = req.get('origin') || CLIENT_URL;
    emailService.sendVerificationEmail(user, verifyToken, baseUrl).catch((err: any) => {
      console.error('[Auth] Failed to send verification email for email update:', err?.message || err);
    });

    return res.json({ message: `Verification email sent to ${newEmail}. Please verify to complete the email change.` });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
