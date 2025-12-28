import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Wallet, CheckCircle, Plus, Trash2, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', location: '' });
    const API_BASE = "http://localhost:5000/api";

    const loadDashboard = async () => {
        try {
            const evRes = await axios.get(`${API_BASE}/events`);
            const payRes = await axios.get(`${API_BASE}/admin/withdrawals`);
            setEvents(evRes.data);
            setPayouts(payRes.data);
        } catch (err) { console.error("Data load failed", err); }
    };

    useEffect(() => { loadDashboard(); }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        await axios.post(`${API_BASE}/events`, newEvent);
        setNewEvent({ name: '', location: '' });
        loadDashboard();
    };

    const handleDeactivate = async (id) => {
        await axios.patch(`${API_BASE}/events/${id}`, { status: 'deactivated' });
        loadDashboard();
    };

    const handleApprove = async (id) => {
        await axios.patch(`${API_BASE}/admin/withdrawals/${id}/approve`);
        loadDashboard();
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between mb-8">
                <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
                    <Wallet size={32}/> RadaPOS Admin
                </h1>
                <button onClick={loadDashboard} className="bg-white p-2 rounded shadow hover:bg-slate-100">
                    <RefreshCcw size={20} />
                </button>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Event Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar/> Events</h2>
                    <form onSubmit={handleCreateEvent} className="flex gap-2 mb-6">
                        <input className="border p-2 rounded flex-grow" placeholder="Event Name" value={newEvent.name} onChange={(e)=>setNewEvent({...newEvent, name:e.target.value})} required />
                        <input className="border p-2 rounded w-1/3" placeholder="Loc" value={newEvent.location} onChange={(e)=>setNewEvent({...newEvent, location:e.target.value})} required />
                        <button className="bg-indigo-600 text-white px-4 rounded font-bold"><Plus/></button>
                    </form>
                    <div className="space-y-3">
                        {events.map(e => (
                            <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                <div><p className="font-bold">{e.name}</p><p className="text-xs text-slate-500">{e.location}</p></div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span>
                                    {e.status === 'active' && <button onClick={() => handleDeactivate(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Payout Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckCircle/> Payout Approvals</h2>
                    <div className="space-y-4">
                        {payouts.map(p => (
                            <div key={p.id} className="flex justify-between border-b pb-2">
                                <div><p className="font-bold">KES {p.amount}</p><p className="text-xs">{p.vendor_name}</p></div>
                                <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">Approve</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;