import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, X, Landmark,
    AlertCircle, History, RefreshCw, CreditCard, Package,
    Loader2, Sun, Moon, CheckCircle, Clock
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const WalletPage = () => {
    const [balance, setBalance] = useState(0);
    const [settlements, setSettlements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const fetchWalletData = async () => {
        setRefreshing(true);
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get('/vendor/stats'),
                api.get('/vendor/wallet/history')
            ]);
            setBalance(statsRes.data.balance || 0);
            setSettlements(historyRes.data || []);
        } catch (err) {
            console.error("❌ Wallet sync error:", err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const withdrawAmount = parseFloat(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        if (withdrawAmount > balance) {
            alert("Insufficient balance for this withdrawal.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/vendor/wallet/request-withdrawal', {
                amount: withdrawAmount
            });

            alert("✅ Withdrawal request submitted! Admin approval pending.");
            setShowModal(false);
            setAmount('');
            setPhone('');
            fetchWalletData();
        } catch (err) {
            alert(err.response?.data?.msg || "Withdrawal failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">Financial Wallet</h1>
                    <p className="page-subtitle">Track earnings and request M-Pesa payouts</p>
                </div>

                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={fetchWalletData}
                        className="btn-primary"
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                        <span>Sync</span>
                    </button>
                </div>
            </div>

            <div className="dashboard-grid mb-8">
                <div className="stat-card primary-gradient">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title text-white/70">Settled Balance</span>
                            <h2 className="stat-value text-white">KES {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                                <CreditCard size={12} /> After 10% Platform Commission
                            </p>
                        </div>
                        <div className="stat-icon-wrapper bg-white/20 text-white">
                            <Wallet size={24} />
                        </div>
                    </div>
                    <button
                        className="btn-white full-width mt-4"
                        onClick={() => setShowModal(true)}
                        disabled={balance < 100}
                    >
                        <Landmark size={16} /> Request Payout
                    </button>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Net Sales Revenue</span>
                            <h2 className="stat-value text-emerald">
                                KES {settlements.filter(s => s.type === 'Sale Credit').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <ArrowDownLeft size={14} className="text-emerald" />
                                <span>Lifetime earnings</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Processing Payouts</span>
                            <h2 className="stat-value text-indigo">
                                KES {settlements.filter(s => s.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <ArrowUpRight size={14} className="text-indigo" />
                                <span>Funds in transit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel">
                <div className="panel-header mb-4">
                    <div className="header-icon"><History size={18} className="text-emerald" /></div>
                    <h3>Transaction History</h3>
                </div>

                <div className="table-responsive">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Timestamp</th>
                                <th>Type</th>
                                <th className="text-right">Amount</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.length > 0 ? (
                                settlements.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-mono text-xs text-primary">
                                            {item.type === 'Sale Credit' ? `SALE-CREDIT-${item.id}` : `PAYOUT-REQ-${item.id}`}
                                        </td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="text-main font-medium">{item.date.split(' ')[0]}</span>
                                                <span className="text-xs text-muted">{item.date.split(' ')[1]}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`event-tag text-xs flex items-center gap-1 w-fit ${item.type === 'Withdrawal' ? 'bg-red-100 text-red-700' : ''}`}>
                                                {item.type === 'Withdrawal' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="text-right font-bold font-mono text-main">
                                            KES {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-center">
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status === 'completed' && <CheckCircle size={12} />}
                                                {item.status === 'pending' && <Clock size={12} />}
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-row">
                                        <Package size={32} className="text-muted mb-2 inline-block" />
                                        <p>No wallet activity found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-glass">
                        <div className="modal-header">
                            <h2>Withdraw Funds</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleWithdraw} className="modal-form">
                            <div className="form-group">
                                <label>Amount to Withdraw (KES)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Min KES 100.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="100"
                                />
                            </div>

                            <div className="info-box mt-4">
                                <AlertCircle size={16} className="text-primary shrink-0" />
                                <p>Funds will be sent to the M-Pesa number registered in your profile.</p>
                            </div>

                            <button className="btn-primary full-width mt-6" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Request Payout"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;