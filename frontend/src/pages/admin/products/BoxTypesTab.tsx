import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Plus, Loader2 } from "lucide-react";

export default function BoxTypesTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: boxTypes, isLoading } = useQuery({
    queryKey: ["admin", "boxtypes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/box-types/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch box types");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Box-Typen</h1>
          <p className="text-slate mt-1">Verwalten Sie Box-Typen und deren Spezifikationen</p>
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
        {boxTypes?.map((boxType: { id: number; name: string; box_type: string; base_price: string; is_active: boolean }) => (
          <div key={boxType.id} className="bg-white dark:bg-charcoal-light rounded-xl p-5 shadow-elegant">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                <Box className="w-6 h-6 text-gold-dark" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-charcoal dark:text-white">{boxType.name}</h3>
                <p className="text-sm text-slate">{boxType.box_type}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate">Basispreis: €{boxType.base_price}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${boxType.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate"}`}>
                {boxType.is_active ? "Aktiv" : "Inaktiv"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!boxTypes?.length && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <Box className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Box-Typen vorhanden</p>
        </div>
      )}
    </div>
  );
}
