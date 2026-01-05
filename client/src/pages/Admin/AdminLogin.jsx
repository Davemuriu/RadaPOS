import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      // Save logged-in admin user in App state
      onLogin(data.user);

      // Redirect to admin dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rada-void text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-rada-surface p-8 rounded-xl w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

        {error && (
          <div className="mb-4 text-sm text-rada-danger">
            {error}
          </div>
        )}

        <input
          className="admin-input mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="admin-input mb-6"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="btn-admin-primary w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
