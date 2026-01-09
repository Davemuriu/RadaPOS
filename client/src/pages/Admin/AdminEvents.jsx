import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, MapPin, Loader2, Download, ChevronDown, Search } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date_range: '',
    region: '',
    status: 'upcoming'
  });

  // Re-fetch events whenever the date filter changes
  useEffect(() => {
    fetchEvents();
  }, [dateFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Syncing with your existing stats endpoint and adding the period filter
      const response = await fetch(`http://localhost:5555/api/admin/stats?period=${dateFilter.toLowerCase().replace(' ', '_')}`);
      const data = await response.json();
      setEvents(data.active_events || []);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Directs browser to the Python export route with current filter
    window.location.href = `http://localhost:5555/api/admin/events/export?period=${dateFilter.toLowerCase().replace(' ', '_')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5555/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', date_range: '', region: '', status: 'upcoming' });
        fetchEvents();
      }
    } catch (err) {
      alert("Error creating event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter the table based on search input
  const filteredEvents = Array.isArray(events) 
    ? events.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="p-8 text-white bg-[#0B0E11] min-h-screen relative font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            {/* Date Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="bg-[#11141A] border border-gray-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:border-gray-600 transition-all"
              >
                <Calendar size={14} className="text-indigo-400" /> 
                Period: {dateFilter} 
                <ChevronDown size={14} />
              </button>
              {showFilterDropdown && (
                <div className="absolute top-12 left-0 w-44 bg-[#1A1F26] border border-gray-800 rounded-xl z-50 overflow-hidden shadow-2xl">
                  {['All', 'This Week', 'This Month', 'This Year'].map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => {setDateFilter(opt); setShowFilterDropdown(false)}} 
                      className="w-full text-left px-4 py-3 text-xs hover:bg-indigo-600/20 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownloadReport}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all font-medium"
            >
              <Download size={14} /> Download Report
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6366F1] hover:bg-[#5558E3] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Create New Event
        </button>
      </div>

      {/* Summary Cards Row (Optional - matches Figma bottom row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#11141A] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Total Events</p>
            <p className="text-3xl font-bold">{filteredEvents.length}</p>
          </div>
          <div className="bg-[#11141A] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Active Regions</p>
            <p className="text-3xl font-bold">{[...new Set(filteredEvents.map(e => e.region))].length}</p>
          </div>
          <div className="bg-[#11141A] p-6 rounded-2xl border border-gray-800">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Platform Status</p>
            <p className="text-3xl font-bold text-green-500">Live</p>
          </div>
      </div>

      {/* Events Table Section */}
      <div className="bg-[#11141A] rounded-3xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#161B22]/30">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Registered Events List</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Search by event name..." 
              className="bg-[#0B0E11] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B0E11]/50 text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-gray-800">
              <tr>
                <th className="px-6 py-5 font-bold">Event Name</th>
                <th className="px-6 py-5 font-bold">Date Range</th>
                <th className="px-6 py-5 font-bold">Region</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Vendors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500 italic">Updating records...</td></tr>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xs font-bold">
                          {event.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{event.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-400 font-medium">{event.date_range}</td>
                    <td className="px-6 py-5 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-600" />
                        {event.region || 'Not Set'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        event.status === 'active' 
                        ? 'border-green-500/30 text-green-500 bg-green-500/5' 
                        : 'border-gray-600 text-gray-500 bg-gray-800/50'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-right font-bold text-indigo-100">
                      {event.vendors_count || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-10 text-center text-gray-500">No events match your current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EVENT MODAL (Same as before) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11141A] w-full max-w-md rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#161B22]">
              <h2 className="text-xl font-bold">New Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Event Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Solfest 2026"
                  className="w-full bg-[#0B0E11] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Region</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Nairobi"
                    className="w-full bg-[#0B0E11] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Status</label>
                  <select 
                    className="w-full bg-[#0B0E11] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Date Range</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Dec 20-22, 2026"
                  className="w-full bg-[#0B0E11] border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                  value={formData.date_range}
                  onChange={(e) => setFormData({...formData, date_range: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}