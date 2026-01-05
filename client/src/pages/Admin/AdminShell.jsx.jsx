import React from "react";
import { Plus, X } from "lucide-react";

export const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`admin-nav-item ${
      active ? "admin-nav-item-active" : "admin-nav-item-idle"
    }`}
  >
    {icon} {label}
  </button>
);

export const DashboardPanel = ({ stats }) => (
  <div className="admin-card">
    <div className="admin-card-header">
      <h2 className="admin-card-title">Overview</h2>
    </div>
    <div className="admin-card-header">
      <p>Gross Sales: KES {stats.total_revenue || 0}</p>
      <p>Host Margin: KES {stats.platform_commission || 0}</p>
      <p>Vendors: {stats.total_vendors || 0}</p>
    </div>
  </div>
);

export const EventsTable = ({ events, canCreate, onCreate }) => (
  <div className="admin-card">
    <div className="admin-card-header">
      <h2 className="admin-card-title">Events</h2>
      <button
        className={canCreate ? "btn-admin-primary" : "btn-admin-muted"}
        onClick={canCreate ? onCreate : undefined}
      >
        <Plus size={16} /> Add Event
      </button>
    </div>

    <table className="admin-table">
      <thead className="admin-thead">
        <tr>
          <th className="admin-th">Name</th>
          <th className="admin-th">Location</th>
          <th className="admin-th">Duration</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id} className="admin-row">
            <td className="admin-td">{e.name}</td>
            <td className="admin-td">{e.location}</td>
            <td className="admin-td">{e.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const VendorsTable = ({ vendors, packages }) => (
  <div className="admin-card">
    <table className="admin-table">
      <thead className="admin-thead">
        <tr>
          <th className="admin-th">Vendor</th>
          <th className="admin-th">Revenue</th>
          <th className="admin-th">Host Margin</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((v) => {
          const tier = packages.find((p) => p.name === v.tier) || { percent: 0 };
          const margin = (v.total_revenue || 0) * (tier.percent / 100);
          return (
            <tr key={v.id} className="admin-row">
              <td className="admin-td">{v.username}</td>
              <td className="admin-td">KES {v.total_revenue || 0}</td>
              <td className="admin-td">KES {margin}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const StaffUsersTable = ({ users, canCreate, onCreate }) => (
  <div className="admin-card">
    <div className="admin-card-header">
      <h2 className="admin-card-title">Staff Users</h2>
      <button
        className={canCreate ? "btn-admin-primary" : "btn-admin-muted"}
        onClick={canCreate ? onCreate : undefined}
      >
        Add User
      </button>
    </div>

    <table className="admin-table">
      <thead className="admin-thead">
        <tr>
          <th className="admin-th">Name</th>
          <th className="admin-th">Role</th>
          <th className="admin-th">Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="admin-row">
            <td className="admin-td">{u.name}</td>
            <td className="admin-td">{u.role}</td>
            <td className="admin-td">{u.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const WithdrawalTable = ({ withdrawals }) => (
  <div className="admin-card">
    <table className="admin-table">
      <thead className="admin-thead">
        <tr>
          <th className="admin-th">Vendor</th>
          <th className="admin-th">Amount</th>
          <th className="admin-th">Status</th>
        </tr>
      </thead>
      <tbody>
        {withdrawals.map((w) => (
          <tr key={w.id} className="admin-row">
            <td className="admin-td">{w.vendor_name}</td>
            <td className="admin-td">KES {w.amount}</td>
            <td className="admin-td">{w.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SettingsPanel = () => (
  <div className="admin-card">
    <div className="admin-card-header">
      <h2 className="admin-card-title">Settings</h2>
    </div>
  </div>
);

export const CreateEventModal = ({ open, value, onChange, onClose }) => {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="admin-modal-title">Create Event</h2>

        <input
          className="admin-input"
          placeholder="Event name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <input
          className="admin-input"
          placeholder="Location"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
        <input
          className="admin-input"
          placeholder="Duration"
          value={value.duration}
          onChange={(e) => onChange({ ...value, duration: e.target.value })}
        />
      </div>
    </div>
  );
};

export const CreateUserModal = ({ open, value, onChange, onClose }) => {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="admin-modal-title">Create User</h2>

        <input className="admin-input" placeholder="Name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        <input className="admin-input" placeholder="Email" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
        <input className="admin-input" placeholder="Phone" value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
      </div>
    </div>
  );
};
