import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Package, Loader2, BarChart3, Sun, Moon } from 'lucide-react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

export default function VendorDashboard() {
    const [stats, setStats] = useState({ today_sales: 0, total_orders: 0, low_stock: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const fetchVendorStats = async () => {
            try {
                const [statsRes, graphRes] = await Promise.all([
                    api.get('/vendor/stats'),
                    api.get('/vendor/sales-graph')
                ]);
                setStats(statsRes.data);
                setChartData(graphRes.data);
            } catch (err) {
                console.error("Dashboard failed to sync:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorStats();
    }, []);

    if (loading) return (
        <div className="management-container flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin mb-4 text-emerald mx-auto" size={40} />
                <p className="text-sm font-black uppercase tracking-widest animate-pulse text-muted">Syncing Storefront...</p>
            </div>
        </div>
    );

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Store Dashboard</h1>
                    <p className="page-subtitle">Track your business performance and inventory</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="dashboard-grid stats-overview">
                {/* Card 1 */}
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">SALES VOLUME</span>
                            {/* Force text-emerald to be bright */}
                            <h2 className="stat-value text-emerald">KES {stats.today_sales.toLocaleString()}</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <TrendingUp size={14} className="text-emerald" />
                                <span>Gross sales tracked</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">SUCCESSFUL SESSIONS</span>
                            {/* Standard white text */}
                            <h2 className="stat-value">{stats.total_orders}</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <ShoppingBag size={14} className="text-indigo" />
                                <span>Completed checkouts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">STOCK ALERTS</span>
                            {/* Conditional Coloring */}
                            <h2 className={`stat-value ${stats.low_stock > 0 ? 'text-red' : 'text-muted'}`}>
                                {stats.low_stock} Items Low
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <Package size={14} className={stats.low_stock > 0 ? "text-red" : ""} />
                                <span>Inventory health</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart Section */}
            <div className="glass-panel chart-panel">
                <div className="panel-header mb-6">
                    <div className="header-icon"><BarChart3 size={18} className="text-emerald" /></div>
                    <div className="flex justify-between w-full items-center">
                        <h3>7-Day Performance Trend</h3>
                        <span className="text-xs text-muted font-mono italic">Volume in KES</span>
                    </div>
                </div>

                <div className="chart-wrapper">
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="vendorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme === 'dark' ? '#34d399' : '#059669'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={theme === 'dark' ? '#34d399' : '#059669'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-muted)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }}
                                    tickFormatter={(str) => str ? str.split('-').slice(1).join('/') : ''}
                                />
                                <YAxis
                                    stroke="var(--text-muted)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }}
                                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-main)',
                                        borderRadius: '12px'
                                    }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={theme === 'dark' ? '#34d399' : '#059669'}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#vendorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            <p className="text-muted text-xs font-bold uppercase tracking-widest italic">
                                No sales activity found
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}