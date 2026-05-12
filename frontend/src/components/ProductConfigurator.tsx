import { useState, useEffect, useCallback } from "react";
import type { Occasion, BoxType, CardPackage, ProductVariant } from "@/types";
import { getConfiguratorData, getProductVariants } from "@/lib/api";
import { OccasionSelector } from "./OccasionSelector";
import { BoxTypeSelector } from "./BoxTypeSelector";
import { Loader2, Check, ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";

interface ProductConfiguratorProps {
  onAddToCart: (variant: ProductVariant, customization?: { engraving_text?: string; box_color?: string; selected_design?: string }) => void;
}

type Step = "occasion" | "box-type" | "cards" | "customize" | "summary";

export function ProductConfigurator({ onAddToCart }: ProductConfiguratorProps) {
  const [step, setStep] = useState<Step>("occasion");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([]);
  const [cardPackages, setCardPackages] = useState<CardPackage[]>([]);

  // Selections
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [selectedBoxType, setSelectedBoxType] = useState<BoxType | null>(null);
  const [selectedCardPackage, setSelectedCardPackage] = useState<CardPackage | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Customization
  const [engravingText, setEngravingText] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedDesign, setSelectedDesign] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getConfiguratorData();
        setOccasions(data.occasions);
        setBoxTypes(data.box_types);
        setCardPackages(data.card_packages);

        // Auto-select defaults
        const defaultOccasion = data.occasions.find(o => o.is_default);
        if (defaultOccasion) {
          setSelectedOccasion(defaultOccasion);
        }
      } catch (err) {
        setError("Konfigurationsdaten konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Load variant when all selections are made
  useEffect(() => {
    if (selectedOccasion && selectedBoxType && selectedCardPackage) {
      loadVariant();
    }
  }, [selectedOccasion, selectedBoxType, selectedCardPackage]);

  const loadVariant = useCallback(async () => {
    if (!selectedOccasion || !selectedBoxType || !selectedCardPackage) return;

    try {
      const variants = await getProductVariants({
        occasion: selectedOccasion.slug,
        box_type: selectedBoxType.slug,
        card_count: selectedCardPackage.card_count,
      });

      if (variants.length > 0) {
        // Get full variant details
        const { getProductVariant } = await import("@/lib/api");
        const fullVariant = await getProductVariant(variants[0].slug);
        setSelectedVariant(fullVariant);
      }
    } catch (err) {
      console.error("Failed to load variant:", err);
    }
  }, [selectedOccasion, selectedBoxType, selectedCardPackage]);

  const handleNext = () => {
    const steps: Step[] = ["occasion", "box-type", "cards", "customize", "summary"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["occasion", "box-type", "cards", "customize", "summary"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    onAddToCart(selectedVariant, {
      engraving_text: engravingText || undefined,
      box_color: selectedColor || undefined,
      selected_design: selectedDesign || undefined,
    });
  };

  const canProceed = () => {
    switch (step) {
      case "occasion":
        return !!selectedOccasion;
      case "box-type":
        return !!selectedBoxType;
      case "cards":
        return !!selectedCardPackage;
      case "customize":
        return true; // Customization is optional
      case "summary":
        return !!selectedVariant;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
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

  const stepsConfig = [
    { id: "occasion", label: "Anlass", number: 1 },
    { id: "box-type", label: "Box-Typ", number: 2 },
    { id: "cards", label: "Karten", number: 3 },
    { id: "customize", label: "Personalisierung", number: 4 },
    { id: "summary", label: "Zusammenfassung", number: 5 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {stepsConfig.map((s, i) => {
          const isActive = step === s.id;
          const isCompleted = stepsConfig.findIndex(x => x.id === step) > i;

          return (
            <div key={s.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${isActive ? "bg-gold text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}
              `}>
                {isCompleted ? <Check className="w-4 h-4" /> : s.number}
              </div>
              <span className={`
                ml-2 text-sm whitespace-nowrap hidden md:block
                ${isActive ? "text-charcoal font-medium" : "text-slate"}
              `}>
                {s.label}
              </span>
              {i < stepsConfig.length - 1 && (
                <div className="w-8 h-px bg-gray-200 mx-2 hidden md:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {step === "occasion" && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Wählen Sie den Anlass</h2>
            <p className="text-slate mb-6">Für welche Feier suchen Sie die perfekte Box?</p>
            <OccasionSelector
              occasions={occasions}
              selectedOccasion={selectedOccasion}
              onSelect={(o) => {
                setSelectedOccasion(o);
                setTimeout(handleNext, 200);
              }}
            />
          </div>
        )}

        {step === "box-type" && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Wählen Sie den Box-Typ</h2>
            <p className="text-slate mb-6">Audio-Aufnahmen oder klassische Erinnerungsbox?</p>
            <BoxTypeSelector
              boxTypes={boxTypes}
              selectedBoxType={selectedBoxType}
              onSelect={(b) => {
                setSelectedBoxType(b);
                setTimeout(handleNext, 200);
              }}
            />
          </div>
        )}

        {step === "cards" && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Wählen Sie die Kartenanzahl</h2>
            <p className="text-slate mb-6">Wie viele Gäste erwarten Sie?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cardPackages.map((pkg) => {
                const isSelected = selectedCardPackage?.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedCardPackage(pkg);
                      setTimeout(handleNext, 200);
                    }}
                    className={`
                      p-6 rounded-xl text-center transition-all border-2
                      ${isSelected
                        ? "border-gold bg-champagne/30"
                        : "border-gray-200 hover:border-gold/50"
                      }
                    `}
                  >
                    <div className="font-serif text-3xl text-charcoal mb-2">
                      {pkg.card_count}
                    </div>
                    <div className="text-slate text-sm mb-3">Karten</div>
                    <div className="font-serif text-xl text-gold">
                      +{parseFloat(pkg.price).toFixed(0)}€
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1 justify-center">
                      {pkg.available_designs.slice(0, 3).map((design) => (
                        <span key={design} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-slate capitalize">
                          {design}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "customize" && selectedVariant && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-2">Personalisieren Sie Ihre Box</h2>
            <p className="text-slate mb-6">Optional: Machen Sie Ihre Box einzigartig</p>

            <div className="space-y-6">
              {/* Engraving (only for wood boxes) */}
              {selectedVariant.customization_options?.engraving && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Gravur-Text (optional)
                  </label>
                  <input
                    type="text"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    placeholder="z.B. Max & Maria 2024"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    maxLength={30}
                  />
                  <p className="text-xs text-slate mt-1">Max. 30 Zeichen</p>
                </div>
              )}

              {/* Color selection (for wood boxes) */}
              {selectedVariant.customization_options?.color_choice && selectedVariant.customization_options.color_choice.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Holz-Farbe
                  </label>
                  <div className="flex gap-3">
                    {selectedVariant.customization_options.color_choice.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`
                          px-4 py-2 rounded-lg border-2 capitalize
                          ${selectedColor === color
                            ? "border-gold bg-champagne/30"
                            : "border-gray-200 hover:border-gold/50"
                          }
                        `}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Design selection */}
              {selectedVariant.customization_options?.occasion_designs && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Karten-Design
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.customization_options.occasion_designs.map((design) => (
                      <button
                        key={design}
                        onClick={() => setSelectedDesign(design)}
                        className={`
                          px-4 py-2 rounded-lg border-2 capitalize
                          ${selectedDesign === design
                            ? "border-gold bg-champagne/30"
                            : "border-gray-200 hover:border-gold/50"
                          }
                        `}
                      >
                        {design}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "summary" && selectedVariant && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-6">Ihre Konfiguration</h2>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate">Anlass</span>
                <span className="text-charcoal font-medium">{selectedOccasion?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Box-Typ</span>
                <span className="text-charcoal font-medium">{selectedBoxType?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Kartenpaket</span>
                <span className="text-charcoal font-medium">{selectedCardPackage?.name} ({selectedCardPackage?.card_count} Karten)</span>
              </div>

              {(engravingText || selectedColor || selectedDesign) && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <span className="text-slate block mb-2">Personalisierung:</span>
                    {engravingText && (
                      <div className="text-sm text-charcoal">Gravur: {engravingText}</div>
                    )}
                    {selectedColor && (
                      <div className="text-sm text-charcoal capitalize">Farbe: {selectedColor}</div>
                    )}
                    {selectedDesign && (
                      <div className="text-sm text-charcoal capitalize">Design: {selectedDesign}</div>
                    )}
                  </div>
                </>
              )}

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg text-charcoal">Gesamtpreis</span>
                <span className="font-serif text-3xl text-gold">
                  {parseFloat(selectedVariant.calculated_price).toFixed(2)}€
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full mt-6 btn-elegant flex items-center justify-center gap-2 text-lg py-4"
            >
              <ShoppingCart className="w-5 h-5" />
              In den Warenkorb
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== "summary" && (
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={step === "occasion"}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl transition-colors
              ${step === "occasion"
                ? "text-gray-300 cursor-not-allowed"
                : "text-slate hover:text-charcoal hover:bg-gray-100"
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Zurück
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl transition-all
              ${canProceed()
                ? "bg-gold text-white hover:bg-gold-dark shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Weiter
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
