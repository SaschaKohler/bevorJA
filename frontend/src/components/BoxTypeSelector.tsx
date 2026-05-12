import { Volume2, Package } from "lucide-react";
import type { BoxType } from "@/types";

interface BoxTypeSelectorProps {
  selectedBoxType: BoxType | null;
  onSelect: (boxType: BoxType) => void;
  boxTypes?: BoxType[]; // Optional: pre-loaded box types
}

const boxTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  audio: Volume2,
  wood: Package,
  hybrid: Volume2,
};

const boxTypeLabels: Record<string, { title: string; subtitle: string }> = {
  audio: {
    title: "Hörbox",
    subtitle: "Mit Audio-Aufnahmen",
  },
  wood: {
    title: "Holzbox",
    subtitle: "Für Karten & Erinnerungen",
  },
  hybrid: {
    title: "Hybrid Box",
    subtitle: "Audio + Karten",
  },
};

export function BoxTypeSelector({ selectedBoxType, onSelect, boxTypes }: BoxTypeSelectorProps) {
  if (!boxTypes || boxTypes.length === 0) {
    return (
      <div className="text-center py-8 text-slate">
        Keine Box-Typen verfügbar
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {boxTypes.map((boxType) => {
        const Icon = boxTypeIcons[boxType.box_type] || Package;
        const labels = boxTypeLabels[boxType.box_type] || { title: boxType.name, subtitle: "" };
        const isSelected = selectedBoxType?.id === boxType.id;

        return (
          <button
            key={boxType.id}
            onClick={() => onSelect(boxType)}
            className={`
              relative p-6 rounded-xl text-left transition-all duration-300
              border-2 hover:shadow-lg flex items-center gap-4
              ${isSelected
                ? "border-gold bg-champagne/30 shadow-md"
                : "border-gray-200 bg-white hover:border-gold/50"
              }
            `}
          >
            <div className={`
              w-16 h-16 rounded-xl flex items-center justify-center
              ${isSelected ? "bg-gold/20" : "bg-gray-100"}
            `}>
              <Icon className={`w-8 h-8 ${isSelected ? "text-gold-dark" : "text-slate"}`} />
            </div>

            <div className="flex-1">
              <h3 className="font-serif text-xl text-charcoal mb-1">
                {labels.title}
              </h3>
              <p className="text-sm text-slate mb-2">
                {labels.subtitle}
              </p>
              <p className="text-xs text-warm-500">
                {boxType.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {boxType.features.slice(0, 3).map((feature, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-gray-100 rounded-full text-slate"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="font-serif text-2xl text-charcoal">
                {parseFloat(boxType.base_price).toFixed(0)}€
              </span>
              <span className="text-sm text-slate">/Basis</span>
            </div>

            {isSelected && (
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gold" />
            )}
          </button>
        );
      })}
    </div>
  );
}
