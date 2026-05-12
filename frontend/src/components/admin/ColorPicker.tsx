import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep input in sync with external value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close picker on outside click
  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)

    // Only propagate valid 6-digit hex
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onChange(raw)
    }
  }

  const handleInputBlur = () => {
    // Reset input to current valid value if input is invalid
    if (!/^#[0-9a-fA-F]{6}$/.test(inputValue)) {
      setInputValue(value)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-charcoal dark:text-white">{label}</span>
      )}

      <div ref={containerRef} className="relative inline-flex items-center gap-2">
        {/* Swatch toggle */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-9 h-9 rounded-lg border-2 border-slate/20 dark:border-white/20 shadow-sm hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-gold/40"
          style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#cccccc" }}
          aria-label={`Farbe wählen: ${value}`}
          aria-expanded={open}
        />

        {/* Hex input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          maxLength={7}
          placeholder="#000000"
          className="w-28 px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-charcoal-light border border-slate/20 dark:border-white/10 rounded-lg text-charcoal dark:text-white placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-colors"
          aria-label="Hex-Farbwert"
        />

        {/* Popover picker */}
        {open && (
          <div className="absolute top-full left-0 mt-2 z-20 rounded-xl shadow-elegant bg-white dark:bg-charcoal-light p-3 border border-slate/10 dark:border-white/10">
            <HexColorPicker
              color={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#cccccc"}
              onChange={(color) => {
                onChange(color)
                setInputValue(color)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
