import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Wallet,
    Search,
    Sun,
    Moon,
    AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import '../../styles/Admin/AdminDashboard.css';
import '../../styles/Admin/AdminManagement.css';

export default function AdminWallet() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({ platform_earnings: 0, total_revenue: 0, pending_withdrawals: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // THEME LOGIC
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, statsRes] = await Promise.all([
                api.get('/admin/wallet/withdrawals'),
                api.get('/admin/wallet/stats')
            ]);
            setWithdrawals(walletRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Ledger sync failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const confirmMsg = action === 'approve'
            ? "Simulate payout? This will mark the request as COMPLETED."
            : "Reject this request? Funds will be returned to the vendor's balance.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.post(`/admin/wallet/withdrawals/${id}/${action}`);
            if (res.status === 200) {
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.msg || "Transaction failed");
        }
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.mpesa_number.includes(searchTerm)
    );

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Global Wallet & Payouts</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="simulation-badge">
                            SIMULATION MODE
                        </span>
                        <p className="page-subtitle">Oversee platform revenue and manage vendor payouts</p>
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="dashboard-grid stats-overview">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Platform Earnings (10%)</span>
                            <h2 className="stat-value highlight">KES {stats.platform_earnings.toLocaleString()}</h2>
                        </div>
                        <div className="stat-icon-wrapper earnings"><DollarSign size={24} /></div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Pending Payouts</span>
                            <h2 className="stat-value" style={{ color: '#f59e0b' }}>KES {stats.pending_withdrawals.toLocaleString()}</h2>
                        </div>
                        <div className="stat-icon-wrapper revenue"><Clock size={24} /></div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Total Processed Revenue</span>
                            <h2 className="stat-value">KES {stats.total_revenue.toLocaleString()}</h2>
                        </div>
                        <div className="stat-icon-wrapper vendors"><Wallet size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Main Content (Glass Panel) */}
            <div className="glass-panel main-panel">
                <div className="action-bar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by vendor or M-Pesa number..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Date requested</th>
                                <th>Vendor Details</th>
                                <th>Amount</th>
                                <th>Payout Destination</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-muted">Syncing wallet data...</td></tr>
                            ) : filteredWithdrawals.length > 0 ? (
                                filteredWithdrawals.map(w => (
                                    <tr key={w.id}>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-medium">{new Date(w.created_at).toLocaleDateString()}</span>
                                                <span className="text-muted text-xs">{new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-bold text-lg">{w.vendor_name}</span>
                                                <span className="text-primary text-xs">{w.vendor_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-bold text-yellow">KES {w.amount.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="event-tag">MPESA</span>
                                                <span className="font-mono text-muted">{w.mpesa_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${w.status.toLowerCase()}`}>
                                                {w.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {w.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(w.id, 'approve')}
                                                            className="icon-btn success"
                                                            title="Approve Simulation"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(w.id, 'reject')}
                                                            className="icon-btn delete"
                                                            title="Reject & Refund"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-muted font-bold uppercase tracking-widest">Closed</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-row">
                                        No pending withdrawal requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}