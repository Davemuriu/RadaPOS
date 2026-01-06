import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TEST: Use the absolute URL to bypass proxy issues
        const response = await fetch("http://localhost:5555/api/admin/stats");
        
        if (!response.ok) {
           throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error} (Check if Flask is running on 5555)</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#11141A] p-4 rounded-xl border border-gray-800">
           <p className="text-gray-400 text-xs uppercase">Total Revenue</p>
           <p className="text-2xl font-bold">KES {stats?.total_revenue?.toLocaleString()}</p>
        </div>
        <div className="bg-[#11141A] p-4 rounded-xl border border-gray-800">
           <p className="text-gray-400 text-xs uppercase">Active Events</p>
           <p className="text-2xl font-bold">{stats?.active_events}</p>
        </div>
      </div>
    </div>
  );
}