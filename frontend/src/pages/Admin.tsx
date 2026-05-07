import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  LogOut, 
  Save, 
  Loader2,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { getHomeContent, getProducts } from "@/lib/api";
import type { HomeContent, Product } from "@/types";

// Simple auth check - in production this should be more secure
const ADMIN_PASSWORD = "vorja2024"; // Should be moved to env

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("admin_auth") === "true";
  });
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "products">("content");
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
        getProducts()
      ]);
      setContent(contentData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      alert("Falsches Passwort");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleContentUpdate = async (_section: string, _key: string, _value: string) => {
    setSaving(true);
    // TODO: Implement actual API call with content IDs
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage("Änderungen gespeichert!");
      setTimeout(() => setSuccessMessage(""), 3000);
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
            <button
              type="submit"
              className="w-full btn-elegant"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Admin Header */}
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
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("content")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "content"
                  ? "bg-gold/10 text-gold-dark"
                  : "text-slate hover:bg-gold/5"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Seiteninhalte</span>
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "products"
                  ? "bg-gold/10 text-gold-dark"
                  : "text-slate hover:bg-gold/5"
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Produkte</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
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
          ) : (
            <ProductEditor products={products} onUpdate={loadData} />
          )}
        </main>
      </div>
    </div>
  );
}

function ContentEditor({ 
  content, 
  saving 
}: { 
  content: HomeContent | null; 
  onUpdate?: (section: string, key: string, value: string) => void;
  saving: boolean;
}) {
  if (!content) return <div>Keine Daten verfügbar</div>;

  const hero = content.sections?.hero || {};
  const cta = content.sections?.cta || {};

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl text-charcoal">Seiteninhalte bearbeiten</h2>
      
      {/* Hero Section */}
      <section className="bg-white rounded-xl p-6 shadow-elegant">
        <h3 className="font-serif text-lg text-charcoal mb-4 pb-2 border-b border-gold/20">
          Hero Bereich
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Titel</label>
            <input
              type="text"
              defaultValue={hero.title?.content || ""}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Untertitel</label>
            <input
              type="text"
              defaultValue={hero.subtitle?.content || ""}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Beschreibung</label>
            <textarea
              defaultValue={hero.description?.content || ""}
              rows={3}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">Button Text</label>
            <input
              type="text"
              defaultValue={hero.button_text?.content || ""}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white rounded-xl p-6 shadow-elegant">
        <h3 className="font-serif text-lg text-charcoal mb-4 pb-2 border-b border-gold/20">
          Call-to-Action Bereich
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Titel</label>
            <input
              type="text"
              defaultValue={cta.cta_title?.content || ""}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Beschreibung</label>
            <textarea
              defaultValue={cta.cta_description?.content || ""}
              rows={3}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate mb-2">CTA Button Text</label>
            <input
              type="text"
              defaultValue={cta.cta_button?.content || ""}
              className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          disabled={saving}
          className="btn-elegant flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Änderungen speichern
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ProductEditor({ 
  products, 
  onUpdate 
}: { 
  products: Product[]; 
  onUpdate: () => void;
}) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl text-charcoal">Produkte verwalten</h2>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl p-6 shadow-elegant flex items-center gap-6"
          >
            <div className="w-20 h-20 bg-cream rounded-lg flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-light" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-serif text-lg text-charcoal">{product.name}</h3>
              <p className="text-slate text-sm">{product.card_count} Karten • €{product.price}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.is_active 
                  ? "bg-green-100 text-green-700" 
                  : "bg-slate-100 text-slate-600"
              }`}>
                {product.is_active ? "Aktiv" : "Inaktiv"}
              </span>
              <button
                onClick={() => setEditingProduct(product)}
                className="px-4 py-2 bg-gold/10 text-gold-dark rounded-lg hover:bg-gold/20 transition-colors"
              >
                Bearbeiten
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="font-display text-xl text-charcoal mb-6">
              {editingProduct.name} bearbeiten
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={editingProduct.name}
                  className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Beschreibung</label>
                <textarea
                  defaultValue={editingProduct.description}
                  rows={4}
                  className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-2">Preis (€)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.price}
                  className="w-full px-4 py-2 border border-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-3 border border-gold/20 text-slate rounded-lg hover:bg-cream transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  onUpdate();
                }}
                className="flex-1 btn-elegant"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
