"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Lightbox({ images, title, isOpen, onClose, startIndex = 0 }) {
  if (!isOpen || images.length === 0) return null;

  return (
    <LightboxDialog
      key={`${startIndex}-${images.length}`}
      images={images}
      title={title}
      onClose={onClose}
      startIndex={startIndex}
    />
  );
}

const SWIPE_THRESHOLD_PX = 40;

function LightboxDialog({ images, title, onClose, startIndex }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const prevImage = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, onClose, prevImage]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaX.current > SWIPE_THRESHOLD_PX) prevImage();
    else if (touchDeltaX.current < -SWIPE_THRESHOLD_PX) nextImage();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${title}`}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl hover:text-rose-500 p-2"
        onClick={onClose}
        aria-label="Cerrar galería"
      >
        ✕
      </button>
      <button
        className="absolute left-4 text-white text-4xl hover:text-rose-500 p-2 hidden sm:block"
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        aria-label="Imagen anterior"
      >
        ‹
      </button>
      <div className="max-w-4xl max-h-[80vh] px-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
          draggable={false}
        />
      </div>
      <button
        className="absolute right-4 text-white text-4xl hover:text-rose-500 p-2 hidden sm:block"
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        aria-label="Imagen siguiente"
      >
        ›
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-rose-500" : "bg-white/50"}`}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            aria-label={`Ver imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
