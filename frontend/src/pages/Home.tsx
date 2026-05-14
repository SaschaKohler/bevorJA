import { useEffect, useState } from "react";
import type { HomeContent } from "@/types";
import { getHomeContent } from "@/lib/api";
import { DynamicSection } from "@/components/sections";

export default function Home() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeContent()
      .then((data) => setContent(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sections = content?.sections || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wedding-pattern">
      {/* Render all sections from the page */}
      {sections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}

      {/* Fallback if no sections */}
      {sections.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-slate">Keine Sections vorhanden.</p>
          <p className="text-slate-light text-sm mt-2">
            Erstellen Sie im Admin-Bereich Sections für die Startseite.
          </p>
        </div>
      )}
    </div>
  );
}
