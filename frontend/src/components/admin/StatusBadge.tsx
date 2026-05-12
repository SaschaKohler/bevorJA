interface StatusBadgeProps {
  status: string
  activeLabel?: string
  inactiveLabel?: string
}

type BadgeVariant = "green" | "gray" | "yellow" | "blue" | "purple" | "dark-green" | "red"

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  gray: "bg-slate/10 text-slate dark:bg-white/10 dark:text-slate-light",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "dark-green": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

function resolveVariant(status: string): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "true":
    case "active":
      return { variant: "green", label: "Aktiv" }
    case "false":
    case "inactive":
      return { variant: "gray", label: "Inaktiv" }
    case "pending":
      return { variant: "yellow", label: "Ausstehend" }
    case "paid":
      return { variant: "green", label: "Bezahlt" }
    case "processing":
      return { variant: "blue", label: "In Bearbeitung" }
    case "shipped":
      return { variant: "purple", label: "Versendet" }
    case "delivered":
      return { variant: "dark-green", label: "Geliefert" }
    case "cancelled":
      return { variant: "red", label: "Storniert" }
    default:
      return { variant: "gray", label: status }
  }
}

export default function StatusBadge({
  status,
  activeLabel,
  inactiveLabel,
}: StatusBadgeProps) {
  const { variant, label: defaultLabel } = resolveVariant(status)

  let label = defaultLabel
  if ((status === "true" || status === "active") && activeLabel) label = activeLabel
  if ((status === "false" || status === "inactive") && inactiveLabel) label = inactiveLabel

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
