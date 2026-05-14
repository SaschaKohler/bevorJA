import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Box, Loader2, X, Check, Package } from "lucide-react";
import toast from "react-hot-toast";
import type { BoxType } from "@/types";

export default function BoxTypesTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBoxType, setEditingBoxType] = useState<BoxType | null>(null);
  const queryClient = useQueryClient();

  const { data: boxTypes, isLoading } = useQuery<BoxType[]>({
    queryKey: ["admin", "boxtypes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/box-types/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch box types");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/box-types/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete box type");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "boxtypes"] });
      toast.success("Box-Typ gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
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
          <h1 className="font-display text-2xl text-charcoal">Box-Typen</h1>
          <p className="text-charcoal-light mt-1">Verwalten Sie Box-Typen und deren Spezifikationen</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-elegant flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neuer Box-Typ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxTypes?.map((boxType) => (
          <BoxTypeCard
            key={boxType.id}
            boxType={boxType}
            onEdit={() => setEditingBoxType(boxType)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {!boxTypes?.length && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Box className="w-12 h-12 text-charcoal-light-light mx-auto mb-4" />
          <p className="text-charcoal-light">Keine Box-Typen vorhanden</p>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <BoxTypeModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["admin", "boxtypes"] });
          }}
        />
      )}

      {editingBoxType && (
        <BoxTypeModal
          boxType={editingBoxType}
          onClose={() => setEditingBoxType(null)}
          onSuccess={() => {
            setEditingBoxType(null);
            queryClient.invalidateQueries({ queryKey: ["admin", "boxtypes"] });
          }}
        />
      )}
    </div>
  );
}

function BoxTypeCard({
  boxType,
  onEdit,
  onDelete,
}: {
  boxType: BoxType;
  onEdit: () => void;
  onDelete: (id: number) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(boxType.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-elegant hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-gold-dark" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-charcoal">{boxType.name}</h3>
            <span className="inline-block px-2 py-1 bg-gold/10 text-gold-dark text-xs rounded-full font-medium">
              {boxType.box_type_display}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          boxType.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-charcoal-light dark:bg-slate-700 dark:text-charcoal-light-300"
        }`}>
          {boxType.is_active ? "Aktiv" : "Inaktiv"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light dark:text-charcoal-light-light">Basispreis:</span>
          <span className="font-medium text-charcoal">€{boxType.base_price}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light dark:text-charcoal-light-light">Gewicht:</span>
          <span className="font-medium text-charcoal">{boxType.weight_grams}g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-light dark:text-charcoal-light-light">Maße:</span>
          <span className="font-medium text-charcoal">
            {boxType.dimensions.length} × {boxType.dimensions.width} × {boxType.dimensions.height}mm
          </span>
        </div>
      </div>

      {boxType.features.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-charcoal-light dark:text-charcoal-light-light mb-2">Features:</p>
          <div className="flex flex-wrap gap-1">
            {boxType.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-gray-50 text-charcoal-light dark:text-charcoal-light-light rounded">
                {feature}
              </span>
            ))}
            {boxType.features.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-50 text-charcoal-light dark:text-charcoal-light-light rounded">
                +{boxType.features.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-200">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-charcoal-light dark:text-charcoal-light-light hover:text-gold-dark hover:bg-gold/5 dark:hover:bg-gold/10 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Bearbeiten
        </button>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center px-3 py-2 text-charcoal-light dark:text-charcoal-light-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="flex items-center justify-center px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex items-center justify-center px-2 py-1 text-xs text-charcoal-light hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BoxTypeModal({
  boxType,
  onClose,
  onSuccess,
}: {
  boxType?: BoxType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<BoxType>>(
    boxType || {
      name: "",
      slug: "",
      description: "",
      box_type: "audio",
      box_type_display: "",
      base_price: "",
      features: [],
      weight_grams: 0,
      dimensions: { length: 0, width: 0, height: 0 },
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
      const url = boxType ? `/api/admin/box-types/${boxType.id}/` : "/api/admin/box-types/";
      const method = boxType ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
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
        throw new Error(boxType ? "Failed to update box type" : "Failed to create box type");
      }

      toast.success(boxType ? "Box-Typ aktualisiert" : "Box-Typ erstellt");
      onSuccess();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), ""]
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.map((f, i) => i === index ? value : f) || []
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-elegant p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-charcoal">
            {boxType ? "Box-Typ bearbeiten" : "Neuer Box-Typ"}
          </h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
            />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
          </div>

          {/* Box Type */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Box-Typ *
            </label>
            <select
              value={formData.box_type || "audio"}
              onChange={(e) => setFormData(prev => ({ ...prev, box_type: e.target.value as 'audio' | 'wood' | 'hybrid' }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              required
            >
              <option value="audio">Audio Box</option>
              <option value="wood">Holz Box</option>
              <option value="hybrid">Hybrid Box</option>
            </select>
            {errors.box_type && <p className="text-red-500 text-xs mt-1">{errors.box_type}</p>}
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Basispreis (€) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-light dark:text-charcoal-light-light">€</span>
              <input
                type="number"
                step="0.01"
                value={formData.base_price || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
                required
              />
            </div>
            {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Gewicht (g)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.weight_grams || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, weight_grams: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-light dark:text-charcoal-light-light text-sm">g</span>
            </div>
            {errors.weight_grams && <p className="text-red-500 text-xs mt-1">{errors.weight_grams}</p>}
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Dimensionen (mm)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="L"
                value={formData.dimensions?.length || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions!, length: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              />
              <span className="text-charcoal-light dark:text-charcoal-light-light">×</span>
              <input
                type="number"
                placeholder="B"
                value={formData.dimensions?.width || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions!, width: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              />
              <span className="text-charcoal-light dark:text-charcoal-light-light">×</span>
              <input
                type="number"
                placeholder="H"
                value={formData.dimensions?.height || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions!, height: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
              />
              <span className="text-charcoal-light dark:text-charcoal-light-light text-sm">mm</span>
            </div>
            {errors.dimensions && <p className="text-red-500 text-xs mt-1">{errors.dimensions}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Beschreibung
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-charcoal-light dark:text-charcoal-light-light mb-1">
              Features
            </label>
            <div className="space-y-2">
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Feature eingeben"
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-charcoal-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="w-full py-2 border border-gray-200 dark:border-gray-200 rounded-lg text-charcoal-light dark:text-charcoal-light-light hover:bg-gold/5 dark:hover:bg-gold/10 transition-colors text-sm"
              >
                + Feature hinzufügen
              </button>
            </div>
            {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features}</p>}
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-gold border-gray-200 rounded focus:ring-gold/50"
            />
            <label htmlFor="is_active" className="text-sm text-charcoal-light dark:text-charcoal-light-light">
              Aktiv
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-charcoal-light dark:text-charcoal-light-light hover:bg-gray-50 transition-colors text-sm"
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
                boxType ? "Aktualisieren" : "Erstellen"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}