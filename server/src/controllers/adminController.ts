import { Request, Response } from 'express';
import { User } from '../models/User.js';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending users (not approved - admin only)
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find(
      { isApproved: false, role: { $ne: 'admin' } },
      { password: 0 }
    ).sort({ createdAt: -1 });
    res.json({ data: pendingUsers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a user for posting properties
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true, select: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User approved successfully', 
      data: user 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject/revoke user approval
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: false },
      { new: true, select: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'User approval revoked', 
      data: user 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user approval status
export const getUserApprovalStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user?.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      isApproved: user.isApproved,
      canPostProperties: user.role === 'admin' || user.isApproved
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user from the system (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Prevent deletion of the requesting admin
    if (userId === (req as any).user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Prevent deletion of other admins
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      message: 'User deleted successfully',
      deletedUserId: userId
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
