import { useState, useMemo } from "react"
import * as LucideIcons from "lucide-react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"

const ICON_NAMES = [
  "Gift", "Heart", "Music", "Star", "Crown", "Gem", "Sparkles", "PartyPopper",
  "Calendar", "Camera", "Flower2", "Palmtree", "Sun", "Moon", "Cloud", "Home",
  "Baby", "Users", "Ring", "Church", "GlassWater", "Cake", "Plane", "Briefcase",
  "Book", "Bell", "Flag", "Globe", "Map", "TreePine", "Waves", "Smile", "Trophy",
  "Zap", "Rocket", "Diamond", "Award", "Feather", "Anchor", "Compass",
] as const

type IconName = typeof ICON_NAMES[number]

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
  label?: string
}

function renderIcon(name: string, className?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }> | undefined
  if (!Icon) return null
  return <Icon className={className} />
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo<IconName[]>(() => {
    const q = search.toLowerCase().trim()
    if (!q) return [...ICON_NAMES]
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [search])

  const currentIcon = ICON_NAMES.includes(value as IconName) ? value : null

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-charcoal dark:text-white">{label}</span>
      )}

      {/* Toggle button showing selected icon */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-2 w-full sm:w-auto bg-white dark:bg-charcoal-light border border-slate/20 dark:border-white/10 rounded-lg text-sm text-charcoal dark:text-white hover:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center justify-center w-5 h-5 text-gold">
          {currentIcon ? renderIcon(currentIcon, "w-5 h-5") : (
            <span className="text-slate dark:text-slate-light text-xs">—</span>
          )}
        </span>
        <span className="flex-1 text-left">
          {currentIcon ?? "Icon wählen"}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate dark:text-slate-light" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate dark:text-slate-light" />
        )}
      </button>

      {/* Collapsible picker panel */}
      {open && (
        <div className="border border-slate/10 dark:border-white/10 rounded-xl bg-white dark:bg-charcoal-light shadow-elegant p-3 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate dark:text-slate-light pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Icon suchen…"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate/5 dark:bg-white/5 border border-slate/10 dark:border-white/10 rounded-lg text-charcoal dark:text-white placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
            />
          </div>

          {/* Icon grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
                    value === name
                      ? "bg-gold text-white shadow-sm"
                      : "text-slate hover:text-charcoal hover:bg-slate/10 dark:text-slate-light dark:hover:text-white dark:hover:bg-white/10"
                  }`}
                  aria-label={name}
                  aria-pressed={value === name}
                >
                  {renderIcon(name, "w-4 h-4")}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate dark:text-slate-light text-center py-3">
              Keine Icons gefunden
            </p>
          )}
        </div>
      )}
    </div>
  )
}
