import { Star } from "lucide-react";
import type { CustomSection } from "@/types";

interface Testimonial {
  name: string;
  company?: string;
  text: string;
  rating?: number;
}

export default function SectionTestimonials({ section }: { section: CustomSection }) {
  const c = section.content as { title?: string; testimonials?: Testimonial[] };
  const items = c.testimonials || [];

  return (
    <section id={section.anchor} className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        {c.title && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.title}</h2>
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
              {item.company && <p className="text-sm text-slate-light">{item.company}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
