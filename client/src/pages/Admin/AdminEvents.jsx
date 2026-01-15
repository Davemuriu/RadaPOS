import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, MapPin, Loader2, Search, Edit2,
  Trash2, ShieldAlert, CheckCircle, ChevronDown, Filter,
  Sun, Moon
} from 'lucide-react';
import '../../styles/Admin/AdminManagement.css';
import '../../styles/Admin/AdminDashboard.css';
import api from '../../services/api';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [dateFilter, setDateFilter] = useState('All Period');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    starts_at: '',
    ends_at: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [dateFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/events');
      setEvents(response.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
      if (err.response && err.response.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this event?`)) return;

    try {
      await api.put(`/admin/events/${id}`, { is_active: !currentStatus });
      fetchEvents();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openEdit = (event) => {
    setEditMode(true);
    setCurrentId(event.id);
    const format = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
    setFormData({
      name: event.name,
      location: event.location,
      starts_at: format(event.starts_at),
      ends_at: format(event.ends_at)
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditMode(false);
    setFormData({ name: '', location: '', starts_at: '', ends_at: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString()
      };

      if (editMode) {
        await api.put(`/admin/events/${currentId}`, payload);
      } else {
        await api.post('/admin/events', payload);
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Error processing event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="management-container">
      <div className="management-header">
        <div>
          <h1 className="page-title">Event Registry</h1>
          <p className="page-subtitle">Configure and monitor platform-wide festivals</p>
        </div>

        <div className="header-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={openCreate} className="btn-primary create-btn">
            <Plus size={18} /> Create New Event
          </button>
        </div>
      </div>

      <div className="dashboard-grid stats-overview">
        <div className="stat-card">
          <span className="stat-label">Total Events</span>
          <h2 className="stat-number">{events.length}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Now</span>
          <h2 className="stat-number highlight">{events.filter(e => e.is_active).length}</h2>
        </div>
        <div className="stat-card">
          <span className="stat-label">Global Locations</span>
          <h2 className="stat-number">{[...new Set(events.map(e => e.location))].length}</h2>
        </div>
      </div>

      <div className="glass-panel main-panel">

        <div className="action-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by event name..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-wrapper">
            <button
              className="filter-dropdown-btn"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter size={16} />
              <span>{dateFilter}</span>
              <ChevronDown size={14} />
            </button>

            {showFilterDropdown && (
              <div className="dropdown-menu">
                {['All Period', 'This Week', 'This Month'].map(opt => (
                  <button
                    key={opt}
                    className="dropdown-item"
                    onClick={() => { setDateFilter(opt); setShowFilterDropdown(false); }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Event Info</th>
                <th>Schedule</th>
                <th>Location</th>
                <th>Status</th>
                <th>Vendors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">Syncing Event Registry...</td></tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>
                      <div className="event-info-cell">
                        <div className="event-initial">{event.name.charAt(0)}</div>
                        <span className="font-bold">{event.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex-col">
                        <span className="font-medium">{new Date(event.starts_at).toLocaleDateString()}</span>
                        <span className="text-muted text-xs">
                          {new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="location-badge">
                        <MapPin size={12} /> {event.location}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${event.is_active ? 'completed' : 'failed'}`}>
                        {event.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="text-center font-bold">{event.vendors_count || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openEdit(event)} className="icon-btn edit" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(event.id, event.is_active)}
                          className={`icon-btn ${event.is_active ? 'warning' : 'success'}`}
                          title={event.is_active ? "Suspend" : "Activate"}
                        >
                          {event.is_active ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="icon-btn delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="empty-row">No events found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-glass">
            <div className="modal-header">
              <h2>{editMode ? 'Modify Event' : 'Launch New Event'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Event Name</label>
                <input
                  required
                  placeholder="e.g., Summer Solstice 2026"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input
                    required
                    placeholder="e.g., Nairobi Central Park"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Starts At</label>
                  <input
                    required type="date"
                    value={formData.starts_at}
                    onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ends At</label>
                  <input
                    required type="date"
                    value={formData.ends_at}
                    onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary full-width">
                {isSubmitting ? <Loader2 className="animate-spin" /> : (editMode ? 'Update Event' : 'Launch Event')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}