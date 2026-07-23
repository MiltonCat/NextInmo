"use client";

import { useMemo, useRef } from "react";
import { PHOTO_CATEGORIES, UNCATEGORIZED } from "@/lib/photoImages";

// "Recorrido fotográfico" estilo Airbnb: nav pegajoso con las categorías
// presentes en esta propiedad + secciones agrupadas por ambiente debajo.
// Las fotos sin categoría (o con una categoría que ya no existe) caen en el
// grupo "Fotos adicionales" al final, para no perder ninguna foto de vista.
// Al clickear una foto se abre el Lightbox (una foto a la vez) en el índice
// correcto dentro de `images` (el mismo array que recibe el Lightbox).
export default function PhotoTour({ images, title, isOpen, onClose, onOpenPhoto }) {
  const sectionRefs = useRef({});

  const groups = useMemo(() => {
    const byCategory = new Map();
    for (const cat of PHOTO_CATEGORIES) byCategory.set(cat.value, []);
    byCategory.set(UNCATEGORIZED.value, []);

    images.forEach((img, index) => {
      const key = img.category && byCategory.has(img.category) ? img.category : UNCATEGORIZED.value;
      byCategory.get(key).push({ ...img, index });
    });

    return [...PHOTO_CATEGORIES, UNCATEGORIZED]
      .map((cat) => ({ ...cat, photos: byCategory.get(cat.value) }))
      .filter((group) => group.photos.length > 0);
  }, [images]);

  if (!isOpen) return null;

  const scrollToSection = (value) => {
    sectionRefs.current[value]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Recorrido fotográfico de ${title}`}>
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <button onClick={onClose} className="text-2xl text-gray-500 transition hover:text-gray-900" aria-label="Cerrar recorrido fotográfico">
          ←
        </button>
        <h2 className="truncate font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Recorrido fotográfico</h1>

        {groups.length > 1 && (
          <div className="mb-8 flex gap-3 overflow-x-auto border-b border-gray-100 pb-6">
            {groups.map((group) => (
              <button
                key={group.value ?? "sin-categoria"}
                type="button"
                onClick={() => scrollToSection(group.value)}
                className="flex-shrink-0 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={group.photos[0].url}
                  alt={group.label}
                  className="mb-1.5 h-20 w-28 rounded-lg object-cover"
                />
                <span className="block w-28 truncate text-xs font-medium text-gray-700">{group.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-10 pb-10">
          {groups.map((group) => (
            <section key={group.value ?? "sin-categoria"} ref={(el) => { sectionRefs.current[group.value] = el; }}>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{group.label}</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {group.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.index}
                    src={photo.url}
                    alt={`${title} - ${group.label}`}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full cursor-pointer rounded-lg object-cover transition hover:opacity-90 sm:h-64"
                    onClick={() => onOpenPhoto(photo.index)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
