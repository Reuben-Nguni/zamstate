import React, { useState, useEffect } from 'react';
import { analyticsService } from '../utils/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data - replace with API call
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const [propertyTypeData, setPropertyTypeData] = useState<any[]>([]);

  const [townshipData, setTownshipData] = useState<any[]>([]);

  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);

  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);

  const [keyMetrics, setKeyMetrics] = useState<any>({
    totalRevenue: 0,
    totalBookings: 0,
    activeProperties: 0,
    totalUsers: 0,
    avgOccupancyRate: 0,
    maintenanceResolutionTime: 0,
  });

  const formatCurrency = (value: number) => {
    return `ZK ${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Fetch analytics on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await analyticsService.getOverview();
        const data = res || {};
        setKeyMetrics(data.keyMetrics || {});
        setRevenueData(data.revenueData || []);
        setPropertyTypeData((data.propertyTypeData || []).map((p: any) => ({ ...p, color: '#007A33' })));
        setUserGrowthData(data.userGrowthData || []);
        setMaintenanceData(data.maintenanceData || []);
        setTownshipData(data.townshipData || []);
      } catch (err) {
        console.warn('Failed to load analytics:', err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="analytics-page">
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
                <h1 className="h2 mb-1">Analytics Dashboard</h1>
                <p className="text-muted mb-0">
                  Last 30 days — Insights and performance metrics for ZAMSTATE platform.
                </p>
              </div>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button className="btn btn-outline-primary">
                  <i className="fas fa-download me-2"></i>
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-zambia-green mb-2">
                  {formatCurrency(keyMetrics.totalRevenue)}
                </div>
                <h6 className="text-muted">Total Revenue</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  +12.5%
                </small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-2">
                  {keyMetrics.totalBookings}
                </div>
                <h6 className="text-muted">Total Bookings</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  +8.2%
                </small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">
                  {keyMetrics.activeProperties}
                </div>
                <h6 className="text-muted">Active Properties</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  +5.1%
                </small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-2">
                  {keyMetrics.totalUsers}
                </div>
                <h6 className="text-muted">Total Users</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  +15.3%
                </small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">
                  {formatPercentage(keyMetrics.avgOccupancyRate)}
                </div>
                <h6 className="text-muted">Avg Occupancy</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  +2.1%
                </small>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="display-6 text-secondary mb-2">
                  {keyMetrics.maintenanceResolutionTime}d
                </div>
                <h6 className="text-muted">Avg Resolution Time</h6>
                <small className="text-success">
                  <i className="fas fa-arrow-down me-1"></i>
                  -0.5d
                </small>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row 1 */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Revenue & Bookings Trend</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Bookings'
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#007A33"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#17a2b8"
                      strokeWidth={2}
                      name="Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Property Types Distribution</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">User Growth</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tenants"
                      stroke="#007A33"
                      strokeWidth={2}
                      name="Tenants"
                    />
                    <Line
                      type="monotone"
                      dataKey="owners"
                      stroke="#ffc107"
                      strokeWidth={2}
                      name="Owners"
                    />
                    <Line
                      type="monotone"
                      dataKey="agents"
                      stroke="#17a2b8"
                      strokeWidth={2}
                      name="Agents"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Maintenance Performance</h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#dc3545" name="Requests" />
                    <Bar dataKey="resolved" fill="#28a745" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Township Performance Table */}
        <motion.div
          className="row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Township Performance</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Township</th>
                        <th>Properties</th>
                        <th>Avg. Price (ZK)</th>
                        <th>Occupancy Rate</th>
                        <th>Revenue</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {townshipData.map((township, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{township.township}</td>
                          <td>{township.properties}</td>
                          <td>{township.avgPrice.toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${Math.random() * 40 + 60}%` }}
                                ></div>
                              </div>
                              <small>{Math.floor(Math.random() * 20 + 70)}%</small>
                            </div>
                          </td>
                          <td>{formatCurrency(township.properties * township.avgPrice * 0.8)}</td>
                          <td>
                            <span className="badge bg-success">
                              <i className="fas fa-arrow-up me-1"></i>
                              +{Math.floor(Math.random() * 10 + 5)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
