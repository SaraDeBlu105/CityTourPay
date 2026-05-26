import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND_NAVY = "#0B2F5E";

interface PhotoGalleryProps {
  images: string[];
  title?: string;
}

export function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, goNext, goPrev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  if (!images || images.length === 0) return null;

  const primary = images[0];
  const secondary = images.slice(1, 5);

  return (
    <>
      {/* ── Grid layout ── */}
      <div className="rounded-2xl overflow-hidden">
        {images.length === 1 ? (
          /* Single image */
          <button
            onClick={() => openLightbox(0)}
            className="relative w-full aspect-[16/9] block group"
          >
            <img
              src={primary}
              alt={title ?? "Galleria"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:brightness-95 transition-all"
            />
            <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                <ZoomIn className="w-3 h-3" /> Espandi
              </span>
            </div>
          </button>
        ) : (
          /* Multi-image mosaic */
          <div
            className={cn(
              "grid gap-1",
              secondary.length === 0 && "grid-cols-1",
              secondary.length === 1 && "grid-cols-2",
              secondary.length >= 2 && "grid-cols-2 md:grid-cols-[2fr_1fr]",
            )}
          >
            {/* Primary large image */}
            <button
              onClick={() => openLightbox(0)}
              className="relative group overflow-hidden aspect-[4/3] md:aspect-auto md:row-span-2"
            >
              <img
                src={primary}
                alt={title ?? "Galleria foto 1"}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Espandi
                </span>
              </div>
            </button>

            {/* Secondary thumbnails */}
            <div
              className={cn(
                "grid gap-1",
                secondary.length === 1 && "grid-cols-1",
                secondary.length >= 2 && "grid-rows-2",
              )}
            >
              {secondary.slice(0, 2).map((src, i) => {
                const isLast = i === 1 && images.length > 5;
                return (
                  <button
                    key={i}
                    onClick={() => openLightbox(i + 1)}
                    className="relative group overflow-hidden aspect-[4/3]"
                  >
                    <img
                      src={src}
                      alt={`${title ?? "Galleria"} foto ${i + 2}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">+{images.length - 4}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View all button */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="mt-2 text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            Vedi tutte le {images.length} foto
          </button>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(11,47,94,0.96)" }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Precedente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${title ?? "Galleria"} – ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Successiva"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                    i === lightboxIndex ? "border-white scale-105" : "border-transparent opacity-60 hover:opacity-90"
                  )}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
