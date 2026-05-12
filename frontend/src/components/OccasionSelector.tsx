import { useEffect, useState } from "react";
import type { Occasion } from "@/types";
import { getOccasions } from "@/lib/api";
import { Gift, Heart, Baby, Cross, HeartHandshake, Sunset, Flower2, Award } from "lucide-react";

interface OccasionSelectorProps {
  selectedOccasion: Occasion | null;
  onSelect: (occasion: Occasion) => void;
  occasions?: Occasion[]; // Optional: pre-loaded occasions
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Gift,
  Heart,
  Baby,
  Cross,
  HeartHandshake,
  Sunset,
  Flower2,
  Award,
};

export function OccasionSelector({ selectedOccasion, onSelect, occasions: preloadedOccasions }: OccasionSelectorProps) {
  const [occasions, setOccasions] = useState<Occasion[]>(preloadedOccasions || []);
  const [loading, setLoading] = useState(!preloadedOccasions);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preloadedOccasions) return;

    async function loadOccasions() {
      try {
        const data = await getOccasions();
        setOccasions(data);
      } catch (err) {
        setError("Anlässe konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }

    loadOccasions();
  }, [preloadedOccasions]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {occasions.map((occasion) => {
        const Icon = iconMap[occasion.icon] || Gift;
        const isSelected = selectedOccasion?.id === occasion.id;

        return (
          <button
            key={occasion.id}
            onClick={() => onSelect(occasion)}
            className={`
              relative p-6 rounded-xl text-center transition-all duration-300
              border-2 hover:shadow-lg
              ${isSelected
                ? "border-gold bg-champagne/30 shadow-md"
                : "border-gray-200 bg-white hover:border-gold/50"
              }
            `}
            style={{
              backgroundColor: isSelected ? `${occasion.color_primary}15` : undefined,
              borderColor: isSelected ? occasion.color_primary : undefined,
            }}
          >
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${occasion.color_primary}20` }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: occasion.color_primary }}
              />
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-1">
              {occasion.name}
            </h3>
            <p className="text-sm text-slate">
              {occasion.description}
            </p>
            {isSelected && (
              <div
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: occasion.color_primary }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
