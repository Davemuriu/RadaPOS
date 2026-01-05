import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5555";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("bekivugz@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // you can also store role/admin_role if you want:
      // localStorage.setItem("role", data.user.role);

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Backend not reachable. Confirm Flask is running on port 5555.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rada-void text-white px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-rada-surface p-8 rounded-rada shadow-lg border border-border-soft"
      >
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in to manage events, vendors, packages and approvals.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <label className="text-sm text-slate-300">Email</label>
        <input
          className="mt-2 mb-4 w-full rounded-xl bg-black/30 border border-border-soft px-4 py-3 outline-none focus:ring-2 focus:ring-rada-accent/40"
          type="text"
          placeholder="bekivugz@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />

        <label className="text-sm text-slate-300">Password</label>
        <input
          className="mt-2 mb-6 w-full rounded-xl bg-black/30 border border-border-soft px-4 py-3 outline-none focus:ring-2 focus:ring-rada-accent/40"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-rada-accent py-3 font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <button
          type="button"
          className="w-full mt-3 rounded-xl border border-border-soft py-3 text-sm text-slate-300 hover:bg-white/5"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </form>
    </div>
  );
}
