import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    UserPlus, Trash2, X, User, Mail, Phone, CreditCard,
    Sun, Moon, Search, ShieldCheck, Loader2
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const StaffPage = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        phone_number: '',
        id_number: ''
    });

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff/');
            setStaffMembers(res.data);
            setFilteredStaff(res.data);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = staffMembers.filter(s =>
            s.name?.toLowerCase().includes(lowerTerm) ||
            s.email?.toLowerCase().includes(lowerTerm)
        );
        setFilteredStaff(filtered);
    }, [searchTerm, staffMembers]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await api.delete(`/staff/${id}`);
            const updated = staffMembers.filter(s => s.id !== id);
            setStaffMembers(updated);
            setFilteredStaff(updated);
        } catch (error) {
            alert("Error deleting staff member.");
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/staff/', newStaff);
            const updatedList = [...staffMembers, res.data.staff];
            setStaffMembers(updatedList);
            setFilteredStaff(updatedList);
            setIsModalOpen(false);
            setNewStaff({ name: '', email: '', phone_number: '', id_number: '' });
            alert("Cashier added! An email with the password reset link has been sent to them.");
        } catch (error) {
            console.error("Failed to add staff:", error);
            alert(error.response?.data?.msg || "Error adding staff member.");
        }
    };

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Staff Management</h1>
                    <p className="page-subtitle">Manage your cashier team and payouts</p>
                </div>

                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="btn-primary create-btn" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={18} /> Add Cashier
                    </button>
                </div>
            </div>

            {/* Action Bar (Search) */}
            <div className="action-bar" style={{ marginBottom: '2rem' }}>
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Staff Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-muted">
                    <Loader2 className="animate-spin mr-2" /> Loading Staff...
                </div>
            ) : (
                <div className="staff-grid">
                    {filteredStaff.map((staff) => (
                        <div key={staff.id} className="stat-card staff-card">
                            <div className="staff-card-header">
                                <div className="avatar-circle">
                                    <User size={24} />
                                </div>
                                <div className="staff-info-header">
                                    <h3 className="staff-name">{staff.name || "Unnamed Staff"}</h3>
                                    <span className="role-badge">Cashier</span>
                                </div>
                            </div>

                            <div className="staff-details-list">
                                <div className="detail-item">
                                    <Mail size={14} className="text-muted" />
                                    <span>{staff.email}</span>
                                </div>
                                <div className="detail-item">
                                    <Phone size={14} className="text-muted" />
                                    <span>{staff.phone_number || "No Phone"}</span>
                                </div>
                                <div className="detail-item">
                                    <CreditCard size={14} className="text-muted" />
                                    <span className="font-mono text-xs">{staff.id_number || "No ID"}</span>
                                </div>
                            </div>

                            <button
                                className="btn-danger-outline full-width"
                                onClick={() => handleDelete(staff.id)}
                            >
                                <Trash2 size={16} /> Remove Access
                            </button>
                        </div>
                    ))}

                    {filteredStaff.length === 0 && (
                        <div className="glass-panel empty-state-panel">
                            <User size={48} className="text-muted mb-4 opacity-50" />
                            <p className="text-muted font-bold">No staff members found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-glass">
                        <div className="modal-header">
                            <h2>New Cashier Setup</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    placeholder="e.g. John Kamau"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>ID Number</label>
                                    <div className="input-with-icon">
                                        <CreditCard size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            className="form-input"
                                            required
                                            value={newStaff.id_number}
                                            onChange={(e) => setNewStaff({ ...newStaff, id_number: e.target.value })}
                                            placeholder="12345678"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone (M-Pesa)</label>
                                    <div className="input-with-icon">
                                        <Phone size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            className="form-input"
                                            required
                                            value={newStaff.phone_number}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone_number: e.target.value })}
                                            placeholder="0712..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        required
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                        placeholder="Send invite to..."
                                    />
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    A password reset link will be sent to this email.
                                </p>
                            </div>

                            <button type="submit" className="btn-primary full-width">
                                Send Invite
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;