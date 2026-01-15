import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Search, Download, Trash2, Sun, Moon,
    CheckCircle, XCircle, Clock, DollarSign, Smartphone, FileText, File
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [userRole, setUserRole] = useState('');

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.role?.toUpperCase() || '');
            } catch (e) { console.error("Token decode error:", e); }
        }
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/transactions/');
            setSales(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching sales:", error);
            setLoading(false);
        }
    };

    // --- CSV EXPORT ---
    const handleDownloadCSV = async () => {
        try {
            const response = await api.get('/transactions/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) { alert("Failed to download CSV report"); }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await api.get('/vendor/reports/export-pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
            alert("Failed to download PDF report");
        }
    };

    const handleDownloadReceipt = async (saleId) => {
        try {
            const response = await api.get(`/mpesa/receipt/${saleId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) { alert("Could not download receipt"); }
    };

    const handleDelete = async (saleId) => {
        if (!window.confirm("Are you sure? This affects stock and reports.")) return;
        try {
            await api.delete(`/mpesa/sale/${saleId}`);
            setSales(sales.filter(s => s.id !== saleId));
            alert("Record deleted.");
        } catch (error) { alert("Delete failed."); }
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.id.toString().includes(searchTerm);
        const matchesDate = filterDate ? sale.created_at.startsWith(filterDate) : true;
        return matchesSearch && matchesDate;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return <span className="status-badge completed"><CheckCircle size={14} /> Paid</span>;
            case 'PENDING': return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
            case 'FAILED': return <span className="status-badge failed"><XCircle size={14} /> Failed</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">Sales History</h1>
                    <p className="page-subtitle">Transaction records & receipts</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button className="btn-white" onClick={handleDownloadPDF} title="Download Summary PDF">
                        <FileText size={18} /> PDF Report
                    </button>

                    <button className="btn-primary" onClick={handleDownloadCSV} title="Export Data CSV">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="glass-panel">
                <div className="filter-bar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text" className="search-input"
                            placeholder="Search ID or Cashier..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="date-wrapper">
                        <input
                            type="date"
                            value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th style={{ width: '140px' }}>Date</th>
                                <th style={{ width: '120px' }}>Cashier</th>
                                <th style={{ width: '90px' }}>Method</th>
                                <th>Breakdown</th>
                                <th style={{ width: '100px' }}>Total</th>
                                <th style={{ width: '90px' }}>Status</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Docs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center">Loading...</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan="8" className="text-center">No sales found</td></tr>
                            ) : (
                                filteredSales.map(sale => (
                                    <tr key={sale.id}>
                                        <td className="font-mono">#{sale.id}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{formatDate(sale.created_at)}</td>
                                        <td>{sale.cashier_name}</td>
                                        <td><span className={`method-badge ${sale.payment_method?.toLowerCase()}`}>{sale.payment_method}</span></td>

                                        <td style={{ fontSize: '0.85rem' }}>
                                            {sale.payment_method === 'SPLIT' ? (
                                                <div className="split-breakdown">
                                                    <span className="text-cash"><DollarSign size={12} /> {sale.amount_cash?.toLocaleString()}</span>
                                                    <span className="text-mpesa"><Smartphone size={12} /> {sale.amount_mpesa?.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>

                                        <td className="font-bold">KES {sale.total_amount.toLocaleString()}</td>
                                        <td>{getStatusBadge(sale.status)}</td>

                                        <td style={{ textAlign: 'center' }}>
                                            <div className="flex justify-center gap-2">
                                                <button className="icon-btn" onClick={() => handleDownloadReceipt(sale.id)} title="Receipt">
                                                    <FileText size={16} />
                                                </button>
                                                {userRole === 'VENDOR' && (
                                                    <button className="icon-btn delete" onClick={() => handleDelete(sale.id)} style={{ color: '#ef4444' }} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;