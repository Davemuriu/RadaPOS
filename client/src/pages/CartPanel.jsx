import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext"; // relative import
import CheckoutModal from "./CheckoutModal";

export default function CartPanel() {
  const { cart, total } = useContext(CartContext);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border-l p-4 flex flex-col h-screen w-full">
      <h2 className="text-xl font-bold mb-4">Cart</h2>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name} × {item.quantity}</span>
            <span>KES {item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mt-4">
        <p className="font-bold text-lg mb-2">Total: KES {total}</p>
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Checkout
        </button>
      </div>

      {open && <CheckoutModal close={() => setOpen(false)} />}
    </div>
  );
}
