// components/admin/AdminTable.jsx
import React from "react";

const AdminTable = ({ headers = [], children }) => {
  return (
    <div className="overflow-x-auto rounded-xl bg-rada-void border border-rada-border">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-rada-dark border-b border-rada-border">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-rada-border">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
