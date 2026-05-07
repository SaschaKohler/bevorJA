import { useState } from "react";
import { X } from "lucide-react";
import type { CustomSection } from "@/types";

export default function SectionGallery({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; caption?: string };
  const images = section.images || [];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <section id={section.anchor} className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setLightboxIdx(i)} className="overflow-hidden rounded-xl group">
              <img
                src={img.image_url || img.image}
                alt={img.alt_text || ""}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
        {c.caption && <p className="text-center text-slate mt-6">{c.caption}</p>}
      </div>
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gold"><X className="w-8 h-8" /></button>
          <img
            src={images[lightboxIdx].image_url || images[lightboxIdx].image}
            alt={images[lightboxIdx].alt_text || ""}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
