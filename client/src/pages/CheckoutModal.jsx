import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext"; // relative import
import api from "../utils/api";

export default function CheckoutModal({ close }) {
  const { cart, total, setCart, offlineQueue, setOfflineQueue } = useContext(CartContext);
  const [amount, setAmount] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      alert("Please enter a valid amount.");
      return;
    }

    const payload = {
      vendor_id: 1,
      event_id: 1,
      items: cart.map((i) => ({ product_id: i.id, qty: i.quantity })),
      amount_tendered: numericAmount,
      payment_method: "cash",
      offline: !navigator.onLine,
    };

    if (!navigator.onLine) {
      setOfflineQueue([...offlineQueue, payload]);
      alert("Offline: Sale queued");
    } else {
      try {
        await api.post("/transactions/checkout", payload);
        alert("Sale completed successfully");
      } catch (error) {
        console.error(error);
        alert("Error completing sale");
      }
    }

    setCart([]);
    close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Cash Payment</h3>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount given"
            className="w-full border px-3 py-2 rounded"
          />
          <p>Total: KES {total}</p>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Complete Sale
          </button>
          <button
            type="button"
            onClick={close}
            className="w-full mt-2 border py-2 rounded"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
