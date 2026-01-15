import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Users, Wallet, Activity, ArrowUpRight, Clock, Award, RefreshCcw,
  Sun, Moon
} from 'lucide-react';
import '../../styles/Admin/AdminDashboard.css';
import api from '../../services/api';

export default function AdminDashboard() {
  const [graphData, setGraphData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsSyncing(true);

    try {
      const [graphRes, statsRes] = await Promise.all([
        api.get('/admin/dashboard/graph'),
        api.get('/admin/stats')
      ]);

      const graph = graphRes.data;
      const statistics = statsRes.data;

      setGraphData(Array.isArray(graph) ? graph : []);
      setStats(statistics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard sync error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Executive Dashboard</h1>
          <p className="dashboard-subtitle">Real-time platform performance & analytics</p>
        </div>

        <div className="dashboard-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="refresh-pill">
            <RefreshCcw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <h2 className="stat-number">KES {(stats?.total_collections || 0).toLocaleString()}</h2>
          </div>
          <div className="stat-icon revenue">
            <Wallet size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Platform Earnings</span>
            <h2 className="stat-number highlight">KES {(stats?.total_earnings || 0).toLocaleString()}</h2>
          </div>
          <div className="stat-icon earnings">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <span className="stat-label">Active Vendors</span>
            <h2 className="stat-number">{stats?.total_vendors || 0}</h2>
          </div>
          <div className="stat-icon vendors">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="analytics-layout">
        <div className="glass-panel chart-panel">
          <div className="panel-header">
            <div className="header-icon"><Activity size={18} /></div>
            <h3>Sales Volume (Last 7 Days)</h3>
          </div>

          <div className="chart-container">
            {!loading && graphData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme === 'dark' ? '#10b981' : '#059669'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme === 'dark' ? '#10b981' : '#059669'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `KES ${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke={theme === 'dark' ? '#10b981' : '#059669'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    isAnimationActive={!isSyncing}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p>{loading ? 'Synchronizing data...' : 'No sales activity recorded.'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel vendors-panel">
          <div className="panel-header">
            <Award size={18} className="text-yellow" />
            <h3>Top Performing Vendors</h3>
          </div>
          <div className="list-container">
            {stats?.active_events?.length > 0 ? (
              stats.active_events.slice(0, 5).map((vendor, idx) => (
                <div key={idx} className="list-item">
                  <div className="item-left">
                    <div className="rank-circle">{idx + 1}</div>
                    <div className="item-details">
                      <p className="item-title">{vendor.name}</p>
                      <p className="item-sub">ID: {vendor.created_by}</p>
                    </div>
                  </div>
                  <div className="item-right">
                    <p className="item-value">{vendor.vendors_count || 0}</p>
                    <p className="item-label">Events</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-text">No active data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel activity-panel">
        <div className="panel-header">
          <Clock size={18} className="text-green" />
          <h3>Recent Withdrawals & Activity</h3>
        </div>
        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_withdrawals?.length > 0 ? (
                stats.recent_withdrawals.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-primary">#WTH-{item.id}</td>
                    <td className="font-bold">{item.vendor_name}</td>
                    <td className="font-bold">KES {item.amount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">
                        Details <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">No recent activities found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}