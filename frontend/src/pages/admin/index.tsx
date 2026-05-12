import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import AdminLogin from "./AdminLogin";
import OccasionsTab from "./products/OccasionsTab";
import BoxTypesTab from "./products/BoxTypesTab";
import CardPackagesTab from "./products/CardPackagesTab";
import ProductVariantsTab from "./products/ProductVariantsTab";
import OrdersTab from "./orders/OrdersTab";
import SectionsTab from "./content/SectionsTab";
import SiteContentTab from "./content/SiteContentTab";
import PagesTab from "./content/PagesTab";
import MediathekTab from "./content/MediathekTab";
import CustomersTab from "./customers/CustomersTab";
import SettingsTab from "./settings/SettingsTab";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401 or 404
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("404"))) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function AdminRoutes() {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    return <AdminLogin />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#3d3128",
            border: "1px solid rgba(212, 165, 116, 0.2)",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
        }}
      />
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products */}
          <Route path="/occasions" element={<OccasionsTab />} />
          <Route path="/boxtypes" element={<BoxTypesTab />} />
          <Route path="/cardpackages" element={<CardPackagesTab />} />
          <Route path="/variants" element={<ProductVariantsTab />} />

          {/* Orders & Customers */}
          <Route path="/orders" element={<OrdersTab />} />
          <Route path="/customers" element={<CustomersTab />} />

          {/* Content */}
          <Route path="/sections" element={<SectionsTab />} />
          <Route path="/content" element={<SiteContentTab />} />
          <Route path="/pages" element={<PagesTab />} />
          <Route path="/mediathek" element={<MediathekTab />} />

          {/* System */}
          <Route path="/users" element={<PlaceholderTab title="Benutzer" description="Benutzerverwaltung wird in Kürze implementiert." />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </AdminLayout>
    </QueryClientProvider>
  );
}

function PlaceholderTab({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <h2 className="font-display text-xl text-charcoal dark:text-white mb-4">{title}</h2>
      <p className="text-slate">{description || "Dieser Bereich wird in Kürze implementiert."}</p>
    </div>
  );
}

export default AdminRoutes;
