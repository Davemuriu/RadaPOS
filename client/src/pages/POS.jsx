import ProductGrid from "./ProductGrid";
import CartPanel from "./CartPanel";

export default function POS() {
  return (
    <div className="grid grid-cols-3 h-screen">
      {/* Product list area */}
      <div className="col-span-2 bg-gray-100 p-4 overflow-y-auto">
        <ProductGrid />
      </div>

      {/* Cart panel */}
      <CartPanel />
    </div>
  );
}
