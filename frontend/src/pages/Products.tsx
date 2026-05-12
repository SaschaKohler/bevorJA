import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { OccasionSelector } from "@/components/OccasionSelector";
import { useCart } from "@/store/cart";
import { useOccasion } from "@/store/occasion";
import type { ProductVariant } from "@/types";
import { Sparkles, Heart, Gift } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const { addVariant } = useCart();
  const { selectedOccasion, setSelectedOccasion, getContent } = useOccasion();
  const [showConfigurator, setShowConfigurator] = useState(false);

  const handleAddToCart = (variant: ProductVariant, customization?: { engraving_text?: string; box_color?: string; selected_design?: string }) => {
    addVariant(variant, customization);
    navigate("/warenkorb");
  };

  const handleOccasionSelect = (occasion: ReturnType<typeof useOccasion>['selectedOccasion']) => {
    if (occasion) {
      setSelectedOccasion(occasion);
      setShowConfigurator(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-champagne/30 to-cream py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-gold" />
            <Heart className="w-6 h-6 text-gold" />
            <Gift className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">
            {getContent("hero_title", "Persoenliche Erinnerungen")}
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto leading-relaxed">
            {getContent("hero_subtitle", "Entdecken Sie unsere handgefertigten Boxen fuer jeden besonderen Anlass. Von Geburtstagen bis Hochzeiten - wir machen Ihre Momente unvergesslich.")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {!showConfigurator ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl text-charcoal mb-4">
                Waehlen Sie Ihren Anlass
              </h2>
              <p className="text-slate max-w-xl mx-auto">
                Fuer welche Feier moechten Sie die perfekte Erinnerungsbox erstellen?
                Wir passen Design und Inhalt automatisch an.
              </p>
            </div>

            <OccasionSelector
              selectedOccasion={selectedOccasion}
              onSelect={handleOccasionSelect}
            />

            {selectedOccasion && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setShowConfigurator(true)}
                  className="btn-elegant text-lg px-8 py-4"
                >
                  Weiter zur Konfiguration
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl text-charcoal">
                  Konfigurieren Sie Ihre Box
                </h2>
                {selectedOccasion && (
                  <p className="text-slate mt-2">
                    Anlass: <span className="text-charcoal font-medium">{selectedOccasion.name}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowConfigurator(false);
                }}
                className="text-slate hover:text-charcoal transition-colors"
              >
                Anlass aendern
              </button>
            </div>

            <ProductConfigurator onAddToCart={handleAddToCart} />
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-charcoal mb-4">
              Warum unsere Boxen besonders sind
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-champagne/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">Handgefertigt</h3>
              <p className="text-slate">Jede Box wird mit Liebe und Sorgfalt in Deutschland gefertigt.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-champagne/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">Personalisiert</h3>
              <p className="text-slate">Waehlen Sie aus verschiedenen Designs, Farben und Gravuren.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-champagne/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">Fuer jeden Anlass</h3>
              <p className="text-slate">Von Geburtstag bis Trauerfeier - wir haben die passende Box.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
