import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Use mock data if API fails
            setStats({
                weekly_sales: [
                    { day: 'Mon', sales: 1200 },
                    { day: 'Tue', sales: 1900 },
                    { day: 'Wed', sales: 1500 },
                    { day: 'Thu', sales: 2200 },
                    { day: 'Fri', sales: 1800 },
                    { day: 'Sat', sales: 2500 },
                    { day: 'Sun', sales: 2100 },
                ],
                categories: [
                    { category: 'Electronics', count: 5 },
                    { category: 'Clothing', count: 8 },
                    { category: 'Food', count: 3 },
                    { category: 'Home', count: 4 },
                ],
                monthly_revenue: 12450,
                total_orders: 156,
                total_products: 24,
                low_stock: 3,
                new_customers: 18
            });
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h1>Vendor Dashboard</h1>
            </div>
            
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">${stats?.monthly_revenue?.toLocaleString() || '0'}</p>
                    <p className="stat-change">+12% from last month</p>
                </div>
                
                <div className="stat-card orders">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats?.total_orders || '0'}</p>
                    <p className="stat-change">+8% from last month</p>
                </div>
                
                <div className="stat-card products">
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats?.total_products || '0'}</p>
                    <p className="stat-change">{stats?.low_stock || '0'} low in stock</p>
                </div>
                
                <div className="stat-card customers">
                    <h3>New Customers</h3>
                    <p className="stat-value">{stats?.new_customers || '0'}</p>
                    <p className="stat-change">+5 from last month</p>
                </div>
            </div>
            
            <div className="charts-container">
                <div className="chart-box">
                    <h2>Weekly Sales</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.weekly_sales || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                            <Legend />
                            <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="chart-box">
                    <h2>Products by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.categories || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="category"
                            >
                                {stats?.categories?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Count']} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="recent-orders">
                <h2>Recent Orders</h2>
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#ORD-001</td>
                            <td>John Doe</td>
                            <td>2024-01-15</td>
                            <td>$124.99</td>
                            <td><span className="status-badge delivered">Delivered</span></td>
                        </tr>
                        <tr>
                            <td>#ORD-002</td>
                            <td>Jane Smith</td>
                            <td>2024-01-14</td>
                            <td>$89.50</td>
                            <td><span className="status-badge pending">Pending</span></td>
                        </tr>
                        <tr>
                            <td>#ORD-003</td>
                            <td>Bob Johnson</td>
                            <td>2024-01-13</td>
                            <td>$245.00</td>
                            <td><span className="status-badge shipped">Shipped</span></td>
                        </tr>
                        <tr>
                            <td>#ORD-004</td>
                            <td>Alice Brown</td>
                            <td>2024-01-12</td>
                            <td>$67.80</td>
                            <td><span className="status-badge delivered">Delivered</span></td>
                        </tr>
                        <tr>
                            <td>#ORD-005</td>
                            <td>Charlie Wilson</td>
                            <td>2024-01-11</td>
                            <td>$189.99</td>
                            <td><span className="status-badge pending">Pending</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;