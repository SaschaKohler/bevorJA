import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Loader2, Filter } from "lucide-react";

export default function ProductVariantsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    occasion: "",
    box_type: "",
    is_active: true,
  });

  const { data: variants, isLoading } = useQuery({
    queryKey: ["admin", "variants", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.occasion) params.append("occasion", filters.occasion);
      if (filters.box_type) params.append("box_type", filters.box_type);
      if (filters.is_active) params.append("is_active", "true");

      const response = await fetch(`/api/admin/variants/?${params}`, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch variants");
      return response.json();
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Produktvarianten</h1>
          <p className="text-slate mt-1">Verwalten Sie Produkt-Kombinationen aus Box + Karten + Anlass</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-elegant flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neue Variante
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-charcoal-light rounded-xl">
        <Filter className="w-5 h-5 text-slate" />
        <select
          value={filters.occasion}
          onChange={(e) => setFilters((f) => ({ ...f, occasion: e.target.value }))}
          className="px-3 py-2 border border-gold/20 rounded-lg text-sm"
        >
          <option value="">Alle Anlässe</option>
          {/* Options loaded dynamically */}
        </select>
        <select
          value={filters.box_type}
          onChange={(e) => setFilters((f) => ({ ...f, box_type: e.target.value }))}
          className="px-3 py-2 border border-gold/20 rounded-lg text-sm"
        >
          <option value="">Alle Box-Typen</option>
          <option value="audio">Hörbox</option>
          <option value="wood">Holzbox</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Variants List */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-charcoal border-b border-gold/10">
            <tr>
              <th className="text-left py-3 px-4 text-slate font-medium">Produkt</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Box</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Karten</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Anlass</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Preis</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {variants?.results?.map((variant: { id: number; name: string; box_type_name: string; card_count: number; occasion_name: string | null; calculated_price: string; is_active: boolean }) => (
              <tr key={variant.id} className="border-b border-gold/5 hover:bg-cream/30">
                <td className="py-3 px-4 text-charcoal dark:text-white font-medium">{variant.name}</td>
                <td className="py-3 px-4 text-slate">{variant.box_type_name}</td>
                <td className="py-3 px-4 text-slate">{variant.card_count}</td>
                <td className="py-3 px-4 text-slate">{variant.occasion_name || "—"}</td>
                <td className="py-3 px-4 text-charcoal dark:text-white">€{variant.calculated_price}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${variant.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate"}`}>
                    {variant.is_active ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!variants?.results?.length && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <Package className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Varianten gefunden</p>
        </div>
      )}
    </div>
  );
}
