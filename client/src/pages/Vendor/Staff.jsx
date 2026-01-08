import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff');
            setStaff(response.data.staff || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            // Mock data for testing
            setStaff([
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'cashier', phone: '(123) 456-7890', status: 'active' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'cashier', phone: '(123) 456-7891', status: 'active' },
                { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager', phone: '(123) 456-7892', status: 'inactive' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            const staffData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            };
            
            await api.post('/staff', staffData);
            alert('Staff member added successfully!');
            resetForm();
            fetchStaff();
            setShowModal(false);
        } catch (error) {
            console.error('Error adding staff:', error);
            alert(error.response?.data?.error || 'Failed to add staff member');
        }
    };

    const handleToggleStatus = async (staffId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.put(`/staff/${staffId}/status`, { status: newStatus });
            
            setStaff(prev => prev.map(s => 
                s.id === staffId ? { ...s, status: newStatus } : s
            ));
            
            alert(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'}!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleResetPassword = async (staffId, staffName) => {
        const newPassword = prompt(`Enter new password for ${staffName}:`);
        if (!newPassword) return;
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        try {
            await api.post(`/staff/${staffId}/reset-password`, {
                new_password: newPassword
            });
            alert('Password reset successfully!');
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Failed to reset password');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: ''
        });
        setErrors({});
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading staff...</p>
            </div>
        );
    }

    return (
        <div className="staff-container">
            <div className="page-header">
                <h1>Staff Management</h1>
                <button 
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    + Add New Staff
                </button>
            </div>

            <div className="staff-table-container">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map(staffMember => (
                            <tr key={staffMember.id}>
                                <td>
                                    <div className="staff-name-cell">
                                        <div className="staff-avatar">
                                            {staffMember.name.charAt(0).toUpperCase()}
                                        </div>
                                        {staffMember.name}
                                    </div>
                                </td>
                                <td>{staffMember.email}</td>
                                <td>
                                    <span className={`role-badge ${staffMember.role}`}>
                                        {staffMember.role}
                                    </span>
                                </td>
                                <td>{staffMember.phone}</td>
                                <td>
                                    <span className={`status-badge ${staffMember.status}`}>
                                        {staffMember.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="staff-actions">
                                        <button 
                                            className={`btn-status ${staffMember.status === 'active' ? 'deactivate' : 'activate'}`}
                                            onClick={() => handleToggleStatus(staffMember.id, staffMember.status)}
                                        >
                                            {staffMember.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button 
                                            className="btn-reset-password"
                                            onClick={() => handleResetPassword(staffMember.id, staffMember.name)}
                                        >
                                            Reset Password
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content staff-modal">
                        <div className="modal-header">
                            <h2>Add New Staff Member</h2>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="Enter full name"
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={errors.password ? 'error' : ''}
                                        placeholder="Enter password"
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label>Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={errors.confirmPassword ? 'error' : ''}
                                        placeholder="Confirm password"
                                    />
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={errors.phone ? 'error' : ''}
                                    placeholder="Enter phone number"
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                            
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={formData.role || 'cashier'}
                                    onChange={handleInputChange}
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                </select>
                                <p className="role-description">
                                    Cashiers can process sales and view inventory. 
                                    Managers have additional access to reports and staff management.
                                </p>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Staff Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;