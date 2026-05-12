import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, ChevronDown, ChevronRight, FileText, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import type { AdminSiteContent } from "@/types";

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
});

// ─── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  item,
  onClose,
  onSuccess,
}: {
  item: AdminSiteContent;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState(item.content);
  const [contentEn, setContentEn] = useState(item.content_en ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/site-content/${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ content, content_en: contentEn }),
      });
      if (!response.ok) throw new Error();
      toast.success("Inhalt gespeichert");
      onSuccess();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-charcoal dark:text-white">
              Inhalt bearbeiten
            </h2>
            <p className="text-sm text-slate mt-1">
              <span className="font-medium">{item.section_display || item.section}</span>
              <span className="mx-2 text-gold/50">·</span>
              <span>{item.key_display || item.key}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              Inhalt (DE)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">
              Inhalt (EN)
            </label>
            <textarea
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white resize-y"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gold/10">
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
  );
}

// ─── Section Group ─────────────────────────────────────────────────────────────

function SectionGroup({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: AdminSiteContent[];
  onEdit: (item: AdminSiteContent) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-charcoal-light rounded-xl overflow-hidden shadow-elegant">
      {/* Group header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full py-3 px-4 bg-cream dark:bg-charcoal font-medium text-charcoal dark:text-white flex items-center justify-between cursor-pointer hover:bg-cream/80 dark:hover:bg-charcoal/80 transition-colors"
      >
        <span className="font-serif">{title}</span>
        <span className="flex items-center gap-2 text-slate">
          <span className="text-xs font-normal">{items.length} Einträge</span>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>

      {/* Table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 text-left">
                <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                  Schlüssel
                </th>
                <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                  Inhalt DE
                </th>
                <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                  Inhalt EN
                </th>
                <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide w-24">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gold/5 hover:bg-cream/30 dark:hover:bg-charcoal/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal dark:text-white whitespace-nowrap">
                    {item.key_display || item.key}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate line-clamp-1 max-w-xs">
                      {item.content || <span className="italic text-slate-light">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate line-clamp-1 max-w-xs">
                      {item.content_en || <span className="italic text-slate-light">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────────

export default function SiteContentTab() {
  const [editingItem, setEditingItem] = useState<AdminSiteContent | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery<AdminSiteContent[]>({
    queryKey: ["admin", "site-content"],
    queryFn: async () => {
      const response = await fetch("/api/admin/site-content/", {
        headers: authHeader(),
      });
      if (!response.ok) throw new Error("Fehler beim Laden der Inhalte");
      return response.json();
    },
  });

  // Build grouped structure
  const grouped = (items ?? []).reduce((acc, item) => {
    const section = item.section_display || item.section;
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, AdminSiteContent[]>);

  const allSections = Object.keys(grouped).sort();

  const visibleSections =
    sectionFilter === "all"
      ? allSections
      : allSections.filter((s) => s === sectionFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Website-Inhalte</h1>
          <p className="text-slate mt-1">
            Texte und Inhalte der Website bearbeiten
          </p>
        </div>

        {/* Section filter */}
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="px-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
        >
          <option value="all">Alle Bereiche</option>
          {allSections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Section groups */}
      {visibleSections.length > 0 ? (
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <SectionGroup
              key={section}
              title={section}
              items={grouped[section]}
              onEdit={setEditingItem}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <FileText className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Inhalte gefunden</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            queryClient.invalidateQueries({ queryKey: ["admin", "site-content"] });
          }}
        />
      )}
    </div>
  );
}
