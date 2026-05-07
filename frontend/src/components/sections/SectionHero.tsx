import { ArrowRight } from "lucide-react";
import type { CustomSection } from "@/types";

export default function SectionHero({ section }: { section: CustomSection }) {
  const c = section.content as Record<string, string>;
  return (
    <section id={section.anchor} className="relative py-28 bg-gradient-to-b from-champagne-light via-cream to-cream overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {c.headline && (
          <h2 className="font-display text-5xl md:text-7xl text-charcoal mb-6">{c.headline}</h2>
        )}
        {c.subtitle && (
          <p className="text-gold-gradient font-display text-3xl italic mb-6">{c.subtitle}</p>
        )}
        {c.description && (
          <p className="text-slate text-lg md:text-xl mb-12 max-w-2xl mx-auto">{c.description}</p>
        )}
        {c.button_text && c.button_url && (
          <a href={c.button_url} className="btn-elegant inline-flex items-center gap-2 text-lg">
            {c.button_text}
            <ArrowRight className="w-5 h-5" />
          </a>
        )}
      </div>
      {section.images?.[0] && (
        <div className="absolute inset-0 -z-10 opacity-20">
          <img src={section.images[0].image_url || section.images[0].image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </section>
  );
}
