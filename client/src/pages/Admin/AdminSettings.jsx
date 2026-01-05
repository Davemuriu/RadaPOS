import React from 'react';
import AdminShell from './components/AdminShell';

const AdminSettings = () => (
  <AdminShell title="Settings">
    <div className="max-w-xl admin-card p-10 space-y-6">
      <div>
        <label className="admin-field-label">Site Title</label>
        <input className="admin-input mt-2" defaultValue="Rada Platform" />
      </div>
      <div>
        <label className="admin-field-label">Maintenance Mode</label>
        <select className="admin-select w-full mt-2">
          <option>OFF</option>
          <option>ON</option>
        </select>
      </div>
      <button className="btn-admin-primary w-full">Update Settings</button>
    </div>
  </AdminShell>
);

export default AdminSettings;