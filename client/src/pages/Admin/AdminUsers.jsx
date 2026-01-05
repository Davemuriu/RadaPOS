import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminUsers = () => (
  <AdminShell title="Users">
    <AdminTable headers={['Username', 'Role', 'Status', 'Actions']}>
      <tr className="admin-row">
        <td className="admin-td font-bold text-white uppercase">John_Doe</td>
        <td className="admin-td italic">Editor</td>
        <td className="admin-td"><span className="admin-pill-success">Active</span></td>
        <td className="admin-td"><button className="btn-admin-warning">Edit</button></td>
      </tr>
    </AdminTable>
  </AdminShell>
);

export default AdminUsers;