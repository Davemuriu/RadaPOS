import { useState } from "react";
import { apiFetch } from "../../../services/api";

export default function ProductForm({ onCreated }) {
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData(e.target);

    try {
      await fetch("http://127.0.0.1:5555/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
        body: data,
      });
      onCreated();
      e.target.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Product name" />
      <input name="price" type="number" />
      <input name="image" type="file" />
      <button disabled={loading}>
        {loading ? "Uploading…" : "Add Product"}
      </button>
    </form>
  );
}
