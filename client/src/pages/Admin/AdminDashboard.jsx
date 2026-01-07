import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronRight, Loader2, Play } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Reusable fetch function
  const fetchDashboardData = useCallback(async (isCustom = false) => {
    setLoading(true);
    try {
      let url = `http://localhost:5555/api/admin/stats?period=${dateFilter.toLowerCase().replace(' ', '_')}`;
      
      if (isCustom || dateFilter === 'Custom') {
        url = `http://localhost:5555/api/admin/stats?period=custom&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Backend connection failed");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, startDate, endDate]);

  // Auto-fetch for presets, but NOT for custom
  useEffect(() => {
    if (dateFilter !== 'Custom') {
      fetchDashboardData();
    }
  }, [dateFilter]);

  if (loading && !stats) return (
    <div className="p-20 text-center text-white bg-[#0B0E11] min-h-screen">
      <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={40} />
      <p>Fetching RadaPOS Analytics...</p>
    </div>
  );

  return (
    <div className="p-8 text-white bg-[#0B0E11] min-h-screen font-sans">
      
      {/* Header & Advanced Filter UI */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-gray-400 text-sm">Real-time collections and earnings monitoring</p>
        </div>

        <div className="flex gap-3 relative">
          {dateFilter === 'Custom' && (
            <div className="flex items-center gap-2 bg-[#1A1F26] px-3 py-1.5 rounded-xl border border-blue-500/30 text-xs">
              <DatePicker selected={startDate} onChange={d => setStartDate(d)} className="bg-transparent w-20 outline-none cursor-pointer" />
              <span className="text-gray-600">to</span>
              <DatePicker selected={endDate} onChange={d => setEndDate(d)} className="bg-transparent w-20 outline-none cursor-pointer" />
              <button 
                onClick={() => fetchDashboardData(true)}
                className="ml-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
              >
                <Play size={10} fill="currentColor" /> RUN
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 bg-[#11141A] border border-gray-800 px-4 py-2 rounded-xl text-sm hover:border-gray-600 transition-all"
          >
            <Calendar size={16} className="text-blue-400" /> {dateFilter} <ChevronDown size={14} />
          </button>
          
          {showFilterDropdown && (
            <div className="absolute right-0 mt-12 w-44 bg-[#1A2026] border border-gray-800 rounded-xl z-50 shadow-2xl">
              {['All', 'This Week', 'This Month', 'This Year', 'Custom'].map(opt => (
                <button 
                  key={opt} 
                  onClick={() => {setDateFilter(opt); setShowFilterDropdown(false)}} 
                  className="w-full text-left px-4 py-3 hover:bg-blue-600/20 text-sm first:rounded-t-xl last:rounded-b-xl"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Collections" value={`KES ${((stats?.total_collections || 0)/1000000).toFixed(1)}M`} subtitle={`Period: ${dateFilter}`} color="border-blue-500/20" />
        <StatCard title="Total Earnings" value={`KES ${((stats?.total_earnings || 0)/1000).toFixed(1)}K`} subtitle="Net Commission" color="border-purple-500/20" />
        <StatCard title="Total Vendors" value={stats?.total_vendors} subtitle="Active Network" />
        <StatCard title="Pending Withdrawals" value={stats?.pending_withdrawals_count} highlight color="border-orange-500/20" subtitle="Awaiting Action" />
      </div>

      {/* Grouped Recent Transactions Container */}
      <div className="bg-[#11141A] rounded-3xl border border-gray-800 p-8">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-800/50">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">Live Updates</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recent Events Section */}
          <TransactionSection title="Recent Events" onAction={() => navigate('/admin/events')}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0E11] text-gray-500 uppercase text-[10px] tracking-widest">
                <tr><th className="p-4">Event</th><th className="p-4">Region</th><th className="p-4 text-right">Vendors</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {Array.isArray(stats?.active_events) ? stats.active_events.slice(0, 10).map(e => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-gray-200">{e.name}</td>
                    <td className="p-4 text-gray-400">{e.region}</td>
                    <td className="p-4 text-right font-mono text-gray-400">{e.vendors_count}</td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </TransactionSection>

          {/* Recent Withdrawals Section */}
          <TransactionSection title="Withdrawal Requests" onAction={() => navigate('/admin/vendors')}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0E11] text-gray-500 uppercase text-[10px] tracking-widest">
                <tr><th className="p-4">Vendor</th><th className="p-4">Amount</th><th className="p-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {Array.isArray(stats?.recent_withdrawals) ? stats.recent_withdrawals.slice(0, 10).map(w => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{w.vendor_name}</td>
                    <td className="p-4 text-blue-400 font-bold">KES {w.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-1 rounded font-black border border-orange-500/20 uppercase">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </TransactionSection>
        </div>
      </div>
    </div>
  );
}

// Visual Sub-components
function StatCard({ title, value, subtitle, color, highlight }) {
  return (
    <div className={`bg-[#11141A] p-6 rounded-2xl border ${color || 'border-gray-800'} flex flex-col justify-between h-40`}>
      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">{title}</p>
      <div>
        <p className={`text-3xl font-bold ${highlight ? 'text-orange-500' : 'text-white'}`}>{value}</p>
        <p className="text-[10px] text-gray-500 mt-1 uppercase font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function TransactionSection({ title, children, onAction }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
        <button onClick={onAction} className="text-[10px] text-blue-400 font-bold flex items-center hover:text-blue-300 transition-colors uppercase">
          Full Report <ChevronRight size={14}/>
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-[#0B0E11]/30">
        {children}
      </div>
    </div>
  );
}