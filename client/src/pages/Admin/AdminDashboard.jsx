import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Calendar, Wallet, CheckCircle, 
  Plus, Trash2, Search, Bell, Settings, LogOut, MapPin
} from 'lucide-react';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', location: '' });
    const API_BASE = "http://localhost:5555/api";

    const fetchData = async () => {
        try {
            const evRes = await axios.get(`${API_BASE}/events`);
            const payRes = await axios.get(`${API_BASE}/admin/withdrawals`);
            setEvents(evRes.data);
            setPayouts(payRes.data);
        } catch (err) { console.error("Sync Error:", err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        await axios.post(`${API_BASE}/events`, newEvent);
        setNewEvent({ name: '', location: '' });
        fetchData();
    };

    return (
        <div className="flex min-h-screen bg-[#F3F4F6]">
            {/* 1. SIDEBAR (Matching Figma Navigation) */}
            <aside className="w-64 bg-[#0F172A] text-white flex flex-col fixed h-full shadow-2xl">
                <div className="p-8 text-2xl font-bold tracking-tight text-indigo-400">
                    RadaPOS
                </div>
                <nav className="flex-grow px-4 space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-indigo-600 rounded-lg cursor-pointer">
                        <LayoutDashboard size={20} /> <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition">
                        <Calendar size={20} /> <span>Events</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition">
                        <Wallet size={20} /> <span>Finances</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer transition">
                        <Settings size={20} /> <span>Settings</span>
                    </div>
                </nav>
                <div className="p-6 border-t border-slate-800">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-white transition">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="ml-64 flex-grow p-10">
                {/* HEADER AREA */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Search..." />
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm cursor-pointer hover:bg-slate-50">
                            <Bell size={20} />
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full border-2 border-indigo-500 flex items-center justify-center font-bold text-indigo-700 shadow-sm">
                            RB
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: EVENTS & FORM */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* CREATE EVENT FORM (The "Add Form" in Figma) */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold mb-6 text-slate-800">Launch New Event</h2>
                            <form onSubmit={handleCreateEvent} className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Event Title</label>
                                    <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Nairobi Festival" value={newEvent.name} onChange={(e)=>setNewEvent({...newEvent, name:e.target.value})} required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                        <input className="w-full border pl-10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Nairobi" value={newEvent.location} onChange={(e)=>setNewEvent({...newEvent, location:e.target.value})} required />
                                    </div>
                                </div>
                                <button className="col-span-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                                    Confirm & Create Event
                                </button>
                            </form>
                        </section>

                        {/* EVENTS TABLE */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 font-bold text-slate-800">Recent Events</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Location</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {events.map(e => (
                                            <tr key={e.id} className="hover:bg-slate-50 transition">
                                                <td className="p-4 font-semibold text-slate-700">{e.name}</td>
                                                <td className="p-4 text-slate-500 text-sm">{e.location}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {e.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: PAYOUTS */}
                    <div className="lg:col-span-1">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold mb-6 text-slate-800">Settlement Queue</h2>
                            <div className="space-y-4">
                                {payouts.map(p => (
                                    <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-transparent hover:border-indigo-100 transition">
                                        <div>
                                            <p className="font-bold text-indigo-900">KES {p.amount}</p>
                                            <p className="text-xs text-slate-400 font-medium">{p.vendor_name}</p>
                                        </div>
                                        <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-md">
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                ))}
                                {payouts.length === 0 && <p className="text-center text-slate-400 py-10 text-sm">No pending settlements</p>}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;