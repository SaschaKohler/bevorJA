import { useState } from "react";
import { Package, Search, Loader2, CheckCircle2, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { orderLookup } from "@/lib/api";
import type { Order } from "@/types";

export default function OrderLookupPage() {
  const [email, setEmail] = useState(() => localStorage.getItem("buyer_email") || "");
  const [orderNumber, setOrderNumber] = useState(() => localStorage.getItem("buyer_order_number") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const result = await orderLookup({ email, order_number: orderNumber });
      setOrder(result);
      localStorage.setItem("buyer_email", email);
      localStorage.setItem("buyer_order_number", orderNumber);
    } catch {
      setError("Bestellung nicht gefunden. Bitte überprüfen Sie E-Mail und Bestellnummer.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setOrder(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-charcoal hover:text-gold-dark transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-display text-xl">Vorja</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl text-charcoal mb-2">Meine Bestellung</h1>
          <p className="text-slate">Suchen Sie Ihre Bestellung mit E-Mail und Bestellnummer</p>
        </div>

        {!order ? (
          <div className="bg-white rounded-2xl p-8 shadow-elegant">
            <form onSubmit={handleLookup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">E-Mail Adresse</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.at"
                  required
                  className="w-full px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Bestellnummer</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="z.B. a1b2c3d4-e5f6-..."
                  required
                  className="w-full px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <p className="text-xs text-slate-light mt-2">
                  Die Bestellnummer finden Sie in Ihrer Bestellbestätigung
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-elegant flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Suchen...</>
                ) : (
                  <><Search className="w-5 h-5" />Bestellung suchen</>
                )}
              </button>
            </form>
          </div>
        ) : (
          <OrderDetails order={order} onNewSearch={handleNewSearch} />
        )}
      </main>
    </div>
  );
}

function OrderDetails({ order, onNewSearch }: { order: Order; onNewSearch: () => void }) {
  const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    paid: "Bezahlt",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    delivered: "Zugestellt",
    cancelled: "Storniert",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" />
        Bestellung gefunden!
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-elegant space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gold/10">
          <h2 className="font-display text-xl text-charcoal">Bestelldetails</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm text-slate">Bestellnummer</span>
            <p className="text-charcoal font-mono text-sm mt-1">{order.order_number}</p>
          </div>
          <div>
            <span className="text-sm text-slate">Datum</span>
            <p className="text-charcoal mt-1">{new Date(order.created_at).toLocaleDateString("de-AT")}</p>
          </div>
          <div>
            <span className="text-sm text-slate">Name</span>
            <p className="text-charcoal mt-1">{order.first_name} {order.last_name}</p>
          </div>
          <div>
            <span className="text-sm text-slate">E-Mail</span>
            <p className="text-charcoal mt-1">{order.email}</p>
          </div>
          <div className="md:col-span-2">
            <span className="text-sm text-slate">Lieferadresse</span>
            <p className="text-charcoal mt-1">
              {order.street}<br />
              {order.zip_code} {order.city}<br />
              {order.country}
            </p>
          </div>
        </div>

        {order.customization_details && (
          <div className="border-t border-gold/10 pt-4">
            <h3 className="font-serif text-charcoal mb-3">Personalisierung</h3>
            <div className="bg-cream/50 rounded-lg p-4 space-y-2 text-sm">
              {order.customization_details.engraving && (
                <div className="flex justify-between">
                  <span className="text-slate">Gravur:</span>
                  <span className="text-charcoal">{order.customization_details.engraving}</span>
                </div>
              )}
              {order.customization_details.box_color && (
                <div className="flex justify-between">
                  <span className="text-slate">Box-Farbe:</span>
                  <span className="text-charcoal">{order.customization_details.box_color}</span>
                </div>
              )}
              {order.customization_details.selected_design && (
                <div className="flex justify-between">
                  <span className="text-slate">Design:</span>
                  <span className="text-charcoal">{order.customization_details.selected_design}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gold/10 pt-4">
          <h3 className="font-serif text-charcoal mb-4">Produkte</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gold/5 last:border-0">
                <div>
                  <p className="text-charcoal font-medium">{item.product_detail.name}</p>
                  <p className="text-slate text-sm">Menge: {item.quantity}</p>
                </div>
                <span className="text-charcoal font-medium">€{item.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gold/20">
            <span className="font-serif text-lg text-charcoal">Gesamt</span>
            <span className="font-display text-2xl text-gold-dark">€{order.total}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNewSearch}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gold/20 text-slate rounded-lg hover:bg-cream transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Neue Suche
      </button>
    </div>
  );
}
