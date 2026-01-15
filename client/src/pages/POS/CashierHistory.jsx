import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Search, FileText, Loader2, Sun, Moon,
    DollarSign, Smartphone, Download
} from 'lucide-react';
import '../../styles/Cashier/CashierManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const CashierHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/');
                setTransactions(res.data);
                setFilteredTransactions(res.data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = transactions.filter(t =>
            t.id.toString().includes(lowerTerm) ||
            t.total_amount.toString().includes(lowerTerm)
        );
        setFilteredTransactions(filtered);
    }, [searchTerm, transactions]);

    const handleDownloadReceipt = async (saleId) => {
        try {
            const response = await api.get(`/mpesa/receipt/${saleId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("Could not download receipt");
        }
    };

    const getPaymentBadge = (method) => {
        let className = 'method-badge';
        if (method === 'CASH') className += ' cash';
        else if (method === 'MPESA') className += ' mpesa';
        else className += ' split';
        return <span className={className}>{method}</span>;
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">My Sales History</h1>
                    <p className="page-subtitle">View all transactions you have processed</p>
                </div>

                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass-panel main-panel">
                {/* Search Bar */}
                <div className="action-bar mb-6">
                    <div className="search-wrapper w-full max-w-md">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by Receipt ID or Amount..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Receipt ID</th>
                                <th>Date & Time</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Payment Method</th>
                                <th>Breakdown</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-8 text-muted"><Loader2 className="animate-spin inline mr-2" /> Loading Records...</td></tr>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="font-mono text-xs text-primary">#{tx.id}</td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-medium text-main">{new Date(tx.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-muted">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="text-sm text-main">{tx.items_count} Items</td>
                                        <td className="font-bold text-main">KES {tx.total_amount.toLocaleString()}</td>
                                        <td>
                                            {getPaymentBadge(tx.payment_method)}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {tx.payment_method === 'SPLIT' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <DollarSign size={12} /> Cash: {tx.amount_cash.toLocaleString()}
                                                    </span>
                                                    <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Smartphone size={12} /> M-Pesa: {tx.amount_mpesa.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${tx.status.toLowerCase()}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn"
                                                title="Download Receipt"
                                                onClick={() => handleDownloadReceipt(tx.id)}
                                            >
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="empty-row text-center py-12">
                                        <FileText size={32} className="text-muted mb-2 inline-block opacity-50" />
                                        <p className="text-muted font-medium">No transactions found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CashierHistory;