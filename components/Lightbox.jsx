"use client";
import { useState, useEffect } from "react";

export default function Lightbox({ images, title, isOpen, onClose, startIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  const prevImage = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  const nextImage = () => setCurrentIndex((currentIndex + 1) % images.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white text-3xl hover:text-rose-500 p-2" onClick={onClose}>
        ✕
      </button>
      <button className="absolute left-4 text-white text-4xl hover:text-rose-500 p-2" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
        ‹
      </button>
      <div className="max-w-4xl max-h-[80vh] px-16" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
      <button className="absolute right-4 text-white text-4xl hover:text-rose-500 p-2" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
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
          />
        ))}
      </div>
    </div>
  );
}
