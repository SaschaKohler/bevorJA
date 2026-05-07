import { Star } from "lucide-react";
import type { CustomSection } from "@/types";

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

export default function SectionTestimonials({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; items?: Testimonial[] };
  const items = c.items || [];

  return (
    <section id={section.anchor} className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-elegant">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: Number(item.rating) || 5 }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-gold fill-gold" />
                ))}
              </div>
              <p className="text-slate leading-relaxed mb-6 italic">&ldquo;{item.text}&rdquo;</p>
              <p className="font-serif text-charcoal font-medium">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
