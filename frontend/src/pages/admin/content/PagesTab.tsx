import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Page } from "@/types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
  "Content-Type": "application/json",
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const TEMPLATE_LABELS: Record<Page["template"], string> = {
  default: "Standard",
  landing: "Landingpage",
  shop: "Shop",
};

const TEMPLATE_COLORS: Record<Page["template"], string> = {
  default: "bg-slate/10 text-slate",
  landing: "bg-gold/10 text-gold-dark",
  shop: "bg-rose-gold/10 text-rose-gold",
};

// ─── Page Modal ────────────────────────────────────────────────────────────────

interface PageForm {
  title: string;
  slug: string;
  template: Page["template"];
  meta_title: string;
  meta_description: string;
  show_in_nav: boolean;
  nav_order: number;
  is_published: boolean;
}

const defaultForm: PageForm = {
  title: "",
  slug: "",
  template: "default",
  meta_title: "",
  meta_description: "",
  show_in_nav: false,
  nav_order: 0,
  is_published: false,
};

function PageModal({
  page,
  onClose,
  onSuccess,
}: {
  page?: Page;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<PageForm>(
    page
      ? {
          title: page.title,
          slug: page.slug,
          template: page.template,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          show_in_nav: page.show_in_nav,
          nav_order: page.nav_order,
          is_published: page.is_published,
        }
      : defaultForm
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page);
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugManuallyEdited ? f.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setForm((f) => ({ ...f, slug: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Titel ist erforderlich");
      return;
    }
    setSaving(true);
    try {
      const url = page ? `/api/admin/pages/${page.id}/` : "/api/admin/pages/";
      const method = page ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(page ? "Seite gespeichert" : "Seite erstellt");
      onSuccess();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-charcoal dark:text-white">
            {page ? "Seite bearbeiten" : "Neue Seite"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-sm font-medium text-slate mb-1.5">
              Titel <span className="text-rose-gold">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Seitentitel"
              className="w-full px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate mb-1.5">Slug</label>
            <div className="flex items-center border border-gold/20 dark:border-gold/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold/50 bg-white dark:bg-charcoal">
              <span className="px-3 text-slate text-sm bg-cream dark:bg-charcoal-light border-r border-gold/20 dark:border-gold/10 py-2.5 select-none">
                /
              </span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="seiten-slug"
                className="flex-1 px-3 py-2.5 font-mono text-sm bg-transparent focus:outline-none text-charcoal dark:text-white"
              />
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-slate mb-1.5">Template</label>
            <select
              value={form.template}
              onChange={(e) => setForm((f) => ({ ...f, template: e.target.value as Page["template"] }))}
              className="w-full px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
            >
              <option value="default">Standard</option>
              <option value="landing">Landingpage</option>
              <option value="shop">Shop</option>
            </select>
          </div>

          {/* SEO Panel */}
          <div className="border border-gold/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-cream dark:bg-charcoal text-sm font-medium text-charcoal dark:text-white hover:bg-cream/80 transition-colors"
            >
              <span>SEO-Einstellungen</span>
              {seoOpen ? <ChevronUp className="w-4 h-4 text-slate" /> : <ChevronDown className="w-4 h-4 text-slate" />}
            </button>
            {seoOpen && (
              <div className="p-4 space-y-4 bg-white dark:bg-charcoal-light">
                {/* Meta-Titel */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate">Meta-Titel</label>
                    <span className={`text-xs ${form.meta_title.length > 60 ? "text-rose-gold" : "text-slate"}`}>
                      {form.meta_title.length}/70
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value.slice(0, 70) }))}
                    placeholder="SEO-Titel der Seite"
                    maxLength={70}
                    className="w-full px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
                  />
                </div>
                {/* Meta-Beschreibung */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate">Meta-Beschreibung</label>
                    <span className={`text-xs ${form.meta_description.length > 140 ? "text-rose-gold" : "text-slate"}`}>
                      {form.meta_description.length}/160
                    </span>
                  </div>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value.slice(0, 160) }))}
                    placeholder="Kurzbeschreibung für Suchmaschinen"
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <input
              id="show_in_nav"
              type="checkbox"
              checked={form.show_in_nav}
              onChange={(e) => setForm((f) => ({ ...f, show_in_nav: e.target.checked }))}
              className="w-4 h-4 accent-gold-dark rounded"
            />
            <label htmlFor="show_in_nav" className="text-sm font-medium text-charcoal dark:text-white cursor-pointer">
              In Navigation anzeigen
            </label>
          </div>

          {form.show_in_nav && (
            <div>
              <label className="block text-sm font-medium text-slate mb-1.5">Nav-Reihenfolge</label>
              <input
                type="number"
                value={form.nav_order}
                onChange={(e) => setForm((f) => ({ ...f, nav_order: Number(e.target.value) }))}
                min={0}
                className="w-32 px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
              />
            </div>
          )}

          {/* Veröffentlicht */}
          <div className="flex items-center gap-3">
            <input
              id="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              className="w-4 h-4 accent-gold-dark rounded"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-charcoal dark:text-white cursor-pointer">
              Veröffentlicht
            </label>
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
            {page ? "Speichern" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────────

export default function PagesTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ results: Page[]; count: number }>({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pages/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error("Fehler beim Laden der Seiten");
      return res.json();
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: number; is_published: boolean }) => {
      const res = await fetch(`/api/admin/pages/${id}/`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ is_published }),
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: (_, { is_published }) => {
      invalidate();
      toast.success(is_published ? "Seite veröffentlicht" : "Seite auf Entwurf gesetzt");
    },
    onError: () => toast.error("Fehler beim Aktualisieren"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/pages/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => {
      invalidate();
      setDeletingId(null);
      toast.success("Seite gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const pages = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Seiten</h1>
          <p className="text-slate mt-1">
            {data?.count ?? 0} {data?.count === 1 ? "Seite" : "Seiten"} verwalten
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-elegant flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neue Seite
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl shadow-elegant overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-light mx-auto mb-4" />
            <p className="text-slate">Noch keine Seiten vorhanden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Titel</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Slug</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Template</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Sections</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide">Navigation</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate uppercase tracking-wide w-36">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-gold/5 last:border-0 hover:bg-cream/30 dark:hover:bg-charcoal/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-charcoal dark:text-white whitespace-nowrap">
                      {page.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate bg-slate/5 px-2 py-1 rounded">
                        /{page.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${TEMPLATE_COLORS[page.template]}`}>
                        {TEMPLATE_LABELS[page.template]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {page.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Veröffentlicht
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate/10 text-slate">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate inline-block" />
                          Entwurf
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate">
                      {page.sections_count}
                    </td>
                    <td className="px-5 py-3.5 text-slate">
                      {page.show_in_nav ? `Ja (${page.nav_order})` : "–"}
                    </td>
                    <td className="px-5 py-3.5">
                      {deletingId === page.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate mr-1">Löschen?</span>
                          <button
                            onClick={() => deleteMutation.mutate(page.id)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 text-xs bg-slate/10 text-slate rounded hover:bg-slate/20 transition-colors"
                          >
                            Nein
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPage(page)}
                            title="Bearbeiten"
                            className="p-1.5 text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              togglePublishMutation.mutate({
                                id: page.id,
                                is_published: !page.is_published,
                              })
                            }
                            title={page.is_published ? "Auf Entwurf setzen" : "Veröffentlichen"}
                            className="p-1.5 text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                          >
                            {page.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeletingId(page.id)}
                            title="Löschen"
                            className="p-1.5 text-slate hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <PageModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            invalidate();
          }}
        />
      )}
      {editingPage && (
        <PageModal
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSuccess={() => {
            setEditingPage(null);
            invalidate();
          }}
        />
      )}
    </div>
  );
}
