import { Request, Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { Property } from '../models/Property.js';
import { User } from '../models/User.js';
import { MaintenanceRequest } from '../models/MaintenanceRequest.js';
import mongoose from 'mongoose';

const monthsBack = (n: number) => {
  const arr: { month: string; year: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({ month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() });
  }
  return arr;
};

export const overview = async (req: Request, res: Response) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: { $in: ['available', 'rented'] } });

    // Revenue (sum of completed payments)
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Avg occupancy: rented / total
    const rentedCount = await Property.countDocuments({ status: 'rented' });
    const avgOccupancyRate = totalProperties ? Math.round((rentedCount / totalProperties) * 100) : 0;

    // Maintenance avg resolution time (days)
    const completed = await MaintenanceRequest.find({ status: 'completed', completedAt: { $exists: true } }).select('createdAt completedAt').lean();
    const avgResolutionTime = completed.length
      ? +(completed.reduce((acc: number, cur: any) => acc + ((new Date(cur.completedAt).getTime() - new Date(cur.createdAt).getTime()) / (1000 * 3600 * 24)), 0) / completed.length).toFixed(1)
      : 0;

    // Monthly revenue & bookings for last 6 months
    const lastMonths = monthsBack(6);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);

    const paymentsAgg = await Payment.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: startDate } } },
      { $project: { amount: 1, month: { $dateToString: { format: '%b', date: '$completedAt' } }, year: { $year: '$completedAt' } } },
      { $group: { _id: { month: '$month', year: '$year' }, total: { $sum: '$amount' } } },
    ]);

    const bookingsAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { month: { $dateToString: { format: '%b', date: '$createdAt' } }, year: { $year: '$createdAt' } } },
      { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 } } },
    ]);

    const revenueData = lastMonths.map((m) => {
      const pr = paymentsAgg.find((p: any) => p._id.month === m.month && p._id.year === m.year);
      const br = bookingsAgg.find((p: any) => p._id.month === m.month && p._id.year === m.year);
      return { month: m.month, revenue: pr ? pr.total : 0, bookings: br ? br.count : 0 };
    });

    // Property type distribution
    const typeAgg = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const propertyTypeData = typeAgg.map((t: any) => ({ name: t._id, value: t.count }));

    // User growth per role (last 6 months)
    const usersAgg = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { role: 1, month: { $dateToString: { format: '%b', date: '$createdAt' } }, year: { $year: '$createdAt' } } },
      { $group: { _id: { role: '$role', month: '$month', year: '$year' }, count: { $sum: 1 } } },
    ]);

    const userGrowthData = lastMonths.map((m) => {
      const tenants = usersAgg.find((u: any) => u._id.month === m.month && u._id.year === m.year && u._id.role === 'tenant')?.count || 0;
      const owners = usersAgg.find((u: any) => u._id.month === m.month && u._id.year === m.year && u._id.role === 'owner')?.count || 0;
      const agents = usersAgg.find((u: any) => u._id.month === m.month && u._id.year === m.year && u._id.role === 'agent')?.count || 0;
      return { month: m.month, tenants, owners, agents };
    });

    // Township performance (basic)
    const townshipAgg = await Property.aggregate([
      { $group: { _id: '$location.township', properties: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    ]);
    const townshipData = townshipAgg.map((t: any) => ({ township: t._id || 'Unknown', properties: t.properties, avgPrice: Math.round(t.avgPrice || 0) }));

    res.json({
      keyMetrics: {
        totalRevenue,
        totalBookings,
        activeProperties,
        totalUsers,
        avgOccupancyRate,
        maintenanceResolutionTime: avgResolutionTime,
      },
      revenueData,
      propertyTypeData,
      userGrowthData,
      maintenanceData: [],
      townshipData,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default { overview };
