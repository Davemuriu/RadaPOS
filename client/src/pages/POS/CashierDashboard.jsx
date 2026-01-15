import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    DollarSign, CreditCard, ShoppingBag, Clock, AlertTriangle,
    TrendingUp, LogOut, Loader2, Sun, Moon, ArrowRight
} from 'lucide-react';
import '../../styles/Cashier/CashierManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const CashierDashboard = () => {
    const [stats, setStats] = useState({
        total_cash: 0,
        total_mpesa: 0,
        transactions_count: 0,
        recent_sales: [],
        top_products: [],
        low_stock_alerts: []
    });
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);

    // THEME LOGIC
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const fetchMyStats = async () => {
        try {
            const res = await api.get('/analytics/cashier-summary');
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching cashier stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyStats(); }, []);

    const handleEndShift = async () => {
        const confirmEnd = window.confirm("Are you sure you want to end your shift? This will generate your final Z-Report for handover.");
        if (!confirmEnd) return;

        setGeneratingReport(true);
        try {
            const res = await api.get('/analytics/shift-report');
            const data = res.data;

            // Generate HTML Report for Print
            const reportWindow = window.open('', '_blank');
            reportWindow.document.write(`
                <html>
                    <head>
                        <title>Shift Report - ${data.cashier_name}</title>
                        <style>
                            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; line-height: 1.4; }
                            .header { text-align: center; margin-bottom: 20px; }
                            .divider { border-top: 1px dashed #000; margin: 15px 0; }
                            .row { display: flex; justify-content: space-between; margin: 5px 0; }
                            .bold { font-weight: bold; font-size: 1.2em; }
                            .footer { margin-top: 40px; }
                            .sig { margin-top: 30px; border-top: 1px solid #000; width: 200px; display: inline-block; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h2>${data.business_name.toUpperCase()}</h2>
                            <p>SHIFT Z-REPORT</p>
                        </div>
                        <div class="divider"></div>
                        <div class="row"><span>Cashier:</span> <span>${data.cashier_name}</span></div>
                        <div class="row"><span>Date:</span> <span>${data.date}</span></div>
                        <div class="row"><span>Generated:</span> <span>${data.time_generated}</span></div>
                        
                        <div class="divider"></div>
                        <div class="row bold"><span>CASH TOTAL:</span> <span>KES ${data.totals.cash.toLocaleString()}</span></div>
                        <div class="row bold"><span>M-PESA TOTAL:</span> <span>KES ${data.totals.mpesa.toLocaleString()}</span></div>
                        <div class="divider"></div>
                        <div class="row bold"><span>GRAND TOTAL:</span> <span>KES ${data.totals.grand_total.toLocaleString()}</span></div>
                        <div class="row"><span>TRANS COUNT:</span> <span>${data.totals.transaction_count}</span></div>
                        
                        <div class="divider"></div>
                        <h3>ITEMIZED SALES</h3>
                        ${data.items.map(i => `
                            <div class="row">
                                <span>${i.name} x${i.qty}</span>
                                <span>KES ${i.revenue.toLocaleString()}</span>
                            </div>
                        `).join('')}
                        
                        <div class="footer">
                            <div style="display: flex; justify-content: space-between;">
                                <div><div class="sig"></div><br>Cashier Signature</div>
                                <div><div class="sig"></div><br>Manager Signature</div>
                            </div>
                        </div>
                        <script>window.print();</script>
                    </body>
                </html>
            `);
            reportWindow.document.close();
        } catch (error) {
            alert("Failed to generate shift report. Please try again.");
        } finally {
            setGeneratingReport(false);
        }
    };

    if (loading) return (
        <div className="management-container flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin mb-4 text-emerald mx-auto" size={40} />
                <p className="text-muted font-bold uppercase tracking-widest">Syncing Shift Data...</p>
            </div>
        </div>
    );

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">My Shift Summary</h1>
                    <p className="page-subtitle">Performance tracking for {new Date().toLocaleDateString()}</p>
                </div>

                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        className="btn-danger"
                        onClick={handleEndShift}
                        disabled={generatingReport}
                    >
                        {generatingReport ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                        <span>{generatingReport ? "Generating..." : "End Shift"}</span>
                    </button>
                </div>
            </div>

            {/* TOP STATS */}
            <div className="dashboard-grid stats-overview">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Cash in Drawer</span>
                            <h2 className="stat-value text-emerald">KES {stats.total_cash.toLocaleString()}</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <DollarSign size={14} className="text-emerald" />
                                <span>Ready for Reconciliation</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">M-Pesa Collections</span>
                            <h2 className="stat-value text-indigo">KES {stats.total_mpesa.toLocaleString()}</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <CreditCard size={14} className="text-indigo" />
                                <span>Digital Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div>
                            <span className="stat-title">Daily Performance</span>
                            <h2 className="stat-value text-primary">{(stats.total_cash + stats.total_mpesa).toLocaleString()}</h2>
                            <div className="flex items-center gap-2 text-xs text-muted mt-2">
                                <TrendingUp size={14} className="text-primary" />
                                <span>{stats.transactions_count} Total Sales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SPLIT VIEW: Recent Sales & Side Analytics */}
            <div className="cashier-split-view">

                {/* RECENT ACTIVITY */}
                <div className="glass-panel sales-list">
                    <div className="panel-header mb-4">
                        <div className="header-icon"><Clock size={18} className="text-emerald" /></div>
                        <h3>Recent Shift Sales</h3>
                    </div>

                    <div className="table-responsive">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_sales.length > 0 ? stats.recent_sales.map(sale => (
                                    <tr key={sale.id}>
                                        <td className="font-mono text-xs text-primary">#INV-{sale.id}</td>
                                        <td>
                                            <span className={`method-badge ${sale.method.toLowerCase()}`}>
                                                {sale.method}
                                            </span>
                                        </td>
                                        <td className="font-bold text-main">KES {sale.amount.toLocaleString()}</td>
                                        <td className="text-xs text-muted">{sale.time}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="empty-row text-center py-8 text-muted">No sales recorded this shift.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDEBAR: ANALYTICS */}
                <div className="analytics-sidebar">
                    <div className="stat-card h-fit">
                        <div className="panel-header mb-4">
                            <div className="header-icon"><TrendingUp size={18} className="text-emerald" /></div>
                            <h3>Top Moving Items</h3>
                        </div>
                        <div className="top-items-list">
                            {stats.top_products?.length > 0 ? stats.top_products.map((item, idx) => (
                                <div key={idx} className="top-item-row">
                                    <span className="text-main font-medium text-sm">{item.name}</span>
                                    <span className="count-pill">{item.count} sold</span>
                                </div>
                            )) : <p className="empty-text">No item data yet.</p>}
                        </div>
                    </div>

                    <div className="stat-card h-fit warning-card">
                        <div className="panel-header mb-4">
                            <div className="header-icon warning"><AlertTriangle size={18} /></div>
                            <h3 className="text-red">Stock Alerts</h3>
                        </div>
                        <div className="alerts-list">
                            {stats.low_stock_alerts?.length > 0 ? stats.low_stock_alerts.map((item, idx) => (
                                <div key={idx} className="alert-row">
                                    <span className="text-main font-bold text-sm">{item.name}</span>
                                    <span className="text-red text-xs font-bold">Only {item.stock} left</span>
                                </div>
                            )) : (
                                <div className="flex items-center gap-2 text-muted text-sm">
                                    <ShoppingBag size={16} /> All stocked up!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;