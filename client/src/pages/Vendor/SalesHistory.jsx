import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Search, Calendar, ChevronRight, Receipt, User,
    ShoppingBag, Clock, Loader2, FileText, Sun, Moon,
    CheckCircle, XCircle
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/mpesa/history');
            setSales(res.data);
            setFilteredSales(res.data);
            if (res.data.length > 0) setSelectedSale(res.data[0]);
        } catch (error) {
            console.error("Error fetching sales history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = sales.filter(s =>
            s.id.toString().includes(lowerTerm) ||
            s.cashier_name?.toLowerCase().includes(lowerTerm)
        );
        setFilteredSales(filtered);
    }, [searchTerm, sales]);

    const downloadReceipt = async (saleId) => {
        try {
            const response = await api.get(`/mpesa/receipt/${saleId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("Receipt generation failed.");
        }
    };

    if (loading) return (
        <div className="management-container flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin mb-4 text-emerald mx-auto" size={40} />
                <p className="text-muted font-bold uppercase tracking-widest">Loading Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Sales Ledger</h1>
                    <p className="page-subtitle">Review all completed and pending transactions</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Split View Content */}
            <div className="history-split-view">
                {/* Left Side: Sales List */}
                <div className="glass-panel list-section">
                    <div className="action-bar">
                        <div className="search-wrapper w-full">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by Ref ID or Cashier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '600px' }}>
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Time</th>
                                    <th>Cashier</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        onClick={() => setSelectedSale(sale)}
                                        className={selectedSale?.id === sale.id ? 'active-row' : 'clickable-row'}
                                    >
                                        <td className="font-mono text-xs text-primary">#{sale.id}</td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-medium text-main">{new Date(sale.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-muted">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm text-main">
                                                <User size={14} className="text-muted" /> {sale.cashier_name}
                                            </div>
                                        </td>
                                        <td className="font-bold text-main">KES {sale.total_amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`status-badge ${sale.status.toLowerCase() === 'completed' ? 'completed' : 'failed'}`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr><td colSpan="5" className="empty-row">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Details Panel */}
                <div className="glass-panel detail-section">
                    {selectedSale ? (
                        <div className="detail-content">
                            <div className="panel-header mb-6">
                                <div className="header-icon"><Receipt size={18} className="text-emerald" /></div>
                                <h3>Transaction Details</h3>
                            </div>

                            <div className="detail-card-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-muted text-sm">Status</span>
                                    <span className={`status-badge ${selectedSale.status.toLowerCase() === 'completed' ? 'completed' : 'failed'}`}>
                                        {selectedSale.status}
                                    </span>
                                </div>

                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <Clock size={14} className="text-muted" />
                                        <span>{new Date(selectedSale.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FileText size={14} className="text-muted" />
                                        <span>Method: {selectedSale.payment_method}</span>
                                    </div>
                                </div>

                                <div className="divider my-6"></div>

                                <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Items Sold</h4>
                                <div className="items-list">
                                    {selectedSale.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <div className="flex-col">
                                                <span className="text-main font-bold">{item.product_name}</span>
                                                <span className="text-xs text-muted">x{item.quantity}</span>
                                            </div>
                                            <span className="text-main font-mono">KES {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider my-6"></div>

                                <div className="total-row flex justify-between items-end mb-8">
                                    <span className="text-muted">Total Value</span>
                                    <span className="text-2xl font-black text-emerald">KES {selectedSale.total_amount.toLocaleString()}</span>
                                </div>

                                <button
                                    className="btn-primary full-width"
                                    onClick={() => downloadReceipt(selectedSale.id)}
                                >
                                    <Receipt size={16} /> Download Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state h-full flex flex-col items-center justify-center text-muted">
                            <ShoppingBag size={48} className="mb-4 opacity-50" />
                            <p>Select a transaction to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;