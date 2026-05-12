import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "…")[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "…", total)
  } else if (current >= total - 2) {
    pages.push(1, "…", total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, "…", current - 1, current, current + 1, "…", total)
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null

  const firstItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null
  const lastItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      {/* Item count info */}
      {totalItems !== undefined && firstItem !== null && lastItem !== null ? (
        <p className="text-sm text-slate dark:text-slate-light">
          Zeige{" "}
          <span className="font-medium text-charcoal dark:text-white">
            {firstItem}–{lastItem}
          </span>{" "}
          von{" "}
          <span className="font-medium text-charcoal dark:text-white">{totalItems}</span>{" "}
          Einträgen
        </p>
      ) : (
        <div />
      )}

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate hover:text-charcoal hover:bg-slate/10 dark:text-slate-light dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Vorherige Seite"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((page, idx) =>
            page === "…" ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 text-center text-sm text-slate dark:text-slate-light select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                  page === currentPage
                    ? "bg-gold text-white font-medium shadow-sm"
                    : "text-slate hover:text-charcoal hover:bg-slate/10 dark:text-slate-light dark:hover:text-white dark:hover:bg-white/10"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate hover:text-charcoal hover:bg-slate/10 dark:text-slate-light dark:hover:text-white dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Nächste Seite"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
