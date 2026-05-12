import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Globe, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { AdminSettings } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FullAdminSettings extends AdminSettings {
  shop: AdminSettings["shop"] & {
    free_shipping_threshold: number;
  };
  seo: AdminSettings["seo"] & {
    analytics_code: string;
  };
  email: {
    from_email: string;
    from_name: string;
  };
}

const DEFAULT_SETTINGS: FullAdminSettings = {
  shop: {
    currency: "EUR",
    tax_rate: 19,
    shipping_cost: 4.9,
    free_shipping_threshold: 50,
  },
  seo: {
    meta_title: "",
    meta_description: "",
    analytics_code: "",
  },
  email: {
    from_email: "",
    from_name: "",
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const authHeader = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
  "Content-Type": "application/json",
});

// ─── Shared Input Styles ───────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white";

const labelClass = "block text-sm font-medium text-slate mb-1.5";

// ─── Field with prefix/suffix ─────────────────────────────────────────────────

function Adornment({
  adornment,
  position,
}: {
  adornment: string;
  position: "prefix" | "suffix";
}) {
  return (
    <span
      className={`px-3 py-2.5 text-sm text-slate bg-cream dark:bg-charcoal-light border-gold/20 dark:border-gold/10 select-none ${
        position === "prefix"
          ? "border-r rounded-l-lg border border-y border-l"
          : "border-l rounded-r-lg border border-y border-r"
      }`}
    >
      {adornment}
    </span>
  );
}

function AdornedInput({
  prefix,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string; suffix?: string }) {
  return (
    <div className="flex items-stretch border border-gold/20 dark:border-gold/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold/50">
      {prefix && <Adornment adornment={prefix} position="prefix" />}
      <input
        {...props}
        className="flex-1 px-4 py-2.5 bg-white dark:bg-charcoal text-charcoal dark:text-white focus:outline-none text-sm"
      />
      {suffix && <Adornment adornment={suffix} position="suffix" />}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type TabKey = "shop" | "seo" | "email";

const TABS: { key: TabKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "shop", label: "Shop-Einstellungen", Icon: ShoppingBag },
  { key: "seo", label: "SEO", Icon: Globe },
  { key: "email", label: "Email", Icon: Mail },
];

// ─── Section Cards ─────────────────────────────────────────────────────────────

function ShopSection({
  data,
  onChange,
}: {
  data: FullAdminSettings["shop"];
  onChange: (val: FullAdminSettings["shop"]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Währung</label>
        <input
          type="text"
          value={data.currency}
          onChange={(e) => onChange({ ...data, currency: e.target.value })}
          placeholder="EUR"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Steuersatz</label>
        <AdornedInput
          type="number"
          value={data.tax_rate}
          onChange={(e) => onChange({ ...data, tax_rate: Number(e.target.value) })}
          placeholder="19"
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />
      </div>
      <div>
        <label className={labelClass}>Versandkosten</label>
        <AdornedInput
          type="number"
          value={data.shipping_cost}
          onChange={(e) => onChange({ ...data, shipping_cost: Number(e.target.value) })}
          placeholder="4.90"
          min={0}
          step={0.01}
          prefix="€"
        />
      </div>
      <div>
        <label className={labelClass}>Kostenloser Versand ab</label>
        <AdornedInput
          type="number"
          value={data.free_shipping_threshold}
          onChange={(e) => onChange({ ...data, free_shipping_threshold: Number(e.target.value) })}
          placeholder="50"
          min={0}
          step={1}
          prefix="€"
        />
      </div>
    </div>
  );
}

function SeoSection({
  data,
  onChange,
}: {
  data: FullAdminSettings["seo"];
  onChange: (val: FullAdminSettings["seo"]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass.replace("mb-1.5", "")}>Standard Meta-Titel</label>
          <span className={`text-xs ${data.meta_title.length > 60 ? "text-rose-gold" : "text-slate"}`}>
            {data.meta_title.length}/70
          </span>
        </div>
        <input
          type="text"
          value={data.meta_title}
          onChange={(e) => onChange({ ...data, meta_title: e.target.value.slice(0, 70) })}
          placeholder="Seitentitel für alle Seiten"
          maxLength={70}
          className={inputClass}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass.replace("mb-1.5", "")}>Standard Meta-Beschreibung</label>
          <span className={`text-xs ${data.meta_description.length > 140 ? "text-rose-gold" : "text-slate"}`}>
            {data.meta_description.length}/160
          </span>
        </div>
        <textarea
          value={data.meta_description}
          onChange={(e) => onChange({ ...data, meta_description: e.target.value.slice(0, 160) })}
          placeholder="Standard-Beschreibung für Suchmaschinen"
          maxLength={160}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div>
        <label className={labelClass}>Analytics-Code</label>
        <p className="text-xs text-slate mb-2">z.B. Google Analytics Tracking-Code (gtag.js)</p>
        <textarea
          value={data.analytics_code}
          onChange={(e) => onChange({ ...data, analytics_code: e.target.value })}
          placeholder="<!-- Google tag (gtag.js) -->"
          rows={4}
          className={`${inputClass} resize-none font-mono text-xs`}
        />
      </div>
    </div>
  );
}

function EmailSection({
  data,
  onChange,
}: {
  data: FullAdminSettings["email"];
  onChange: (val: FullAdminSettings["email"]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Absender-Email</label>
        <input
          type="email"
          value={data.from_email}
          onChange={(e) => onChange({ ...data, from_email: e.target.value })}
          placeholder="noreply@example.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Absender-Name</label>
        <input
          type="text"
          value={data.from_name}
          onChange={(e) => onChange({ ...data, from_name: e.target.value })}
          placeholder="bevorJA"
          className={inputClass}
        />
      </div>
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────────

export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState<TabKey>("shop");
  const [localSettings, setLocalSettings] = useState<FullAdminSettings | null>(null);
  const queryClient = useQueryClient();

  const { isLoading, data: fetchedSettings } = useQuery<FullAdminSettings>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings/", {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (res.status === 404) return DEFAULT_SETTINGS;
      if (!res.ok) throw new Error("Fehler beim Laden der Einstellungen");
      return res.json();
    },
  });

  // Merge fetched data with defaults whenever the query resolves
  const mergedSettings: FullAdminSettings = fetchedSettings
    ? {
        shop: { ...DEFAULT_SETTINGS.shop, ...fetchedSettings.shop },
        seo: { ...DEFAULT_SETTINGS.seo, ...fetchedSettings.seo },
        email: { ...DEFAULT_SETTINGS.email, ...fetchedSettings.email },
      }
    : DEFAULT_SETTINGS;

  const settings = localSettings ?? mergedSettings;

  const saveMutation = useMutation({
    mutationFn: async (section: TabKey) => {
      const payload = { [section]: settings[section] };
      const res = await fetch("/api/admin/settings/", {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify(payload),
      });
      if (!res.ok && res.status !== 404) throw new Error();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Gespeichert!");
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-charcoal dark:text-white">Einstellungen</h1>
        <p className="text-slate mt-1">Shop, SEO und Email-Konfiguration</p>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gold/10 mb-6 gap-1">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors -mb-px ${
              activeTab === key
                ? "border-b-2 border-gold text-gold-dark"
                : "text-slate hover:text-charcoal dark:hover:text-white border-b-2 border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Section Card */}
      <div className="bg-white dark:bg-charcoal-light rounded-xl p-6 shadow-elegant">
        {activeTab === "shop" && (
          <ShopSection
            data={settings.shop}
            onChange={(val) => setLocalSettings((s) => ({ ...(s ?? DEFAULT_SETTINGS), shop: val }))}
          />
        )}
        {activeTab === "seo" && (
          <SeoSection
            data={settings.seo}
            onChange={(val) => setLocalSettings((s) => ({ ...(s ?? DEFAULT_SETTINGS), seo: val }))}
          />
        )}
        {activeTab === "email" && (
          <EmailSection
            data={settings.email}
            onChange={(val) => setLocalSettings((s) => ({ ...(s ?? DEFAULT_SETTINGS), email: val }))}
          />
        )}

        {/* Save Button */}
        <div className="mt-8 pt-5 border-t border-gold/10 flex justify-end">
          <button
            onClick={() => saveMutation.mutate(activeTab)}
            disabled={saveMutation.isPending}
            className="btn-elegant flex items-center gap-2"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  );
}
