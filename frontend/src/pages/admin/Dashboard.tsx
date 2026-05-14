import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import { de } from "date-fns/locale";
import type { DashboardStats, ChartData } from "@/types";

const COLORS = ["#D4AF37", "#B8941D", "#8B7355", "#B76E79"];

function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-charcoal-light uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-display text-charcoal mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trendUp ? "text-green-600" : "text-rose-gold"}`}>
              {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trend}</span>
            </div>
          )}
          {description && <p className="text-xs text-charcoal-light mt-2">{description}</p>}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-gold-dark" />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100 animate-pulse h-80">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-48 bg-gray-100 rounded mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: chartData } = useQuery<ChartData>({
    queryKey: ["admin", "charts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/charts/?days=7", {
        headers: {
          Authorization: `Token ${localStorage.getItem("admin_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch charts");
      return response.json();
    },
  });

  // Fallback data for development
  const revenueData = chartData?.revenue ||
    [...Array(7)].map((_, i) => ({
      date: format(subDays(new Date(), 6 - i), "EEE", { locale: de }),
      amount: Math.floor(Math.random() * 1000) + 500,
    }));

  const orderStatusData = chartData?.orderStatus || [
    { name: "Ausstehend", value: 12, color: "#fbbf24" },
    { name: "Bezahlt", value: 8, color: "#22c55e" },
    { name: "In Bearbeitung", value: 5, color: "#3b82f6" },
    { name: "Versendet", value: 15, color: "#a855f7" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  const statValues = stats || {
    revenue: { today: 0, thisWeek: 0, thisMonth: 0, trend: 0 },
    orders: { pending: 0, processing: 0, shipped: 0, totalToday: 0 },
    products: { activeVariants: 0, totalOccasions: 0, totalBoxTypes: 0 },
    customers: { total: 0, newThisMonth: 0 },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
          <p className="text-sm text-charcoal-light mt-1">
            Willkommen zurück! Hier ist die Übersicht Ihres Geschäfts.
          </p>
        </div>
        <p className="text-sm text-charcoal-light bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
          {format(new Date(), "dd.MM.yyyy, HH:mm")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Umsatz heute"
          value={`€${statValues.revenue.today.toFixed(2)}`}
          trend={`${statValues.revenue.trend > 0 ? "+" : ""}${statValues.revenue.trend.toFixed(1)}%`}
          trendUp={statValues.revenue.trend >= 0}
          icon={CreditCard}
          description="vs. gestern"
        />
        <StatCard
          title="Offene Bestellungen"
          value={String(statValues.orders.pending + statValues.orders.processing)}
          icon={ShoppingBag}
          description={`${statValues.orders.pending} ausstehend, ${statValues.orders.processing} in Bearbeitung`}
        />
        <StatCard
          title="Aktive Produkte"
          value={String(statValues.products.activeVariants)}
          trend={`${statValues.products.totalOccasions} Anlässe`}
          trendUp={true}
          icon={Package}
          description={`${statValues.products.totalBoxTypes} Box-Typen`}
        />
        <StatCard
          title="Kunden"
          value={String(statValues.customers.total)}
          trend={`+${statValues.customers.newThisMonth} diesen Monat`}
          trendUp={true}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100">
          <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Umsatz (7 Tage)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `€${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`€${Number(value)}`, "Umsatz"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#d4a574"
                  strokeWidth={2}
                  dot={{ fill: "#d4a574", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100">
          <h3 className="font-serif text-lg text-charcoal mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            Bestellstatus
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {orderStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                />
                <span className="text-charcoal font-medium">
                  {entry.name}: <span className="text-charcoal-light">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-elegant border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-charcoal flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Neueste Bestellungen
          </h3>
          <a href="/admin/orders" className="text-gold-dark hover:text-gold text-sm">
            Alle anzeigen
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-charcoal-light font-semibold uppercase text-xs tracking-wider">Bestellung</th>
                <th className="text-left py-3 px-4 text-charcoal-light font-semibold uppercase text-xs tracking-wider">Kunde</th>
                <th className="text-left py-3 px-4 text-charcoal-light font-semibold uppercase text-xs tracking-wider">Datum</th>
                <th className="text-left py-3 px-4 text-charcoal-light font-semibold uppercase text-xs tracking-wider">Betrag</th>
                <th className="text-left py-3 px-4 text-charcoal-light font-semibold uppercase text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gold/5 transition-colors">
                  <td className="py-3.5 px-4 text-charcoal font-semibold">
                    #{order.order_number.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-light">{order.customer_name}</td>
                  <td className="py-3.5 px-4 text-charcoal-light">
                    {format(new Date(order.created_at), "dd.MM.yyyy")}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal font-semibold">€{order.total}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-charcoal-light">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                      <span>Keine Bestellungen vorhanden</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-700" },
    paid: { label: "Bezahlt", className: "bg-green-100 text-green-700" },
    processing: { label: "In Bearbeitung", className: "bg-blue-100 text-blue-700" },
    shipped: { label: "Versendet", className: "bg-purple-100 text-purple-700" },
    delivered: { label: "Zugestellt", className: "bg-green-100 text-green-800" },
    cancelled: { label: "Storniert", className: "bg-red-100 text-red-700" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
