import { useState } from "react";
import { Send } from "lucide-react";
import type { CustomSection } from "@/types";

export default function SectionContact({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; description?: string; recipient_email?: string };
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id={section.anchor} className="py-24 bg-cream">
      <div className="max-w-2xl mx-auto px-4">
        {c.headline && (
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-charcoal mb-4">{c.headline}</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>
        )}
        {c.description && <p className="text-slate text-center mb-8">{c.description}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-elegant space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Name" required className="px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            <input type="email" placeholder="E-Mail" required className="px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <input type="text" placeholder="Betreff" className="w-full px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          <textarea placeholder="Nachricht" rows={5} required className="w-full px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          <button type="submit" className="btn-elegant flex items-center gap-2 w-full justify-center">
            <Send className="w-5 h-5" />
            {sent ? "Gesendet!" : "Nachricht senden"}
          </button>
        </form>
      </div>
    </section>
  );
}
