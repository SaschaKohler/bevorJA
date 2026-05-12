import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/store/cart";
import { OccasionProvider } from "@/store/occasion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrderLookupPage from "@/pages/OrderLookupPage";
import AdminRoutes from "@/pages/admin";

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  
  if (isAdmin) {
    // For admin routes, just render the outlet (child routes)
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produkte" element={<Products />} />
          <Route path="/produkte/:slug" element={<ProductDetail />} />
          <Route path="/warenkorb" element={<Cart />} />
          <Route path="/kasse" element={<Checkout />} />
          <Route path="/bestellung/erfolg" element={<OrderConfirmation />} />
          <Route path="/bestellung/suchen" element={<OrderLookupPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <OccasionProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </CartProvider>
    </OccasionProvider>
  );
}
