import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, ExternalLink, Loader2 } from 'lucide-react';

export default function AdminVendors() {
  const [data, setData] = useState({ summary: {}, vendors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("http://localhost:5555/api/admin/vendors");
        const json = await res.json();
        setData(json); // Fetches real DB counts for Active/Pending
      } catch (err) {
        console.error("Vendor fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  if (loading) return (
    <div className="p-20 text-center text-white bg-[#0B0E11] min-h-screen">
      <Loader2 className="animate-spin mx-auto mb-4 text-indigo-500" size={40} />
      <p>Loading Vendor Registry...</p>
    </div>
  );

  return (
    <div className="p-8 text-white bg-[#0B0E11] min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-gray-400 text-sm mt-1">Manage vendor accounts and permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <SummaryCard title="Total Vendors" count={data.summary.total} subtitle="Registered" color="border-gray-800" />
        <SummaryCard title="Active" count={data.summary.active} subtitle="Currently active" color="border-green-500/30" textColor="text-green-500" />
        <SummaryCard title="Pending" count={data.summary.pending} subtitle="Awaiting approval" color="border-orange-500/30" textColor="text-orange-500" />
        <SummaryCard title="Inactive" count={data.summary.inactive} subtitle="Suspended/Inactive" color="border-red-500/30" textColor="text-red-500" />
      </div>

      {/* Vendors Table */}
      <div className="bg-[#11141A] rounded-3xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0B0E11]/50 text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-gray-800">
            <tr>
              <th className="px-6 py-5">Vendor Name</th>
              <th className="px-6 py-5">Package</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Phone</th>
              <th className="px-6 py-5">Total Sales</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.vendors.map(vendor => (
              <tr key={vendor.id} className="hover:bg-white/5 transition-colors text-sm">
                <td className="px-6 py-5 font-semibold">{vendor.name}</td>
                <td className="px-6 py-5">
                   <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-700">
                     {vendor.package}
                   </span>
                </td>
                <td className="px-6 py-5 text-gray-400">{vendor.email}</td>
                <td className="px-6 py-5 text-gray-400">{vendor.phone}</td>
                <td className="px-6 py-5 font-bold text-green-400">KES {(vendor.sales || 0).toLocaleString()}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                    vendor.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    vendor.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="bg-[#0B0E11] border border-gray-800 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-black transition-all flex items-center gap-1 ml-auto">
                    VIEW DETAILS <ExternalLink size={10} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, count, subtitle, color, textColor }) {
  return (
    <div className={`bg-[#11141A] p-6 rounded-2xl border ${color || 'border-gray-800'} flex flex-col justify-between h-32`}>
      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{title}</p>
      <div>
        <p className={`text-3xl font-bold ${textColor || 'text-white'}`}>{count || 0}</p>
        <p className="text-[10px] text-gray-600 mt-1 uppercase">{subtitle}</p>
      </div>
    </div>
  );
}