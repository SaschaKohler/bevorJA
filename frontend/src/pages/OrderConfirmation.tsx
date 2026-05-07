import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Heart } from "lucide-react";
import type { Order } from "@/types";
import { getOrder } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const isDemo = searchParams.get("demo") === "true";
  const orderNumber = searchParams.get("order");

  useEffect(() => {
    if (orderNumber) {
      getOrder(orderNumber).then(setOrder).catch(console.error);
    }
  }, [orderNumber]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="font-serif text-4xl text-warm-800 mb-4">
        Vielen Dank fuer Ihre Bestellung!
      </h1>

      {isDemo ? (
        <div className="bg-warm-100 rounded-xl p-6 mb-8">
          <p className="text-warm-700 mb-2">
            <strong>Demo-Modus:</strong> Stripe ist noch nicht konfiguriert.
          </p>
          <p className="text-warm-600 text-sm">
            Ihre Bestellung wurde erstellt. Sobald Stripe eingerichtet ist,
            werden Zahlungen verarbeitet.
          </p>
        </div>
      ) : (
        <p className="text-warm-600 text-lg mb-8">
          Ihre Bestellung wurde erfolgreich aufgegeben. Sie erhalten in
          Kuerze eine Bestaetigungs-E-Mail.
        </p>
      )}

      {order && (
        <div className="bg-white rounded-xl border border-warm-200 p-6 text-left mb-8">
          <h2 className="font-serif text-lg text-warm-700 mb-4">
            Bestelldetails
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-500">Bestellnummer</span>
              <span className="text-warm-800 font-mono text-xs">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-500">Name</span>
              <span className="text-warm-800">
                {order.first_name} {order.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-500">Gesamtsumme</span>
              <span className="font-serif text-primary-dark text-lg">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-warm-400 mb-8">
        <Heart className="w-4 h-4 text-rose" />
        <span className="text-sm">
          Wir wuenschen Ihnen eine wunderschoene Hochzeit!
        </span>
      </div>

      <Link
        to="/"
        className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors"
      >
        Zurueck zur Startseite
      </Link>
    </div>
  );
}
