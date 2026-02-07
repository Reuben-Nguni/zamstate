import { Request, Response } from 'express';
import { User } from '../models/User.js';

export const getPresence = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'firstName lastName online lastSeen').lean();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default { getPresence };
