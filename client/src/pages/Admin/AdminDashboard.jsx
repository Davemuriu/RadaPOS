import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Wallet, CheckCircle, Plus, 
  Trash2, AlertCircle, Clock, RefreshCcw 
} from 'lucide-react';

const AdminDashboard = () => {
    // --- STATE MANAGEMENT ---
    const [events, setEvents] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', location: '' });
    const [loading, setLoading] = useState(true);

    const API_BASE = "http://localhost:5000/api";

    // --- DATA FETCHING ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [evRes, payRes] = await Promise.all([
                axios.get(`${API_BASE}/events`),
                axios.get(`${API_BASE}/admin/withdrawals`) // Ensure this route exists in your backend
            ]);
            setEvents(evRes.data);
            setPayouts(payRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- ADMIN ACTIONS ---
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/events`, newEvent);
            setNewEvent({ name: '', location: '' });
            fetchData(); // Refresh list
        } catch (err) { alert("Failed to add event"); }
    };

    const handleDeactivate = async (id) => {
        try {
            await axios.patch(`${API_BASE}/events/${id}`, { status: 'deactivated' });
            fetchData();
        } catch (err) { alert("Update failed"); }
    };

    const handleApprovePayout = async (id) => {
        try {
            await axios.patch(`${API_BASE}/admin/withdrawals/${id}/approve`);
            fetchData();
        } catch (err) { alert("Approval failed"); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Platform Data...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight flex items-center gap-3">
                    <Wallet className="text-indigo-600" size={40} /> SaaS Admin Central
                </h1>
                <button onClick={fetchData} className="p-2 hover:rotate-180 transition-transform duration-500">
                    <RefreshCcw size={20} className="text-slate-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. EVENT MANAGEMENT (Col 1 & 2) */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-indigo-500" /> Platform Events
                        </h2>
                        
                        {/* Add Event Form */}
                        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
                            <input 
                                type="text" placeholder="Event Name" required
                                className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={newEvent.name}
                                onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                            />
                            <input 
                                type="text" placeholder="Location" required
                                className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-400 outline-none"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                            />
                            <button className="bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2">
                                <Plus size={18}/> Create Event
                            </button>
                        </form>

                        {/* Events Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(event => (
                                        <tr key={event.id} className="border-b hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <p className="font-bold">{event.name}</p>
                                                <p className="text-xs text-slate-400">{event.location}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {event.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {event.status !== 'deactivated' && (
                                                    <button onClick={() => handleDeactivate(event.id)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* 2. WITHDRAWAL QUEUE (Col 3) */}
                <div className="lg:col-span-1">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="text-amber-500" /> Payout Queue
                        </h2>
                        <div className="space-y-4">
                            {payouts.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <AlertCircle className="mx-auto mb-2" />
                                    <p>No pending payouts</p>
                                </div>
                            ) : (
                                payouts.map(pay => (
                                    <div key={pay.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50">
                                        <div>
                                            <p className="font-bold text-sm">KES {pay.amount}</p>
                                            <p className="text-xs text-slate-500">{pay.vendor_name}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleApprovePayout(pay.id)}
                                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;