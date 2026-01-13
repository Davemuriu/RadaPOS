import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Search, ShoppingBag, Plus, Minus, Trash2, Banknote, X,
    CheckCircle, Loader2, Smartphone, Receipt, Package, CreditCard,
    Sun, Moon, LayoutGrid
} from 'lucide-react';
import '../../styles/Cashier/POSPage.css';
import '../../styles/Admin/AdminManagement.css';

const POSPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('CASH');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Transaction States
    const [processing, setProcessing] = useState(false);
    const [mpesaStatus, setMpesaStatus] = useState('');
    const [lastSaleId, setLastSaleId] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // DATA FETCHING
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/');
            setProducts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // CART LOGIC
    const addToCart = (product) => {
        if (product.stock_quantity <= 0) return;
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity >= product.stock_quantity) return;
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return (newQty > item.stock_quantity || newQty < 1) ? item : { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // PAYMENT LOGIC
    const handlePayment = async () => {
        if (selectedPayment === 'CASH') {
            processCashPayment();
        } else {
            processMpesaPayment();
        }
    };

    const processCashPayment = async () => {
        setProcessing(true);
        try {
            const payload = {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                payment_method: 'CASH'
            };
            const res = await api.post('/transactions/', payload);
            finishSale(res.data.sale_id);
        } catch (error) {
            alert("Cash payment failed. Please check stock.");
            setProcessing(false);
        }
    };

    const processMpesaPayment = async () => {
        let cleanPhone = phoneNumber.trim();
        if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
        if (!/^254\d{9}$/.test(cleanPhone)) {
            alert("Invalid format. Use 2547XXXXXXXX or 07XXXXXXXX");
            return;
        }
        setProcessing(true);
        setMpesaStatus('waiting');
        try {
            const res = await api.post('/mpesa/pay', {
                amount: cartTotal,
                phone_number: cleanPhone,
                items: cart.map(item => ({ id: item.id, quantity: item.quantity }))
            });
            const checkoutId = res.data.checkout_request_id;
            const saleId = res.data.sale_id;
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    setProcessing(false);
                    setMpesaStatus('timeout');
                    alert("Payment timed out.");
                    return;
                }
                try {
                    const statusRes = await api.get(`/mpesa/status/${checkoutId}`);
                    if (statusRes.data.status === 'COMPLETED') {
                        clearInterval(interval);
                        finishSale(saleId);
                    } else if (statusRes.data.status === 'FAILED') {
                        clearInterval(interval);
                        setProcessing(false);
                        setMpesaStatus('failed');
                        alert(`M-Pesa Rejected: ${statusRes.data.reason}`);
                    }
                } catch (e) { console.log("Polling..."); }
            }, 3000);
        } catch (error) {
            setProcessing(false);
            setMpesaStatus('failed');
            alert("M-Pesa Connection Failed");
        }
    };

    const finishSale = (saleId) => {
        setLastSaleId(saleId);
        setProcessing(false);
        setPaymentModalOpen(false);
        setSuccessModalOpen(true);
        setCart([]);
        setMpesaStatus('');
        setPhoneNumber('');
        fetchProducts();
    };

    const downloadReceipt = async (saleId) => {
        try {
            const response = await api.get(`/mpesa/receipt/${saleId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) { alert("Could not download receipt"); }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="pos-layout">
            {/* LEFT SIDE: PRODUCT CATALOG */}
            <div className="pos-main">
                <div className="pos-header-bar">
                    <div className="brand-title">
                        <div className="logo-icon"><LayoutGrid size={20} /></div>
                        <div>
                            <h1>Retail Terminal</h1>
                            <p>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="pos-actions">
                        <div className="pos-search">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* THEME TOGGLE BUTTON */}
                        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state"><Loader2 className="animate-spin" size={40} /></div>
                ) : (
                    <div className="products-grid-container">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className={`pos-product-card ${product.stock_quantity <= 0 ? 'disabled' : ''}`}
                                onClick={() => addToCart(product)}
                            >
                                <div className="card-top">
                                    <h3 className="prod-name">{product.name}</h3>
                                    <span className={`stock-pill ${product.stock_quantity < 5 ? 'low' : 'ok'}`}>
                                        {product.stock_quantity} left
                                    </span>
                                </div>
                                <div className="card-bottom">
                                    <div className="price-tag">KES {product.price.toLocaleString()}</div>
                                    <div className="add-icon"><Plus size={16} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: CART SIDEBAR */}
            <div className="pos-sidebar">
                <div className="sidebar-header">
                    <h2>Current Order</h2>
                    <span className="count-badge">{cart.length}</span>
                </div>

                <div className="cart-list">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingBag size={48} />
                            <p>Cart is empty</p>
                            <span>Scan or click items to add</span>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-item-row">
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <span>KES {item.price} x {item.quantity}</span>
                                </div>
                                <div className="cart-controls">
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                    <span className="qty-val">{item.quantity}</span>
                                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                    <button className="del-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>KES {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="total-row tax">
                            <span>VAT (16%)</span>
                            <span>Inc.</span>
                        </div>
                        <div className="total-row grand">
                            <span>Total</span>
                            <span>KES {cartTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        className="pay-btn-large"
                        disabled={cart.length === 0}
                        onClick={() => setPaymentModalOpen(true)}
                    >
                        {processing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        Process Payment
                    </button>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-glass">
                        <div className="modal-header">
                            <h2>Select Payment Method</h2>
                            <button className="close-btn" onClick={() => !processing && setPaymentModalOpen(false)}><X size={24} /></button>
                        </div>

                        <div className="payment-grid">
                            <button
                                className={`pay-option ${selectedPayment === 'CASH' ? 'active' : ''}`}
                                onClick={() => !processing && setSelectedPayment('CASH')}
                            >
                                <Banknote size={24} />
                                <span>Cash</span>
                            </button>
                            <button
                                className={`pay-option ${selectedPayment === 'MPESA' ? 'active' : ''}`}
                                onClick={() => !processing && setSelectedPayment('MPESA')}
                            >
                                <Smartphone size={24} />
                                <span>M-Pesa</span>
                            </button>
                        </div>

                        {selectedPayment === 'MPESA' && (
                            <div className="form-group mt-4">
                                <label className="form-label">Customer Phone</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="07XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={processing}
                                />
                            </div>
                        )}

                        <button className="btn-primary full-width" onClick={handlePayment} disabled={processing}>
                            {processing ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : (selectedPayment === 'MPESA' ? 'Send STK Push' : `Confirm Cash Sale`)}
                        </button>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {isSuccessModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-glass text-center">
                        <div className="success-icon-wrapper">
                            <CheckCircle size={48} className="text-emerald" />
                        </div>
                        <h2 className="text-xl font-bold mt-4 mb-2">Sale Completed!</h2>
                        <p className="text-muted mb-6">Transaction #{lastSaleId} confirmed successfully.</p>

                        <div className="flex gap-4 justify-center">
                            <button className="btn-secondary" onClick={() => downloadReceipt(lastSaleId)}>
                                <Receipt size={18} /> Print Receipt
                            </button>
                            <button className="btn-primary" onClick={() => setSuccessModalOpen(false)}>
                                New Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSPage;