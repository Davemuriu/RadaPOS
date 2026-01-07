import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5555";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/dashboard"); // redirect to dashboard after login
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ maxWidth: 300 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />
        <button type="submit" style={{ padding: 8, width: "100%" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
