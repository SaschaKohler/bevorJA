import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  LogOut,
  Save,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  ShoppingBag,
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Star,
  Upload,
  Eye,
} from "lucide-react";
import {
  getHomeContent,
  getProducts,
  orderLookup,
  updateProduct,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  updateProductImage,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  uploadSectionImage,
  deleteSectionImage,
  adminLogin,
} from "@/lib/api";
import type {
  HomeContent,
  Product,
  Order,
  ProductImage,
  CustomSection,
  TemplatType,
} from "@/types";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

const TEMPLATE_OPTIONS: { value: TemplatType; label: string; icon: string }[] = [
  { value: "hero", label: "Hero \u2013 Vollbild mit Titel & CTA", icon: "H" },
  { value: "text_image_left", label: "Text + Bild (Bild links)", icon: "TL" },
  { value: "text_image_right", label: "Text + Bild (Bild rechts)", icon: "TR" },
  { value: "features_grid", label: "Features-Grid (3\u20134 Spalten)", icon: "FG" },
  { value: "testimonials", label: "Testimonials / Bewertungen", icon: "TS" },
  { value: "faq", label: "FAQ Accordion", icon: "FA" },
  { value: "gallery", label: "Bildgalerie", icon: "GA" },
  { value: "timeline", label: "Timeline / Ablauf", icon: "TI" },
  { value: "countdown", label: "Countdown Timer", icon: "CD" },
  { value: "video", label: "Video Embed", icon: "VI" },
  { value: "pricing", label: "Pricing-Tabelle", icon: "PR" },
  { value: "contact", label: "Kontakt-Formular", icon: "CO" },
];

function getDefaultContent(templateType: TemplatType): Record<string, unknown> {
  switch (templateType) {
    case "hero":
      return { headline: "", subtitle: "", description: "", button_text: "", button_url: "" };
    case "text_image_left":
    case "text_image_right":
      return { headline: "", text: "", button_text: "", button_url: "" };
    case "features_grid":
      return { headline: "", features: [{ icon: "Star", title: "", description: "" }] };
    case "testimonials":
      return { headline: "", items: [{ name: "", text: "", rating: 5 }] };
    case "faq":
      return { headline: "", items: [{ question: "", answer: "" }] };
    case "gallery":
      return { headline: "", caption: "" };
    case "timeline":
      return { headline: "", steps: [{ title: "", description: "", date: "" }] };
    case "countdown":
      return { headline: "", target_date: "", description: "" };
    case "video":
      return { headline: "", video_url: "", caption: "" };
    case "pricing":
      return { headline: "", tiers: [{ name: "", price: "", features: [""], cta: "" }] };
    case "contact":
      return { headline: "", description: "", recipient_email: "" };
    default:
      return {};
  }
}

type AdminTab = "content" | "products" | "orders" | "sections";

export default function Admin() {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem("admin_token");
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("admin_token");
  });
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("content");
  const [content, setContent] = useState<HomeContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentData, productsData] = await Promise.all([
        getHomeContent(),
        getProducts(),
      ]);
      setContent(contentData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await adminLogin(password);
      localStorage.setItem("admin_token", result.token);
      setAuthToken(result.token);
      setIsAuthenticated(true);
    } catch {
      alert("Falsches Passwort");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthToken(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleContentUpdate = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSuccess("\u00c4nderungen gespeichert!");
    }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-elegant max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl text-charcoal">Admin Login</h1>
            <p className="text-slate mt-2">Vorja Content Management</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full px-4 py-3 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <button type="submit" className="w-full btn-elegant">
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-gold/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl text-charcoal">Vorja Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate hover:text-rose-gold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Abmelden</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            {([
              { key: "content" as const, icon: FileText, label: "Seiteninhalte" },
              { key: "products" as const, icon: Package, label: "Produkte" },
              { key: "sections" as const, icon: Layers, label: "Sections" },
              { key: "orders" as const, icon: ShoppingBag, label: "Bestellungen" },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === key ? "bg-gold/10 text-gold-dark" : "text-slate hover:bg-gold/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : activeTab === "content" ? (
            <ContentEditor content={content} onUpdate={handleContentUpdate} saving={saving} />
          ) : activeTab === "products" ? (
            <ProductEditor products={products} onUpdate={loadData} onSuccess={showSuccess} />
          ) : activeTab === "sections" ? (
            <SectionManager onSuccess={showSuccess} token={authToken || ""} />
          ) : (
            <OrderLookupTab />
          )}
        </main>
      </div>
    </div>
  );
}

function ContentEditor({
  content,
  saving,
  onUpdate,
}: {
  content: HomeContent | null;
  onUpdate: () => void;
  saving: boolean;
}) {
  if (!content) return <div>Keine Daten verf\u00fcgbar</div>;
  const hero = content.sections?.hero || {};
  const cta = content.sections?.cta || {};
  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl text-charcoal">Seiteninhalte bearbeiten</h2>
      <section className="bg-white rounded-xl p-6 shadow-elegant">
        <h3 className="font-serif text-lg text-charcoal mb-4 pb-2 border-b border-gold/20">Hero Bereich</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Titel</label>
            <input type="text" defaultValue={hero.title?.content || ""} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Untertitel</label>
            <input type="text" defaultValue={hero.subtitle?.content || ""} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Beschreibung</label>
            <textarea defaultValue={hero.description?.content || ""} rows={3} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Button Text</label>
            <input type="text" defaultValue={hero.button_text?.content || ""} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
        </div>
      </section>
      <section className="bg-white rounded-xl p-6 shadow-elegant">
        <h3 className="font-serif text-lg text-charcoal mb-4 pb-2 border-b border-gold/20">Call-to-Action Bereich</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Titel</label>
            <input type="text" defaultValue={cta.cta_title?.content || ""} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Beschreibung</label>
            <textarea defaultValue={cta.cta_description?.content || ""} rows={3} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Button Text</label>
            <input type="text" defaultValue={cta.cta_button?.content || ""} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
        </div>
      </section>
      <div className="flex justify-end">
        <button onClick={onUpdate} disabled={saving} className="btn-elegant flex items-center gap-2 disabled:opacity-50">
          {saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Speichern...</>
          ) : (
            <><Save className="w-5 h-5" />\u00c4nderungen speichern</>
          )}
        </button>
      </div>
    </div>
  );
}

function OrderLookupTab() {
  const [email, setEmail] = useState(() => localStorage.getItem("buyer_email") || "");
  const [orderNumber, setOrderNumber] = useState(() => localStorage.getItem("buyer_order_number") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const result = await orderLookup({ email, order_number: orderNumber });
      setOrder(result);
      localStorage.setItem("buyer_email", email);
      localStorage.setItem("buyer_order_number", orderNumber);
    } catch {
      setError("Bestellung nicht gefunden. Bitte \u00fcberpr\u00fcfen Sie E-Mail und Bestellnummer.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl text-charcoal">Bestellung nachschlagen</h2>
      <div className="bg-white rounded-xl p-6 shadow-elegant">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">E-Mail Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.at" required className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Bestellnummer</label>
            <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="z.B. a1b2c3d4-e5f6-..." required className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-elegant flex items-center gap-2 disabled:opacity-50">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Suchen...</>
            ) : (
              <><ShoppingBag className="w-5 h-5" />Bestellung suchen</>
            )}
          </button>
        </form>
      </div>
      {order && (
        <div className="bg-white rounded-xl p-6 shadow-elegant space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-charcoal">Bestelldetails</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate">Bestellnummer</span>
              <p className="text-charcoal font-mono text-xs mt-1">{order.order_number}</p>
            </div>
            <div>
              <span className="text-slate">Datum</span>
              <p className="text-charcoal mt-1">{new Date(order.created_at).toLocaleDateString("de-AT")}</p>
            </div>
            <div>
              <span className="text-slate">Name</span>
              <p className="text-charcoal mt-1">{order.first_name} {order.last_name}</p>
            </div>
            <div>
              <span className="text-slate">Adresse</span>
              <p className="text-charcoal mt-1">{order.street}, {order.zip_code} {order.city}</p>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-4">
            <h4 className="font-serif text-charcoal mb-3">Produkte</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-charcoal">{item.product_detail.name}</p>
                    <p className="text-slate text-sm">Menge: {item.quantity}</p>
                  </div>
                  <span className="text-charcoal font-medium">{"\u20AC"}{item.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold/10">
              <span className="font-serif text-charcoal">Gesamt</span>
              <span className="font-serif text-xl text-gold-dark">{"\u20AC"}{order.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductEditor({
  products,
  onUpdate,
  onSuccess,
}: {
  products: Product[];
  onUpdate: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl text-charcoal">Produkte verwalten</h2>
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-6 shadow-elegant flex items-center gap-6">
            <div className="w-20 h-20 bg-cream rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-light" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-charcoal">{product.name}</h3>
              <p className="text-slate text-sm">{product.card_count} Karten {"\u2022"} {"\u20AC"}{product.price}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                {product.is_active ? "Aktiv" : "Inaktiv"}
              </span>
              <button onClick={() => setEditingProduct(product)} className="px-4 py-2 bg-gold/10 text-gold-dark rounded-lg hover:bg-gold/20 transition-colors">
                Bearbeiten
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => { setEditingProduct(null); onUpdate(); onSuccess("Produkt gespeichert!"); }}
        />
      )}
    </div>
  );
}

function ProductEditModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description);
  const [cardCount, setCardCount] = useState(String(product.card_count));
  const [price, setPrice] = useState(String(product.price));
  const [features, setFeatures] = useState<string[]>(product.features || []);
  const [isActive, setIsActive] = useState(product.is_active);
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProductImages(product.slug).then(setGalleryImages).catch(() => {});
  }, [product.slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProduct(product.id, {
        name, slug, description,
        card_count: Number(cardCount),
        price, features, is_active: isActive,
      });
      onSave();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const img = await uploadProductImage(product.slug, formData, "");
      setGalleryImages((prev) => [...prev, img]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteProductImage(product.slug, imageId, "");
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await updateProductImage(product.slug, imageId, { is_primary: true }, "");
      setGalleryImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === imageId })));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, val: string) => setFeatures(features.map((f, i) => (i === idx ? val : f)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-charcoal">{product.name} bearbeiten</h3>
          <button onClick={onClose} className="text-slate hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Beschreibung</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Kartenanzahl</label>
              <input type="number" value={cardCount} onChange={(e) => setCardCount(e.target.value)} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate mb-2">Preis</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate">Aktiv</label>
            <button onClick={() => setIsActive(!isActive)} className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate">Features</label>
              <button onClick={addFeature} className="text-gold-dark hover:text-gold text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Hinzuf\u00fcgen
              </button>
            </div>
            <div className="space-y-2">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={feature} onChange={(e) => updateFeature(idx, e.target.value)} className="flex-1 px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" placeholder="Feature eingeben..." />
                  <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate">Galerie-Bilder</label>
              <button onClick={() => fileInputRef.current?.click()} className="text-gold-dark hover:text-gold text-sm flex items-center gap-1">
                <Upload className="w-4 h-4" /> Bild hochladen
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url || img.image} alt={img.alt_text || ""} className={`w-full h-24 object-cover rounded-lg border-2 ${img.is_primary ? "border-gold" : "border-transparent"}`} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button onClick={() => handleSetPrimary(img.id)} className="text-white hover:text-gold" title="Als Hauptbild"><Star className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteImage(img.id)} className="text-white hover:text-red-400" title="L\u00f6schen"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-gold text-white text-xs px-1.5 py-0.5 rounded">Hauptbild</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gold/20 text-slate rounded-lg hover:bg-cream transition-colors">Abbrechen</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-elegant flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Speichern...</>
            ) : (
              <><Save className="w-5 h-5" />Speichern</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionManager({ onSuccess, token }: { onSuccess: (msg: string) => void; token: string }) {
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);

  const loadSections = async () => {
    try {
      const data = await getSections();
      setSections(data);
    } catch (error) {
      console.error("Failed to load sections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSections(); }, []);

  const handleCreateSection = async (templateType: TemplatType) => {
    setShowTemplateModal(false);
    try {
      const newSection = await createSection({
        title: "Neue Section",
        anchor: `section-${Date.now()}`,
        template_type: templateType,
        content: getDefaultContent(templateType),
        order: sections.length,
        is_active: true,
      }, token);
      setSections((prev) => [...prev, newSection]);
      setEditingSection(newSection);
      onSuccess("Section erstellt!");
    } catch (error) {
      console.error("Create failed:", error);
    }
  };

  const handleUpdateSection = async (section: CustomSection) => {
    try {
      const updated = await updateSection(section.id, {
        title: section.title,
        anchor: section.anchor,
        template_type: section.template_type,
        content: section.content,
        order: section.order,
        is_active: section.is_active,
      }, token);
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSection(null);
      onSuccess("Section gespeichert!");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm("Section wirklich l\u00f6schen?")) return;
    try {
      await deleteSection(id, token);
      setSections((prev) => prev.filter((s) => s.id !== id));
      onSuccess("Section gel\u00f6scht!");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const moveSection = async (idx: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newSections.length) return;
    const tempOrder = newSections[idx].order;
    newSections[idx] = { ...newSections[idx], order: newSections[swapIdx].order };
    newSections[swapIdx] = { ...newSections[swapIdx], order: tempOrder };
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections);
    try {
      await Promise.all([
        updateSection(newSections[idx].id, { order: newSections[idx].order }, token),
        updateSection(newSections[swapIdx].id, { order: newSections[swapIdx].order }, token),
      ]);
    } catch (error) {
      console.error("Reorder failed:", error);
      loadSections();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-charcoal">Sections verwalten</h2>
        <button onClick={() => setShowTemplateModal(true)} className="btn-elegant flex items-center gap-2">
          <Plus className="w-5 h-5" />Neue Section
        </button>
      </div>
      {sections.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-elegant text-center">
          <Layers className="w-12 h-12 text-slate-light mx-auto mb-4" />
          <p className="text-slate">Noch keine Sections erstellt.</p>
          <button onClick={() => setShowTemplateModal(true)} className="mt-4 text-gold-dark hover:text-gold font-medium">
            Erste Section erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white rounded-xl p-4 shadow-elegant flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(idx, "up")} disabled={idx === 0} className="text-slate hover:text-gold-dark disabled:opacity-30">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveSection(idx, "down")} disabled={idx === sections.length - 1} className="text-slate hover:text-gold-dark disabled:opacity-30">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-charcoal">{section.title}</h3>
                  <span className="text-xs text-slate bg-cream px-2 py-0.5 rounded">#{section.anchor}</span>
                </div>
                <p className="text-slate text-sm">{section.template_type_display}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${section.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {section.is_active ? "Aktiv" : "Inaktiv"}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingSection(section)} className="px-3 py-1.5 bg-gold/10 text-gold-dark rounded-lg hover:bg-gold/20 transition-colors text-sm">
                  Bearbeiten
                </button>
                <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showTemplateModal && (
        <TemplateSelectionModal onSelect={handleCreateSection} onClose={() => setShowTemplateModal(false)} />
      )}
      {editingSection && (
        <SectionEditModal section={editingSection} onClose={() => setEditingSection(null)} onSave={handleUpdateSection} token={token} />
      )}
    </div>
  );
}

function TemplateSelectionModal({
  onSelect,
  onClose,
}: {
  onSelect: (t: TemplatType) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-charcoal">Template ausw\u00e4hlen</h3>
          <button onClick={onClose} className="text-slate hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {TEMPLATE_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => onSelect(opt.value)} className="p-4 border border-gold/20 rounded-xl hover:border-gold hover:bg-gold/5 transition-all text-left group">
              <div className="text-2xl mb-2 font-bold text-gold">{opt.icon}</div>
              <p className="font-serif text-charcoal text-sm group-hover:text-gold-dark">{opt.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionEditModal({
  section,
  onClose,
  onSave,
  token,
}: {
  section: CustomSection;
  onClose: () => void;
  onSave: (section: CustomSection) => void;
  token: string;
}) {
  const [title, setTitle] = useState(section.title);
  const [anchor, setAnchor] = useState(section.anchor);
  const [isActive, setIsActive] = useState(section.is_active);
  const [content, setContent] = useState<Record<string, unknown>>(
    section.content || getDefaultContent(section.template_type)
  );
  const [sectionImages, setSectionImages] = useState(section.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateContentField = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const img = await uploadSectionImage(section.id, formData, token);
      setSectionImages((prev) => [...prev, img as CustomSection["images"][number]]);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteSectionImage(section.id, imageId, token);
      setSectionImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleSave = () => {
    onSave({ ...section, title, anchor, is_active: isActive, content });
  };

  const renderContentFields = () => {
    switch (section.template_type) {
      case "hero":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <InputField label="Subtitle" value={(content.subtitle as string) || ""} onChange={(v) => updateContentField("subtitle", v)} />
            <TextareaField label="Beschreibung" value={(content.description as string) || ""} onChange={(v) => updateContentField("description", v)} />
            <InputField label="Button Text" value={(content.button_text as string) || ""} onChange={(v) => updateContentField("button_text", v)} />
            <InputField label="Button URL" value={(content.button_url as string) || ""} onChange={(v) => updateContentField("button_url", v)} />
          </>
        );
      case "text_image_left":
      case "text_image_right":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <TextareaField label="Text" value={(content.text as string) || ""} onChange={(v) => updateContentField("text", v)} />
            <InputField label="Button Text" value={(content.button_text as string) || ""} onChange={(v) => updateContentField("button_text", v)} />
            <InputField label="Button URL" value={(content.button_url as string) || ""} onChange={(v) => updateContentField("button_url", v)} />
          </>
        );
      case "features_grid":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <DynamicListField label="Features" items={(content.features as Array<Record<string, unknown>>) || []} onUpdate={(items) => updateContentField("features", items)} fields={["icon", "title", "description"]} defaults={{ icon: "Star", title: "", description: "" }} />
          </>
        );
      case "testimonials":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <DynamicListField label="Testimonials" items={(content.items as Array<Record<string, unknown>>) || []} onUpdate={(items) => updateContentField("items", items)} fields={["name", "text", "rating"]} defaults={{ name: "", text: "", rating: 5 }} />
          </>
        );
      case "faq":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <DynamicListField label="FAQ Eintr\u00e4ge" items={(content.items as Array<Record<string, unknown>>) || []} onUpdate={(items) => updateContentField("items", items)} fields={["question", "answer"]} defaults={{ question: "", answer: "" }} />
          </>
        );
      case "gallery":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <InputField label="Caption" value={(content.caption as string) || ""} onChange={(v) => updateContentField("caption", v)} />
          </>
        );
      case "timeline":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <DynamicListField label="Schritte" items={(content.steps as Array<Record<string, unknown>>) || []} onUpdate={(items) => updateContentField("steps", items)} fields={["title", "description", "date"]} defaults={{ title: "", description: "", date: "" }} />
          </>
        );
      case "countdown":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <InputField label="Zieldatum (ISO)" value={(content.target_date as string) || ""} onChange={(v) => updateContentField("target_date", v)} />
            <TextareaField label="Beschreibung" value={(content.description as string) || ""} onChange={(v) => updateContentField("description", v)} />
          </>
        );
      case "video":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <InputField label="Video URL" value={(content.video_url as string) || ""} onChange={(v) => updateContentField("video_url", v)} />
            <InputField label="Caption" value={(content.caption as string) || ""} onChange={(v) => updateContentField("caption", v)} />
          </>
        );
      case "pricing":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <DynamicListField label="Pricing Tiers" items={(content.tiers as Array<Record<string, unknown>>) || []} onUpdate={(items) => updateContentField("tiers", items)} fields={["name", "price", "cta"]} defaults={{ name: "", price: "", features: [""], cta: "" }} />
          </>
        );
      case "contact":
        return (
          <>
            <InputField label="Headline" value={(content.headline as string) || ""} onChange={(v) => updateContentField("headline", v)} />
            <TextareaField label="Beschreibung" value={(content.description as string) || ""} onChange={(v) => updateContentField("description", v)} />
            <InputField label="Empf\u00e4nger E-Mail" value={(content.recipient_email as string) || ""} onChange={(v) => updateContentField("recipient_email", v)} />
          </>
        );
      default:
        return <p className="text-slate text-sm">Keine Felder f\u00fcr dieses Template.</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-charcoal">Section bearbeiten</h3>
          <button onClick={onClose} className="text-slate hover:text-charcoal"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Titel" value={title} onChange={setTitle} />
            <InputField label="Anchor (URL)" value={anchor} onChange={setAnchor} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate">Aktiv</label>
            <button onClick={() => setIsActive(!isActive)} className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? "bg-green-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="bg-cream/50 rounded-lg p-4 flex items-center gap-2 text-sm text-slate">
            <Eye className="w-4 h-4" />
            <span>Template: <strong>{section.template_type_display}</strong> | Anchor: <code>#{anchor}</code></span>
          </div>
          <div className="border-t border-gold/10 pt-4 space-y-4">
            <h4 className="font-serif text-charcoal">Inhalt</h4>
            {renderContentFields()}
          </div>
          <div className="border-t border-gold/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif text-charcoal">Bilder</h4>
              <button onClick={() => fileInputRef.current?.click()} className="text-gold-dark hover:text-gold text-sm flex items-center gap-1">
                <Upload className="w-4 h-4" /> Bild hochladen
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {sectionImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url || img.image} alt={img.alt_text || ""} className="w-full h-24 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button onClick={() => handleDeleteImage(img.id)} className="text-white hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gold/20 text-slate rounded-lg hover:bg-cream transition-colors">Abbrechen</button>
          <button onClick={handleSave} className="flex-1 btn-elegant">
            <Save className="w-5 h-5 inline mr-2" />Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50" />
    </div>
  );
}

function DynamicListField({
  label,
  items,
  onUpdate,
  fields,
  defaults,
}: {
  label: string;
  items: Record<string, unknown>[];
  onUpdate: (items: Record<string, unknown>[]) => void;
  fields: string[];
  defaults: Record<string, unknown>;
}) {
  const addItem = () => onUpdate([...items, { ...defaults }]);
  const removeItem = (idx: number) => onUpdate(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: unknown) =>
    onUpdate(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate">{label}</label>
        <button onClick={addItem} className="text-gold-dark hover:text-gold text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> Hinzuf\u00fcgen
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-cream/30 p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate">#{idx + 1}</span>
              <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
            </div>
            {fields.map((field) => (
              <input key={field} type="text" value={String(item[field] ?? "")} onChange={(e) => updateItem(idx, field, e.target.value)} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} className="w-full px-3 py-1.5 border border-gold/20 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
