import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, Wallet, Settings, LogOut, Search, Bell, Plus, X, 
  ShieldCheck, CreditCard, Lock, Eye, Banknote, FileBarChart, Download, Filter, 
  Package, Trash2, Percent, Edit3, Check, UserPlus, Zap, Trash, ChevronRight 
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

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
    // Change this line in your State Management section
    const [currentUser, setCurrentUser] = useState({ 
        name: localStorage.getItem('userName') || "Guest User", 
        role: localStorage.getItem('userRole') || 'admin_manager' 
    });
    
    
    // Ensure your Python Backend matches this URL exactly
    const API_BASE = "http://localhost:5555/api";

    // 2. DATA FETCHING (Corrected for CORS/404)
    const fetchData = async () => {
        try {
            const queryParams = { ...filters };
            const [evRes, withRes, statsRes, userRes] = await Promise.all([
                axios.get(`${API_BASE}/events`),
                axios.get(`${API_BASE}/admin/withdrawals`, { params: queryParams }),
                axios.get(`${API_BASE}/admin/stats`, { params: queryParams }),
                axios.get(`${API_BASE}/admin/users`)
            ]);
            setEvents(evRes.data || []);
            setWithdrawals(withRes.data || []);
            setStats(statsRes.data || { total_revenue: 0, platform_commission: 0, active_events: 0, total_vendors: 0, pending_withdrawals: 0 });
            setPlatformUsers(userRes.data || []);
        } catch (err) { 
            console.error("Database Sync Error. Check Flask CORS settings.", err); 
        }
    };

    useEffect(() => { fetchData(); }, [filters, activeTab]);

    // Logout logic
    const handleLogout = () => navigate('/');

    // 3. UI HELPERS
    const navClass = (tab) => `w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        activeTab === tab 
        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold italic' 
        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
    }`;

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        setIsModalOpen(true);
    };

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
                                <input className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-5 outline-none focus:ring-1 focus:ring-indigo-500 font-bold italic text-white" placeholder="e.g. SOLFEST 2025" required />
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition uppercase tracking-[0.2em] text-xs">Deploy to System</button>
                        </form>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-72 bg-[#0B0F1A] border-r border-slate-800/50 fixed h-full z-30 shadow-2xl flex flex-col">
                <div className="p-10 flex items-center gap-3">
                    <Zap className="text-indigo-500 fill-indigo-500 animate-pulse" size={24} />
                    <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Rada<span className="text-emerald-500">POS</span></span>
                </div>
                <nav className="px-6 space-y-2 flex-grow">
                    <button onClick={() => setActiveTab('dashboard')} className={navClass('dashboard')}><LayoutDashboard size={18}/> Dashboard</button>
                    <button onClick={() => setActiveTab('events')} className={navClass('events')}><Calendar size={18}/> Events</button>
                    <button onClick={() => setActiveTab('vendors')} className={navClass('vendors')}><Users size={18}/> Vendors</button>
                    <button onClick={() => setActiveTab('users')} className={navClass('users')}><ShieldCheck size={18}/> Admin Users</button>
                    <button onClick={() => setActiveTab('withdrawals')} className={navClass('withdrawals')}><Wallet size={18}/> Withdrawals</button>
                    <button onClick={() => setActiveTab('reports')} className={navClass('reports')}><FileBarChart size={18}/> Reports</button>
                    <button onClick={() => setActiveTab('settings')} className={navClass('settings')}><Settings size={18}/> Settings</button>
                </nav>

                {/* LOGOUT BUTTON */}
                <div className="p-6 mt-auto border-t border-slate-800/50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold uppercase text-xs tracking-widest active:scale-95">
                        <LogOut size={18}/> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="ml-72 flex-grow p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white capitalize italic underline underline-offset-[12px] decoration-indigo-500/40 tracking-tighter">{activeTab}</h1>
                        <p className="text-slate-500 text-sm mt-4 font-bold italic opacity-60">System Operator: {currentUser.name}</p>
                    </div>
                    <div className="bg-[#0B0F1A] border border-indigo-500/30 px-4 py-2 rounded-xl shadow-lg">
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
                        <select className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none font-bold italic" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                            <option value="all">All (Lifetime)</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <select className="bg-[#020617] border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none font-bold italic" value={filters.eventId} onChange={(e) => setFilters({...filters, eventId: e.target.value})}>
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

                {/* --- TAB: EVENTS (RE-INTEGRATED) --- */}
                {activeTab === 'events' && (
                    <div className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6">
                        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center italic">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Live Event Management</h2>
                            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white shadow-lg hover:scale-105 transition flex items-center gap-2"><Plus size={18}/> New Event</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] italic p-8">
                                <tr><th className="p-8">Event Name</th><th className="p-8">Date</th><th className="p-8 text-center">Status</th><th className="p-8 text-right pr-12">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {events.length > 0 ? events.map((ev, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition group italic font-medium">
                                        <td className="p-8 font-black text-white group-hover:text-indigo-400 text-lg tracking-tighter">{ev.name}</td>
                                        <td className="p-8 text-slate-500 text-sm">{ev.date}</td>
                                        <td className="p-8 flex justify-center"><StatusPill status={ev.status || 'active'} /></td>
                                        <td className="p-8 text-right pr-12"><button className="text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition">Manage</button></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="p-20 text-center text-slate-600 uppercase font-bold tracking-widest opacity-50 italic">Verify API Connection: No events found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: VENDORS --- */}
                {activeTab === 'vendors' && (
                    <div className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6">
                        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center italic">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Merchant Onboarding</h2>
                        </div>
                        <table className="w-full text-left italic font-medium">
                            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] p-8 border-b border-slate-800/50">
                                <tr><th className="p-8">Vendor Name</th><th className="p-8">Category</th><th className="p-8 text-center">Status</th><th className="p-8 text-right pr-12">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {platformUsers.filter(u => u.role === 'vendor').map((v, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                                        <td className="p-8 font-black text-white group-hover:text-indigo-400 text-lg tracking-tighter underline decoration-transparent group-hover:decoration-indigo-500 transition-all">{v.username}</td>
                                        <td className="p-8"><span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black border border-indigo-500/20 uppercase">{v.product_type || 'General'}</span></td>
                                        <td className="p-8 flex justify-center"><StatusPill status={v.status || 'active'} /></td>
                                        <td className="p-8 text-right pr-12">
                                            <button className="text-indigo-400 hover:text-white transition uppercase font-black text-[10px] tracking-widest">Dossier</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: ADMIN USERS --- */}
                {activeTab === 'users' && (
                    <div className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 italic">
                        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Access Control</h2>
                            <button className="bg-indigo-600 px-6 py-3 rounded-2xl font-black uppercase text-[11px] flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-indigo-500/20"><UserPlus size={18}/> Add Admin</button>
                        </div>
                        <table className="w-full text-left italic font-medium">
                            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] p-8 border-b border-slate-800/50">
                                <tr><th className="p-8">Staff</th><th className="p-8">Email</th><th className="p-8 text-center">Status</th><th className="p-8 text-right pr-12">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30 font-bold tracking-tight">
                                {platformUsers.filter(u => u.role.includes('admin')).map((u, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                                        <td className="p-8 font-black text-white group-hover:text-indigo-400 flex items-center gap-3 tracking-tighter"><ShieldCheck size={18} className="text-indigo-500"/> {u.username}</td>
                                        <td className="p-8 text-slate-500 text-xs italic">{u.email}</td>
                                        <td className="p-8 flex justify-center"><StatusPill status="active" /></td>
                                        <td className="p-8 text-right pr-12"><button className="text-rose-500/60 hover:text-rose-500 transition"><Trash size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: WITHDRAWALS (FULL LOG) --- */}
                {activeTab === 'withdrawals' && <WithdrawalTable withdrawals={withdrawals} showActions={true} currentUser={currentUser} />}

                {/* --- TAB: SETTINGS (PACKAGES & GATEWAYS) --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-12 animate-in fade-in max-w-5xl italic font-medium">
                        <div className="bg-[#0B0F1A] border border-slate-800 p-10 rounded-[40px] shadow-2xl">
                            <div className="flex justify-between items-center mb-10 italic">
                                <div><h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30 flex items-center gap-3"><Percent size={24} className="text-indigo-500"/> Revenue Packages</h2><p className="text-xs text-slate-500 mt-2 font-bold opacity-60">Define commission tiers for merchants</p></div>
                                <button className="bg-indigo-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase text-white shadow-lg"><Plus size={16} className="inline mr-2"/> New Tier</button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className="p-8 bg-[#020617] border border-slate-800 rounded-3xl relative group overflow-hidden transition-all hover:border-indigo-500/50">
                                        <div className="absolute top-0 right-0 p-6 font-black text-indigo-500 text-4xl italic opacity-10 group-hover:opacity-100 transition-opacity tracking-tighter">{pkg.percent}%</div>
                                        <h3 className="text-white font-black text-xl mb-4 tracking-tighter uppercase">{pkg.name}</h3>
                                        <p className="text-slate-500 text-xs italic mb-10 h-16">{pkg.desc}</p>
                                        <button className="text-slate-500 hover:text-indigo-400 transition flex items-center gap-2 text-[10px] uppercase font-black italic tracking-widest"><Edit3 size={14}/> Edit Tier</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NEW: Payment Method Gateway Section */}
                        <div className="bg-[#0B0F1A] border border-slate-800 p-10 rounded-[40px] shadow-2xl">
                            <h2 className="text-2xl font-black text-white uppercase mb-8 flex items-center gap-3 tracking-tighter italic"><CreditCard size={24} className="text-emerald-500"/> Payment Gateways</h2>
                            <div className="space-y-4">
                                <GatewayItem name="M-Pesa STK Push" status="active" color="emerald" />
                                <GatewayItem name="Card Processing (Stripe)" status="active" color="indigo" />
                                <GatewayItem name="Manual Cash Overrides" status="restricted" color="orange" />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

/* --- SUB-COMPONENTS (Figma Perfection) --- */

const MetricCard = ({ title, value, color, trend }) => (
    <div className="bg-[#0B0F1A] border border-slate-800 p-8 rounded-[32px] relative overflow-hidden shadow-2xl transition-all hover:translate-y-[-4px]">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color === 'indigo' ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : color === 'orange' ? 'bg-orange-600' : 'bg-slate-700'}`}></div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mb-4 italic opacity-80 tracking-tighter underline decoration-indigo-500/10">{title}</p>
        <h3 className="text-3xl font-black text-white mb-2 italic tracking-tighter">{value}</h3>
        <p className="text-[10px] text-indigo-400 font-bold italic tracking-widest">{trend}</p>
    </div>
);

const WithdrawalTable = ({ withdrawals, onNavigate, showActions, currentUser }) => (
    <section className="bg-[#0B0F1A] border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl italic animate-in slide-in-from-bottom-8">
        <div className="p-10 border-b border-slate-800/50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-indigo-500/30">Financial Pipeline</h2>
            {onNavigate && <button onClick={onNavigate} className="text-indigo-400 text-xs font-black tracking-widest uppercase hover:underline flex items-center gap-2">Full Log <ChevronRight size={14}/></button>}
        </div>
        <table className="w-full text-left italic font-medium">
            <thead className="bg-[#020617] text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] p-8 border-b border-slate-800/50">
                <tr><th className="p-8">Merchant</th><th className="p-8">Gross Sale</th><th className="p-8 text-center">Status</th>{showActions && <th className="p-8 text-right pr-12">Action</th>}</tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
                {withdrawals.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition group">
                        <td className="p-8 font-black text-white group-hover:text-indigo-400 transition-all text-lg tracking-tighter italic">{req.vendor_name}</td>
                        <td className="p-8 text-slate-500 font-mono italic">KES {(req.amount || 0).toLocaleString()}</td>
                        <td className="p-8 flex justify-center"><StatusPill status={req.status || 'pending'} /></td>
                        {showActions && <td className="p-8 text-right pr-12"><button className="bg-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg active:scale-95 transition-all">Approve</button></td>}
                    </tr>
                ))}
            </tbody>
        </table>
    </section>
);

const ReportCard = ({ title, desc, icon }) => (
    <div className="bg-[#0B0F1A] border border-slate-800 p-8 rounded-[40px] hover:border-indigo-500/50 transition relative group shadow-2xl flex flex-col h-full italic">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Zap className="text-indigo-400 fill-indigo-400" size={24}/></div>
        <h3 className="text-white font-black italic mb-4 uppercase text-lg tracking-tighter underline decoration-indigo-500/20">{title}</h3>
        <p className="text-slate-500 text-xs mb-10 leading-relaxed font-medium pr-4 opacity-70">{desc}</p>
        <button className="mt-auto flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 hover:text-white transition italic"><Download size={16}/> Download CSV</button>
    </div>
);

const GatewayItem = ({ name, status, color }) => (
    <div className="p-6 bg-[#020617] border border-slate-800 rounded-[24px] flex justify-between items-center transition-all hover:border-indigo-500/30 group italic">
        <div className="flex items-center gap-5">
            <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center`}><Banknote className={`text-${color}-500`} size={28} /></div>
            <p className="font-black text-white uppercase text-sm tracking-tighter">{name}</p>
        </div>
        <div className="flex items-center gap-6 font-black italic">
            <span className={`text-[10px] uppercase px-4 py-1.5 rounded-full border tracking-widest ${status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>{status}</span>
            <button className="text-xs text-indigo-400 hover:text-white uppercase font-black tracking-widest underline decoration-indigo-500/20">Configure</button>
        </div>
    </div>
);

const StatusPill = ({ status }) => (
    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 border shadow-lg ${status === 'active' || status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
        <span className={`w-2 h-2 rounded-full ${status === 'active' || status === 'approved' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-orange-500'}`}></span>
        {status}
    </span>
);

export default AdminDashboard;