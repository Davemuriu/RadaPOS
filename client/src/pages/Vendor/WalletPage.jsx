import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Wallet, ArrowUpRight, ArrowDownLeft, X, Landmark,
    AlertCircle, History, RefreshCw, CreditCard, Package,
    Loader2, Sun, Moon
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
            const [balanceRes, historyRes] = await Promise.all([
                api.get('/wallet/'),
                api.get('/wallet/settlements')
            ]);
            setBalance(balanceRes.data.current_balance);
            setSettlements(historyRes.data);
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
        if (parseFloat(amount) > balance) {
            alert("Insufficient balance for this withdrawal.");
            return;
        }
        setLoading(true);
        try {
            let cleanPhone = phone.trim();
            if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);

            await api.post('/wallet/withdraw', {
                amount: parseFloat(amount),
                phone: cleanPhone
            });

            alert("✅ Withdrawal request processed! Funds are being sent to your M-Pesa.");
            setShowModal(false);
            setAmount('');
            setPhone('');
            fetchWalletData();
        } catch (err) {
            alert(err.response?.data?.msg || "Withdrawal failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-container">
            {/* Header */}
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

            {/* Wallet Overview Grid */}
            <div className="dashboard-grid mb-8">
                {/* Main Balance Card */}
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
                        disabled={balance < 10}
                    >
                        <Landmark size={16} /> Request Payout
                    </button>
                </div>

                {/* Net Sales */}
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Net Sales Revenue</span>
                            <h2 className="stat-value text-emerald">
                                KES {settlements.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <ArrowDownLeft size={14} className="text-emerald" />
                                <span>Lifetime earnings</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing */}
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Processing Payouts</span>
                            <h2 className="stat-value text-indigo">KES 0.00</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <ArrowUpRight size={14} className="text-indigo" />
                                <span>Funds in transit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
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
                                <th className="text-right">Net Credit</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.length > 0 ? (
                                settlements.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-mono text-xs text-primary">
                                            {item.sale_id ? `SALE-INV-${item.sale_id}` : `WD-REF-${item.id}`}
                                        </td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="text-main font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-muted">{new Date(item.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="event-tag text-xs flex items-center gap-1 w-fit">
                                                <ArrowDownLeft size={12} /> Store Sale
                                            </span>
                                        </td>
                                        <td className="text-right font-bold font-mono text-main">
                                            KES {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="text-center">
                                            <span className="status-badge completed">
                                                {item.status || 'Success'}
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

            {/* Withdrawal Modal */}
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
                                    placeholder="Min KES 10.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>M-Pesa Payout Number</label>
                                <div className="input-with-icon">
                                    <CreditCard size={16} className="input-icon" />
                                    <input
                                        type="tel"
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="07XXXXXXXX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="info-box mt-4">
                                <AlertCircle size={16} className="text-primary shrink-0" />
                                <p>Payouts are sent via M-Pesa B2C. Ensure the number is active.</p>
                            </div>

                            <button className="btn-primary full-width mt-6" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Finalize Payout"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;