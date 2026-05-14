import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Layers, Loader2,
  ChevronUp, ChevronDown, Check, X,
  Image, AlignLeft, Grid, MessageSquare,
  HelpCircle, Clock, Video, Tag, Mail,
  Star, LayoutTemplate, Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CustomSection, TemplatType, Page } from "@/types";
import { getAdminPages } from "@/lib/api";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

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
  contact: "bg-slate-100 text-charcoal-light-700",
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
      return { headline: "", subtitle: "", description: "", button_text: "", button_url: "" };
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
      <label className="block text-sm font-medium text-charcoal">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white text-charcoal text-sm";
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
        <Field label="Überschrift"><input className={inputCls} value={str("headline")} onChange={e => set("headline", e.target.value)} /></Field>
        <Field label="Untertitel"><input className={inputCls} value={str("subtitle")} onChange={e => set("subtitle", e.target.value)} /></Field>
        <Field label="Beschreibung"><textarea className={textareaCls} rows={3} value={str("description")} onChange={e => set("description", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Button-Text"><input className={inputCls} value={str("button_text")} onChange={e => set("button_text", e.target.value)} /></Field>
          <Field label="Button-Link"><input className={inputCls} value={str("button_url")} onChange={e => set("button_url", e.target.value)} /></Field>
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
            <p className="text-sm font-medium text-charcoal">Features</p>
            <button type="button" onClick={() => addItem("features", { icon: "", title: "", description: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {features.map((f, i) => (
            <div key={i} className="p-3 bg-gray-50/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-light">Feature {i + 1}</span>
                <button type="button" onClick={() => removeItem("features", i)} className="text-charcoal-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <p className="text-sm font-medium text-charcoal">Testimonials</p>
            <button type="button" onClick={() => addItem("testimonials", { name: "", text: "", rating: 5, company: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {testimonials.map((t, i) => (
            <div key={i} className="p-3 bg-gray-50/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-light">Testimonial {i + 1}</span>
                <button type="button" onClick={() => removeItem("testimonials", i)} className="text-charcoal-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <p className="text-sm font-medium text-charcoal">FAQ-Einträge</p>
            <button type="button" onClick={() => addItem("items", { question: "", answer: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-light">Eintrag {i + 1}</span>
                <button type="button" onClick={() => removeItem("items", i)} className="text-charcoal-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <p className="text-xs text-charcoal-light bg-gold/5 border border-gray-200 rounded-lg p-3">
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
            <p className="text-sm font-medium text-charcoal">Ereignisse</p>
            <button type="button" onClick={() => addItem("items", { year: "", title: "", description: "" })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-50/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-light">Ereignis {i + 1}</span>
                <button type="button" onClick={() => removeItem("items", i)} className="text-charcoal-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <p className="text-sm font-medium text-charcoal">Pläne</p>
            <button type="button" onClick={() => addItem("plans", { name: "", price: "", features: [""], is_featured: false })} className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold px-2 py-1 rounded hover:bg-gold/5">
              <Plus className="w-3 h-3" /> Hinzufügen
            </button>
          </div>
          {plans.map((plan, i) => (
            <div key={i} className="p-3 bg-gray-50/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-light">Plan {i + 1}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs text-charcoal-light cursor-pointer">
                    <input type="checkbox" checked={plan.is_featured} onChange={e => updateItem("plans", i, "is_featured", e.target.checked)} className="rounded" />
                    Empfohlen
                  </label>
                  <button type="button" onClick={() => removeItem("plans", i)} className="text-charcoal-light hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <span className="text-sm text-charcoal">Kontaktformular anzeigen</span>
        </label>
      </div>
    );
  }

  return null;
}

// ─── ImageManager ────────────────────────────────────────────────────────────

const IMAGE_TEMPLATES: TemplatType[] = ["hero", "text_image_left", "text_image_right", "gallery"];

function ImageManager({ sectionId, images, onRefresh }: {
  sectionId: number;
  images: import("@/types").SectionImage[];
  onRefresh: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("order", String(images.length));
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}/images/`, {
        method: "POST",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      toast.error("Bild-Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: number) {
    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}/images/${imageId}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      toast.error("Löschen fehlgeschlagen");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePickFromLibrary(media: { id: number; file_url: string; file: string; alt_text: string }) {
    setPickerOpen(false);
    setUploading(true);
    try {
      const res = await fetch(media.file_url);
      const blob = await res.blob();
      const fileName = media.file.split("/").pop() ?? "image";
      const file = new File([blob], fileName, { type: blob.type });
      const fd = new FormData();
      fd.append("image", file);
      fd.append("order", String(images.length));
      fd.append("alt_text", media.alt_text ?? "");
      const uploadRes = await fetch(`/api/admin/sections/${sectionId}/images/`, {
        method: "POST",
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error();
      onRefresh();
    } catch {
      toast.error("Bild-Link fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={img.image_url ?? img.image}
                alt={img.alt_text || ""}
                className="w-full h-28 object-cover"
              />
              <button
                type="button"
                disabled={deletingId === img.id}
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {deletingId === img.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-charcoal-light hover:border-gold hover:text-gold-dark transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Hochladen…" : "Hochladen"}
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => setPickerOpen(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-charcoal-light hover:border-gold hover:text-gold-dark transition-colors disabled:opacity-50"
        >
          <Image className="w-4 h-4" />
          Mediathek
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      {pickerOpen && (
        <MediaPickerModal
          onSelect={handlePickFromLibrary}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
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
  const [pageId, setPageId] = useState<number | null>(section?.page_id ?? null);
  const [images, setImages] = useState<import("@/types").SectionImage[]>(section?.images ?? []);

  async function refreshImages() {
    if (!section?.id) return;
    try {
      const res = await fetch(`/api/admin/sections/${section.id}/`, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      }
    } catch { /* ignore */ }
  }

  // Load pages for dropdown
  const { data: availablePages, isLoading: pagesLoading, error: pagesLoadError } = useQuery<Page[]>({
    queryKey: ["admin", "pages"],
    queryFn: getAdminPages,
    retry: 1,
  });

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
    if (!pageId) {
      toast.error("Bitte wählen Sie eine Seite aus");
      return;
    }
    saveMutation.mutate({
      title,
      anchor,
      template_type: selectedTemplate,
      content,
      order,
      is_active: isActive,
      page_id: pageId,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {step === "content" && !isEdit && (
              <button type="button" onClick={() => setStep("template")} className="text-charcoal-light hover:text-charcoal">
                <X className="w-4 h-4 rotate-180" />
              </button>
            )}
            <h2 className="font-display text-xl text-charcoal">
              {isEdit ? "Section bearbeiten" : step === "template" ? "Template wählen" : "Section konfigurieren"}
            </h2>
            {step === "content" && selectedTemplate && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TEMPLATE_COLORS[selectedTemplate]}`}>
                {TEMPLATE_LABELS[selectedTemplate]}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-charcoal-light hover:text-charcoal p-1 rounded-lg hover:bg-gold/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {step === "template" ? (
            <div>
              <p className="text-sm text-charcoal-light mb-4">Wählen Sie das Layout für Ihre neue Section:</p>
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
                          : "border-gray-200 dark:border-gray-200 hover:border-gold dark:hover:border-gold"
                      }`}
                    >
                      <div className={`inline-flex p-2 rounded-lg mb-2 ${TEMPLATE_COLORS[tpl]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-charcoal leading-tight">
                        {TEMPLATE_LABELS[tpl]}
                      </p>
                      <p className="text-xs text-charcoal-light mt-1 leading-tight">
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
                  <span className="text-sm text-charcoal">Aktiv</span>
                </label>
              </div>

              {/* Page Selection */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Seite *
                </label>
                <select
                  required
                  value={pageId ?? ""}
                  onChange={(e) => setPageId(e.target.value ? Number(e.target.value) : null)}
                  className={inputCls}
                  disabled={pagesLoading}
                >
                  <option value="">
                    {pagesLoading ? "Lade Seiten..." : pagesLoadError ? "Fehler beim Laden" : "Seite auswählen..."}
                  </option>
                  {Array.isArray(availablePages) && availablePages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title}
                    </option>
                  ))}
                </select>
                {pagesLoadError && (
                  <p className="text-red-500 text-xs mt-1">Fehler: {pagesLoadError.message}</p>
                )}
              </div>

              <hr className="border-gray-200" />

              {/* Template-specific */}
              <div>
                <p className="text-sm font-medium text-charcoal mb-3">Inhalt</p>
                {selectedTemplate && (
                  <ContentFields
                    templateType={selectedTemplate}
                    content={content}
                    onChange={setContent}
                  />
                )}
              </div>

              {/* Image management – only for saved sections with image-supporting templates */}
              {isEdit && section?.id && selectedTemplate && IMAGE_TEMPLATES.includes(selectedTemplate) && (
                <div>
                  <hr className="border-gray-200 mb-5" />
                  <p className="text-sm font-medium text-charcoal mb-3">Bilder</p>
                  <ImageManager
                    sectionId={section.id}
                    images={images}
                    onRefresh={refreshImages}
                  />
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-charcoal-light hover:text-charcoal border border-gray-200 rounded-lg hover:bg-gold/5 transition-colors">
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
    <div className="bg-white rounded-xl p-5 shadow-elegant hover:shadow-lg transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`shrink-0 p-2 rounded-lg ${TEMPLATE_COLORS[section.template_type]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-base text-charcoal truncate">{section.title}</h3>
            {section.anchor && <p className="text-xs text-charcoal-light truncate">#{section.anchor}</p>}
          </div>
        </div>
        {/* Order controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button type="button" onClick={() => onOrderChange(-1)} className="p-1 text-charcoal-light hover:text-charcoal hover:bg-gold/5 rounded transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-xs text-charcoal-light w-5 text-center font-mono">{section.order}</span>
          <button type="button" onClick={() => onOrderChange(1)} className="p-1 text-charcoal-light hover:text-charcoal hover:bg-gold/5 rounded transition-colors">
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
              : "bg-slate/10 text-charcoal-light hover:bg-slate/20"
          }`}
        >
          {section.is_active ? "Aktiv" : "Inaktiv"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
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
              className="flex items-center gap-1 px-2 py-1.5 text-xs border border-gray-200 text-charcoal-light rounded-lg hover:bg-gold/5 transition-colors"
            >
              <X className="w-3 h-3" /> Nein
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-gold-dark hover:bg-gold/5 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center px-3 py-2 text-charcoal-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Load pages for filter
  const { data: pages, error: pagesError } = useQuery<Page[]>({
    queryKey: ["admin", "pages"],
    queryFn: getAdminPages,
    retry: 1,
  });

  const { data: sections, isLoading, error: sectionsError } = useQuery<CustomSection[]>({
    queryKey: ["admin", "sections", selectedPageId],
    queryFn: async () => {
      const url = selectedPageId
        ? `/api/admin/sections/list/?page=${selectedPageId}`
        : "/api/admin/sections/list/";
      const response = await fetch(url, {
        headers: { Authorization: `Token ${localStorage.getItem("admin_token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch sections");
      return response.json();
    },
    retry: 1,
  });

  // Handle errors gracefully
  if (pagesError || sectionsError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Fehler beim Laden der Daten</p>
        <button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
          }}
          className="btn-elegant"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

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

  const sorted = Array.isArray(sections) ? [...sections].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Custom Sections</h1>
          <p className="text-charcoal-light mt-1">Verwalten Sie individuelle Seitenbereiche und deren Inhalte</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Page Filter */}
          <select
            value={selectedPageId ?? ""}
            onChange={(e) => setSelectedPageId(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-charcoal"
          >
            <option value="">Alle Seiten</option>
            {Array.isArray(pages) ? pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            )) : <option value="" disabled>Lade...</option>}
          </select>
          <button onClick={() => setModalOpen(true)} className="btn-elegant flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Neue Section
          </button>
        </div>
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
        <div className="text-center py-16 bg-white rounded-xl shadow-elegant">
          <Layers className="w-14 h-14 text-charcoal-light-light mx-auto mb-4" />
          <p className="font-serif text-lg text-charcoal mb-1">Keine Sections vorhanden</p>
          <p className="text-charcoal-light text-sm">Erstellen Sie Ihre erste Custom Section mit dem Button oben.</p>
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
