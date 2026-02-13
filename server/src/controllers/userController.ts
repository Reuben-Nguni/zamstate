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

export const getTenants = async (req: Request, res: Response) => {
  try {
    // Fetch all users except admin and owner/agent
    const tenants = await User.find(
      { $or: [
        { role: 'tenant' },
        { role: 'user' },
        { role: { $exists: false } }
      ]},
      '_id firstName lastName email phone profileImage role'
    ).sort({ firstName: 1 }).lean();
    
    console.log('Fetched tenants:', tenants.length); // Debug log
    res.json({ data: tenants });
  } catch (error: any) {
    console.error('Error in getTenants:', error);
    res.status(500).json({ message: error.message });
  }
};

export default { getPresence, getTenants };
