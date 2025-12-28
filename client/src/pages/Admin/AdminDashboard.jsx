import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Wallet, CheckCircle, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [eventName, setEventName] = useState('');

    // Fetch existing events from Backend
    useEffect(() => {
        axios.get('http://localhost:5000/api/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error("Error fetching events:", err));
    }, []);

    // Function to add a new event
    const handleAddEvent = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/events', { name: eventName, location: 'Nairobi' })
            .then(res => {
                setEvents([...events, { name: eventName, location: 'Nairobi' }]);
                setEventName('');
            });
    };

    return (
        <div className="p-10 bg-gray-100 min-h-screen text-slate-800">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Wallet className="text-blue-600" /> SaaS Admin Panel
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* EVENT MANAGEMENT */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar /> Manage Events
                    </h2>
                    <form onSubmit={handleAddEvent} className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            className="border p-2 rounded flex-grow" 
                            placeholder="Event Name (e.g. Solfest)"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                        <button className="bg-blue-600 text-white p-2 rounded flex items-center">
                            <Plus size={20} /> Add
                        </button>
                    </form>
                    <ul className="divide-y">
                        {events.map((event, index) => (
                            <li key={index} className="py-2 flex justify-between">
                                <span>{event.name}</span>
                                <span className="text-gray-400 text-sm">Active</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* WITHDRAWAL APPROVALS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Pending Withdrawals
                    </h2>
                    <p className="text-gray-500 italic">No pending vendor payouts.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;