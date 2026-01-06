// pages/Admin/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800">Welcome to the Dashboard</h1>
      <p className="mt-2 text-slate-600">You have successfully logged in as an Administrator.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-500">Total Users</h3>
          <p className="text-2xl font-bold">1,284</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-500">Active Events</h3>
          <p className="text-2xl font-bold">42</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-500">Pending Vendors</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;