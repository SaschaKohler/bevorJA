import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CustomSection } from "@/types";

interface FAQItem {
  question: string;
  answer: string;
}

export default function SectionFAQ({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; items?: FAQItem[] };
  const items = c.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id={section.anchor} className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="bg-cream rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-serif text-lg text-charcoal">{item.question}</span>
                <ChevronDown className={`w-5 h-5 text-gold-dark transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-6 text-slate leading-relaxed">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
