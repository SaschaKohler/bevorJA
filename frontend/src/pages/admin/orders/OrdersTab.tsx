import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Loader2, Search, Filter, X, Copy, ChevronLeft, ChevronRight, Package, User, Calendar } from "lucide-react";
import type { Order } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import toast from "react-hot-toast";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: number, status: string, comment?: string, trackingNumber?: string) => void;
  isUpdating: boolean;
}

function OrderDetailModal({ order, onClose, onStatusUpdate, isUpdating }: OrderDetailModalProps) {
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    paid: "Bezahlt",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    delivered: "Zugestellt",
    cancelled: "Storniert",
    refunded: "Erstattet",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-orange-100 text-orange-700",
  };

  const statusTransitions: Record<string, string[]> = {
    pending: ["paid", "cancelled"],
    paid: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
    refunded: [],
  };

  const allowedTransitions = statusTransitions[order.status] || [];

  const handleStatusClick = (status: string) => {
    setNewStatus(status);
    setShowStatusForm(true);
    setComment("");
    setTrackingNumber("");
  };

  const handleStatusConfirm = () => {
    onStatusUpdate(order.id, newStatus, comment, trackingNumber);
    setShowStatusForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-2xl mt-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-charcoal font-bold">
              Bestellung #{order.order_number.slice(0, 8)}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-charcoal-light flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(order.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-rose-gold transition-colors p-1 hover:bg-rose-gold/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Customer Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Kundendaten
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-charcoal font-medium">
              {order.first_name} {order.last_name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-charcoal-light text-sm">{order.email}</p>
              <button
                onClick={() => copyToClipboard(order.email)}
                className="text-gold hover:text-gold-dark transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {order.phone && (
              <p className="text-charcoal-light text-sm">{order.phone}</p>
            )}
            <p className="text-charcoal-light text-sm">
              {order.street}, {order.zip_code} {order.city}, {order.country}
            </p>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bestellte Artikel
          </h3>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3 text-charcoal-light font-medium">Produkt</th>
                  <th className="text-center py-2 px-3 text-charcoal-light font-medium">Menge</th>
                  <th className="text-right py-2 px-3 text-charcoal-light font-medium">Einzelpreis</th>
                  <th className="text-right py-2 px-3 text-charcoal-light font-medium">Zwischensumme</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="py-2 px-3 text-charcoal">
                      {item.product_detail.name}
                    </td>
                    <td className="py-2 px-3 text-center text-charcoal-light">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-charcoal-light">€{item.price}</td>
                    <td className="py-2 px-3 text-right text-charcoal font-medium">
                      €{item.subtotal}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-charcoal font-semibold">
                    Gesamtsumme
                  </td>
                  <td className="py-2 px-3 text-right text-charcoal font-bold">
                    €{order.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customization Section */}
        {order.customization_details && (
          <div className="mb-6">
            <h3 className="font-semibold text-charcoal mb-3">Personalisierung</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {order.customization_details.engraving && (
                <div>
                  <span className="text-sm font-medium text-charcoal-light">Gravur:</span>
                  <p className="text-charcoal">{order.customization_details.engraving}</p>
                </div>
              )}
              {order.customization_details.box_color && (
                <div>
                  <span className="text-sm font-medium text-charcoal-light">Boxfarbe:</span>
                  <p className="text-charcoal">{order.customization_details.box_color}</p>
                </div>
              )}
              {order.customization_details.selected_design && (
                <div>
                  <span className="text-sm font-medium text-charcoal-light">Design:</span>
                  <p className="text-charcoal">{order.customization_details.selected_design}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Workflow Section */}
        {allowedTransitions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-charcoal mb-3">Status ändern</h3>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  disabled={isUpdating}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-gold text-white hover:bg-gold-dark disabled:opacity-50 transition-colors"
                >
                  → {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Change Form */}
        {showStatusForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-charcoal mb-3">
              Status ändern zu: {statusLabels[newStatus]}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-charcoal-light mb-1">
                  Kommentar (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={3}
                  placeholder="Interner Kommentar..."
                />
              </div>
              {newStatus === "shipped" && (
                <div>
                  <label className="block text-sm font-medium text-charcoal-light mb-1">
                    Tracking-Nummer
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Tracking-Nummer..."
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleStatusConfirm}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bestätigen"}
                </button>
                <button
                  onClick={() => setShowStatusForm(false)}
                  className="px-4 py-2 bg-slate text-white rounded-lg hover:bg-slate-dark transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="font-semibold text-charcoal mb-3">Notizen</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-charcoal-light">{order.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{
    count: number;
    results: Order[];
    next: string | null;
    previous: string | null;
  }>({
    queryKey: ["admin", "orders", { searchQuery, statusFilter, dateFrom, dateTo, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      params.append("page", page.toString());

      const response = await fetch(`/api/admin/orders/?${params}`, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const { data: selectedOrder, isLoading: isDetailLoading } = useQuery<Order>({
    queryKey: ["admin", "orders", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      const response = await fetch(`/api/admin/orders/${selectedOrderId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch order details");
      return response.json();
    },
    enabled: !!selectedOrderId,
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      comment, 
      trackingNumber 
    }: { 
      orderId: number; 
      status: string; 
      comment?: string; 
      trackingNumber?: string;
    }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({ status, comment, tracking_number: trackingNumber }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Status erfolgreich aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      if (selectedOrderId) {
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", selectedOrderId] });
      }
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Status");
    },
  });

  const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    paid: "Bezahlt",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    delivered: "Zugestellt",
    cancelled: "Storniert",
    refunded: "Erstattet",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-orange-100 text-orange-700",
  };

  const totalPages = Math.ceil((ordersData?.count || 0) / 20);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
        <div className="bg-white rounded-xl p-4 space-y-4">
          <div className="h-4 bg-slate/20 rounded animate-pulse"></div>
          <div className="h-4 bg-slate/20 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Bestellungen</h1>
        <p className="text-charcoal-light mt-1">
          Verwalten Sie Kundenbestellungen und deren Status ({ordersData?.count || 0} Gesamt)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-charcoal-light mb-2">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Suche (Name, Email, Nr.)"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Alle Status</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Von"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Bis"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Bestellung</th>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Kunde</th>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Datum</th>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Betrag</th>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Status</th>
              <th className="text-left py-3 px-4 text-charcoal-light font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {ordersData?.results?.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-gray-200 hover:bg-gray-50/30 cursor-pointer"
                onClick={() => setSelectedOrderId(order.id)}
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-xs text-charcoal-light">#{order.order_number.slice(0, 8)}</span>
                </td>
                <td className="py-3 px-4">
                  <p className="text-charcoal font-medium">{order.first_name} {order.last_name}</p>
                  <p className="text-xs text-charcoal-light">{order.email}</p>
                </td>
                <td className="py-3 px-4 text-charcoal-light">
                  {format(new Date(order.created_at), "dd.MM.yyyy", { locale: de })}
                </td>
                <td className="py-3 px-4 text-charcoal font-medium">
                  €{order.total}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrderId(order.id);
                    }}
                    className="text-gold hover:text-gold-dark text-sm font-medium"
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
        <div className="flex items-center justify-between bg-white rounded-xl p-4">
          <div className="text-sm text-charcoal-light">
            Seite {page} von {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gold text-white rounded-lg hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gold text-white rounded-lg hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!ordersData?.results?.length && (
        <div className="text-center py-12 bg-white rounded-xl">
          <ShoppingBag className="w-12 h-12 text-charcoal-light-light mx-auto mb-4" />
          <p className="text-charcoal-light">Keine Bestellungen gefunden</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !isDetailLoading && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdate={(orderId, status, comment, trackingNumber) => 
            statusUpdateMutation.mutate({ orderId, status, comment, trackingNumber })
          }
          isUpdating={statusUpdateMutation.isPending}
        />
      )}

      {/* Detail Loading Skeleton */}
      {isDetailLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-elegant p-6 w-full max-w-2xl mt-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-slate/20 rounded w-3/4"></div>
              <div className="h-4 bg-slate/20 rounded w-1/2"></div>
              <div className="h-32 bg-slate/20 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}