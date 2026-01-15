import { useEffect, useContext, useState } from "react";
import { CartContext } from "../context/CartContext"; // relative import
import api from "../utils/api";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((p) => (
        <div
          key={p.id}
          onClick={() => addItem(p)}
          className="cursor-pointer bg-white rounded-2xl shadow hover:scale-105 transform transition p-4 text-center"
        >
          <img src={p.image_url} alt={p.name} className="h-24 mx-auto mb-2" />
          <h3 className="font-bold">{p.name}</h3>
          <p className="text-gray-500">KES {p.price}</p>
        </div>
      ))}
    </div>
  );
}
