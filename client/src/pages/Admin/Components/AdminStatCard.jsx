import React from 'react';

const AdminStatCard = ({ label, value }) => (
  <div className="admin-card p-8">
    <span className="admin-field-label">{label}</span>
    <div className="text-3xl font-black text-white mt-2 tracking-tighter uppercase">{value}</div>
  </div>
);

export default AdminStatCard;