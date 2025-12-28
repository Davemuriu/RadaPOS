import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Calendar, Users, Wallet, Settings, LogOut, Search, Bell, Plus, X, 
  ShieldCheck, CreditCard, Lock, Eye, Banknote, FileBarChart, Download, Filter, 
  Package, Trash2, Percent, Edit3, Check, UserPlus, Zap, Trash
} from 'lucide-react';

const AdminDashboard = () => {
    // 1. STATE MANAGEMENT
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [selectedItem, setSelectedItem] = useState(null);

    const [events, setEvents] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [platformUsers, setPlatformUsers] = useState([]);
    const [packages, setPackages] = useState([
        { id: 1, name: 'Basic Tier', percent: 15, desc: 'For small vendors', status: 'active' },
        { id: 2, name: 'Standard Tier', percent: 10, desc: 'General food vendors', status: 'active' },
        { id: 3, name: 'Premium Tier', percent: 5, desc: 'High volume partners', status: 'pending_approval' }
    ]);
    
    const [stats, setStats] = useState({ 
        total_revenue: 0, platform_commission: 0, active_events: 0, 
        total_vendors: 0, pending_withdrawals: 0 
    });

    const [filters, setFilters] = useState({ dateRange: 'all', startDate: '', endDate: '', eventId: 'all' });
    const [currentUser, setCurrentUser] = useState({ name: "David Muriu", role: 'super_admin' });
    const API_BASE = "http://localhost:5555/api";

    // 2. DATA FETCHING
    const fetchData = async () => {
        try {
            const queryParams = { ...filters };
            const [evRes, withRes, statsRes, userRes] = await Promise.all([
                axios.get(`${API_BASE}/events`),
                axios.get(`${API_BASE}/admin/withdrawals`, { params: queryParams }),
                axios.get(`${API_BASE}/admin/stats`, { params: queryParams }),
                axios.get(`${API_BASE}/admin/users`)
            ]);
            setEvents(evRes.data);
            setWithdrawals(withRes.data);
            setStats(statsRes.data);
            setPlatformUsers(userRes.data);
        } catch (err) { console.error("Database Sync Error:", err); }
    };

    useEffect(() => { fetchData(); }, [filters, activeTab]);

    // 3. UI HELPERS
    const navClass = (tab) => `w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        activeTab === tab 
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold italic' 
        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
    }`;

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans relative selection:bg-indigo-500/30">
            
            {/* --- MODAL: CREATE/EDIT --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0B0F1A] border border-slate-800 w-full max-w-lg rounded-3xl p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold italic text-white tracking-tighter uppercase">Configure {activeTab}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-500 hover:text-white" /></button>
                        </div>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-1">Entry Name</label>
                                <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-5 outline-none focus:ring-1 focus:ring-indigo-500 font-bold italic" placeholder="e.g. SOLFEST 2025" required />
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition uppercase tracking-[0.2em] text-xs">Deploy to System</button>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-72 bg-[#0B0F1A] border-r border-slate-800/50 fixed h-full z-30 shadow-2xl">
                <div className="p-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase italic">RadaPOS</span>
                </div>
                <nav className="px-6 space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className={navClass('dashboard')}><LayoutDashboard size={18}/> Dashboard</button>
                    <button onClick={() => setActiveTab('events')} className={navClass('events')}><Calendar size={18}/> Events</button>
                    <button onClick={() => setActiveTab('vendors')} className={navClass('vendors')}><Users size={18}/> Vendors</button>
                    <button onClick={() => setActiveTab('users')} className={navClass('users')}><ShieldCheck size={18}/> Admin Users</button>
                    <button onClick={() => setActiveTab('withdrawals')} className={navClass('withdrawals')}><Wallet size={18}/> Withdrawals</button>
                    <button onClick={() => setActiveTab('reports')} className={navClass('reports')}><FileBarChart size={18}/> Reports</button>
                    <button onClick={() => setActiveTab('settings')} className={navClass('settings')}><Settings size={18}/> Settings</button>
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="ml-72 flex-grow p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white capitalize italic underline underline-offset-[12px] decoration-indigo-500/40 tracking-tighter">{activeTab}</h1>
                        <p className="text-slate-500 text-sm mt-4 font-bold italic opacity-60">System Operator: {currentUser.name}</p>
                    </div>
                    <div className="bg-[#0B0F1A] border border-indigo-500/30 px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/5">
                        <select value={currentUser.role} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})} className="bg-transparent text-[11px] font-black text-indigo-400 outline-none uppercase cursor-pointer italic tracking-widest">
                            <option value="super_admin">Super Admin</option>
                            <option value="admin_manager">Manager</option>
                            <option value="admin_accountant">Accountant</option>
                        </select>
                    </div>
                </header>

                {/* --- GLOBAL FILTERS --- */}
                {['dashboard', 'vendors', 'reports', 'withdrawals'].includes(activeTab) && (
                    <div className="flex flex-wrap gap-4 mb-10 p-8 bg-[#0B0F1A] border border-slate-800 rounded-[32px] items-center shadow-2xl">
                        <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase italic mr-4 tracking-widest"><Filter size={14} /> Global Filters</div>
                        <select className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none font-bold italic hover:border-indigo-500/30 transition-all" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                            <option value="all">All (Lifetime)</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                        <select className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none font-bold italic hover:border-indigo-500/30 transition-all" value={filters.eventId} onChange={(e) => setFilters({...filters, eventId: e.target.value})}>
                            <option value="all">All Events</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                        </select>
                    </div>
                )}

                {/* --- TAB: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-16 animate-in fade-in duration-700">
                        <div className="grid grid-cols-4 gap-8">
                            <MetricCard title="Gross Sales" value={`KES ${stats.total_revenue.toLocaleString()}`} color="slate" trend="Total processing" />
                            <MetricCard title="Net Commission" value={`KES ${stats.platform_commission.toLocaleString()}`} color="indigo" trend="Owner Profit" />
                            <MetricCard title="Partners" value={stats.total_vendors} color="emerald" trend="Active Vendors" />
                            <MetricCard title="Queue" value={stats.pending_withdrawals} color="orange" trend="Payout Requests" />
                        </div>
                        <WithdrawalTable withdrawals={withdrawals.slice(0, 5)} onNavigate={() => setActiveTab('withdrawals')} currentUser={currentUser} />
                    </div>
                )}

                {/* --- TAB: VENDORS (FULL TABLE) --- */}
                {activeTab === 'vendors' && (
                    <div className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6">
                        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center italic">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Merchant Onboarding</h2>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] italic p-8 border-b border-slate-800/50">
                                <tr><th className="p-8">Vendor Name</th><th className="p-8">Category</th><th className="p-8">Phone</th><th className="p-8 text-center">Status</th><th className="p-8 text-right pr-12">Control</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 italic font-medium">
                                {platformUsers.filter(u => u.role === 'vendor').map((v, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                                        <td className="p-8 font-black text-white group-hover:text-indigo-400 text-lg tracking-tighter underline decoration-transparent group-hover:decoration-indigo-500 decoration-2 transition-all">{v.username}</td>
                                        <td className="p-8"><span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-500/20 uppercase tracking-widest">{v.product_type || 'General'}</span></td>
                                        <td className="p-8 text-slate-500 text-sm font-mono tracking-tighter">{v.phone || '+254 7XX XXX XXX'}</td>
                                        <td className="p-8 flex justify-center"><StatusPill status={v.status || 'active'} /></td>
                                        <td className="p-8 text-right pr-12">
                                            {v.status === 'pending' && (currentUser.role === 'super_admin' || currentUser.role === 'admin_manager') ? (
                                                <div className="flex justify-end gap-3">
                                                    <button className="bg-emerald-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:bg-emerald-700 shadow-lg">Approve</button>
                                                    <button className="bg-rose-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase text-white hover:bg-rose-700 shadow-lg">Reject</button>
                                                </div>
                                            ) : <button className="text-indigo-400 hover:text-white transition uppercase font-black text-[10px] tracking-[0.2em]">View Dossier</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: ADMIN USERS (FULL TABLE) --- */}
                {activeTab === 'users' && (
                    <div className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 italic">
                        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Staff Access Control</h2>
                            {currentUser.role === 'super_admin' && (
                                <button onClick={() => openModal('create')} className="bg-indigo-600 px-6 py-3 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:scale-105 transition flex items-center gap-2"><UserPlus size={18}/> Add Admin</button>
                            )}
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] p-8 border-b border-slate-800/50">
                                <tr><th className="p-8">Staff Name</th><th className="p-8">Email</th><th className="p-8">Level</th><th className="p-8 text-center">Status</th><th className="p-8 text-right pr-12">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 font-bold tracking-tight">
                                {platformUsers.filter(u => u.role.includes('admin')).map((u, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                                        <td className="p-8 font-black text-white group-hover:text-indigo-400 transition-all flex items-center gap-3"><ShieldCheck size={18} className="text-indigo-500"/> {u.username}</td>
                                        <td className="p-8 text-slate-500 text-xs italic font-medium">{u.email}</td>
                                        <td className="p-8"><span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.role.replace('_', ' ')}</span></td>
                                        <td className="p-8 flex justify-center"><StatusPill status="active" /></td>
                                        <td className="p-8 text-right pr-12"><button className="text-rose-500/60 hover:text-rose-500 transition uppercase font-black text-[10px] tracking-widest"><Trash size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: WITHDRAWALS --- */}
                {activeTab === 'withdrawals' && <WithdrawalTable withdrawals={withdrawals} showActions={true} currentUser={currentUser} />}

                {/* --- TAB: SETTINGS (PACKAGES) --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-12 animate-in fade-in max-w-5xl">
                        <div className="bg-[#0B0F1A] border border-slate-800 p-10 rounded-[40px] shadow-2xl">
                            <div className="flex justify-between items-center mb-10 italic">
                                <div><h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30 flex items-center gap-3"><Percent size={24} className="text-indigo-500"/> Revenue Packages</h2><p className="text-xs text-slate-500 mt-2 font-bold opacity-60">Define custom commission tiers for different merchant types</p></div>
                                <button onClick={() => openModal('create')} className="bg-indigo-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition"><Plus size={16} className="inline mr-2"/> New Package</button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className={`p-8 bg-[#020617] border rounded-3xl relative group overflow-hidden transition-all ${pkg.status === 'pending_approval' ? 'border-orange-500/40 border-dashed' : 'border-slate-800 hover:border-indigo-500/50'}`}>
                                        <div className="absolute top-0 right-0 p-6 font-black text-indigo-500 text-4xl italic opacity-10 group-hover:opacity-100 transition-opacity tracking-tighter">{pkg.percent}%</div>
                                        <h3 className="text-white font-black text-xl mb-4 italic tracking-tighter uppercase">{pkg.name}</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed italic mb-10 h-16">{pkg.desc}</p>
                                        <div className="flex justify-between items-center mt-auto border-t border-slate-800/50 pt-6">
                                            <button onClick={() => openModal('edit', pkg)} className="text-slate-500 hover:text-indigo-400 transition flex items-center gap-2 text-[10px] uppercase font-black italic tracking-widest"><Edit3 size={14}/> Edit Tier</button>
                                            {pkg.status === 'pending_approval' && currentUser.role === 'super_admin' && (
                                                <button className="bg-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg">Go Live</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REMAINING TABS (REPORTS, EVENTS) integrated via shared components --- */}
                {activeTab === 'reports' && (
                    <div className="grid grid-cols-3 gap-8 animate-in slide-in-from-bottom-8">
                        <ReportCard title="Revenue Reconcile" desc="Audit of gross sales vs platform profit margins." icon={<Percent className="text-indigo-500"/>} />
                        <ReportCard title="Merchant Performance" desc="Category-wise ranking of vendor sell-through rates." icon={<Users className="text-emerald-500"/>} />
                        <ReportCard title="Audit Logs" desc="Complete history of all administrative approval events." icon={<FileBarChart className="text-orange-500"/>} />
                    </div>
                )}
            </main>
        </div>
    );
};

/* --- SUB-COMPONENTS (FIGMA SPECIFIC) --- */

const MetricCard = ({ title, value, color, trend }) => (
    <div className="bg-[#0B0F1A] border border-slate-800 p-8 rounded-[32px] relative overflow-hidden shadow-2xl group transition-all hover:translate-y-[-4px]">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color === 'indigo' ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : color === 'orange' ? 'bg-orange-600' : 'bg-slate-700'}`}></div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic opacity-80">{title}</p>
        <h3 className="text-3xl font-black text-white mb-2 italic tracking-tighter font-mono">{value}</h3>
        <p className="text-[10px] text-indigo-400 font-bold italic tracking-widest underline decoration-indigo-500/20 underline-offset-4">{trend}</p>
    </div>
);

const ReportCard = ({ title, desc, icon }) => (
    <div className="bg-[#0B0F1A] border border-slate-800 p-8 rounded-[40px] hover:border-indigo-500/50 transition relative group shadow-2xl flex flex-col h-full">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Zap className="text-indigo-400 fill-indigo-400" size={24}/></div>
        <h3 className="text-white font-black italic mb-4 tracking-tighter uppercase text-lg underline decoration-indigo-500/20">{title}</h3>
        <p className="text-slate-500 text-xs mb-10 leading-relaxed italic font-medium pr-4">{desc}</p>
        <button className="mt-auto flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 hover:text-white transition group/btn italic">
            <Download size={16} className="group-hover/btn:translate-y-1 transition-transform"/> Download CSV
        </button>
    </div>
);

const WithdrawalTable = ({ withdrawals, onNavigate, showActions, currentUser }) => (
    <section className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl italic animate-in slide-in-from-bottom-8">
        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Financial Pipeline</h2>
            {onNavigate && <button onClick={onNavigate} className="text-indigo-400 text-xs font-black tracking-widest uppercase hover:underline">Full Log <ChevronRight size={14} className="inline"/></button>}
        </div>
        <table className="w-full text-left">
            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] p-8 border-b border-slate-800/50">
                <tr><th className="p-8">Merchant</th><th className="p-8">Gross Sale</th><th className="p-8 text-emerald-400">Net (P% Less)</th><th className="p-8 text-center">Status</th>{showActions && <th className="p-8 text-right pr-12">Control</th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
                {withdrawals.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                        <td className="p-8 font-black text-white group-hover:text-indigo-400 transition-all text-lg tracking-tighter underline decoration-transparent group-hover:decoration-indigo-500 decoration-2 italic">{req.vendor_name}</td>
                        <td className="p-8 text-slate-500 font-mono tracking-tighter italic">KES {(req.amount || 0).toLocaleString()}</td>
                        <td className="p-8 text-emerald-400 font-black font-mono tracking-tighter italic text-lg shadow-emerald-500/10">KES {((req.amount || 0) * 0.9).toLocaleString()}</td>
                        <td className="p-8 flex justify-center"><StatusPill status={req.status || 'pending'} /></td>
                        {showActions && (
                            <td className="p-8 text-right pr-12">
                                <button className="bg-indigo-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 tracking-[0.15em] transition-all active:scale-95">
                                    {currentUser.role === 'admin_manager' ? 'Init Approval' : 'Final Signature'}
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </section>
);

const StatusPill = ({ status }) => (
    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 border shadow-lg ${status === 'approved' || status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
        <span className={`w-2 h-2 rounded-full ${status === 'approved' || status === 'active' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-orange-500'}`}></span>
        {status}
    </span>
);

const GatewayItem = ({ name, status, color }) => (
    <div className="p-6 bg-[#020617] border border-slate-800 rounded-[24px] flex justify-between items-center transition-all hover:border-indigo-500/30 shadow-xl group">
        <div className="flex items-center gap-5">
            <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}><Banknote className={`text-${color}-500`} size={28} /></div>
            <p className="font-black text-white italic uppercase text-sm tracking-tighter">{name}</p>
        </div>
        <div className="flex items-center gap-6 font-black italic">
            <span className={`text-[10px] uppercase px-4 py-1.5 rounded-full border tracking-widest ${status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{status}</span>
            <button className="text-xs text-indigo-400 hover:text-white uppercase tracking-widest underline decoration-indigo-500/20 underline-offset-4">Configure</button>
        </div>
    </div>
);

export default AdminDashboard;