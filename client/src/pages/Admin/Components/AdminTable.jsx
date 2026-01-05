import React from 'react';

const AdminTable = ({ headers, children }) => (
  <div className="admin-card overflow-x-auto">
    <table className="admin-table">
      <thead className="admin-thead">
        <tr>
          {headers.map((h) => (
            <th key={h} className="admin-th">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default AdminTable;