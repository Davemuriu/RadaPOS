import { useEffect, useState } from "react";
import axios from "axios";
import SummaryCards from "./components/SummaryCards";
import SalesChart from "./components/SalesChart";

const API = "http://127.0.0.1:5555";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/transactions/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => {
        console.error("Summary error:", err);
        setError(err.response?.data?.msg || "Failed to fetch summary");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading dashboard…</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!summary) return <p style={{ padding: 20 }}>No data available</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <SummaryCards summary={summary} />
      <div style={{ marginTop: 40 }}>
        <SalesChart data={summary.daily_sales || []} />
      </div>
    </div>
  );
}
