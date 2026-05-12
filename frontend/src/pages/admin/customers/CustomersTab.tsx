import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import type { AdminCustomer, AdminCustomerDetail } from "@/types";

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
});

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};
const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  paid: "Bezahlt",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
  cancelled: "Storniert",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Customer Detail Modal ─────────────────────────────────────────────────────

function CustomerDetailModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const { data: customer, isLoading } = useQuery<AdminCustomerDetail>({
    queryKey: ["admin", "customer", email],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/customers/${encodeURIComponent(email)}/`,
        { headers: authHeader() }
      );
      if (!response.ok) throw new Error("Fehler beim Laden");
      return response.json();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-charcoal dark:text-white">
              {customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Kundenprofil"}
            </h2>
            <p className="text-sm text-slate mt-1">{email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-gold" />
          </div>
        ) : customer ? (
          <>
            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: "Bestellungen", value: customer.total_orders },
                { label: "Gesamtumsatz", value: `€ ${customer.total_spent}` },
                { label: "Letzte Bestellung", value: formatDate(customer.last_order_at) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex-1 min-w-[140px] bg-cream dark:bg-charcoal rounded-xl px-4 py-3"
                >
                  <p className="text-xs text-slate mb-1">{label}</p>
                  <p className="font-serif text-charcoal dark:text-white font-medium">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-gold/10 text-gold-dark text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Order history */}
            <div>
              <h3 className="font-serif text-base text-charcoal dark:text-white mb-3">
                Bestellhistorie
              </h3>
              {customer.orders.length === 0 ? (
                <p className="text-sm text-slate text-center py-6">
                  Keine Bestellungen vorhanden
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gold/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/10 bg-cream/50 dark:bg-charcoal/50 text-left">
                        <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                          Bestellung
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                          Datum
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-4 py-2 text-xs font-medium text-slate uppercase tracking-wide text-right">
                          Betrag
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gold/5 hover:bg-cream/30 dark:hover:bg-charcoal/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-charcoal dark:text-white">
                            #{order.order_number}
                          </td>
                          <td className="px-4 py-3 text-slate">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[order.status] ?? "bg-slate/10 text-slate"
                              }`}
                            >
                              {statusLabels[order.status] ?? order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-charcoal dark:text-white font-medium">
                            € {order.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate text-center py-8">
            Kundendaten konnten nicht geladen werden.
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gold/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate hover:text-charcoal dark:hover:text-white transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function CustomersTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (400 ms)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading } = useQuery<{ count: number; results: AdminCustomer[] }>({
    queryKey: ["admin", "customers", debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const response = await fetch(`/api/admin/customers/?${params}`, {
        headers: authHeader(),
      });
      if (!response.ok) throw new Error("Fehler beim Laden der Kunden");
      return response.json();
    },
  });

  const customers = data?.results ?? [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Kunden</h1>
          <p className="text-slate mt-1">
            {data ? `${data.count} Kunden gesamt` : "Kundenliste"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name oder E-Mail suchen..."
          className="w-full pl-10 pr-4 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-charcoal-light rounded-xl">
          <Users className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Keine Kunden gefunden</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-light rounded-xl overflow-hidden shadow-elegant">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 bg-cream/50 dark:bg-charcoal/50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide">
                    E-Mail
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide text-center">
                    Bestellungen
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide text-right">
                    Gesamtumsatz
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide">
                    Letzte Bestellung
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-slate uppercase tracking-wide w-24">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gold/5 hover:bg-cream/30 dark:hover:bg-charcoal/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-charcoal dark:text-white whitespace-nowrap">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="px-4 py-3 text-slate">{customer.email}</td>
                    <td className="px-4 py-3 text-center text-charcoal dark:text-white">
                      {customer.total_orders}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-charcoal dark:text-white">
                      € {customer.total_spent}
                    </td>
                    <td className="px-4 py-3 text-slate whitespace-nowrap">
                      {formatDate(customer.last_order_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEmail(customer.email)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gold/10">
              <p className="text-sm text-slate">
                Seite {page} von {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate hover:text-charcoal hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate hover:text-charcoal hover:bg-gold/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEmail && (
        <CustomerDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
}
