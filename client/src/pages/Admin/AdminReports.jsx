import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, TrendingUp, Loader2,
  BarChart3, Trophy, Medal, Printer,
  Sun, Moon, PieChart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import '../../styles/Admin/AdminManagement.css';
import '../../styles/Admin/AdminDashboard.css';

export default function AdminReports() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // --- THEME LOGIC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dailyRes, statsRes, paymentRes, graphRes, topVendorsRes] = await Promise.all([
        api.get("/admin/reports/daily"),
        api.get("/admin/stats"),
        api.get("/admin/reports/payment-methods"),
        api.get("/admin/dashboard/graph"),
        api.get("/admin/reports/top-vendors")
      ]);
      setReportData(dailyRes.data);
      setGlobalStats(statsRes.data);
      setPaymentStats(paymentRes.data);
      setGraphData(graphRes.data);
      setTopVendors(topVendorsRes.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleString();

      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text("RadaPOS Financial Summary", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${dateStr}`, 14, 30);
      doc.text(`Reporting Period: Daily (${reportData?.date || 'Today'})`, 14, 35);

      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: [
          ['Total Processed Volume', `KES ${globalStats?.total_collections?.toLocaleString()}`],
          ['Commission Revenue (10%)', `KES ${globalStats?.total_earnings?.toLocaleString()}`],
          ['Pending Payout Requests', globalStats?.pending_withdrawals_count || 0]
        ],
        headStyles: { fillColor: [16, 185, 129] },
        theme: 'striped'
      });

      doc.text("Top Performing Vendors", 14, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Vendor', 'Sales Count', 'Total Volume']],
        body: topVendors.map(v => [v.name, v.count, `KES ${v.amount.toLocaleString()}`]),
        theme: 'grid'
      });

      doc.save(`RadaPOS_Report_${reportData?.date || 'Export'}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return (
    <div className="management-container flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mb-4 text-primary mx-auto" size={40} />
        <p className="text-muted">Compiling Financial Intelligence...</p>
      </div>
    </div>
  );

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1 className="page-title">Financial Intelligence</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="simulation-badge">REAL-TIME LEDGER</span>
            <p className="page-subtitle">Revenue analysis and performance leaderboards</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={generatePDFReport} className="btn-primary" disabled={isExporting}>
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            <span>{isExporting ? "Generating..." : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-grid mb-8">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <span className="stat-title">Gross Volume</span>
              <h2 className="stat-value">KES {globalStats?.total_collections?.toLocaleString()}</h2>
              <div className="mt-2 flex items-center gap-1 text-green text-xs font-bold">
                <TrendingUp size={12} /> System Healthy
              </div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <span className="stat-title">Net Earnings (10%)</span>
              <h2 className="stat-value highlight">KES {globalStats?.total_earnings?.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-inner">
            <div>
              <span className="stat-title">Pending Payouts</span>
              <h2 className="stat-value text-yellow">{globalStats?.pending_withdrawals_count} Requests</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="glass-panel chart-panel mb-8">
        <div className="panel-header">
          <div className="header-icon"><BarChart3 size={18} /></div>
          <h3>7-Day Revenue Velocity</h3>
        </div>

        <div className="chart-wrapper">
          {graphData && graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => str ? str.split('-').slice(1).join('/') : ''}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `KES ${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-main)'
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
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              No transaction history available for the last 7 days.
            </div>
          )}
        </div>
      </div>

      {/* Split View: Leaderboard & Summary */}
      <div className="analytics-layout">
        {/* Vendor Leaderboard */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="header-icon"><Trophy size={18} className="text-yellow" /></div>
            <h3>Vendor Leaderboard</h3>
          </div>

          <div className="table-responsive">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vendor</th>
                  <th className="text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.length > 0 ? topVendors.map((vendor, index) => (
                  <tr key={index}>
                    <td>
                      <div className="rank-circle">
                        {index < 3 ? <Medal size={16} className={index === 0 ? "text-yellow" : "text-muted"} /> : index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="flex-col">
                        <span className="font-bold">{vendor.name}</span>
                        <span className="text-muted text-xs">{vendor.count} Sales</span>
                      </div>
                    </td>
                    <td className="text-right font-mono text-primary font-bold">
                      KES {vendor.amount.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="empty-row">No vendor data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Z-Summary / Daily Report */}
        <div className="stat-card h-fit">
          <div className="panel-header mb-6">
            <div className="header-icon"><PieChart size={18} /></div>
            <h3 className="stat-label" style={{ marginBottom: 0 }}>Daily Z-Summary</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Gross Sales</span>
              <span className="font-mono font-bold">KES {reportData?.gross_sales?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Transactions</span>
              <span className="font-mono font-bold">{reportData?.transaction_count || 0}</span>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">Net Cash</span>
                <span className="text-xl font-black font-mono">KES {reportData?.net_total?.toLocaleString() || 0}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-primary full-width mt-4"
              style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}