import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onLogin({
      email,
      role: "SUPER_ADMIN",
    });

    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rada-void text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-rada-surface p-8 rounded-xl w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

        <input
          className="admin-input mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="admin-input mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-admin-primary w-full">
          Login
        </button>
      </form>
    </div>
  );
}
