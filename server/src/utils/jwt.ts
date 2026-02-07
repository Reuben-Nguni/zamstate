import jwt from 'jsonwebtoken';
const jwtAny: any = jwt;
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: string) => {
  return jwtAny.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

export const verifyToken = (token: string) => {
  try {
    return jwtAny.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateActionToken = (userId: string, type: 'reset' | 'verify', expiresIn: string) => {
  return jwtAny.sign({ userId, type }, JWT_SECRET, { expiresIn });
};

export const verifyActionToken = (token: string) => {
  try {
    return jwtAny.verify(token, JWT_SECRET) as { userId: string; type: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
