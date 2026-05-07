import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Music, Gift, Star, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-warm-100 via-warm-50 to-rose-light py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-rose rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Heart className="w-12 h-12 text-rose" />
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-warm-900 mb-6 leading-tight">
              Unvergessliche Wuensche
              <br />
              <span className="text-primary">fuer Ihren grossen Tag</span>
            </h1>
            <p className="text-warm-600 text-lg md:text-xl mb-10 leading-relaxed">
              Mit Vorja bewahren Sie die herzlichsten Gruesse und Wuensche
              Ihrer Hochzeitsgaeste in einer wunderschoenen Audio- und Kartenbox
              fuer die Ewigkeit auf.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/produkte"
                className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-primary-dark transition-colors inline-flex items-center gap-2 justify-center"
              >
                Jetzt entdecken
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-3xl text-center text-warm-800 mb-12">
            Warum Vorja?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Music,
                title: "Audio-Aufnahmen",
                desc: "Gaeste hinterlassen persoenliche Sprachnachrichten, die Sie immer wieder anhoeren koennen.",
              },
              {
                icon: Gift,
                title: "Elegantes Design",
                desc: "Hochwertige Verarbeitung mit wunderschoenem Hochzeitsdesign, das perfekt zu Ihrem Fest passt.",
              },
              {
                icon: Star,
                title: "Erinnerung fuer immer",
                desc: "Bewahren Sie die schoensten Momente und Wuensche Ihrer Gaeste fuer die Ewigkeit auf.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-2xl bg-warm-50 border border-warm-100"
              >
                <div className="bg-warm-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-warm-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-warm-600 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-3xl text-center text-warm-800 mb-4">
            Unsere Boxen
          </h2>
          <p className="text-center text-warm-600 mb-12 max-w-2xl mx-auto">
            Waehlen Sie die perfekte Groesse fuer Ihre Feier
          </p>

          {loading ? (
            <div className="text-center text-warm-500 py-12">Laden...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl mb-6">
            Bereit fuer unvergessliche Erinnerungen?
          </h2>
          <p className="text-warm-200 mb-8 text-lg">
            Bestellen Sie jetzt Ihre Vorja-Box und machen Sie Ihre Hochzeit
            noch unvergesslicher.
          </p>
          <Link
            to="/produkte"
            className="bg-white text-primary px-8 py-4 rounded-full text-lg font-medium hover:bg-warm-100 transition-colors inline-flex items-center gap-2"
          >
            Alle Produkte ansehen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
