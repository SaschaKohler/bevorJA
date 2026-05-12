import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CreditCard, Loader2, X, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";
import type { CardPackage } from "@/types";

export default function CardPackagesTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CardPackage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery<CardPackage[]>({
    queryKey: ["admin", "cardpackages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/card-packages/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch card packages");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/card-packages/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete card package");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cardpackages"] });
      toast.success("Kartenpaket gelöscht");
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
      setDeleteConfirmId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Kartenpakete</h1>
          <p className="text-slate mt-1">Verwalten Sie Kartenpakete und Preise</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-elegant flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neues Paket
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream dark:bg-charcoal border-b border-gold/10 dark:border-gold/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Karten-Anzahl
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Preis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Designs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate dark:text-slate-light uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 dark:divide-gold/20">
              {packages?.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-cream/50 dark:hover:bg-charcoal transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-charcoal dark:text-white">
                        {pkg.name}
                      </div>
                      <div className="text-xs text-slate dark:text-slate-light">
                        /{pkg.slug}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-charcoal dark:text-white">
                      {pkg.card_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gold-dark">
                      €{pkg.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate dark:text-slate-light">
                        {pkg.available_designs.length}
                      </span>
                      <div className="flex -space-x-1">
                        {pkg.available_designs.slice(0, 3).map((design, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 bg-gold/10 border border-white dark:border-charcoal rounded-full flex items-center justify-center"
                            title={design}
                          >
                            <Layers className="w-3 h-3 text-gold-dark" />
                          </div>
                        ))}
                        {pkg.available_designs.length > 3 && (
                          <div className="w-6 h-6 bg-slate/10 border border-white dark:border-charcoal rounded-full flex items-center justify-center">
                            <span className="text-xs text-slate dark:text-slate-light">
                              +{pkg.available_designs.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pkg.is_active 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-slate-100 text-slate dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {pkg.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {deleteConfirmId === pkg.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(pkg.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Löschen bestätigen"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-slate hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Abbrechen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingPackage(pkg)}
                          className="p-1 text-slate hover:text-gold-dark hover:bg-gold/5 dark:hover:bg-gold/10 rounded transition-colors"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(pkg.id)}
                          className="p-1 text-slate hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Löschen"
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
      </div>

      {!packages?.length && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <CreditCard className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Kartenpakete vorhanden</p>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CardPackageModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin", "cardpackages"] });
          }}
        />
      )}

      {editingPackage && (
        <CardPackageModal
          cardPackage={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSuccess={() => {
            setEditingPackage(null);
            queryClient.invalidateQueries({ queryKey: ["admin", "cardpackages"] });
          }}
        />
      )}
    </div>
  );
}

function CardPackageModal({
  cardPackage,
  onClose,
  onSuccess,
}: {
  cardPackage?: CardPackage;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CardPackage>>(
    cardPackage || {
      name: "",
      slug: "",
      card_count: 0,
      price: "",
      available_designs: [],
      occasion_slugs: [],
      is_active: true,
      sort_order: 0,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newSlug = !prev.slug || prev.slug === generateSlug(prev.name || '') ? generateSlug(name) : prev.slug;
      return { ...prev, name, slug: newSlug };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const url = cardPackage ? `/api/admin/card-packages/${cardPackage.id}/` : "/api/admin/card-packages/";
      const method = cardPackage ? "PATCH" : "POST";
      
      // Filter out empty designs
      const submitData = {
        ...formData,
        available_designs: formData.available_designs?.filter(design => design.trim() !== "") || [],
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errorData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              fieldErrors[key] = value[0];
            } else if (typeof value === 'string') {
              fieldErrors[key] = value;
            }
          });
          setErrors(fieldErrors);
        }
        throw new Error(cardPackage ? "Failed to update card package" : "Failed to create card package");
      }

      toast.success(cardPackage ? "Kartenpaket aktualisiert" : "Kartenpaket erstellt");
      onSuccess();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDesign = () => {
    setFormData(prev => ({
      ...prev,
      available_designs: [...(prev.available_designs || []), ""]
    }));
  };

  const updateDesign = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      available_designs: prev.available_designs?.map((d, i) => i === index ? value : d) || []
    }));
  };

  const removeDesign = (index: number) => {
    setFormData(prev => ({
      ...prev,
      available_designs: prev.available_designs?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl shadow-elegant p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-charcoal dark:text-white">
            {cardPackage ? "Kartenpaket bearbeiten" : "Neues Kartenpaket"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
            />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
          </div>

          {/* Card Count */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Kartenanzahl *
            </label>
            <input
              type="number"
              value={formData.card_count || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, card_count: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
              required
              min="1"
            />
            {errors.card_count && <p className="text-red-500 text-xs mt-1">{errors.card_count}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Preis (€) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate dark:text-slate-light">€</span>
              <input
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
                required
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Available Designs */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Verfügbare Designs
            </label>
            <div className="space-y-2">
              {formData.available_designs?.map((design, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={design}
                    onChange={(e) => updateDesign(index, e.target.value)}
                    placeholder="Design-Name eingeben"
                    className="flex-1 px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeDesign(index)}
                    className="p-2 text-slate hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addDesign}
                className="w-full py-2 border border-gold/20 dark:border-gold/10 rounded-lg text-slate dark:text-slate-light hover:bg-gold/5 dark:hover:bg-gold/10 transition-colors text-sm"
              >
                + Design hinzufügen
              </button>
            </div>
            {errors.available_designs && <p className="text-red-500 text-xs mt-1">{errors.available_designs}</p>}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-1">
              Sort-Order
            </label>
            <input
              type="number"
              value={formData.sort_order || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm"
            />
            {errors.sort_order && <p className="text-red-500 text-xs mt-1">{errors.sort_order}</p>}
          </div>

          {/* Occasion Info */}
          <div className="p-3 bg-cream dark:bg-charcoal rounded-lg">
            <p className="text-xs text-slate dark:text-slate-light">
              <strong>Hinweis:</strong> Anlass-Zuordnungen werden über Produktvarianten verwaltet.
              {cardPackage?.occasion_slugs && cardPackage.occasion_slugs.length > 0 && (
                <span className="block mt-1">
                  Aktuelle Anlässe: {cardPackage.occasion_slugs.join(", ")}
                </span>
              )}
            </p>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-gold border-gold/20 rounded focus:ring-gold/50"
            />
            <label htmlFor="is_active" className="text-sm text-slate dark:text-slate-light">
              Aktiv
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gold/20 rounded-lg text-slate dark:text-slate-light hover:bg-cream dark:hover:bg-charcoal transition-colors text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-elegant disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                cardPackage ? "Aktualisieren" : "Erstellen"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}