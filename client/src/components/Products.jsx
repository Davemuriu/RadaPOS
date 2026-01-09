import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

const API = "http://127.0.0.1:5000";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    //  No token → kick user to login
    if (!token) {
      console.warn("No access token found. Redirecting to login.");
      navigate("/login");
      return;
    }

    axios
      .get(`${API}/products/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Products response:", res.data);
        setProducts(res.data.products || []);
      })
      .catch((err) => {
        console.error("Products fetch error:", err);

        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("access_token");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setError("Failed to load products.");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading products…</p>;
  }

  if (error) {
    return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  }

  if (products.length === 0) {
    return <p style={{ padding: 20 }}>No products found.</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              background: "#fff",
            }}
          >
            <h3>{p.name}</h3>
            <p>{p.description || "No description"}</p>
            <strong>KES {p.price}</strong>
            <p style={{ fontSize: 12, color: "#666" }}>
              Vendor: {p.vendor_name || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
