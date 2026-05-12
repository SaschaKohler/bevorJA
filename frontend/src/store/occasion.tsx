import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Occasion, OccasionContent, OccasionDetail } from "@/types";
import { getOccasion } from "@/lib/api";

interface OccasionContextType {
  // Selected occasion
  selectedOccasion: Occasion | null;
  setSelectedOccasion: (occasion: Occasion) => void;
  clearSelectedOccasion: () => void;

  // Occasion content
  occasionContent: Record<string, string> | null;
  occasionContentLoading: boolean;

  // Available occasions
  availableOccasions: Occasion[];
  setAvailableOccasions: (occasions: Occasion[]) => void;

  // Default occasion
  defaultOccasion: Occasion | null;

  // Helpers
  getContent: (key: string, fallback?: string) => string;
  loadOccasionContent: (slug: string) => Promise<void>;
}

const STORAGE_KEY = "vorja-selected-occasion";

const OccasionContext = createContext<OccasionContextType | null>(null);

export function OccasionProvider({ children }: { children: ReactNode }) {
  const [selectedOccasion, setSelectedOccasionState] = useState<Occasion | null>(null);
  const [occasionContent, setOccasionContent] = useState<Record<string, string> | null>(null);
  const [occasionContentLoading, setOccasionContentLoading] = useState(false);
  const [availableOccasions, setAvailableOccasions] = useState<Occasion[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedOccasionState(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Set default occasion when available occasions load
  useEffect(() => {
    if (availableOccasions.length > 0 && !selectedOccasion) {
      const defaultOcc = availableOccasions.find(o => o.is_default) || availableOccasions[0];
      if (defaultOcc) {
        setSelectedOccasion(defaultOcc);
      }
    }
  }, [availableOccasions, selectedOccasion]);

  const setSelectedOccasion = useCallback((occasion: Occasion) => {
    setSelectedOccasionState(occasion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(occasion));
    // Clear old content when switching occasions
    setOccasionContent(null);
  }, []);

  const clearSelectedOccasion = useCallback(() => {
    setSelectedOccasionState(null);
    setOccasionContent(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loadOccasionContent = useCallback(async (slug: string) => {
    setOccasionContentLoading(true);
    try {
      const detail: OccasionDetail = await getOccasion(slug);
      // Convert content array to record for easy lookup
      const contentRecord: Record<string, string> = {};
      detail.contents?.forEach((item: OccasionContent) => {
        contentRecord[item.key] = item.content;
      });
      setOccasionContent(contentRecord);
    } catch (error) {
      console.error("Failed to load occasion content:", error);
      setOccasionContent(null);
    } finally {
      setOccasionContentLoading(false);
    }
  }, []);

  // Load content when selected occasion changes
  useEffect(() => {
    if (selectedOccasion?.slug) {
      loadOccasionContent(selectedOccasion.slug);
    }
  }, [selectedOccasion, loadOccasionContent]);

  const getContent = useCallback((key: string, fallback = ""): string => {
    return occasionContent?.[key] || fallback;
  }, [occasionContent]);

  const defaultOccasion = availableOccasions.find(o => o.is_default) || availableOccasions[0] || null;

  return (
    <OccasionContext value={{
      selectedOccasion,
      setSelectedOccasion,
      clearSelectedOccasion,
      occasionContent,
      occasionContentLoading,
      availableOccasions,
      setAvailableOccasions,
      defaultOccasion,
      getContent,
      loadOccasionContent,
    }}>
      {children}
    </OccasionContext>
  );
}

export function useOccasion() {
  const context = useContext(OccasionContext);
  if (!context) {
    throw new Error("useOccasion must be used within an OccasionProvider");
  }
  return context;
}
