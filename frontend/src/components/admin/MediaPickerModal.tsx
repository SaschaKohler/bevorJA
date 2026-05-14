import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X, Search, ChevronLeft, ChevronRight,
  Loader2, Image as ImageIcon, AlertCircle,
} from "lucide-react";

interface AdminMedia {
  id: number;
  file: string;
  file_url: string;
  title: string;
  alt_text: string;
}

interface MediaPage {
  results: AdminMedia[];
  count: number;
}

const PAGE_SIZE = 20;

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
});

interface MediaPickerModalProps {
  onSelect: (media: AdminMedia) => void;
  onClose: () => void;
}

export default function MediaPickerModal({ onSelect, onClose }: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<MediaPage>({
    queryKey: ["admin", "media", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/media/?${params}`, { headers: authHeader() });
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    },
  });

  const items = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="font-display text-lg text-charcoal">Bild aus Mediathek wählen</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal p-1 rounded-lg hover:bg-gold/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
            <input
              type="search"
              placeholder="Suche nach Titel oder Alt-Text…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-charcoal-light">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Wird geladen…</span>
            </div>
          ) : isError ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Mediathek konnte nicht geladen werden.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-charcoal-light">
              <ImageIcon className="w-12 h-12 text-charcoal-light mb-3" />
              <p className="text-sm font-medium">Keine Bilder gefunden</p>
              {search && (
                <p className="text-xs text-charcoal-light mt-1">Keine Ergebnisse für „{search}"</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-50 relative group focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-1.5">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title || item.file.split("/").pop()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-charcoal-light hover:text-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </button>
            <span className="text-sm text-charcoal-light">
              Seite {page} von {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-charcoal-light hover:text-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
