import { Star } from "lucide-react";
import type { CustomSection } from "@/types";

interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export default function SectionFeaturesGrid({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; features?: Feature[] };
  const features = c.features || [];

  return (
    <section id={section.anchor} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className={`grid gap-8 ${features.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {features.map((f, i) => (
            <div key={i} className="card-gold-border text-center p-10 group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-champagne to-champagne-dark flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-gold-dark" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-4">{f.title}</h3>
              <p className="text-slate leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
