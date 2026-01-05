import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminVendors = () => {
  const headers = ['Business Name', 'Category', 'Rating', 'Status', 'Actions'];

  return (
    <AdminShell title="Vendors">
      <div className="admin-filters">
        <span className="admin-filter-label">Quick Search:</span>
        <select className="admin-select">
          <option>All Categories</option>
          <option>Catering</option>
          <option>Security</option>
          <option>Audio/Visual</option>
        </select>
        <button className="btn-admin-primary ml-auto">Add New Vendor</button>
      </div>

      <AdminTable headers={headers}>
        <tr className="admin-row">
          <td className="admin-td text-white font-bold">Starlight Catering</td>
          <td className="admin-td italic">Food & Beverage</td>
          <td className="admin-td text-rada-accent">★★★★★</td>
          <td className="admin-td">
            <span className="admin-pill-success">Verified</span>
          </td>
          <td className="admin-td">
            <button className="btn-admin-warning">Contact</button>
          </td>
        </tr>
        <tr className="admin-row">
          <td className="admin-td text-white font-bold">SafeGuard Sec</td>
          <td className="admin-td italic">Security</td>
          <td className="admin-td text-rada-accent">★★★★☆</td>
          <td className="admin-td">
            <span className="admin-pill-warning">Reviewing</span>
          </td>
          <td className="admin-td">
            <button className="btn-admin-warning">Contact</button>
          </td>
        </tr>
      </AdminTable>
    </AdminShell>
  );
};

export default AdminVendors;