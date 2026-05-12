import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Palette, PenTool } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const { items, removeItem, updateQuantity, removeVariant, updateVariantQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-warm-300 mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-warm-800 mb-4">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-warm-600 mb-8">
          Entdecken Sie unsere wunderschoenen Erinnerungsboxen fuer jeden Anlass.
        </p>
        <Link
          to="/produkte"
          className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
        >
          Produkte konfigurieren
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-warm-800 mb-8">Warenkorb</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          // NEW: Flexible Framework variant display
          const isVariant = !!item.variant;
          const itemId = item.variant?.id || item.product.id;
          const itemPrice = item.variant?.calculated_price || item.product.price;
          const itemName = item.variant?.name || item.product.name;

          const handleRemove = () => {
            if (isVariant && item.variant) {
              removeVariant(item.variant.id);
            } else {
              removeItem(item.product.id);
            }
          };

          const handleQuantityChange = (newQuantity: number) => {
            if (isVariant && item.variant) {
              updateVariantQuantity(item.variant.id, newQuantity);
            } else {
              updateQuantity(item.product.id, newQuantity);
            }
          };

          return (
            <div
              key={itemId}
              className="bg-white rounded-xl border border-warm-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-20 h-20 bg-warm-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.variant?.image ? (
                  <img
                    src={item.variant.image}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gold opacity-50">&#10022;</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-warm-800">
                  {itemName}
                </h3>

                {/* NEW: Variant details */}
                {isVariant && (
                  <div className="text-warm-500 text-sm space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      <span>{item.box_type?.name}</span>
                    </div>
                    <div>
                      {item.card_package?.card_count} Karten ({item.card_package?.name})
                    </div>
                    {item.occasion && (
                      <div className="text-gold">{item.occasion.name}</div>
                    )}
                  </div>
                )}

                {/* NEW: Customization details */}
                {item.customization && (
                  <div className="mt-2 text-xs text-warm-400 space-y-0.5">
                    {item.customization.engraving_text && (
                      <div className="flex items-center gap-1">
                        <PenTool className="w-3 h-3" />
                        <span>Gravur: {item.customization.engraving_text}</span>
                      </div>
                    )}
                    {item.customization.box_color && (
                      <div className="flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        <span>Farbe: {item.customization.box_color}</span>
                      </div>
                    )}
                    {item.customization.selected_design && (
                      <div>Design: {item.customization.selected_design}</div>
                    )}
                  </div>
                )}

                {/* Legacy display */}
                {!isVariant && (
                  <p className="text-warm-500 text-sm">
                    {item.product.card_count} Karten
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-warm-300 flex items-center justify-center hover:bg-warm-100 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-warm-300 flex items-center justify-center hover:bg-warm-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right min-w-24">
                <div className="font-serif text-lg text-primary-dark">
                  {formatPrice(parseFloat(itemPrice) * item.quantity)}
                </div>
                <span className="text-warm-400 text-xs">
                  {formatPrice(itemPrice)} / Stueck
                </span>
              </div>

              <button
                onClick={handleRemove}
                className="text-warm-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
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
