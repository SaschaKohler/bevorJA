import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Gift, Search, X, Check, Loader2 } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import toast from "react-hot-toast";
import type { Occasion } from "@/types";

// Extended Occasion type for admin with potential extra fields
interface AdminOccasion extends Occasion {
  meta_title?: string;
  meta_description?: string;
}

const LUCIDE_ICONS = [
  "Gift", "Heart", "Music", "Star", "Crown", "Gem", "Sparkles", "PartyPopper",
  "Calendar", "Camera", "Flower2", "Palmtree", "Sun", "Moon", "Cloud", "Home",
  "Baby", "Users", "Ring", "Church", "GlassWater", "Cake", "Plane", "Briefcase",
];

export default function OccasionsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOccasion, setEditingOccasion] = useState<AdminOccasion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: occasions, isLoading } = useQuery<AdminOccasion[]>({
    queryKey: ["admin", "occasions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/occasions/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch occasions");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/occasions/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete occasion");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "occasions"] });
      toast.success("Anlass gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const filteredOccasions = occasions?.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Anlässe</h1>
          <p className="text-slate mt-1">Verwalten Sie Anlässe und deren Design-Einstellungen</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-elegant flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neuer Anlass
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Anlässe durchsuchen..."
          className="w-full pl-10 pr-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOccasions?.map((occasion) => (
          <OccasionCard
            key={occasion.id}
            occasion={occasion}
            onEdit={() => setEditingOccasion(occasion)}
            onDelete={() => {
              if (confirm(`Möchten Sie "${occasion.name}" wirklich löschen?`)) {
                deleteMutation.mutate(occasion.id);
              }
            }}
          />
        ))}
      </div>

      {filteredOccasions?.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <Gift className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Anlässe gefunden</p>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <OccasionModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin", "occasions"] });
          }}
        />
      )}

      {editingOccasion && (
        <OccasionModal
          occasion={editingOccasion}
          onClose={() => setEditingOccasion(null)}
          onSuccess={() => {
            setEditingOccasion(null);
            queryClient.invalidateQueries({ queryKey: ["admin", "occasions"] });
          }}
        />
      )}
    </div>
  );
}

function OccasionCard({
  occasion,
  onEdit,
  onDelete,
}: {
  occasion: AdminOccasion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white dark:bg-charcoal-light rounded-xl p-5 shadow-elegant hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: occasion.color_primary }}
          >
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-charcoal dark:text-white">{occasion.name}</h3>
            <p className="text-sm text-slate">/{occasion.slug}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {occasion.is_default && (
            <span className="px-2 py-1 bg-gold/10 text-gold-dark text-xs rounded-full font-medium">
              Standard
            </span>
          )}
          {!occasion.is_active && (
            <span className="px-2 py-1 bg-slate/10 text-slate text-xs rounded-full font-medium">
              Inaktiv
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate mb-4 line-clamp-2">{occasion.description || "Keine Beschreibung"}</p>

      {/* Colors Preview */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate">Primär</span>
          <div
            className="w-6 h-6 rounded-full border-2 border-white dark:border-charcoal shadow-sm"
            style={{ backgroundColor: occasion.color_primary }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate">Sekundär</span>
          <div
            className="w-6 h-6 rounded-full border-2 border-white dark:border-charcoal shadow-sm"
            style={{ backgroundColor: occasion.color_secondary }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gold/10">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Bearbeiten
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center px-3 py-2 text-slate hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function OccasionModal({
  occasion,
  onClose,
  onSuccess,
}: {
  occasion?: AdminOccasion;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<AdminOccasion>>(
    occasion || {
      name: "",
      slug: "",
      description: "",
      icon: "Gift",
      color_primary: "#d4a574",
      color_secondary: "#8b7355",
      is_active: true,
      is_default: false,
      sort_order: 0,
    }
  );
  const [activeColorPicker, setActiveColorPicker] = useState<"primary" | "secondary" | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = occasion ? `/api/admin/occasions/${occasion.id}/` : "/api/admin/occasions/";
      const method = occasion ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save occasion");

      toast.success(occasion ? "Anlass aktualisiert" : "Anlass erstellt");
      onSuccess();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[match] || match))
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-charcoal dark:text-white">
            {occasion ? "Anlass bearbeiten" : "Neuer Anlass"}
          </h2>
          <button onClick={onClose} className="text-slate hover:text-charcoal dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name,
                    slug: occasion ? prev.slug : generateSlug(name),
                  }));
                }}
                className="w-full px-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white font-mono text-sm"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Icon</label>
            <div className="grid grid-cols-8 gap-2 p-3 border border-gold/20 dark:border-gold/10 rounded-lg max-h-32 overflow-y-auto">
              {LUCIDE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.icon === icon
                      ? "bg-gold text-white"
                      : "hover:bg-gold/10 text-slate"
                  }`}
                  title={icon}
                >
                  <Gift className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Primärfarbe</label>
              <div className="flex gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gold/20 cursor-pointer"
                  style={{ backgroundColor: formData.color_primary }}
                  onClick={() => setActiveColorPicker(activeColorPicker === "primary" ? null : "primary")}
                />
                <input
                  type="text"
                  value={formData.color_primary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color_primary: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg font-mono text-sm"
                />
              </div>
              {activeColorPicker === "primary" && (
                <div className="mt-2">
                  <HexColorPicker
                    color={formData.color_primary}
                    onChange={(color) => setFormData((prev) => ({ ...prev, color_primary: color }))}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate mb-2">Sekundärfarbe</label>
              <div className="flex gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gold/20 cursor-pointer"
                  style={{ backgroundColor: formData.color_secondary }}
                  onClick={() => setActiveColorPicker(activeColorPicker === "secondary" ? null : "secondary")}
                />
                <input
                  type="text"
                  value={formData.color_secondary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, color_secondary: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg font-mono text-sm"
                />
              </div>
              {activeColorPicker === "secondary" && (
                <div className="mt-2">
                  <HexColorPicker
                    color={formData.color_secondary}
                    onChange={(color) => setFormData((prev) => ({ ...prev, color_secondary: color }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-gold rounded border-gold/20 focus:ring-gold"
              />
              <span className="text-sm text-slate">Aktiv</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_default: e.target.checked }))}
                className="w-4 h-4 text-gold rounded border-gold/20 focus:ring-gold"
              />
              <span className="text-sm text-slate">Standard-Anlass</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gold/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gold/20 dark:border-gold/10 text-slate rounded-lg hover:bg-cream dark:hover:bg-charcoal transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-elegant flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {occasion ? "Aktualisieren" : "Erstellen"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
