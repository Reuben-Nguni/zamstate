import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { propertyService } from '../utils/api';
import apiClient from '../utils/api';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    unreadMessages: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch properties count
        const propertiesRes = await propertyService.getProperties({ limit: 1 });
        const totalProperties = propertiesRes.pagination?.total || 0;

        // Fetch bookings count
        const bookingsRes = await apiClient('/bookings');
        const activeBookings = (bookingsRes.bookings || []).filter(
          (b: any) => b.status === 'confirmed' || b.status === 'pending'
        ).length;

        // Fetch unread messages count (if available)
        const messagesRes = await apiClient('/messages/conversations');
        const convs = Array.isArray(messagesRes) ? messagesRes : (messagesRes.conversations || messagesRes.data || []);
        const unreadMessages = (convs || []).filter((c: any) => c.unreadCount > 0).length;

        // Set stats
        setStats({
          totalProperties,
          activeBookings,
          monthlyRevenue: 45000, // placeholder - would need actual revenue API
          unreadMessages,
        });

        // Fetch recent activities
        const activitiesRes = await apiClient('/bookings');
        const mockActivities = [
          {
            type: 'booking',
            message: `You have ${activeBookings} active bookings`,
            time: 'Just now',
            icon: 'fas fa-calendar-plus',
          },
          ...((activitiesRes.bookings || []).slice(0, 3).map((b: any) => ({
            type: 'booking',
            message: `Booking for "${b.property?.title || 'Property'}" - ${b.status}`,
            time: new Date(b.createdAt).toLocaleDateString(),
            icon: 'fas fa-calendar-check',
          })) || []),
        ];
        setRecentActivities(mockActivities);
      } catch (err: any) {
        console.warn('Failed to fetch dashboard data:', err.message);
        // Fallback to default state
        setRecentActivities([
          {
            type: 'booking',
            message: 'Welcome to your dashboard',
            time: 'Just now',
            icon: 'fas fa-home',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Properties',
        description: 'Manage your property listings',
        icon: 'fas fa-home',
        link: '/properties',
        color: 'primary',
        count: '12',
      },
      {
        title: 'Bookings',
        description: 'View and manage appointments',
        icon: 'fas fa-calendar-check',
        link: '/bookings',
        color: 'success',
        count: '8',
      },
      {
        title: 'Messages',
        description: 'Communicate with tenants & agents',
        icon: 'fas fa-comments',
        link: '/messages',
        color: 'info',
        count: '24',
      },
    ];

    // Add role-specific cards
    if (user?.role === 'tenant' || user?.role === 'owner') {
      baseCards.push({
        title: 'Maintenance',
        description: 'Report and track issues',
        icon: 'fas fa-tools',
        link: '/maintenance',
        color: 'warning',
        count: '3',
      });
    }

    if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'agent') {
      baseCards.push({
        title: 'Analytics',
        description: 'View platform insights',
        icon: 'fas fa-chart-bar',
        link: '/analytics',
        color: 'secondary',
        count: 'Reports',
      });
    }

    return baseCards;
  };

  const recentActivityList = recentActivities.length > 0 ? recentActivities : [
    {
      type: 'booking',
      message: 'Welcome to your dashboard',
      time: 'Just now',
      icon: 'fas fa-home',
    },
  ];

  const quickStats = [
    { label: 'Total Properties', value: stats.totalProperties, change: '+2', trend: 'up' },
    { label: 'Active Bookings', value: stats.activeBookings, change: '+3', trend: 'up' },
    { label: 'Monthly Revenue', value: `ZK ${stats.monthlyRevenue.toLocaleString()}`, change: '+12%', trend: 'up' },
    { label: 'Messages', value: stats.unreadMessages, change: '-5', trend: 'down' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container-fluid py-4">
        {/* Header */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1">Welcome back, {user?.firstName}!</h1>
                <p className="text-muted mb-0">
                  Here's what's happening with your properties today.
                </p>
              </div>
              <div className="d-flex gap-2">
                <Link to="/properties" className="btn btn-zambia-green">
                  <i className="fas fa-plus me-2"></i>
                  Add Property
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {quickStats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="text-muted mb-1">{stat.label}</h6>
                      <h3 className="mb-1">{stat.value}</h3>
                      <small className={`text-${stat.trend === 'up' ? 'success' : 'danger'}`}>
                        <i className={`fas fa-arrow-${stat.trend} me-1`}></i>
                        {stat.change}
                      </small>
                    </div>
                    <div className="text-muted">
                      <i className="fas fa-chart-line fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Dashboard Cards */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {getDashboardCards().map((card, index) => (
            <div key={index} className="col-lg-4 col-md-6 mb-4">
              <Link to={card.link} className="text-decoration-none">
                <div className="card h-100 dashboard-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`bg-${card.color} bg-opacity-10 p-3 rounded me-3`}>
                        <i className={`${card.icon} text-${card.color} fa-2x`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-1">{card.title}</h5>
                        <p className="card-text text-muted small mb-0">{card.description}</p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-light text-dark">{card.count}</span>
                      <i className="fas fa-arrow-right text-muted"></i>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Activity
                </h5>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentActivityList.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentActivityList.map((activity, index) => (
                    <div key={index} className="list-group-item px-4 py-3">
                      <div className="d-flex align-items-start">
                        <div className={`bg-${activity.type === 'booking' ? 'success' : activity.type === 'message' ? 'info' : activity.type === 'payment' ? 'primary' : 'warning'} bg-opacity-10 p-2 rounded me-3`}>
                          <i className={`${activity.icon} text-${activity.type === 'booking' ? 'success' : activity.type === 'message' ? 'info' : activity.type === 'payment' ? 'primary' : 'warning'}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1">{activity.message}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <i className="fas fa-chevron-right text-muted"></i>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/properties" className="btn btn-outline-primary">
                    <i className="fas fa-plus me-2"></i>
                    List New Property
                  </Link>
                  <Link to="/bookings" className="btn btn-outline-success">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Schedule Viewing
                  </Link>
                  <Link to="/messages" className="btn btn-outline-info">
                    <i className="fas fa-envelope me-2"></i>
                    Send Message
                  </Link>
                  <Link to="/maintenance" className="btn btn-outline-warning">
                    <i className="fas fa-tools me-2"></i>
                    Report Issue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
