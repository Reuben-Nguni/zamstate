import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/jwt.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@zamstate.com' });
    if (adminExists) {
      console.log('✅ Admin user already exists');
      await disconnectDB();
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword('Admin@123456');
    const admin = new User({
      email: 'admin@zamstate.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+260 123 456 789',
      role: 'admin',
      isVerified: true,
    });

    await admin.save();

    console.log('✅ Admin user seeded successfully');
    console.log('Admin credentials:');
    console.log('Email: admin@zamstate.com');
    console.log('Password: Admin@123456');

    await disconnectDB();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
