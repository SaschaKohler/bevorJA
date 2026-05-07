import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/store/cart";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-warm-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="text-rose w-6 h-6" />
          <span className="font-serif text-2xl text-primary-dark tracking-wide">
            Vorja
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-warm-700 hover:text-primary transition-colors"
          >
            Startseite
          </Link>
          <Link
            to="/produkte"
            className="text-warm-700 hover:text-primary transition-colors"
          >
            Produkte
          </Link>
        </nav>

        <Link
          to="/warenkorb"
          className="relative flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm font-medium">Warenkorb</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
