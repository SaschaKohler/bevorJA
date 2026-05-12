import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud, Grid2X2, List, X, Download, Trash2,
  Loader2, Image as ImageIcon, ChevronLeft, ChevronRight,
  AlertCircle, Search,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminMedia {
  id: number;
  file: string;
  file_url: string;
  title: string;
  alt_text: string;
  tags: string;
  width?: number;
  height?: number;
  file_size?: number;
  uploaded_at: string;
}

interface MediaPage {
  results: AdminMedia[];
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
});

const PAGE_SIZE = 20;

const inputCls =
  "w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm";

// ─── MediaDetailModal ─────────────────────────────────────────────────────────

function MediaDetailModal({
  item,
  onClose,
  onDeleted,
}: {
  item: AdminMedia;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [altText, setAltText] = useState(item.alt_text);
  const [title, setTitle] = useState(item.title);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ alt_text: altText, title }),
      });
      if (!res.ok) throw new Error();
      toast.success("Änderungen gespeichert");
      onClose();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${item.id}/`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      toast.success("Bild gelöscht");
      onDeleted();
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elegant">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-charcoal dark:text-white">
            Bild-Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden bg-cream dark:bg-charcoal mb-5 flex items-center justify-center max-h-64">
          <img
            src={item.file_url}
            alt={item.alt_text || item.title}
            className="max-h-64 w-full object-contain"
          />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5 text-xs text-slate">
          {item.width && item.height && (
            <span className="px-2 py-1 bg-cream dark:bg-charcoal rounded-md">
              {item.width} × {item.height} px
            </span>
          )}
          <span className="px-2 py-1 bg-cream dark:bg-charcoal rounded-md">
            {formatFileSize(item.file_size)}
          </span>
          <span className="px-2 py-1 bg-cream dark:bg-charcoal rounded-md">
            Hochgeladen: {formatDate(item.uploaded_at)}
          </span>
        </div>

        {/* Edit fields */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
              Titel
            </label>
            <input
              className={inputCls}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bildtitel…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal dark:text-white mb-1">
              Alt-Text
            </label>
            <input
              className={inputCls}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Bildbeschreibung für Barrierefreiheit…"
            />
          </div>
        </div>

        {/* Usage */}
        <div className="mb-5 p-3 bg-cream dark:bg-charcoal rounded-lg text-sm text-slate">
          <span className="font-medium text-charcoal dark:text-white">Verwendung:</span>{" "}
          Wird verwendet in: —
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
              Dieses Bild wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Ja, löschen
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-sm text-slate hover:text-charcoal dark:hover:text-white transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gold/10">
          <div className="flex gap-2">
            <a
              href={item.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            {!confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate hover:text-charcoal dark:hover:text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-elegant flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const addFiles = useCallback((files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    setSelectedFiles((prev) => [...prev, ...images]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch("/api/admin/media/upload/", {
          method: "POST",
          headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
          body: formData,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      const count = selectedFiles.length;
      setSelectedFiles([]);
      toast.success(`${count} Bild${count !== 1 ? "er" : ""} hochgeladen`);
      onUploaded();
    } catch {
      toast.error("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-charcoal-light rounded-2xl p-5 shadow-elegant">
      <h3 className="font-display text-base text-charcoal dark:text-white mb-4">
        Bilder hochladen
      </h3>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-default ${
          isDragging
            ? "border-gold bg-gold/5"
            : "border-gold/30 hover:border-gold/50"
        }`}
      >
        <UploadCloud className="w-10 h-10 text-gold/50 mx-auto mb-3" />
        <p className="text-sm text-slate">
          Bilder hierher ziehen oder{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gold hover:text-gold-dark font-medium underline underline-offset-2 transition-colors"
          >
            auswählen
          </button>
        </p>
        <p className="text-xs text-slate-light mt-1">PNG, JPG, GIF, WebP · Mehrere Dateien möglich</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Selected file previews */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate mb-2">{selectedFiles.length} Datei{selectedFiles.length !== 1 ? "en" : ""} ausgewählt</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden bg-cream dark:bg-charcoal flex-shrink-0">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-elegant flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {uploading ? "Wird hochgeladen…" : "Hochladen"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function MediathekTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailItem, setDetailItem] = useState<AdminMedia | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { data, isLoading, isError, error } = useQuery<MediaPage>({
    queryKey: ["admin", "media", search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/media/?${params}`, {
        headers: authHeader(),
      });
      if (!res.ok) {
        const err = new Error(res.statusText) as Error & { status: number };
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
  });

  const apiUnavailable =
    isError &&
    ((error as Error & { status?: number })?.status === 404 ||
      (error as Error & { status?: number })?.status === 500 ||
      (error as Error & { status?: number })?.status === undefined);

  const items = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/admin/media/${id}/`, {
          method: "DELETE",
          headers: authHeader(),
        });
      }
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success(`${count} Bild${count !== 1 ? "er" : ""} gelöscht`);
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <UploadZone onUploaded={() => queryClient.invalidateQueries({ queryKey: ["admin", "media"] })} />

      {/* API unavailable notice */}
      {apiUnavailable && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Media-API nicht verfügbar.</strong> Die Mediathek konnte nicht geladen werden.
            Der Upload-Bereich ist weiterhin nutzbar.
          </p>
        </div>
      )}

      {/* Grid section */}
      <div className="bg-white dark:bg-charcoal-light rounded-2xl shadow-elegant overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gold/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light" />
            <input
              type="search"
              placeholder="Suche nach Titel oder Dateiname…"
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-cream dark:bg-charcoal rounded-lg self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-charcoal-light text-gold shadow-sm"
                  : "text-slate hover:text-charcoal dark:hover:text-white"
              }`}
              title="Rasteransicht"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-charcoal-light text-gold shadow-sm"
                  : "text-slate hover:text-charcoal dark:hover:text-white"
              }`}
              title="Listenansicht"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {data && (
            <span className="text-xs text-slate whitespace-nowrap">
              {data.count} Bild{data.count !== 1 ? "er" : ""}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Wird geladen…</span>
          </div>
        ) : !apiUnavailable && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate">
            <ImageIcon className="w-12 h-12 text-slate-light mb-3" />
            <p className="text-sm font-medium">Keine Bilder gefunden</p>
            {search && (
              <p className="text-xs text-slate-light mt-1">
                Keine Ergebnisse für „{search}"
              </p>
            )}
          </div>
        ) : !apiUnavailable ? (
          viewMode === "grid" ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-lg overflow-hidden bg-cream dark:bg-charcoal relative group cursor-pointer"
                  onClick={() => setDetailItem(item)}
                >
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                      {item.title || item.file.split("/").pop()}
                    </p>
                  </div>
                  {/* Checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                    className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                      selectedIds.has(item.id)
                        ? "bg-gold border-gold"
                        : "bg-white/80 border-white/80 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {selectedIds.has(item.id) && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-none stroke-current stroke-2">
                        <polyline points="1.5,6 4.5,9 10.5,3" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10 text-left">
                    <th className="px-4 py-2 w-10"></th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">Vorschau</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">Titel</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide hidden md:table-cell">Dimensionen</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide hidden md:table-cell">Dateigröße</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide hidden lg:table-cell">Hochgeladen</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gold/5 hover:bg-cream/30 dark:hover:bg-charcoal/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(item.id)}
                          className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                            selectedIds.has(item.id)
                              ? "bg-gold border-gold"
                              : "border-gold/30 hover:border-gold"
                          }`}
                        >
                          {selectedIds.has(item.id) && (
                            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-none stroke-current stroke-2">
                              <polyline points="1.5,6 4.5,9 10.5,3" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <div
                          className="w-12 h-12 rounded-lg overflow-hidden bg-cream dark:bg-charcoal cursor-pointer flex-shrink-0"
                          onClick={() => setDetailItem(item)}
                        >
                          <img
                            src={item.file_url}
                            alt={item.alt_text || item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 font-medium text-charcoal dark:text-white cursor-pointer hover:text-gold-dark transition-colors"
                        onClick={() => setDetailItem(item)}
                      >
                        <p className="line-clamp-1">{item.title || item.file.split("/").pop() || "—"}</p>
                        {item.alt_text && (
                          <p className="text-xs text-slate font-normal line-clamp-1">{item.alt_text}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate hidden md:table-cell whitespace-nowrap">
                        {item.width && item.height ? `${item.width} × ${item.height}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate hidden md:table-cell whitespace-nowrap">
                        {formatFileSize(item.file_size)}
                      </td>
                      <td className="px-4 py-3 text-slate hidden lg:table-cell whitespace-nowrap">
                        {formatDate(item.uploaded_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {/* Pagination */}
        {!apiUnavailable && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate hover:text-charcoal dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </button>
            <span className="text-sm text-slate">
              Seite {page} von {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate hover:text-charcoal dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-charcoal dark:bg-white shadow-elegant rounded-2xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-white dark:text-charcoal">
            {selectedIds.size} ausgewählt
          </span>
          {confirmBulkDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-300 dark:text-red-500">Sicher löschen?</span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60"
              >
                {bulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Ja, löschen
              </button>
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-3 py-1.5 text-xs text-slate-light hover:text-white dark:hover:text-charcoal transition-colors"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Auswahl löschen
            </button>
          )}
          <button
            onClick={() => { setSelectedIds(new Set()); setConfirmBulkDelete(false); }}
            className="text-slate-light hover:text-white dark:hover:text-charcoal transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <MediaDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onDeleted={() => {
            setDetailItem(null);
            queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
          }}
        />
      )}
    </div>
  );
}
