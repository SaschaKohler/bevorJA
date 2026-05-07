import { Link } from "react-router-dom";
import { ShoppingCart, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 bg-gradient-to-br from-warm-100 to-warm-200 flex items-center justify-center">
        <Sparkles className="w-16 h-16 text-gold opacity-40 group-hover:opacity-70 transition-opacity" />
        <div className="absolute top-3 right-3 bg-secondary text-white text-xs px-3 py-1 rounded-full font-medium">
          {product.card_count} Karten
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl text-warm-800 mb-2">{product.name}</h3>
        <p className="text-warm-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <ul className="space-y-1 mb-4">
          {product.features.slice(0, 3).map((feature) => (
            <li key={feature} className="text-warm-500 text-xs flex items-center gap-1">
              <span className="text-gold">&#10003;</span> {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-4 border-t border-warm-100">
          <span className="font-serif text-2xl text-primary-dark">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            <Link
              to={`/produkte/${product.slug}`}
              className="text-sm text-primary hover:text-primary-dark underline underline-offset-2"
            >
              Details
            </Link>
            <button
              onClick={() => addItem(product)}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary-dark transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Hinzufuegen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
