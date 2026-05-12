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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
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
      <Toaster position="top-right" />
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Products */}
          <Route path="/occasions" element={<OccasionsTab />} />
          <Route path="/boxtypes" element={<BoxTypesTab />} />
          <Route path="/cardpackages" element={<CardPackagesTab />} />
          <Route path="/variants" element={<ProductVariantsTab />} />
          
          {/* Orders */}
          <Route path="/orders" element={<OrdersTab />} />
          
          {/* Placeholder routes */}
          <Route path="/pages" element={<PlaceholderTab title="Seiten" />} />
          <Route path="/sections" element={<PlaceholderTab title="Sections" />} />
          <Route path="/content" element={<PlaceholderTab title="Inhalte" />} />
          <Route path="/mediathek" element={<PlaceholderTab title="Mediathek" />} />
          <Route path="/customers" element={<PlaceholderTab title="Kunden" />} />
          <Route path="/users" element={<PlaceholderTab title="Benutzer" />} />
          <Route path="/settings" element={<PlaceholderTab title="Einstellungen" />} />
        </Routes>
      </AdminLayout>
    </QueryClientProvider>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <h2 className="font-display text-xl text-charcoal dark:text-white mb-4">{title}</h2>
      <p className="text-slate">Dieser Bereich wird in Kürze implementiert.</p>
    </div>
  );
}

export default AdminRoutes;
