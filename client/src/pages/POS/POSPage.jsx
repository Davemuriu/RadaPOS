import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    Search, ShoppingBag, Plus, Minus, Trash2, Banknote, X,
    CheckCircle, Loader2, Smartphone, Receipt, CreditCard,
    Sun, Moon, LayoutGrid, Tag, Percent, Split,
    Coffee, Utensils, Archive, Monitor
} from 'lucide-react';
import '../../styles/Cashier/POSPage.css';
import '../../styles/Admin/AdminManagement.css';

const POSPage = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('CASH');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [splitCash, setSplitCash] = useState(0);
    const [splitMpesa, setSplitMpesa] = useState(0);

    const [processing, setProcessing] = useState(false);
    const [mpesaStatus, setMpesaStatus] = useState('');
    const [lastSaleId, setLastSaleId] = useState(null);

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [appliedCode, setAppliedCode] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        fetchProducts();
        fetchCoupons();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products/');
            setProducts(res.data);
            setLoading(false);
        } catch (error) { console.error("Error fetching products:", error); }
    };

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/transactions/coupons');
            setAvailableCoupons(res.data);
        } catch (error) { console.error("Error fetching coupons:", error); }
    };

    const getCategoryIcon = (category) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('beverage') || cat.includes('coffee') || cat.includes('drink')) return <Coffee size={24} />;
        if (cat.includes('food') || cat.includes('meal')) return <Utensils size={24} />;
        if (cat.includes('snack')) return <ShoppingBag size={24} />;
        if (cat.includes('electronic')) return <Smartphone size={24} />;
        if (cat.includes('tech')) return <Monitor size={24} />;
        return <Archive size={24} />;
    };

    const getCategoryColor = (category) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('beverage')) return '#f59e0b';
        if (cat.includes('food')) return '#ef4444';
        if (cat.includes('electronic')) return '#3b82f6';
        return '#10b981';
    };

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

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const finalTotal = subtotal - discountAmount;

    const openPaymentModal = () => {
        setPaymentModalOpen(true);
        setSplitCash(Math.floor(finalTotal / 2));
        setSplitMpesa(Math.ceil(finalTotal / 2));
        setMpesaStatus('');
    };

    const handleSplitChange = (cashVal) => {
        const cash = parseFloat(cashVal) || 0;
        if (cash > finalTotal) {
            setSplitCash(finalTotal);
            setSplitMpesa(0);
        } else {
            setSplitCash(cash);
            setSplitMpesa(finalTotal - cash);
        }
    };

    const handleCouponSelect = (e) => {
        const code = e.target.value;
        if (code === "") {
            setDiscount(0); setAppliedCode(null); return;
        }
        const selected = availableCoupons.find(c => c.code === code);
        if (selected) {
            setDiscount(selected.percentage); setAppliedCode(selected.code);
        }
    };

    const handlePayment = async () => {
        if (selectedPayment === 'CASH') processCashPayment();
        else if (selectedPayment === 'MPESA') processMpesaPayment();
        else processSplitPayment();
    };

    const processCashPayment = async () => {
        setProcessing(true);
        try {
            const res = await api.post('/transactions/', {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                payment_method: 'CASH',
                coupon_code: appliedCode
            });
            finishSale(res.data.sale_id);
        } catch (error) {
            alert("Cash payment failed.");
            setProcessing(false);
        }
    };

    const processMpesaPayment = async () => {
        let cleanPhone = phoneNumber.trim();
        if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
        if (!/^254\d{9}$/.test(cleanPhone)) { alert("Invalid Phone"); return; }

        setProcessing(true);
        setMpesaStatus('waiting');

        try {
            const saleRes = await api.post('/transactions/', {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                payment_method: 'MPESA',
                coupon_code: appliedCode
            });
            const saleId = saleRes.data.sale_id;

            const mpesaRes = await api.post('/mpesa/pay', {
                amount: finalTotal,
                phone_number: cleanPhone,
                sale_id: saleId
            });

            pollStatus(mpesaRes.data.checkout_request_id, saleId);
        } catch (error) {
            setProcessing(false);
            setMpesaStatus('failed');
            alert("Transaction Failed. Check logs.");
        }
    };

    const processSplitPayment = async () => {
        if (Math.abs((splitCash + splitMpesa) - finalTotal) > 1) {
            alert("Split amounts must match total.");
            return;
        }

        let cleanPhone = phoneNumber.trim();
        if (splitMpesa > 0) {
            if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
            if (!/^254\d{9}$/.test(cleanPhone)) { alert("Invalid Phone"); return; }
        }

        setProcessing(true);
        setMpesaStatus('waiting');

        try {
            const saleRes = await api.post('/transactions/', {
                items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
                payment_method: 'SPLIT',
                amount_cash: splitCash,
                amount_mpesa: splitMpesa,
                coupon_code: appliedCode
            });
            const saleId = saleRes.data.sale_id;

            if (splitMpesa > 0) {
                const mpesaRes = await api.post('/mpesa/pay', {
                    amount: splitMpesa,
                    phone_number: cleanPhone,
                    sale_id: saleId
                });
                pollStatus(mpesaRes.data.checkout_request_id, saleId);
            } else {
                finishSale(saleId);
            }
        } catch (error) {
            setProcessing(false);
            setMpesaStatus('failed');
            alert(error.response?.data?.msg || "Transaction Failed");
        }
    };

    const pollStatus = (checkoutId, saleId) => {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            if (attempts > 60) {
                clearInterval(interval);
                setProcessing(false);
                setMpesaStatus('timeout');
                alert("Payment timed out. Check phone.");
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
                    alert(`M-Pesa Failed: ${statusRes.data.reason}`);
                }
            } catch (e) { console.log("Polling..."); }
        }, 2000);
    };

    const finishSale = (saleId) => {
        setLastSaleId(saleId);
        setProcessing(false);
        setPaymentModalOpen(false);
        setSuccessModalOpen(true);
        setCart([]);
        setMpesaStatus('');
        setPhoneNumber('');
        setDiscount(0);
        setAppliedCode(null);
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
        } catch (error) { alert("Receipt download failed"); }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="pos-layout">
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
                                className="search-input"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="icon-btn theme-toggle" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state"><Loader2 className="animate-spin" size={40} /></div>
                ) : (
                    <div className="products-grid-container">
                        {filteredProducts.map(product => {
                            const cardColor = getCategoryColor(product.category);
                            return (
                                <div
                                    key={product.id}
                                    className={`pos-product-card ${product.stock_quantity <= 0 ? 'disabled' : ''}`}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="card-top">
                                        {/* Dynamic Icon */}
                                        <div
                                            style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: cardColor, color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            {getCategoryIcon(product.category)}
                                        </div>
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
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="pos-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div className="sidebar-header">
                    <h2>Current Order</h2>
                    <span className="count-badge">{cart.length}</span>
                </div>

                <div className="cart-list" style={{ flex: 1, overflowY: 'auto' }}>
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

                <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
                    <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag size={16} style={{ color: '#9ca3af' }} />
                            <select
                                className="form-input"
                                style={{ flex: 1, padding: '8px', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                value={appliedCode || ""}
                                onChange={handleCouponSelect}
                                disabled={cart.length === 0}
                            >
                                <option value="">Select Promo Code</option>
                                {availableCoupons.map(coupon => (
                                    <option key={coupon.id} value={coupon.code}>{coupon.code} — {coupon.percentage}% Off</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="totals-section">
                        <div className="total-row"><span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span></div>
                        {discount > 0 && (
                            <div className="total-row" style={{ color: '#10b981', fontWeight: 'bold' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Percent size={12} /> Discount ({discount}%)</span>
                                <span>- KES {discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="total-row tax"><span>VAT (16%)</span><span>Inc.</span></div>
                        <div className="total-row grand"><span>Total</span><span>KES {finalTotal.toLocaleString()}</span></div>
                    </div>

                    <button className="pay-btn-large" disabled={cart.length === 0} onClick={openPaymentModal}>
                        {processing ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        Pay KES {finalTotal.toLocaleString()}
                    </button>
                </div>
            </div>

            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-glass">
                        <div className="modal-header">
                            <h2>Select Payment Method</h2>
                            <button className="close-btn" onClick={() => !processing && setPaymentModalOpen(false)}><X size={24} /></button>
                        </div>

                        <div className="payment-grid">
                            <button className={`pay-option ${selectedPayment === 'CASH' ? 'active' : ''}`} onClick={() => !processing && setSelectedPayment('CASH')}>
                                <Banknote size={24} /> <span>Cash</span>
                            </button>
                            <button className={`pay-option ${selectedPayment === 'MPESA' ? 'active' : ''}`} onClick={() => !processing && setSelectedPayment('MPESA')}>
                                <Smartphone size={24} /> <span>M-Pesa</span>
                            </button>
                            <button className={`pay-option ${selectedPayment === 'SPLIT' ? 'active' : ''}`} onClick={() => !processing && setSelectedPayment('SPLIT')}>
                                <Split size={24} /> <span>Split</span>
                            </button>
                        </div>

                        {selectedPayment === 'SPLIT' && (
                            <div style={{ margin: '1rem 0', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <label>Cash Amount</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        style={{ width: '120px', textAlign: 'right' }}
                                        value={splitCash}
                                        onChange={(e) => handleSplitChange(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                    <label>M-Pesa Balance</label>
                                    <span>KES {splitMpesa.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {(selectedPayment === 'MPESA' || (selectedPayment === 'SPLIT' && splitMpesa > 0)) && (
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
                            {processing ? <><Loader2 className="animate-spin" size={18} /> Processing...</> :
                                (selectedPayment === 'SPLIT' ? `Confirm Split` : `Confirm Payment`)}
                        </button>
                    </div>
                </div>
            )}

            {isSuccessModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-glass text-center">
                        <div className="success-icon-wrapper"><CheckCircle size={48} className="text-emerald" /></div>
                        <h2 className="text-xl font-bold mt-4 mb-2">Sale Completed!</h2>
                        <p className="text-muted mb-6">Transaction #{lastSaleId} confirmed.</p>
                        <div className="flex gap-4 justify-center">
                            <button className="btn-secondary" onClick={() => downloadReceipt(lastSaleId)}><Receipt size={18} /> Print</button>
                            <button className="btn-primary" onClick={() => setSuccessModalOpen(false)}>New Sale</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSPage;