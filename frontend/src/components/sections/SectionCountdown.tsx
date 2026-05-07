import { useState, useEffect } from "react";
import type { CustomSection } from "@/types";

export default function SectionCountdown({ section }: { section: CustomSection }) {
  const c = section.content as { headline?: string; target_date?: string; description?: string };
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!c.target_date) return;
    const target = new Date(c.target_date).getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [c.target_date]);

  return (
    <section id={section.anchor} className="py-24 bg-gradient-to-br from-charcoal via-charcoal-light to-slate">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {c.headline && <h2 className="font-display text-4xl text-white mb-8">{c.headline}</h2>}
        <div className="flex justify-center gap-6 mb-8">
          {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
            <div key={unit} className="bg-white/10 backdrop-blur rounded-xl px-6 py-4 min-w-[80px]">
              <div className="font-display text-4xl text-gold">{timeLeft[unit]}</div>
              <div className="text-champagne text-sm mt-1">
                {unit === "days" ? "Tage" : unit === "hours" ? "Stunden" : unit === "minutes" ? "Minuten" : "Sekunden"}
              </div>
            </div>
          ))}
        </div>
        {c.description && <p className="text-champagne text-lg">{c.description}</p>}
      </div>
    </section>
  );
}
