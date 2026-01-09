import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  // Load cart and offline queue from localStorage
  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("rada_cart")) || []
  );
  const [offlineQueue, setOfflineQueue] = useState(
    () => JSON.parse(localStorage.getItem("rada_queue")) || []
  );

  // Persist cart and offline queue to localStorage
  useEffect(() => {
    localStorage.setItem("rada_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("rada_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Add item to cart
  const addItem = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Calculate total amount
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addItem,
        total,
        offlineQueue,
        setOfflineQueue,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
