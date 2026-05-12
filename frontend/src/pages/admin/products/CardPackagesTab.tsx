import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Plus, Loader2 } from "lucide-react";

export default function CardPackagesTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin", "cardpackages"],
    queryFn: async () => {
      const response = await fetch("/api/admin/card-packages/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch card packages");
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages?.map((pkg: { id: number; name: string; card_count: number; price: string; is_active: boolean }) => (
          <div key={pkg.id} className="bg-white dark:bg-charcoal-light rounded-xl p-5 shadow-elegant">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gold-dark" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-charcoal dark:text-white">{pkg.name}</h3>
                <p className="text-sm text-slate">{pkg.card_count} Karten</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate">€{pkg.price}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${pkg.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate"}`}>
                {pkg.is_active ? "Aktiv" : "Inaktiv"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!packages?.length && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <CreditCard className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Kartenpakete vorhanden</p>
        </div>
      )}
    </div>
  );
}
