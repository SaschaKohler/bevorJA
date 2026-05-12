import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Suchen…",
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local value in sync when external value changes (e.g. reset)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setLocalValue(next)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(next)
    }, debounceMs)
  }

  const handleClear = () => {
    setLocalValue("")
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange("")
  }

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 w-4 h-4 text-slate dark:text-slate-light pointer-events-none" />

      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-charcoal-light border border-slate/20 dark:border-white/10 rounded-lg text-charcoal dark:text-white placeholder:text-slate/60 dark:placeholder:text-slate-light/60 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
      />

      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded text-slate hover:text-charcoal dark:text-slate-light dark:hover:text-white transition-colors"
          aria-label="Suche zurücksetzen"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
