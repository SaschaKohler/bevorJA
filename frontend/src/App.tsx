import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/store/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
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
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
