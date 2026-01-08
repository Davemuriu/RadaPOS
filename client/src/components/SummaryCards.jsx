export default function SummaryCards({ summary }) {
  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
        <h3>Total Transactions</h3>
        <p>{summary.transaction_count}</p>
      </div>
      <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
        <h3>Total Amount</h3>
        <p>${summary.total_amount}</p>
      </div>
    </div>
  );
}
