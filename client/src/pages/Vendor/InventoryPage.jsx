import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Plus, Trash2, Search, X, Package, Loader2, Edit3,
    Sun, Moon, Layers, AlertCircle, CheckCircle,
    Coffee, Utensils, Smartphone, Archive, Monitor, ShoppingBag
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock_quantity: '',
        description: '',
        category: 'General'
    });

    const categories = ['General', 'Beverages', 'Food', 'Snacks', 'Electronics', 'Others'];

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerTerm) ||
            p.category?.toLowerCase().includes(lowerTerm)
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const getCategoryIcon = (category) => {
        const cat = (category || '').toLowerCase();

        if (cat.includes('beverage') || cat.includes('coffee') || cat.includes('drink')) return <Coffee size={20} />;
        if (cat.includes('food') || cat.includes('meal') || cat.includes('lunch')) return <Utensils size={20} />;
        if (cat.includes('snack') || cat.includes('bite')) return <ShoppingBag size={20} />;
        if (cat.includes('electronic') || cat.includes('phone')) return <Smartphone size={20} />;
        if (cat.includes('computer') || cat.includes('tech')) return <Monitor size={20} />;
        if (cat.includes('other')) return <Archive size={20} />;

        return <Package size={20} />;
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setIsEditing(true);
            setCurrentProductId(product.id);
            setFormData({
                name: product.name,
                price: product.price,
                stock_quantity: product.stock_quantity,
                description: product.description || '',
                category: product.category || 'General'
            });
        } else {
            setIsEditing(false);
            setFormData({ name: '', price: '', stock_quantity: '', description: '', category: 'General' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${currentProductId}`, formData);
            } else {
                await api.post('/products/', formData);
            }
            fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            alert("Operation failed. Check your connection.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Confirm delete?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert("Could not delete. Product may be linked to sales history.");
        }
    };

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Inventory Management</h1>
                    <p className="page-subtitle">Manage catalog, pricing, and stock levels</p>
                </div>

                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="btn-primary create-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="glass-panel main-panel">
                {/* Action Bar */}
                <div className="action-bar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products by name or category..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrapper">
                        <div className="filter-label">
                            <Layers size={14} /> <span>{products.length} Items</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-muted"><Loader2 className="animate-spin inline mr-2" /> Loading Inventory...</td></tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="flex items-center gap-3">

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'var(--primary)',
                                                    color: '#ffffff',
                                                    flexShrink: 0
                                                }}>
                                                    {getCategoryIcon(p.category)}
                                                </div>

                                                <div className="flex-col">
                                                    <span className="font-bold text-main">{p.name}</span>
                                                    <span className="text-xs text-muted truncate max-w-xs">{p.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="event-tag">{p.category || 'General'}</span>
                                        </td>
                                        <td className="font-mono font-bold text-emerald">
                                            KES {p.price.toLocaleString()}
                                        </td>
                                        <td>
                                            {p.stock_quantity <= 10 ? (
                                                <span className="status-badge failed flex items-center gap-1 w-fit">
                                                    <AlertCircle size={12} /> {p.stock_quantity} Low Stock
                                                </span>
                                            ) : (
                                                <span className="status-badge completed flex items-center gap-1 w-fit">
                                                    <CheckCircle size={12} /> {p.stock_quantity} In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="icon-btn edit" onClick={() => handleOpenModal(p)} title="Edit">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(p.id)} title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="empty-row">No products found matching your search.</td></tr>
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
                            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Wireless Mouse"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price (KES)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter product details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '12px',
                                        border: '1px solid var(--border)', backgroundColor: 'var(--bg-page)',
                                        color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none'
                                    }}
                                />
                            </div>

                            <button type="submit" className="btn-primary full-width">
                                {isEditing ? 'Update Catalog' : 'Add to Inventory'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;