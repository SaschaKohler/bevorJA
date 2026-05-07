import { Check } from "lucide-react";
import type { CustomSection } from "@/types";

interface PricingTier {
  name: string;
  price: string;
  features?: string[];
  cta?: string;
}

export default function SectionPricing({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; tiers?: PricingTier[] };
  const tiers = c.tiers || [];

  return (
    <section id={section.anchor} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className={`grid gap-8 ${tiers.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {tiers.map((tier, i) => (
            <div key={i} className="card-gold-border p-8 text-center">
              <h3 className="font-serif text-2xl text-charcoal mb-2">{tier.name}</h3>
              <div className="font-display text-4xl text-gold-dark mb-6">{tier.price}</div>
              {tier.features && tier.features.length > 0 && (
                <ul className="space-y-3 mb-8 text-left">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate">
                      <Check className="w-4 h-4 text-gold flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {tier.cta && (
                <button className="btn-elegant w-full">{tier.cta}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
