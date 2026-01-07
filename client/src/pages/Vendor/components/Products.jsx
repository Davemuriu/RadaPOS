import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5555";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Products fetch error:", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <p>No access token found. Please log in.</p>;
  if (loading) return <p>Loading products…</p>;
  if (!products.length) return <p>No products available.</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Products</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              width: 250,
              boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <p>
              <strong>${p.price}</strong> | Stock: {p.stock}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
