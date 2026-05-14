import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image,
  Package,
  Gift,
  Box,
  CreditCard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

interface NavItem {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  children?: NavItem[];
}

const adminNavigation: { group: string; items: NavItem[] }[] = [
  {
    group: "Übersicht",
    items: [{ key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" }],
  },
  {
    group: "Content",
    items: [
      { key: "pages", icon: FileText, label: "Seiten", path: "/admin/pages" },
      { key: "sections", icon: Layers, label: "Sections", path: "/admin/sections" },
      { key: "mediathek", icon: Image, label: "Mediathek", path: "/admin/mediathek" },
    ],
  },
  {
    group: "Shop",
    items: [
      { key: "variants", icon: Package, label: "Produktvarianten", path: "/admin/variants" },
      { key: "occasions", icon: Gift, label: "Anlässe", path: "/admin/occasions" },
      { key: "boxtypes", icon: Box, label: "Box-Typen", path: "/admin/boxtypes" },
      { key: "cardpackages", icon: CreditCard, label: "Kartenpakete", path: "/admin/cardpackages" },
    ],
  },
  {
    group: "Verkauf",
    items: [
      { key: "orders", icon: ShoppingBag, label: "Bestellungen", path: "/admin/orders" },
      { key: "customers", icon: Users, label: "Kunden", path: "/admin/customers" },
    ],
  },
  {
    group: "System",
    items: [
      { key: "users", icon: Users, label: "Benutzer", path: "/admin/users" },
      { key: "settings", icon: Settings, label: "Einstellungen", path: "/admin/settings" },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Übersicht", "Shop", "Verkauf"]);
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
      isActive
        ? "bg-gradient-to-r from-gold/30 to-gold/10 text-charcoal font-semibold shadow-sm border-l-2 border-gold"
        : "text-charcoal-light hover:bg-gold/5 hover:text-charcoal"
    }`;

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-charcoal" : "bg-gray-50"}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal-light hover:text-charcoal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-lg">V</span>
            </div>
            <span className="font-display text-xl text-charcoal hidden sm:block tracking-wide">
              Vorja <span className="text-gold">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100-light text-charcoal-light hover:text-charcoal dark:text-charcoal-light-light transition-colors"
              title={darkMode ? "Hellmodus" : "Dunkelmodus"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-gold/10 text-rose-gold hover:bg-rose-gold hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[65px] left-0 z-40 w-64 h-[calc(100vh-65px)] bg-white border-r border-gray-200 dark:border-gray-200 overflow-y-auto transition-transform shadow-lg lg:shadow-none ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-6">
            {adminNavigation.map(({ group, items }) => (
              <div key={group}>
                <button
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-charcoal-light uppercase tracking-wider hover:text-charcoal transition-colors border-b border-gray-100 dark:border-charcoal-light mb-2 pb-1"
                >
                  <span>{group}</span>
                  {expandedGroups.includes(group) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedGroups.includes(group) && (
                  <div className="mt-1 space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.key}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={navLinkClass}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
