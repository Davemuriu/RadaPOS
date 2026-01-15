import React, { useState, useEffect } from "react";
import api from '../../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Loader2,
  AlertCircle,
  X,
  User,
  Phone,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const DirectPayoutModal = ({ onClose, onSuccess, maxAmount }) => {
  const [formData, setFormData] = useState({
    recipient_name: '',
    phone_number: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (parseFloat(formData.amount) > maxAmount) {
      setError("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/vendor/wallet/payout-direct', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setSuccessMsg(res.data.msg);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <ArrowUpRight className="icon-blue" size={20} />
            Direct Payout
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success">
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            <div className="form-group">
              <label>Recipient Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.recipient_name}
                  onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>M-Pesa Number</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="07XX XXX XXX"
                  value={formData.phone_number}
                  onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <div className="input-wrapper">
                <span className="currency-prefix">KES</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <p className="helper-text text-right">Available: {maxAmount?.toLocaleString()}</p>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? <Loader2 size={18} className="spin" /> : "Pay Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const WithdrawalRequestModal = ({ onClose, onSuccess, maxAmount }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(amount) > maxAmount) {
      setError("Insufficient wallet balance.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/vendor/wallet/request-withdrawal', { amount: parseFloat(amount) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <ArrowDownLeft className="icon-green" size={20} />
            Withdraw Funds
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <div className="form-group">
              <label>Withdrawal Amount</label>
              <div className="input-wrapper">
                <span className="currency-prefix">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  required
                />
              </div>
              <p className="helper-text text-right">Available: {maxAmount?.toLocaleString()}</p>
            </div>

            <div className="info-box">
              <p>
                <AlertCircle size={16} />
                Requests are processed by Admin within 24 hours.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? <Loader2 size={18} className="spin" /> : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function WalletPage() {
  const [wallet, setWallet] = useState({ current_balance: 0, currency: 'KES' });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showPayout, setShowPayout] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const fetchData = async () => {
    try {
      const walletRes = await api.get('/vendor/wallet');
      setWallet(walletRes.data);

      const historyRes = await api.get('/vendor/wallet/history');
      setHistory(historyRes.data || []);

    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  return (
    <div className="wallet-page-container">
      {/* HEADER SECTION */}
      <div className="wallet-header-card">
        <div className="wallet-balance-section">
          <h2>
            <Wallet size={18} className="icon-green" />
            Available Balance
          </h2>
          <div className="balance-display">
            <span className="currency">{wallet.currency}</span>
            <span className="amount">{wallet.current_balance?.toLocaleString()}</span>
          </div>
        </div>

        <div className="wallet-actions-group">
          <button
            onClick={() => setShowWithdrawal(true)}
            className="btn btn-primary btn-withdraw"
          >
            <ArrowDownLeft size={20} />
            Withdraw Funds
          </button>
          <button
            onClick={() => setShowPayout(true)}
            className="btn btn-outline btn-transfer"
          >
            <ArrowUpRight size={20} />
            Transfer / Pay
          </button>
        </div>
      </div>

      {/* TRANSACTION HISTORY SECTION */}
      <div className="history-section-card">
        <div className="history-header">
          <h3>
            <div className="icon-wrapper">
              <History size={20} />
            </div>
            Transaction History
          </h3>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="spin" size={32} />
            <p>Loading transactions...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <History size={32} />
            </div>
            <p>No transactions found</p>
            <small>Sales and payments will appear here.</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Transaction Type</th>
                  <th>Details</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id}>
                    <td className="date-cell">
                      {tx.date}
                    </td>
                    <td>
                      <div className="type-cell">
                        {tx.type.includes('Payout') || tx.type.includes('Withdrawal') ? (
                          <span className="icon-circle icon-red"><ArrowUpRight size={14} /></span>
                        ) : (
                          <span className="icon-circle icon-green"><ArrowDownLeft size={14} /></span>
                        )}
                        <span>{tx.type}</span>
                      </div>
                    </td>
                    <td className="notes-cell" title={tx.notes}>
                      {tx.notes || '-'}
                    </td>
                    <td className={`amount-cell ${tx.type.includes('Payout') || tx.type.includes('Withdrawal') ? 'text-neg' : 'text-pos'}`}>
                      {tx.type.includes('Payout') || tx.type.includes('Withdrawal') ? '-' : '+'}
                      {Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${getStatusClass(tx.status)}`}>
                        {tx.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPayout && (
        <DirectPayoutModal
          onClose={() => setShowPayout(false)}
          onSuccess={fetchData}
          maxAmount={wallet.current_balance}
        />
      )}

      {showWithdrawal && (
        <WithdrawalRequestModal
          onClose={() => setShowWithdrawal(false)}
          onSuccess={fetchData}
          maxAmount={wallet.current_balance}
        />
      )}
    </div>
  );
}