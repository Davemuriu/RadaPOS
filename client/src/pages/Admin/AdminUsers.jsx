import React, { useState, useEffect } from 'react';
import {
  UserPlus, X, Mail, Trash2, Sun, Moon,
  ShieldCheck, CheckCircle, ShieldAlert
} from 'lucide-react';
import '../../styles/Admin/AdminManagement.css';
import '../../styles/Admin/AdminDashboard.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'ADMIN' });
  const [loading, setLoading] = useState(true);

  // THEME LOGIC
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5555/api/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5555/api/admin/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'ADMIN' });
        fetchUsers();
        alert("Invitation Sent Successfully");
      } else {
        alert("Failed to create user");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this admin user? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:5555/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.msg || "Failed to delete user");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';

    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch(`http://localhost:5555/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">Manage system access and roles</p>
        </div>

        {/* Actions: Theme Toggle + Invite Button */}
        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary create-btn">
            <UserPlus size={18} /> Invite New Admin
          </button>
        </div>
      </div>

      {/* Main Content (Glass Panel) */}
      <div className="glass-panel main-panel">

        {/* Table */}
        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-muted">Loading Administrators...</td></tr>
              ) : users.length > 0 ? (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="event-info-cell">
                        <div className="event-initial" style={{ background: 'var(--border)' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex-col">
                          <span className="font-bold">{u.name}</span>
                          <span className="text-muted text-xs">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`event-tag ${u.role === 'ADMIN' ? 'admin-role' : 'manager-role'}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={12} style={{ marginRight: 4 }} /> : null}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status === 'suspended' ? 'failed' : 'completed'}`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleSuspend(u.id, u.status)}
                          className={`icon-btn ${u.status === 'active' ? 'warning' : 'success'}`}
                          title={u.status === 'active' ? "Suspend User" : "Activate User"}
                        >
                          {u.status === 'active' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                        </button>

                        <button
                          onClick={() => handleDelete(u.id)}
                          className="icon-btn delete"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="empty-row">No administrators found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-glass">
            <div className="modal-header">
              <h2>Invite Administrator</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-input"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. jane@radapos.com"
                />
              </div>

              <div className="form-group">
                <label>Access Level</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
                >
                  <option value="ADMIN">Administrator (Full Access)</option>
                  <option value="MANAGER">Manager (Limited Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary full-width"
              >
                <Mail size={16} /> Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}