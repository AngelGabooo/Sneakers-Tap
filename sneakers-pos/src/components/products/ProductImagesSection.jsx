import { useRef } from 'react'
import { UploadCloud, Star, Trash2, ImageIcon } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

export default function ProductImagesSection({ images = [], onChange }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const list = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      isPrimary: false,
    }))
    onChange?.([...images, ...list])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleRemove = (id) => {
    onChange?.(images.filter((img) => img.id !== id))
  }

  const handleSetPrimary = (id) => {
    onChange?.(images.map((img) => ({ ...img, isPrimary: img.id === id })))
  }

  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Imágenes del producto
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Agrega fotografías para identificar fácilmente el producto.
        </p>
      </header>

      {/* Zona de drop */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="
          flex flex-col items-center justify-center text-center
          px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer
          border-gray-200 dark:border-dark-border
          bg-gray-50/50 dark:bg-dark-card/40
          hover:border-brand-blue hover:bg-blue-50/40 dark:hover:bg-blue-950/20
          transition-colors
        "
      >
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-3">
          <UploadCloud size={22} className="text-brand-blue" strokeWidth={1.9} />
        </div>
        <p className="text-sm font-medium text-brand-black dark:text-dark-text">
          Arrastra tus imágenes aquí
        </p>
        <p className="text-sm text-brand-blue font-medium mt-0.5">
          o haz clic para seleccionar archivos
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-2">
          PNG, JPG o WEBP · Máximo 5 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface"
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5">
                  <Badge variant="success">Principal</Badge>
                </div>
              )}

              <div className="
                absolute inset-0 flex items-center justify-center gap-1
                bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
              ">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className="p-1.5 rounded-md bg-white/90 hover:bg-white text-brand-black transition-colors"
                    title="Marcar como principal"
                  >
                    <Star size={14} strokeWidth={2.2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(img.id)}
                  className="p-1.5 rounded-md bg-white/90 hover:bg-white text-brand-red transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 dark:text-dark-muted">
          <ImageIcon size={13} strokeWidth={1.8} />
          <span>Aún no hay imágenes agregadas</span>
        </div>
      )}
    </Card>
  )
}