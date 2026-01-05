import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminEvents = () => (
  <AdminShell title="Events">
    <div className="admin-filters">
       <button className="btn-admin-primary">New Event</button>
    </div>
    <AdminTable headers={['Event', 'Date', 'Capacity', 'Status']}>
      <tr className="admin-row">
        <td className="admin-td text-white font-black">Summer Festival</td>
        <td className="admin-td">AUG 20, 2026</td>
        <td className="admin-td">5,000</td>
        <td className="admin-td"><span className="admin-pill-warning">Pending</span></td>
      </tr>
    </AdminTable>
  </AdminShell>
);

export default AdminEvents;