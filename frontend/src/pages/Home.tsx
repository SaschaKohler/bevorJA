import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Music, Gift, Star, ArrowRight, Sparkles } from "lucide-react";
import type { Product, HomeContent, CustomSection } from "@/types";
import { getProducts, getHomeContent, getSections } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { FloralOrnament, OrnamentDivider, CornerOrnament } from "@/components/Ornaments";
import { DynamicSection } from "@/components/sections";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<HomeContent | null>(null);
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getHomeContent(),
      getSections().catch(() => []),
    ])
      .then(([productsData, contentData, sectionsData]) => {
        setProducts(productsData);
        setContent(contentData);
        setSections(sectionsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heroContent = content?.sections?.hero || {};
  const ctaContent = content?.sections?.cta || {};

  return (
    <div className="bg-wedding-pattern">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-champagne-light via-cream to-cream py-28 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float opacity-40">
          <FloralOrnament size={60} />
        </div>
        <div className="absolute bottom-32 right-16 animate-float-delayed opacity-30">
          <FloralOrnament size={80} />
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <CornerOrnament position="top-right" />
        </div>
        <div className="absolute bottom-40 left-16 opacity-20">
          <CornerOrnament position="bottom-left" />
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-rose-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="relative">
                <Heart className="w-16 h-16 text-rose-gold" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gold animate-glow-pulse" />
              </div>
            </div>
            
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <OrnamentDivider />
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl text-charcoal mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {heroContent.title?.content || "Unvergessliche Wünsche"}
              <br />
              <span className="text-gold-gradient italic">
                {heroContent.subtitle?.content || "für Ihren großen Tag"}
              </span>
            </h1>
            
            <p className="text-slate text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {heroContent.description?.content || "Mit Vorja bewahren Sie die herzlichsten Grüße und Wünsche Ihrer Hochzeitsgäste in einer wunderschönen Audio- und Kartenbox für die Ewigkeit auf."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/produkte"
                className="btn-elegant inline-flex items-center gap-2 justify-center text-lg"
              >
                {heroContent.button_text?.content || "Jetzt entdecken"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <FloralOrnament size={48} className="mx-auto mb-6 opacity-60" />
            <h2 className="font-display text-4xl text-charcoal mb-4">
              {content?.sections?.features?.section_title?.content || "Warum Vorja?"}
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(content?.hero_features || [
              { icon: "Music", title: "Audio-Aufnahmen", description: "Gäste hinterlassen persönliche Sprachnachrichten, die Sie immer wieder anhören können." },
              { icon: "Gift", title: "Elegantes Design", description: "Hochwertige Verarbeitung mit wunderschönem Hochzeitsdesign, das perfekt zu Ihrem Fest passt." },
              { icon: "Star", title: "Erinnerung für immer", description: "Bewahren Sie die schönsten Momente und Wünsche Ihrer Gäste für die Ewigkeit auf." },
            ]).map((feature) => {
              const IconComponent = feature.icon === "Music" ? Music : feature.icon === "Gift" ? Gift : Star;
              return (
                <div
                  key={feature.title}
                  className="card-gold-border text-center p-10 group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-champagne to-champagne-dark flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-gold/20 transition-shadow">
                    <IconComponent className="w-10 h-10 text-gold-dark" />
                  </div>
                  <h3 className="font-serif text-2xl text-charcoal mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {sections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}

      {/* Products Section */}
      <section className="py-24 bg-cream relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">
              {content?.sections?.products?.section_title?.content || "Unsere Boxen"}
            </h2>
            <p className="text-slate text-lg max-w-2xl mx-auto">
              {content?.sections?.products?.section_description?.content || "Wählen Sie die perfekte Größe für Ihre Feier"}
            </p>
            <div className="mt-6">
              <OrnamentDivider />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-slate py-12">Laden...</div>
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
      <section className="py-24 bg-gradient-to-br from-charcoal via-charcoal-light to-slate relative overflow-hidden">
        <div className="absolute top-0 left-0 opacity-20">
          <CornerOrnament position="top-left" className="w-20 h-20" />
        </div>
        <div className="absolute top-0 right-0 opacity-20">
          <CornerOrnament position="top-right" className="w-20 h-20" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-20">
          <CornerOrnament position="bottom-left" className="w-20 h-20" />
        </div>
        <div className="absolute bottom-0 right-0 opacity-20">
          <CornerOrnament position="bottom-right" className="w-20 h-20" />
        </div>
        
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <FloralOrnament size={56} className="mx-auto mb-8 text-gold opacity-80" />
          
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            {ctaContent.cta_title?.content || "Bereit für unvergessliche Erinnerungen?"}
          </h2>
          
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8" />
          
          <p className="text-champagne text-lg mb-10 leading-relaxed">
            {ctaContent.cta_description?.content || "Bestellen Sie jetzt Ihre Vorja-Box und machen Sie Ihre Hochzeit noch unvergesslicher."}
          </p>
          
          <Link
            to="/produkte"
            className="inline-flex items-center gap-3 bg-white text-charcoal px-10 py-4 rounded-full text-lg font-medium hover:bg-champagne transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {ctaContent.cta_button?.content || "Alle Produkte ansehen"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
