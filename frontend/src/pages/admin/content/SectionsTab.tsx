import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Layers, Loader2,
  ChevronUp, ChevronDown, Check, X,
  Image, AlignLeft, Grid, MessageSquare,
  HelpCircle, Clock, Video, Tag, Mail,
  Star, LayoutTemplate,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CustomSection, TemplatType } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const TEMPLATE_LABELS: Record<string, string> = {
  hero: "Hero – Vollbild",
  text_image_left: "Text + Bild (links)",
  text_image_right: "Text + Bild (rechts)",
  features_grid: "Features-Grid",
  testimonials: "Testimonials",
  faq: "FAQ Accordion",
  gallery: "Bildgalerie",
  timeline: "Timeline",
  countdown: "Countdown",
  video: "Video Embed",
  pricing: "Pricing-Tabelle",
  contact: "Kontakt-Formular",
};

const TEMPLATE_COLORS: Record<string, string> = {
  hero: "bg-purple-100 text-purple-700",
  text_image_left: "bg-blue-100 text-blue-700",
  text_image_right: "bg-blue-100 text-blue-700",
  features_grid: "bg-green-100 text-green-700",
  testimonials: "bg-yellow-100 text-yellow-700",
  faq: "bg-orange-100 text-orange-700",
  gallery: "bg-pink-100 text-pink-700",
  timeline: "bg-teal-100 text-teal-700",
  countdown: "bg-red-100 text-red-700",
  video: "bg-indigo-100 text-indigo-700",
  pricing: "bg-emerald-100 text-emerald-700",
  contact: "bg-slate-100 text-slate-700",
};

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Star,
  text_image_left: AlignLeft,
  text_image_right: AlignLeft,
  features_grid: Grid,
  testimonials: MessageSquare,
  faq: HelpCircle,
  gallery: Image,
  timeline: Clock,
  countdown: Clock,
  video: Video,
  pricing: Tag,
  contact: Mail,
};

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  hero: "Großes Vollbild-Banner mit CTA",
  text_image_left: "Text links, Bild rechts",
  text_image_right: "Bild links, Text rechts",
  features_grid: "Raster mit Feature-Karten",
  testimonials: "Kundenbewertungen & Zitate",
  faq: "Aufklappbare Frage-Antwort-Paare",
  gallery: "Bildergalerie mit Upload",
  timeline: "Zeitstrahl mit Ereignissen",
  countdown: "Countdown bis Datum",
  video: "Eingebettetes Video",
  pricing: "Preispläne im Vergleich",
  contact: "Kontaktinformationen & Formular",
};

const ALL_TEMPLATES: TemplatType[] = [
  "hero", "text_image_left", "text_image_right", "features_grid",
  "testimonials", "faq", "gallery", "timeline", "countdown",
  "video", "pricing", "contact",
];

const AUTH_HEADER = () => ({
  Authorization: `Token ${localStorage.getItem("admin_token")}`,
  "Content-Type": "application/json",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultContent(type: TemplatType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { title: "", subtitle: "", description: "", cta_text: "", cta_link: "" };
    case "text_image_left":
    case "text_image_right":
      return { title: "", text: "", image_position: type === "text_image_left" ? "left" : "right", cta_text: "", cta_link: "" };
    case "features_grid":
      return { title: "", subtitle: "", features: [{ icon: "", title: "", description: "" }] };
    case "testimonials":
      return { title: "", testimonials: [{ name: "", text: "", rating: 5, company: "" }] };
    case "faq":
      return { title: "", items: [{ question: "", answer: "" }] };
    case "gallery":
      return { title: "", columns: 3 };
    case "timeline":
      return { title: "", items: [{ year: "", title: "", description: "" }] };
    case "countdown":
      return { title: "", subtitle: "", target_date: "" };
    case "video":
      return { title: "", video_url: "", poster_text: "" };
    case "pricing":
      return { title: "", subtitle: "", plans: [{ name: "", price: "", features: [""], is_featured: false }] };
    case "contact":
      return { title: "", subtitle: "", email: "", phone: "", show_form: true };
    default:
      return {};
  }
}

// ─── ContentFields ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-charcoal dark:text-white">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white text-sm";
const textareaCls = inputCls + " resize-none";

function ContentFields({
  templateType,
  content,
  onChange,
}: {
  templateType: TemplatType;
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: unknown) => onChange({ ...content, [key]: value });
  const str = (key: string) => (content[key] as string) ?? "";
  const arr = <T,>(key: string): T[] => (content[key] as T[]) ?? [];

  // Dynamic array helpers
  function addItem(key: string, empty: Record<string, unknown>) {
    set(key, [...arr<Record<string, unknown>>(key), { ...empty }]);
  }
  function removeItem(key: string, idx: number) {
    set(key, arr<Record<string, unknown>>(key).filter((_, i) => i !== idx));
  }
  function updateItem(key: string, idx: number, field: string, value: unknown) {
    const updated = arr<Record<string, unknown>>(key).map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    set(key, updated);
  }

  if (templateType === "hero") {
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Untertitel"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <Field label="Beschreibung"><textarea className={textareaCls} rows={3} value={str("description")} onChange={e => set("description", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button-Text"><input className={inputCls} value={str("cta_text")} onChange={e => set("cta_text", e.target.value)} /></Field>
          <Field label="Button-Link"><input className={inputCls} value={str("cta_link")} onChange={e => set("cta_link", e.target.value)} /></Field>
        </div>
      </div>
    );
  }

  if (templateType === "text_image_left" || templateType === "text_image_right") {
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Text"><textarea className={textareaCls} rows={5} value={str("text")} onChange={e => set("text", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button-Text"><input className={inputCls} value={str("cta_text")} onChange={e => set("cta_text", e.target.value)} /></Field>
          <Field label="Button-Link"><input className={inputCls} value={str("cta_link")} onChange={e => set("cta_link", e.target.value)} /></Field>
        </div>
      </div>
    );
  }

  if (templateType === "features_grid") {
    const features = arr<{ icon: string; title: string; description: string }>("features");
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Untertitel"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal dark:text-white">Features</p>
            <button type="button" onClick={() => addItem("features", { icon: "", title: "", description: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {features.map((f, i) => (
            <div key={i} className="p-3 bg-cream/50 dark:bg-charcoal rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate">Feature {i + 1}</span>
                <button type="button" onClick={() => removeItem("features", i)} className="text-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <input className={inputCls} placeholder="Icon (z.B. Heart)" value={f.icon} onChange={e => updateItem("features", i, "icon", e.target.value)} />
              <input className={inputCls} placeholder="Titel" value={f.title} onChange={e => updateItem("features", i, "title", e.target.value)} />
              <input className={inputCls} placeholder="Beschreibung" value={f.description} onChange={e => updateItem("features", i, "description", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateType === "testimonials") {
    const testimonials = arr<{ name: string; text: string; rating: number; company?: string }>("testimonials");
    return (
      <div className="space-y-4">
        <Field label="Titel (optional)"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal dark:text-white">Testimonials</p>
            <button type="button" onClick={() => addItem("testimonials", { name: "", text: "", rating: 5, company: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {testimonials.map((t, i) => (
            <div key={i} className="p-3 bg-cream/50 dark:bg-charcoal rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate">Testimonial {i + 1}</span>
                <button type="button" onClick={() => removeItem("testimonials", i)} className="text-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Name" value={t.name} onChange={e => updateItem("testimonials", i, "name", e.target.value)} />
                <input className={inputCls} placeholder="Firma (optional)" value={t.company ?? ""} onChange={e => updateItem("testimonials", i, "company", e.target.value)} />
              </div>
              <textarea className={textareaCls} rows={2} placeholder="Zitat" value={t.text} onChange={e => updateItem("testimonials", i, "text", e.target.value)} />
              <Field label="Bewertung (1–5)">
                <input type="number" min={1} max={5} className={inputCls} value={t.rating} onChange={e => updateItem("testimonials", i, "rating", Number(e.target.value))} />
              </Field>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateType === "faq") {
    const items = arr<{ question: string; answer: string }>("items");
    return (
      <div className="space-y-4">
        <Field label="Titel (optional)"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal dark:text-white">FAQ-Einträge</p>
            <button type="button" onClick={() => addItem("items", { question: "", answer: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-cream/50 dark:bg-charcoal rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate">Eintrag {i + 1}</span>
                <button type="button" onClick={() => removeItem("items", i)} className="text-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <input className={inputCls} placeholder="Frage" value={item.question} onChange={e => updateItem("items", i, "question", e.target.value)} />
              <textarea className={textareaCls} rows={2} placeholder="Antwort" value={item.answer} onChange={e => updateItem("items", i, "answer", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateType === "gallery") {
    return (
      <div className="space-y-4">
        <Field label="Titel (optional)"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Spalten">
          <select className={inputCls} value={String(content["columns"] ?? 3)} onChange={e => set("columns", Number(e.target.value))}>
            <option value="2">2 Spalten</option>
            <option value="3">3 Spalten</option>
            <option value="4">4 Spalten</option>
          </select>
        </Field>
        <p className="text-xs text-slate bg-gold/5 border border-gold/20 rounded-lg p-3">
          Bilder werden nach dem Speichern separat über den Bild-Upload verwaltet.
        </p>
      </div>
    );
  }

  if (templateType === "timeline") {
    const items = arr<{ year: string; title: string; description: string }>("items");
    return (
      <div className="space-y-4">
        <Field label="Titel (optional)"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal dark:text-white">Ereignisse</p>
            <button type="button" onClick={() => addItem("items", { year: "", title: "", description: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-cream/50 dark:bg-charcoal rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate">Ereignis {i + 1}</span>
                <button type="button" onClick={() => removeItem("items", i)} className="text-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input className={inputCls} placeholder="Jahr / Datum" value={item.year} onChange={e => updateItem("items", i, "year", e.target.value)} />
                <div className="col-span-2">
                  <input className={inputCls} placeholder="Titel" value={item.title} onChange={e => updateItem("items", i, "title", e.target.value)} />
                </div>
              </div>
              <textarea className={textareaCls} rows={2} placeholder="Beschreibung" value={item.description} onChange={e => updateItem("items", i, "description", e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateType === "countdown") {
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Untertitel (optional)"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <Field label="Zieldatum">
          <input type="datetime-local" className={inputCls} value={str("target_date")} onChange={e => set("target_date", e.target.value)} />
        </Field>
      </div>
    );
  }

  if (templateType === "video") {
    return (
      <div className="space-y-4">
        <Field label="Titel (optional)"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Video-URL (YouTube / Vimeo)"><input className={inputCls} placeholder="https://..." value={str("video_url")} onChange={e => set("video_url", e.target.value)} /></Field>
        <Field label="Poster-Text (optional)"><input className={inputCls} value={str("poster_text")} onChange={e => set("poster_text", e.target.value)} /></Field>
      </div>
    );
  }

  if (templateType === "pricing") {
    const plans = arr<{ name: string; price: string; features: string[]; is_featured: boolean }>("plans");
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Untertitel (optional)"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-charcoal dark:text-white">Pläne</p>
            <button type="button" onClick={() => addItem("plans", { name: "", price: "", features: [""], is_featured: false })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {plans.map((plan, i) => (
            <div key={i} className="p-3 bg-cream/50 dark:bg-charcoal rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate">Plan {i + 1}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-slate cursor-pointer">
                    <input type="checkbox" checked={plan.is_featured} onChange={e => updateItem("plans", i, "is_featured", e.target.checked)} className="rounded" />
                    Empfohlen
                  </label>
                  <button type="button" onClick={() => removeItem("plans", i)} className="text-slate hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Plan-Name" value={plan.name} onChange={e => updateItem("plans", i, "name", e.target.value)} />
                <input className={inputCls} placeholder="Preis (z.B. €49)" value={plan.price} onChange={e => updateItem("plans", i, "price", e.target.value)} />
              </div>
              <Field label="Features (eine pro Zeile)">
                <textarea
                  className={textareaCls} rows={3}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  value={(plan.features ?? []).join("\n")}
                  onChange={e => updateItem("plans", i, "features", e.target.value.split("\n"))}
                />
              </Field>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateType === "contact") {
    return (
      <div className="space-y-4">
        <Field label="Titel"><input className={inputCls} value={str("title")} onChange={e => set("title", e.target.value)} /></Field>
        <Field label="Untertitel (optional)"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-Mail (optional)"><input className={inputCls} type="email" value={str("email")} onChange={e => set("email", e.target.value)} /></Field>
          <Field label="Telefon (optional)"><input className={inputCls} type="tel" value={str("phone")} onChange={e => set("phone", e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={(content["show_form"] as boolean) ?? true} onChange={e => set("show_form", e.target.checked)} className="rounded" />
          <span className="text-sm text-charcoal dark:text-white">Kontaktformular anzeigen</span>
        </label>
      </div>
    );
  }

  return null;
}

// ─── SectionModal ─────────────────────────────────────────────────────────────

interface ModalProps {
  section?: CustomSection;
  onClose: () => void;
  onSuccess: () => void;
}

function SectionModal({ section, onClose, onSuccess }: ModalProps) {
  const isEdit = !!section;
  const [step, setStep] = useState<"template" | "content">(isEdit ? "content" : "template");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatType | null>(
    section?.template_type ?? null
  );
  const [title, setTitle] = useState(section?.title ?? "");
  const [anchor, setAnchor] = useState(section?.anchor ?? "");
  const [isActive, setIsActive] = useState(section?.is_active ?? true);
  const [order, setOrder] = useState(section?.order ?? 0);
  const [content, setContent] = useState<Record<string, unknown>>(section?.content ?? {});
  const [anchorManual, setAnchorManual] = useState(isEdit);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = isEdit ? `/api/admin/sections/${section!.id}/` : "/api/admin/sections/";
      const method = isEdit ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: AUTH_HEADER(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success(isEdit ? "Section gespeichert" : "Section erstellt");
      onSuccess();
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!anchorManual) setAnchor(slugify(v));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplate) return;
    saveMutation.mutate({
      title,
      anchor,
      template_type: selectedTemplate,
      content,
      order,
      is_active: isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-charcoal-light rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
          <div className="flex items-center gap-3">
            {step === "content" && !isEdit && (
              <button type="button" onClick={() => setStep("template")} className="text-slate hover:text-charcoal dark:hover:text-white">
                <X className="w-4 h-4 rotate-180" />
              </button>
            )}
            <h2 className="font-display text-xl text-charcoal dark:text-white">
              {isEdit ? "Section bearbeiten" : step === "template" ? "Template wählen" : "Section konfigurieren"}
            </h2>
            {step === "content" && selectedTemplate && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TEMPLATE_COLORS[selectedTemplate]}`}>
                {TEMPLATE_LABELS[selectedTemplate]}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-slate hover:text-charcoal dark:hover:text-white p-1 rounded-lg hover:bg-gold/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {step === "template" ? (
            <div>
              <p className="text-sm text-slate mb-4">Wählen Sie das Layout für Ihre neue Section:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_TEMPLATES.map((tpl) => {
                  const Icon = TEMPLATE_ICONS[tpl] ?? LayoutTemplate;
                  const isSelected = selectedTemplate === tpl;
                  return (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setContent(defaultContent(tpl));
                      }}
                      className={`p-4 border-2 rounded-xl cursor-pointer text-left transition-colors ${
                        isSelected
                          ? "border-gold bg-gold/5"
                          : "border-gold/20 dark:border-gold/10 hover:border-gold dark:hover:border-gold"
                      }`}
                    >
                      <div className={`inline-flex p-2 rounded-lg mb-2 ${TEMPLATE_COLORS[tpl]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-charcoal dark:text-white leading-tight">
                        {TEMPLATE_LABELS[tpl]}
                      </p>
                      <p className="text-xs text-slate mt-1 leading-tight">
                        {TEMPLATE_DESCRIPTIONS[tpl]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form id="section-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Titel *">
                  <input
                    required
                    className={inputCls}
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                  />
                </Field>
                <Field label="Anchor (Slug)">
                  <input
                    className={inputCls}
                    value={anchor}
                    onChange={e => { setAnchorManual(true); setAnchor(e.target.value); }}
                    placeholder="automatisch"
                  />
                </Field>
              </div>
              <div className="flex items-center gap-6">
                <Field label="Reihenfolge">
                  <input type="number" className={inputCls + " w-24"} value={order} onChange={e => setOrder(Number(e.target.value))} />
                </Field>
                <label className="flex items-center gap-2 mt-5 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
                  <span className="text-sm text-charcoal dark:text-white">Aktiv</span>
                </label>
              </div>

              <hr className="border-gold/10" />

              {/* Template-specific */}
              <div>
                <p className="text-sm font-medium text-charcoal dark:text-white mb-3">Inhalt</p>
                {selectedTemplate && (
                  <ContentFields
                    templateType={selectedTemplate}
                    content={content}
                    onChange={setContent}
                  />
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate hover:text-charcoal dark:hover:text-white border border-gold/20 rounded-lg hover:bg-gold/5 transition-colors">
            Abbrechen
          </button>
          {step === "template" ? (
            <button
              type="button"
              disabled={!selectedTemplate}
              onClick={() => setStep("content")}
              className="btn-elegant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          ) : (
            <button
              type="submit"
              form="section-form"
              disabled={saveMutation.isPending}
              className="btn-elegant flex items-center gap-2 disabled:opacity-50"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Speichern" : "Erstellen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  section,
  onEdit,
  onToggleActive,
  onOrderChange,
  onDelete,
}: {
  section: CustomSection;
  onEdit: () => void;
  onToggleActive: () => void;
  onOrderChange: (delta: number) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = TEMPLATE_ICONS[section.template_type] ?? LayoutTemplate;

  return (
    <div className="bg-white dark:bg-charcoal-light rounded-xl p-5 shadow-elegant hover:shadow-lg transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 p-2 rounded-lg ${TEMPLATE_COLORS[section.template_type]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-base text-charcoal dark:text-white truncate">{section.title}</h3>
            {section.anchor && <p className="text-xs text-slate truncate">#{section.anchor}</p>}
          </div>
        </div>
        {/* Order controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button type="button" onClick={() => onOrderChange(-1)} className="p-1 text-slate hover:text-charcoal dark:hover:text-white hover:bg-gold/5 rounded transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate w-5 text-center font-mono">{section.order}</span>
          <button type="button" onClick={() => onOrderChange(1)} className="p-1 text-slate hover:text-charcoal dark:hover:text-white hover:bg-gold/5 rounded transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badge row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TEMPLATE_COLORS[section.template_type]}`}>
          {TEMPLATE_LABELS[section.template_type]}
        </span>
        <button
          type="button"
          onClick={onToggleActive}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            section.is_active
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-slate/10 text-slate hover:bg-slate/20"
          }`}
        >
          {section.is_active ? "Aktiv" : "Inaktiv"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gold/10">
        {confirmDelete ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-red-500 flex-1">Wirklich löschen?</span>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 px-2 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Check className="w-3 h-3" /> Ja
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs border border-gold/20 text-slate rounded-lg hover:bg-gold/5 transition-colors"
            >
              <X className="w-3 h-3" /> Nein
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center px-3 py-2 text-slate hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function SectionsTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery<CustomSection[]>({
    queryKey: ["admin", "sections"],
    queryFn: async () => {
      const response = await fetch("/api/content/sections/");
      if (!response.ok) throw new Error("Failed to fetch sections");
      return response.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const response = await fetch(`/api/admin/sections/${id}/`, {
        method: "PATCH",
        headers: AUTH_HEADER(),
        body: JSON.stringify({ is_active }),
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "sections"] }),
    onError: () => toast.error("Fehler beim Aktualisieren"),
  });

  const orderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: number; order: number }) => {
      const response = await fetch(`/api/admin/sections/${id}/`, {
        method: "PATCH",
        headers: AUTH_HEADER(),
        body: JSON.stringify({ order }),
      });
      if (!response.ok) throw new Error("Failed to update order");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "sections"] }),
    onError: () => toast.error("Fehler beim Sortieren"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/sections/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      toast.success("Section gelöscht");
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const sorted = [...(sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Custom Sections</h1>
          <p className="text-slate mt-1">Verwalten Sie individuelle Seitenbereiche und deren Inhalte</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-elegant flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Neue Section
        </button>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onEdit={() => setEditingSection(section)}
              onToggleActive={() => toggleMutation.mutate({ id: section.id, is_active: !section.is_active })}
              onOrderChange={(delta) => orderMutation.mutate({ id: section.id, order: section.order + delta })}
              onDelete={() => deleteMutation.mutate(section.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-charcoal-light rounded-xl shadow-elegant">
          <Layers className="w-14 h-14 text-slate-light mx-auto mb-4" />
          <p className="font-serif text-lg text-charcoal dark:text-white mb-1">Keine Sections vorhanden</p>
          <p className="text-slate text-sm">Erstellen Sie Ihre erste Custom Section mit dem Button oben.</p>
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <SectionModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => setModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editingSection && (
        <SectionModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSuccess={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}
