import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, Search, Trash2, Edit2, Mail, Key,
  ShieldAlert, CheckCircle, ChevronDown, Filter, Store,
  Sun, Moon
} from 'lucide-react';
import '../../styles/Admin/AdminManagement.css';
import '../../styles/Admin/AdminDashboard.css';

export default function AdminVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    business_name: '',
    kra_pin: '',
    business_permit_no: '',
    event_id: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorRes, eventRes] = await Promise.all([
        fetch('http://localhost:5555/api/admin/vendors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5555/api/admin/events', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const vendorData = await vendorRes.json();
      const eventData = await eventRes.json();

      setVendors(vendorData.vendors || []);
      setEvents(eventData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditMode(true);
    setCurrentId(vendor.id);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      business_name: vendor.business_name || '',
      kra_pin: vendor.kra_pin || '',
      business_permit_no: vendor.business_permit_no || '',
      event_id: vendor.current_event_id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editMode
      ? `http://localhost:5555/api/admin/vendors/${currentId}`
      : `http://localhost:5555/api/admin/vendors`;

    const method = editMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        setFormData(initialFormState);
        alert(editMode ? "Vendor updated successfully." : "Vendor registered. Credentials have been emailed.");
      } else {
        alert(data.msg || "Operation failed");
      }
    } catch (err) {
      alert("Network error occurred");
    }
  };

  const handleResetPassword = async (id, email) => {
    if (!window.confirm(`Reset password for ${email}? A new temporary password will be emailed.`)) return;

    try {
      const res = await fetch(`http://localhost:5555/api/admin/vendors/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) alert(data.msg);
      else alert(data.msg || "Reset failed");
    } catch (err) {
      alert("Network error occurred");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} this vendor?`)) return;

    try {
      const res = await fetch(`http://localhost:5555/api/admin/vendors/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this vendor? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5555/api/admin/vendors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        alert("Vendor deleted successfully.");
      } else {
        alert("Failed to delete vendor");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">Manage business partners and legal compliance</p>
        </div>

        {/* Actions: Theme Toggle + Create Button */}
        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={openCreate} className="btn-primary create-btn">
            <Plus size={18} /> Onboard Vendor
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel main-panel">

        {/* Search & Filter */}
        <div className="action-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search vendors by name or business..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-wrapper">
            <div className="filter-label">
              <Store size={14} /> <span>{vendors.length} Total Vendors</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Business Entity</th>
                <th>Contact Person</th>
                <th>Permit / PIN</th>
                <th>Assigned Event</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">Loading Registry...</td></tr>
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="flex-col">
                        <span className="font-bold text-lg">{v.business_name || v.name}</span>
                        <span className="text-muted text-xs">{v.email}</span>
                      </div>
                    </td>
                    <td className="font-medium">{v.name}</td>
                    <td>
                      <div className="flex-col font-mono text-xs">
                        <span>{v.business_permit_no || 'N/A'}</span>
                        <span className="text-primary">{v.kra_pin || 'No PIN'}</span>
                      </div>
                    </td>
                    <td>
                      {v.current_event !== 'None' ? (
                        <span className="event-tag">{v.current_event}</span>
                      ) : (
                        <span className="text-muted italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${v.status === 'active' ? 'completed' : 'failed'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleResetPassword(v.id, v.email)} className="icon-btn warning" title="Reset Password">
                          <Key size={16} />
                        </button>
                        <button onClick={() => openEdit(v)} className="icon-btn edit" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatus(v.id, v.status)}
                          className={`icon-btn ${v.status === 'active' ? 'delete' : 'success'}`}
                          title={v.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {v.status === 'active' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="icon-btn delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="empty-row">No vendors found.</td></tr>
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
              <h2>{editMode ? 'Edit Vendor' : 'Register New Vendor'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
              {/* Fake hidden inputs to trick Chrome autofill */}
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              <div className="form-row">
                <div className="form-group">
                  <label>Business Name</label>
                  <input required name="biz_name_field" autoComplete="new-password" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input required name="contact_person_field" autoComplete="new-password" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>KRA PIN</label>
                  <input required name="kra_pin_field" autoComplete="new-password" value={formData.kra_pin} onChange={e => setFormData({ ...formData, kra_pin: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Permit No</label>
                  <input required name="permit_no_field" autoComplete="new-password" value={formData.business_permit_no} onChange={e => setFormData({ ...formData, business_permit_no: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" required name="vendor_email_field" autoComplete="new-password" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input required name="phone_field" autoComplete="new-password" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              {!editMode && (
                <div className="info-box">
                  <Mail size={18} className="text-primary" />
                  <p>A system-generated password will be sent to the provided email address upon registration.</p>
                </div>
              )}

              <div className="form-group">
                <label>Assign to Event</label>
                <select
                  className="form-select"
                  value={formData.event_id}
                  onChange={e => setFormData({ ...formData, event_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Select Event --</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary full-width">
                {editMode ? "Save Changes" : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}