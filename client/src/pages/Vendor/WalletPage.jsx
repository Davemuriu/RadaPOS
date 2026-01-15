import React, { useState, useEffect } from "react";
import api from '../../services/api';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Loader2, AlertCircle, X, User, Phone, DollarSign } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Direct Payout</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" /> {successMsg}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="John Doe"
                  value={formData.recipient_name}
                  onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="07XX XXX XXX"
                  value={formData.phone_number}
                  onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Max: {maxAmount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Pay Now
            </button>
          </div>
        </form>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Request Withdrawal</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="0.00"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              Available: KES {maxAmount?.toLocaleString()}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paid': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
              <Wallet size={16} /> Wallet Balance
            </h2>
            <div className="text-4xl font-bold text-gray-900">
              {wallet.currency} {wallet.current_balance?.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWithdrawal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowDownLeft size={18} />
              Withdraw Funds
            </button>
            <button
              onClick={() => setShowPayout(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpRight size={18} />
              Pay Staff / Supplier
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <History size={18} /> Transaction History
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No transactions found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{tx.type}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={tx.notes}>
                      {tx.notes || '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${tx.type.includes('Payout') || tx.type.includes('Withdrawal') ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type.includes('Payout') || tx.type.includes('Withdrawal') ? '-' : '+'}
                      {wallet.currency} {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tx.status)} border-transparent`}>
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