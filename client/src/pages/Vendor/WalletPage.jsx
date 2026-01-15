import { useState, useEffect } from "react";
import { getWallet } from "../../api";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [showPayout, setShowPayout] = useState(false);

  const refreshWallet = async () => {
    const res = await getWallet();
    setWallet(res.data);
  };

  useEffect(() => { refreshWallet(); }, []);

  return (
    <div>
      <h2>Wallet Balance: {wallet?.current_balance}</h2>

      <button onClick={() => setShowPayout(true)}>Supplier / Staff Payout</button>

      {showPayout && (
        <DirectPayoutModal
          onClose={() => setShowPayout(false)}
          onSuccess={refreshWallet}
        />
      )}
    </div>
  );
}
