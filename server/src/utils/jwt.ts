import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId: string) => {
  // jwt.sign accepts Secret as string | Buffer in types; ensure correct typing
  return jwt.sign({ userId }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
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
