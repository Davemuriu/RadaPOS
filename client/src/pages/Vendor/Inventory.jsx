import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";
import ProductForm from "./components/ProductForm";

export default function Inventory() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Inventory</h1>
      <ProductForm onCreated={() =>
        apiFetch("/products").then(setProducts)
      } />

      {products.map(p => (
        <div key={p.id}>
          {p.name} - KES {p.price}
        </div>
      ))}
    </div>
  );
}
