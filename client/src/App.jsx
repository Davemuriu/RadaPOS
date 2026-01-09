import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import POS from "./pages/POS";
import CartProvider from "./context/CartContext"; // relative import

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /pos */}
          <Route path="/" element={<Navigate to="/pos" />} />
          {/* Main POS page */}
          <Route path="/pos" element={<POS />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
