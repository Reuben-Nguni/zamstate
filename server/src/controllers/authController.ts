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
import { sendEmail } from '../utils/mailer.js';

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

    // Send verification email (token expires in 24h)
    const verifyToken = generateActionToken(user._id.toString(), 'verify', '24h');
    const verifyLink = `${CLIENT_URL}/verify-email?token=${verifyToken}`;
    const html = `<p>Hi ${user.firstName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyLink}">Verify email</a></p>
      <p>If you didn't sign up, ignore this email.</p>`;
    try {
      await sendEmail(user.email, 'Verify your email', html);
    } catch (err) {
      console.error('Failed sending verification email', err);
    }

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
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
    const html = `<p>Hi ${user.firstName},</p>
      <p>Click the link below to reset your password (expires in 15 minutes):</p>
      <p><a href="${resetLink}">Reset password</a></p>`;
    try {
      await sendEmail(user.email, 'Password reset request', html);
    } catch (err) {
      console.error('Error sending reset email', err);
    }

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

    user.password = await hashPassword(password);
    await user.save();

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

    user.isVerified = true;
    user.verified_at = new Date();
    await user.save();

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

    const verifyToken = generateActionToken(user._id.toString(), 'verify', '24h');
    const verifyLink = `${CLIENT_URL}/verify-email?token=${verifyToken}`;
    const html = `<p>Hi ${user.firstName},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyLink}">Verify email</a></p>`;
    try {
      await sendEmail(user.email, 'Verify your email', html);
    } catch (err) {
      console.error('Failed sending verification email', err);
    }

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
