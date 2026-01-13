import React, { useState, useEffect, useCallback } from 'react';
import {
  Database, AlertTriangle, Loader2, CheckCircle2,
  Printer, Shield, Trash2, FileClock, RefreshCcw,
  Info, Sun, Moon
} from 'lucide-react';
import api from '../../services/api';
import '../../styles/Admin/AdminManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const AdminSettings = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  // --- THEME LOGIC ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchLogs = useCallback(async () => {
    setIsFetchingLogs(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setIsFetchingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleInitializeDB = async () => {
    const doubleConfirm = window.confirm("CRITICAL: This will attempt to re-initialize system tables. Proceed?");
    if (!doubleConfirm) return;

    setIsInitializing(true);
    setStatus(null);

    try {
      const response = await api.post("/admin/db-init");
      if (response.status === 200 || response.status === 201) {
        setStatus('success');
        fetchLogs();
      }
    } catch (error) {
      setStatus('error');
      alert(error.response?.data?.msg || "DB Initialization failed.");
    } finally {
      setIsInitializing(false);
    }
  };

  const getActionColor = (action) => {
    const a = action.toUpperCase();
    if (a.includes('DELETE') || a.includes('ARCHIVE') || a.includes('REJECT')) return 'status-badge failed';
    if (a.includes('CREATE') || a.includes('APPROVE')) return 'status-badge completed';
    if (a.includes('EDIT') || a.includes('UPDATE')) return 'status-badge pending'; // Reusing pending style for edits (usually yellow/blue)
    return 'status-badge'; // Default
  };

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1 className="page-title">System Management</h1>
          <p className="page-subtitle">Hardware configuration and security audit</p>
        </div>
        {/* Theme Toggle */}
        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div className="analytics-layout" style={{ marginBottom: '2rem' }}>
        {/* Database Maintenance */}
        <div className="stat-card h-fit">
          <div className="panel-header mb-4">
            <div className="header-icon"><Database size={18} /></div>
            <div className="flex justify-between w-full items-center">
              <h3>Database Health</h3>
              {status === 'success' && <CheckCircle2 size={18} className="text-green animate-pulse" />}
            </div>
          </div>

          <div className="info-box">
            <Info size={16} className="text-primary shrink-0" />
            <p>
              System running on <code>SQLite</code>. Re-running setup verifies schema integrity.
            </p>
          </div>

          <button
            onClick={handleInitializeDB}
            disabled={isInitializing}
            className="btn-primary full-width mt-4"
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            {isInitializing ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
            {isInitializing ? "Verifying..." : "Verify Integrity"}
          </button>
        </div>

        {/* POS Hardware */}
        <div className="stat-card h-fit">
          <div className="panel-header mb-4">
            <div className="header-icon"><Printer size={18} /></div>
            <h3>POS Hardware</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="stat-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Print Width</label>
              <select className="form-select w-full" style={{ padding: '10px', borderRadius: '10px', width: '100%', background: 'var(--bg-page)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                <option>80mm (Standard)</option>
                <option>58mm (Compact)</option>
              </select>
            </div>
            <button className="action-btn w-full justify-center py-2">
              Test Printer Connection
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="stat-card h-fit" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="panel-header mb-4">
            <div className="header-icon" style={{ borderColor: '#ef4444', color: '#ef4444' }}><Shield size={18} /></div>
            <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl mb-4" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <span className="text-sm font-bold text-muted">Strict Session Mode</span>
            <div className="w-8 h-4 bg-red-600 rounded-full relative cursor-pointer">
              <div className="w-2 h-2 bg-white rounded-full absolute right-1 top-1" />
            </div>
          </div>

          <button className="btn-primary full-width" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
            <Trash2 size={16} /> Clear System Cache
          </button>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="glass-panel">
        <div className="panel-header flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="header-icon"><FileClock size={18} /></div>
            <h3>Security Audit Log</h3>
          </div>
          <button
            onClick={fetchLogs}
            className="action-btn"
            title="Refresh Logs"
          >
            <RefreshCcw size={16} className={isFetchingLogs ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Operation</th>
                <th>Target Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="font-mono text-muted text-xs">{log.date}</td>
                  <td className="font-bold">{log.user}</td>
                  <td>
                    <span className={getActionColor(log.action)}>
                      {log.action}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-muted max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="4" className="empty-row">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;