import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, Sparkles, Package, Lock } from "lucide-react";
import { useCart } from "@/store/cart";
import { getSections } from "@/lib/api";
import type { CustomSection } from "@/types";

export default function Header() {
  const { totalItems } = useCart();
  const [sections, setSections] = useState<CustomSection[]>([]);
  const location = useLocation();

  useEffect(() => {
    getSections()
      .then((data) => setSections(data.filter((s) => s.is_active)))
      .catch(() => {});
  }, []);

  const handleAnchorClick = (anchor: string) => {
    if (location.pathname !== "/") {
      window.location.href = `/#${anchor}`;
      return;
    }
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gold/10 sticky top-0 z-50 shadow-elegant">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Heart className="text-rose-gold w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-3xl text-charcoal tracking-wide">
            Vorja
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link
            to="/"
            className="text-slate hover:text-gold-dark transition-colors font-medium tracking-wide text-sm uppercase"
          >
            Startseite
          </Link>
          <Link
            to="/produkte"
            className="text-slate hover:text-gold-dark transition-colors font-medium tracking-wide text-sm uppercase"
          >
            Produkte
          </Link>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleAnchorClick(section.anchor)}
              className="text-slate hover:text-gold-dark transition-colors font-medium tracking-wide text-sm uppercase"
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/bestellung/suchen"
            className="hidden sm:flex items-center gap-1.5 text-slate hover:text-gold-dark transition-colors"
          >
            <Package className="w-4 h-4" />
            <span className="text-sm">Bestellung</span>
          </Link>

          <Link
            to="/admin"
            className="text-slate hover:text-gold-dark transition-colors"
            title="Admin"
          >
            <Lock className="w-4 h-4" />
          </Link>

          <Link
            to="/warenkorb"
            className="relative flex items-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-medium">Warenkorb</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
