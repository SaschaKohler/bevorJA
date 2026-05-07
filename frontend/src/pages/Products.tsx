import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl text-warm-800 mb-4">Unsere Produkte</h1>
        <p className="text-warm-600 max-w-2xl mx-auto">
          Entdecken Sie unsere handgefertigten Audio- und Kartenboxen fuer
          Ihre Hochzeit. Jede Box ist ein Unikat.
        </p>
      </div>

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
  );
}
