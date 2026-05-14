import { ArrowRight } from "lucide-react";
import type { CustomSection } from "@/types";

export default function SectionTextImage({ section }: { section: CustomSection }) {
  const c = section.content as Record<string, string>;
  const isLeft = section.template_type === "text_image_left";
  const img = section.images?.[0];

  return (
    <section id={section.anchor} className="py-24 bg-white">
      <div className={`max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center ${isLeft ? "" : "direction-rtl"}`}>
        <div className={isLeft ? "order-2 md:order-1" : "order-2"}>
          {img ? (
            <img src={img.image_url || img.image} alt={img.alt_text || ""} className="w-full rounded-2xl shadow-elegant" />
          ) : (
            <div className="w-full h-80 bg-cream rounded-2xl flex items-center justify-center text-slate">Bild</div>
          )}
        </div>
        <div className={`${isLeft ? "order-1 md:order-2" : "order-1"} text-left`} style={{ direction: "ltr" }}>
          {c.title && <h2 className="font-display text-4xl text-charcoal mb-6">{c.title}</h2>}
          {c.text && <p className="text-slate text-lg leading-relaxed mb-8">{c.text}</p>}
          {c.cta_text && c.cta_link && (
            <a href={c.cta_link} className="btn-elegant inline-flex items-center gap-2">
              {c.cta_text}
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
