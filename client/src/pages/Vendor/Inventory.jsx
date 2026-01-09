import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '0'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/vendor');
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to load products. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Create FormData
            const data = new FormData();
            
            // Add text fields
            data.append('name', formData.name);
            data.append('description', formData.description || '');
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('stock_quantity', formData.stock_quantity || '0');
            
            // Add image if selected
            if (imageFile) {
                data.append('image', imageFile);
            }
            
            console.log('Submitting product data:', {
                name: formData.name,
                price: formData.price,
                category: formData.category,
                hasImage: !!imageFile
            });
            
            let response;
            if (editingProduct) {
                response = await api.put(`/products/${editingProduct.id}`, data);
                alert('Product updated successfully!');
            } else {
                response = await api.post('/products', data);
                alert('Product added successfully!');
            }
            
            console.log('Product saved:', response.data);
            
            resetForm();
            fetchProducts();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving product:', error);
            console.error('Error response:', error.response?.data);
            alert(`Failed to save product: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category,
            stock_quantity: product.stock_quantity.toString()
        });
        setImagePreview(product.image_url || '');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await api.delete(`/products/${id}`);
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock_quantity: '0'
        });
        setImageFile(null);
        setImagePreview('');
        setEditingProduct(null);
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #4CAF50',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h1 style={{ color: '#333', fontSize: '28px' }}>Inventory Management</h1>
                <button 
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Add New Product
                </button>
            </div>

            {products.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>No products found. Add your first product!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {products.map(product => (
                        <div key={product.id} style={{
                            background: 'white',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                height: '200px',
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {product.image_url ? (
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ color: '#999' }}>No Image</div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
                                <p style={{ 
                                    margin: '0 0 10px 0', 
                                    color: '#666',
                                    fontSize: '14px',
                                    textTransform: 'uppercase'
                                }}>
                                    {product.category}
                                </p>
                                <p style={{ 
                                    margin: '0 0 15px 0', 
                                    color: '#777',
                                    fontSize: '14px',
                                    lineHeight: '1.4'
                                }}>
                                    {product.description || 'No description'}
                                </p>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <span style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: '#4CAF50'
                                    }}>
                                        ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        background: product.stock_quantity < 10 ? '#ffebee' : '#f0f0f0',
                                        color: product.stock_quantity < 10 ? '#d32f2f' : '#666'
                                    }}>
                                        Stock: {product.stock_quantity}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        style={{
                                            flex: 1,
                                            padding: '8px 16px',
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        style={{
                                            flex: 1,
                                            padding: '8px 16px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            borderBottom: '1px solid #e0e0e0'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '24px' }}>
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#999'
                                }}
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        Price ($) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px'
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Home & Garden">Home & Garden</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Books">Books</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    value={formData.stock_quantity}
                                    onChange={handleInputChange}
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Product Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={{ 
                                                maxWidth: '200px',
                                                borderRadius: '5px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px',
                                justifyContent: 'flex-end',
                                paddingTop: '20px',
                                borderTop: '1px solid #e0e0e0'
                            }}>
                                <button 
                                    type="button"
                                    style={{
                                        padding: '10px 20px',
                                        background: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;