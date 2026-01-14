import { useState } from "react";
import { directPayout } from "../../api";

export default function DirectPayoutModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ recipient_name: "", phone: "", amount: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!window.confirm("This payment is instant and cannot be reversed.")) return;

    setLoading(true);
    try {
      await directPayout(form);
      onSuccess();
      onClose();
    } catch (e) {
      alert(e.response?.data?.msg || "Payment failed");
    }
    setLoading(false);
  };

  return (
    <div className="modal">
      <h3>Supplier / Staff Payout</h3>
      <input placeholder="Recipient Name" onChange={e => setForm({...form, recipient_name:e.target.value})}/>
      <input placeholder="Phone" onChange={e => setForm({...form, phone:e.target.value})}/>
      <input type="number" placeholder="Amount" onChange={e => setForm({...form, amount:e.target.value})}/>
      <button onClick={submit} disabled={loading}>Send Payment</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
