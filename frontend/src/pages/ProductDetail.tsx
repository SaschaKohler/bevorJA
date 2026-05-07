import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Check } from "lucide-react";
import type { Product } from "@/types";
import { getProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (slug) {
      getProduct(slug)
        .then(setProduct)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-warm-500">
        Laden...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-warm-600 mb-4">Produkt nicht gefunden.</p>
        <Link to="/produkte" className="text-primary hover:underline">
          Zurueck zu den Produkten
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link
        to="/produkte"
        className="inline-flex items-center gap-1 text-warm-600 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Alle Produkte
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-gradient-to-br from-warm-100 to-warm-200 rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 text-gold opacity-50">&#10022;</div>
            <span className="text-warm-500 text-sm">{product.name}</span>
          </div>
        </div>

        <div>
          <div className="bg-secondary/10 text-secondary-light inline-block px-3 py-1 rounded-full text-sm mb-4">
            <span className="text-warm-700 font-medium">{product.card_count} Karten</span>
          </div>
          <h1 className="font-serif text-4xl text-warm-800 mb-4">{product.name}</h1>
          <p className="text-warm-600 text-lg mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-8">
            <h3 className="font-serif text-lg text-warm-700 mb-3">
              Was ist enthalten:
            </h3>
            <ul className="space-y-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-warm-600">
                  <Check className="w-4 h-4 text-gold flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-warm-200 pt-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-warm-500 text-sm">Preis</span>
                <div className="font-serif text-4xl text-primary-dark">
                  {formatPrice(product.price)}
                </div>
              </div>
              <span className="text-warm-400 text-sm">inkl. MwSt.</span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-full text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Hinzugefuegt!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  In den Warenkorb
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
