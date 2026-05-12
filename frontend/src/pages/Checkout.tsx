import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Package, Palette, PenTool } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOccasion } from "@/store/occasion";
import { formatPrice } from "@/lib/utils";
import { createOrder, createCheckoutSession } from "@/lib/api";

export default function Checkout() {
  const { items, totalPrice, clearCart, selectedOccasion: cartOccasion } = useCart();
  const { selectedOccasion: occasionContext } = useOccasion();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    street: "",
    zip_code: "",
    city: "",
    country: "Oesterreich",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // NEW: Flexible Framework - send variant data with customizations
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        // NEW: Include variant and customization data
        variant_id: item.variant?.id,
        customization: item.customization || undefined,
      }));

      // Get primary occasion (from cart or occasion context)
      const primaryOccasion = cartOccasion || occasionContext;

      const orderData = {
        ...form,
        items: orderItems,
        // NEW: Include occasion if available
        ...(primaryOccasion && { occasion_id: primaryOccasion.id }),
        // NEW: Include customization summary
        customization_details: items.some(i => i.customization) ? {
          has_engraving: items.some(i => i.customization?.engraving_text),
          has_color_choice: items.some(i => i.customization?.box_color),
          has_design: items.some(i => i.customization?.selected_design),
        } : undefined,
      };

      const order = await createOrder(orderData);

      try {
        const checkout = await createCheckoutSession(order.id, orderItems);
        if (checkout.url) {
          clearCart();
          window.location.href = checkout.url;
          return;
        }
      } catch {
        // Stripe not configured - show order confirmation without payment
      }

      clearCart();
      navigate(`/bestellung/erfolg?order=${order.order_number}&pending=true`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/warenkorb");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-warm-600 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurueck
      </button>

      <h1 className="font-serif text-3xl text-warm-800 mb-8">Kasse</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-warm-200 p-6">
            <h2 className="font-serif text-xl text-warm-700 mb-4">
              Ihre Daten
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Vorname *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Nachname *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  E-Mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-warm-200 p-6">
            <h2 className="font-serif text-xl text-warm-700 mb-4">
              Lieferadresse
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Strasse und Hausnummer *
                </label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-warm-600 mb-1">
                    PLZ *
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={form.zip_code}
                    onChange={handleChange}
                    required
                    className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-600 mb-1">
                    Stadt *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-warm-200 p-6">
            <h2 className="font-serif text-xl text-warm-700 mb-4">
              Anmerkungen
            </h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Besondere Wuensche oder Anmerkungen..."
              className="w-full border border-warm-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              `Jetzt bestellen - ${formatPrice(totalPrice)}`
            )}
          </button>
        </form>

        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-warm-200 p-6 sticky top-24">
            <h2 className="font-serif text-lg text-warm-700 mb-4">
              Bestelluebersicht
            </h2>
            {/* NEW: Show selected occasion */}
            {(cartOccasion || occasionContext) && (
              <div className="mb-4 pb-4 border-b border-warm-100">
                <span className="text-xs text-warm-400 uppercase tracking-wide">Anlass</span>
                <div className="font-medium text-warm-700">
                  {(cartOccasion || occasionContext)?.name}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const itemPrice = item.variant?.calculated_price || item.product.price;
                return (
                  <div key={item.product.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-warm-600">
                        {item.quantity}x {item.variant?.name || item.product.name}
                      </span>
                      <span className="text-warm-800 font-medium">
                        {formatPrice(parseFloat(itemPrice) * item.quantity)}
                      </span>
                    </div>
                    {/* NEW: Show customization details */}
                    {item.customization && (
                      <div className="mt-1 text-xs text-warm-400 space-y-0.5">
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
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>Design: {item.customization.selected_design}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-warm-200 pt-3">
              <div className="flex justify-between">
                <span className="font-serif text-warm-700">Gesamt</span>
                <span className="font-serif text-xl text-primary-dark">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <span className="text-warm-400 text-xs">inkl. MwSt.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
