// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  isApproved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'tenant' | 'owner' | 'agent' | 'investor' | 'admin';

// Property types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'ZMW' | 'USD';
  type: PropertyType;
  status: PropertyStatus;
  location: Location;
  features: PropertyFeatures;
  images: string[];
  videos?: string[];
  floorPlans?: string[];
  owner: User;
  agent?: User;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'apartment' | 'house' | 'office' | 'land' | 'commercial';
export type PropertyStatus = 'available' | 'rented' | 'sold' | 'maintenance';

export interface Location {
  address: string;
  township: string;
  city: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  parking: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  utilities: string[]; // electricity, water, internet, etc.
}

// Booking types
export interface Booking {
  id: string;
  property: Property;
  tenant: User;
  agent?: User;
  date: Date;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Message types
export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  type: MessageType;
  attachments?: string[];
  readBy: string[]; // user IDs
  createdAt: Date;
}

export type MessageType = 'text' | 'image' | 'video' | 'file';

export interface Conversation {
  id: string;
  participants: User[];
  property?: Property;
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

// Maintenance types
export interface MaintenanceRequest {
  id: string;
  property: Property;
  tenant: User;
  title: string;
  description: string;
  priority: MaintenancePriority;
  category: string;
  status: MaintenanceStatus;
  images?: string[];
  assignedTo?: User;
  estimatedCost?: number;
  actualCost?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Payment types
export interface Payment {
  id: string;
  amount: number;
  currency: 'ZMW' | 'USD';
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  description: string;
  payer: User;
  payee: User;
  property?: Property;
  booking?: Booking;
  maintenance?: MaintenanceRequest;
  createdAt: Date;
  completedAt?: Date;
}

export type PaymentType = 'rent' | 'deposit' | 'commission' | 'maintenance' | 'other';
export type PaymentMethod = 'mobile_money' | 'bank_transfer' | 'card' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Analytics types
export interface AnalyticsData {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  propertyViews: number;
  userRegistrations: number;
  maintenanceRequests: number;
  townshipStats: TownshipStats[];
  monthlyRevenue: MonthlyData[];
  propertyTypeDistribution: PropertyTypeStats[];
}

export interface TownshipStats {
  township: string;
  properties: number;
  averagePrice: number;
  bookings: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  users: number;
}

export interface PropertyTypeStats {
  type: PropertyType;
  count: number;
  percentage: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Exclude<UserRole, 'admin'>;
}

export interface PropertyForm {
  title: string;
  description: string;
  price: number;
  currency: 'ZMW' | 'USD';
  type: PropertyType;
  address: string;
  township: string;
  city: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: boolean;
  furnished: boolean;
  petsAllowed: boolean;
  utilities: string[];
  images: File[];
}

// Filter types
export interface PropertyFilters {
  type?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  township?: string[];
  features?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
}
