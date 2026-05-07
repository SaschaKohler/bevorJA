import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-warm-300 mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-warm-800 mb-4">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-warm-600 mb-8">
          Entdecken Sie unsere wunderschoenen Hochzeitsboxen.
        </p>
        <Link
          to="/produkte"
          className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
        >
          Produkte ansehen
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-warm-800 mb-8">Warenkorb</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="bg-white rounded-xl border border-warm-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="w-20 h-20 bg-warm-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-gold opacity-50">&#10022;</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg text-warm-800">
                {item.product.name}
              </h3>
              <p className="text-warm-500 text-sm">
                {item.product.card_count} Karten
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="w-8 h-8 rounded-full border border-warm-300 flex items-center justify-center hover:bg-warm-100 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="w-8 h-8 rounded-full border border-warm-300 flex items-center justify-center hover:bg-warm-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="text-right min-w-24">
              <div className="font-serif text-lg text-primary-dark">
                {formatPrice(
                  parseFloat(item.product.price) * item.quantity
                )}
              </div>
              <span className="text-warm-400 text-xs">
                {formatPrice(item.product.price)} / Stueck
              </span>
            </div>

            <button
              onClick={() => removeItem(item.product.id)}
              className="text-warm-400 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-warm-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="font-serif text-xl text-warm-700">Gesamtsumme</span>
          <span className="font-serif text-3xl text-primary-dark">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <div className="text-warm-400 text-sm mb-6">inkl. MwSt.</div>
        <Link
          to="/kasse"
          className="w-full bg-primary text-white py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          Zur Kasse
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
