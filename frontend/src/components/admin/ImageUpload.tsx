import { useRef, useState } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"

interface ImageUploadSingleProps {
  onUpload: (file: File) => void
  multiple?: false
  preview?: string | null
  accept?: string
  isLoading?: boolean
}

interface ImageUploadMultipleProps {
  onUpload: (files: File[]) => void
  multiple: true
  preview?: string | null
  accept?: string
  isLoading?: boolean
}

type ImageUploadProps = ImageUploadSingleProps | ImageUploadMultipleProps

export default function ImageUpload({
  onUpload,
  multiple = false,
  preview,
  accept = "image/*",
  isLoading = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localPreviews, setLocalPreviews] = useState<string[]>([])

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Generate local preview URLs
    const previews = fileArray.map((f) => URL.createObjectURL(f))
    setLocalPreviews(previews)

    if (multiple) {
      ;(onUpload as (files: File[]) => void)(fileArray)
    } else {
      ;(onUpload as (file: File) => void)(fileArray[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    // Reset input so the same file can be re-selected
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleClearPreview = () => {
    setLocalPreviews([])
    if (inputRef.current) inputRef.current.value = ""
  }

  const displayPreview = localPreviews[0] ?? preview ?? null

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-gold bg-gold/5"
            : "border-slate/20 dark:border-white/10 hover:border-gold/50 bg-slate/5 dark:bg-white/5"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-sm text-slate dark:text-slate-light">Wird hochgeladen…</p>
          </div>
        ) : displayPreview ? (
          <div className="relative group">
            <img
              src={displayPreview}
              alt="Vorschau"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-charcoal text-sm font-medium rounded-lg hover:bg-cream transition-colors"
              >
                <Upload className="w-4 h-4" />
                Ersetzen
              </button>
              <button
                type="button"
                onClick={handleClearPreview}
                className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Vorschau entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 py-10 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gold" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-charcoal dark:text-white">
                Bild hierher ziehen
              </p>
              <p className="text-xs text-slate dark:text-slate-light mt-0.5">
                oder{" "}
                <span className="text-gold underline underline-offset-2">
                  Datei auswählen
                </span>
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Multiple previews strip */}
      {multiple && localPreviews.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {localPreviews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Vorschau ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-slate/10 dark:border-white/10"
            />
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
