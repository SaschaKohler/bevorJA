import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Loader2, Search, Filter } from "lucide-react";
import type { Order } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function OrdersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: orders, isLoading } = useQuery<{ results: Order[] }>({
    queryKey: ["admin", "orders", { searchQuery, statusFilter, dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const response = await fetch(`/api/admin/orders/?${params}`, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    paid: "Bezahlt",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    delivered: "Zugestellt",
    cancelled: "Storniert",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-charcoal dark:text-white">Bestellungen</h1>
        <p className="text-slate mt-1">Verwalten Sie Kundenbestellungen und deren Status</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-slate mb-2">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suche (Name, Email, Nr.)"
              className="w-full pl-9 pr-3 py-2 border border-gold/20 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gold/20 rounded-lg text-sm"
          >
            <option value="">Alle Status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gold/20 rounded-lg text-sm"
            placeholder="Von"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gold/20 rounded-lg text-sm"
            placeholder="Bis"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl overflow-hidden shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-cream dark:bg-charcoal border-b border-gold/10">
            <tr>
              <th className="text-left py-3 px-4 text-slate font-medium">Bestellung</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Kunde</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Datum</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Betrag</th>
              <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.results?.map((order) => (
              <tr key={order.id} className="border-b border-gold/5 hover:bg-cream/30 cursor-pointer">
                <td className="py-3 px-4">
                  <span className="font-mono text-xs text-slate">#{order.order_number.slice(0, 8)}</span>
                </td>
                <td className="py-3 px-4">
                  <p className="text-charcoal dark:text-white font-medium">{order.first_name} {order.last_name}</p>
                  <p className="text-xs text-slate">{order.email}</p>
                </td>
                <td className="py-3 px-4 text-slate">
                  {format(new Date(order.created_at), "dd.MM.yyyy", { locale: de })}
                </td>
                <td className="py-3 px-4 text-charcoal dark:text-white font-medium">
                  €{order.total}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!orders?.results?.length && (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <ShoppingBag className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Bestellungen gefunden</p>
        </div>
      )}
    </div>
  );
}
