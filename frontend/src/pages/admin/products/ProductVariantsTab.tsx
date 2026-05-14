import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Package, Plus, Pencil, Eye, EyeOff, Trash2, Search, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { ProductVariantListItem, ProductVariant, BoxType, CardPackage, Occasion } from "../../../types/index";

const TOKEN = () => localStorage.getItem("admin_token");
const authHeader = () => ({ Authorization: `Token ${TOKEN()}`, "Content-Type": "application/json" });

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...authHeader(), ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantListResponse { results: ProductVariantListItem[]; count: number }
interface Filters { occasion: string; box_type: string; is_active: string; search: string }

interface VariantFormData {
  box_type_id: number | null;
  card_package_id: number | null;
  occasion_id: number | null;
  name: string;
  description: string;
  base_price_override: string;
  price_adjustment: string;
  is_active: boolean;
  is_default: boolean;
  customization_options: { engraving: boolean; message_card: boolean; color_choice: string[] };
}

const defaultForm = (): VariantFormData => ({
  box_type_id: null, card_package_id: null, occasion_id: null,
  name: "", description: "", base_price_override: "", price_adjustment: "0",
  is_active: true, is_default: false,
  customization_options: { engraving: false, message_card: false, color_choice: [] },
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-gray-200">
          {[10, 28, 16, 16, 14, 12, 14, 16].map((w, j) => (
            <td key={j} className="py-3 px-4">
              <div className={`h-4 w-${w} rounded bg-gray-50 animate-pulse`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── VariantModal ─────────────────────────────────────────────────────────────

interface ModalProps {
  editVariant: ProductVariant | null;
  onClose: () => void;
  onSaved: () => void;
}

function VariantModal({ editVariant, onClose, onSaved }: ModalProps) {
  const isEdit = editVariant !== null;
  const [step, setStep] = useState<1 | 2>(isEdit ? 2 : 1);
  const [form, setForm] = useState<VariantFormData>(() => {
    if (isEdit) {
      return {
        box_type_id: editVariant.box_type.id,
        card_package_id: editVariant.card_package.id,
        occasion_id: editVariant.occasion?.id ?? null,
        name: editVariant.name,
        description: editVariant.description,
        base_price_override: "",
        price_adjustment: "0",
        is_active: editVariant.is_active,
        is_default: editVariant.is_default,
        customization_options: {
          engraving: editVariant.customization_options?.engraving ?? false,
          message_card: editVariant.customization_options?.message_card ?? false,
          color_choice: editVariant.customization_options?.color_choice ?? [],
        },
      };
    }
    return defaultForm();
  });
  const [colorInput, setColorInput] = useState("");

  const { data: boxTypes = [] } = useQuery<BoxType[]>({
    queryKey: ["admin", "box-types"],
    queryFn: () => apiFetch("/api/admin/box-types/"),
  });
  const { data: cardPackages = [] } = useQuery<CardPackage[]>({
    queryKey: ["admin", "card-packages"],
    queryFn: () => apiFetch("/api/admin/card-packages/"),
  });
  const { data: occasions = [] } = useQuery<Occasion[]>({
    queryKey: ["admin", "occasions"],
    queryFn: () => apiFetch("/api/admin/occasions/"),
  });

  const selectedBox = boxTypes.find((b) => b.id === form.box_type_id);
  const selectedPkg = cardPackages.find((c) => c.id === form.card_package_id);

  const calcPrice = () => {
    const base = parseFloat(selectedBox?.base_price ?? "0") + parseFloat(selectedPkg?.price ?? "0");
    const adj = parseFloat(form.price_adjustment || "0");
    return (base + adj).toFixed(2);
  };

  const setF = useCallback(<K extends keyof VariantFormData>(k: K, v: VariantFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v })), []);

  const setCustom = (k: keyof VariantFormData["customization_options"], v: boolean | string[]) =>
    setForm((f) => ({ ...f, customization_options: { ...f.customization_options, [k]: v } }));

  const handleStep1Next = () => {
    if (!form.box_type_id || !form.card_package_id) {
      toast.error("Bitte Box-Typ und Kartenpaket wählen");
      return;
    }
    const box = boxTypes.find((b) => b.id === form.box_type_id);
    const pkg = cardPackages.find((c) => c.id === form.card_package_id);
    if (box && pkg) setF("name", `${box.name} ${pkg.name}`);
    setStep(2);
  };

  const mutation = useMutation({
    mutationFn: (body: object) =>
      isEdit
        ? apiFetch(`/api/admin/variants/${editVariant!.id}/`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch("/api/admin/variants/", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast.success(isEdit ? "Variante aktualisiert" : "Variante erstellt");
      onSaved();
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  const handleSubmit = () => {
    const body: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      occasion_id: form.occasion_id,
      is_active: form.is_active,
      is_default: form.is_default,
      price_adjustment: parseFloat(form.price_adjustment || "0"),
      customization_options: form.customization_options,
    };
    if (!isEdit) { body.box_type_id = form.box_type_id; body.card_package_id = form.card_package_id; }
    if (form.base_price_override) body.base_price_override = parseFloat(form.base_price_override);
    mutation.mutate(body);
  };

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !form.customization_options.color_choice.includes(c)) {
      setCustom("color_choice", [...form.customization_options.color_choice, c]);
    }
    setColorInput("");
  };

  const removeColor = (c: string) =>
    setCustom("color_choice", form.customization_options.color_choice.filter((x) => x !== c));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-elegant w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="font-display text-xl text-charcoal">
              {isEdit ? "Variante bearbeiten" : step === 1 ? "Kombination wählen" : "Details festlegen"}
            </h2>
            {!isEdit && (
              <p className="text-sm text-charcoal-light mt-0.5">Schritt {step} von 2</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-50 text-charcoal-light">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Step 1: Selector ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">Box-Typ</label>
                <div className="grid grid-cols-2 gap-3">
                  {boxTypes.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setF("box_type_id", b.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.box_type_id === b.id
                          ? "border-gold bg-gold/5"
                          : "border-gray-200 hover:border-gray-200"
                      }`}
                    >
                      <span className="block font-medium text-charcoal text-sm">{b.name}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-50 text-xs text-charcoal-light">
                        {b.box_type_display}
                      </span>
                      <span className="block mt-2 text-sm text-gold font-medium">€{b.base_price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">Kartenpaket</label>
                <div className="grid grid-cols-2 gap-3">
                  {cardPackages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setF("card_package_id", p.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.card_package_id === p.id
                          ? "border-gold bg-gold/5"
                          : "border-gray-200 hover:border-gray-200"
                      }`}
                    >
                      <span className="block font-medium text-charcoal text-sm">{p.name}</span>
                      <span className="block text-xs text-charcoal-light mt-1">{p.card_count} Karten</span>
                      <span className="block mt-2 text-sm text-gold font-medium">€{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedBox && selectedPkg && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                  <span className="text-charcoal-light">Basispreis: </span>
                  <span className="text-charcoal">€{selectedBox.base_price} + €{selectedPkg.price}</span>
                  <span className="text-charcoal-light"> = </span>
                  <span className="font-medium text-gold">€{calcPrice()}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-charcoal-light hover:bg-gray-50 text-sm">
                  Abbrechen
                </button>
                <button type="button" onClick={handleStep1Next} className="btn-elegant">
                  Weiter
                </button>
              </div>
            </>
          )}

          {/* ── Step 2 / Edit Form ── */}
          {step === 2 && (
            <>
              <Field label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                  className="input-field"
                />
              </Field>

              <Field label="Anlass (optional)">
                <select value={form.occasion_id ?? ""} onChange={(e) => setF("occasion_id", e.target.value ? Number(e.target.value) : null)} className="input-field">
                  <option value="">Kein spezifischer Anlass</option>
                  {occasions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </Field>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-charcoal">Preis-Konfiguration</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <span className="text-charcoal-light">Automatisch berechnet: </span>
                  <span className="font-medium text-gold">€{calcPrice()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preis-Zuschlag (€)">
                    <input type="number" step="0.01" value={form.price_adjustment} onChange={(e) => setF("price_adjustment", e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Preis-Überschreib (€, optional)">
                    <input type="number" step="0.01" value={form.base_price_override} onChange={(e) => setF("base_price_override", e.target.value)} placeholder="Leer lassen für auto" className="input-field" />
                  </Field>
                </div>
              </div>

              <Field label="Beschreibung">
                <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={3} className="input-field resize-none" />
              </Field>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-charcoal">Personalisierungs-Optionen</label>
                <CheckField
                  label="Gravur möglich"
                  checked={form.customization_options.engraving}
                  onChange={(v) => setCustom("engraving", v)}
                />
                <CheckField
                  label="Nachrichtenkarte"
                  checked={form.customization_options.message_card}
                  onChange={(v) => setCustom("message_card", v)}
                />
                <div>
                  <span className="block text-sm text-charcoal-light mb-2">Farbauswahl</span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.customization_options.color_choice.map((c) => (
                      <span key={c} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-charcoal border border-gray-200">
                        {c}
                        <button type="button" onClick={() => removeColor(c)} className="text-charcoal-light hover:text-rose-gold">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                      placeholder="Farbe hinzufügen..."
                      className="input-field flex-1 text-sm"
                    />
                    <button type="button" onClick={addColor} className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-charcoal-light hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <CheckField label="Aktiv" checked={form.is_active} onChange={(v) => setF("is_active", v)} />
                <CheckField label="Standard-Variante" checked={form.is_default} onChange={(v) => setF("is_default", v)} />
              </div>

              <div className="flex justify-between gap-3 pt-2">
                {!isEdit && (
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-gray-200 text-charcoal-light hover:bg-gray-50 text-sm flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Zurück
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-charcoal-light hover:bg-gray-50 text-sm">
                    Abbrechen
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={mutation.isPending} className="btn-elegant">
                    {mutation.isPending ? "Speichern..." : isEdit ? "Aktualisieren" : "Erstellen"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-charcoal">{label}</label>
      {children}
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-200 accent-gold" />
      <span className="text-sm text-charcoal">{label}</span>
    </label>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function ProductVariantsTab() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<Filters>({ occasion: "", box_type: "", is_active: "", search: "" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [modalState, setModalState] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  const queryParams = () => {
    const p = new URLSearchParams({ page: String(page) });
    if (filters.occasion) p.set("occasion", filters.occasion);
    if (filters.box_type) p.set("box_type", filters.box_type);
    if (filters.is_active) p.set("is_active", filters.is_active);
    if (filters.search) p.set("search", filters.search);
    return p.toString();
  };

  const { data, isLoading, isFetching } = useQuery<VariantListResponse>({
    queryKey: ["admin", "variants", filters, page],
    queryFn: () => apiFetch(`/api/admin/variants/?${queryParams()}`),
    placeholderData: (prev) => prev,
  });

  const { data: occasions = [] } = useQuery<Occasion[]>({
    queryKey: ["admin", "occasions"],
    queryFn: () => apiFetch("/api/admin/occasions/"),
  });
  const { data: boxTypes = [] } = useQuery<BoxType[]>({
    queryKey: ["admin", "box-types"],
    queryFn: () => apiFetch("/api/admin/box-types/"),
  });

  const { data: editVariant } = useQuery<ProductVariant>({
    queryKey: ["admin", "variant", modalState.editId],
    queryFn: () => apiFetch(`/api/admin/variants/${modalState.editId}/`),
    enabled: modalState.editId !== null,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "variants"] });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiFetch(`/api/admin/variants/${id}/`, { method: "PATCH", body: JSON.stringify({ is_active }) }),
    onSuccess: () => { toast.success("Status aktualisiert"); invalidate(); },
    onError: () => toast.error("Fehler beim Aktualisieren"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/variants/${id}/`, { method: "DELETE" }),
    onSuccess: () => { toast.success("Variante gelöscht"); setConfirmDeleteId(null); invalidate(); },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const openCreate = () => setModalState({ open: true, editId: null });
  const openEdit = (id: number) => setModalState({ open: true, editId: id });
  const closeModal = () => setModalState({ open: false, editId: null });
  const handleSaved = () => { closeModal(); invalidate(); };

  const variants = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showModal = modalState.open && (!modalState.editId || editVariant !== undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Produktvarianten</h1>
          <p className="text-charcoal-light mt-1 text-sm">Kombinationen aus Box-Typ, Kartenpaket und Anlass verwalten</p>
        </div>
        <button onClick={openCreate} className="btn-elegant flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neue Variante
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 flex flex-wrap gap-3 shadow-elegant">
        <select
          value={filters.occasion}
          onChange={(e) => setFilter("occasion", e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-transparent text-charcoal focus:outline-none focus:border-gold"
        >
          <option value="">Alle Anlässe</option>
          {occasions.map((o) => <option key={o.id} value={o.slug}>{o.name}</option>)}
        </select>

        <select
          value={filters.box_type}
          onChange={(e) => setFilter("box_type", e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-transparent text-charcoal focus:outline-none focus:border-gold"
        >
          <option value="">Alle Box-Typen</option>
          {boxTypes.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
        </select>

        <select
          value={filters.is_active}
          onChange={(e) => setFilter("is_active", e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-transparent text-charcoal focus:outline-none focus:border-gold"
        >
          <option value="">Alle</option>
          <option value="true">Aktiv</option>
          <option value="false">Inaktiv</option>
        </select>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-transparent text-charcoal placeholder:text-charcoal-light focus:outline-none focus:border-gold"
          />
        </div>

        {(filters.occasion || filters.box_type || filters.is_active || filters.search) && (
          <button
            onClick={() => { setFilters({ occasion: "", box_type: "", is_active: "", search: "" }); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-charcoal-light hover:bg-gray-50 flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Bild", "Name", "Box-Typ", "Karten", "Anlass", "Preis", "Status", "Aktionen"].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-charcoal-light font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isFetching && !isLoading ? "opacity-60 transition-opacity" : ""}>
            {isLoading ? (
              <SkeletonRows />
            ) : variants.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Package className="w-10 h-10 text-charcoal-light-light mx-auto mb-3" />
                  <p className="text-charcoal-light">Keine Varianten gefunden</p>
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <>
                  <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50/30/50 transition-colors">
                    <td className="py-3 px-4">
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <Package className="w-4 h-4 text-charcoal-light-light" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-charcoal">{v.name}</span>
                      {v.is_default && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gold/10 text-gold">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-charcoal-light">{v.box_type_name}</td>
                    <td className="py-3 px-4 text-charcoal-light">{v.card_count}</td>
                    <td className="py-3 px-4 text-charcoal-light">{v.occasion_name ?? "—"}</td>
                    <td className="py-3 px-4 font-medium text-charcoal">€{v.calculated_price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-slate-100 text-charcoal-light"
                      }`}>
                        {v.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <ActionBtn title="Bearbeiten" onClick={() => openEdit(v.id)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </ActionBtn>
                        <ActionBtn
                          title={v.is_active ? "Deaktivieren" : "Aktivieren"}
                          onClick={() => toggleActiveMutation.mutate({ id: v.id, is_active: !v.is_active })}
                        >
                          {v.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </ActionBtn>
                        <ActionBtn title="Löschen" onClick={() => setConfirmDeleteId(v.id)} className="hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                  {confirmDeleteId === v.id && (
                    <tr key={`del-${v.id}`} className="bg-red-50 dark:bg-red-900/10 border-b border-gray-200">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-sm text-red-700 dark:text-red-400">
                            Variante <strong>"{v.name}"</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-charcoal-light hover:bg-gray-50"
                            >
                              Abbrechen
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(v.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                            >
                              {deleteMutation.isPending ? "Löschen..." : "Endgültig löschen"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/30/30">
            <span className="text-xs text-charcoal-light">
              {totalCount} Einträge gesamt — Seite {page} von {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-charcoal-light hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-charcoal-light hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <VariantModal
          editVariant={modalState.editId ? (editVariant ?? null) : null}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Tiny reusable action button ──────────────────────────────────────────────

function ActionBtn({
  children, title, onClick, className = "",
}: { children: React.ReactNode; title: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-gray-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
