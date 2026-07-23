"use client";

import { useEffect, useRef, useState } from "react";
import { PHOTO_CATEGORIES } from "@/lib/photoImages";

// Gestor de fotos del formulario de propiedades. Reemplaza los 5 casilleros
// fijos por una galería de cantidad libre:
// - Las fotos existentes se pueden reordenar (arriba/abajo) y eliminar.
// - Cada foto (existente o nueva) tiene un selector de "ambiente" (Cocina,
//   Dormitorio, Baño, Exterior, Otros) para poder agruparlas en la ficha
//   pública como el recorrido fotográfico de Airbnb. Dejar "Sin categoría"
//   está bien: esas fotos caen en un grupo genérico ("Fotos adicionales")
//   hasta que se les asigne un ambiente.
// - Las fotos nuevas se agregan al final (se pueden reordenar recién en una
//   edición posterior, cuando ya están guardadas — evita manipular File[]
//   entre inputs, que es frágil en el navegador).
// El orden final de las existentes viaja en un input oculto (JSON, con
// categoría incluida); las nuevas viajan como archivos reales en un input
// file múltiple más un input oculto paralelo con sus categorías elegidas.
export default function ImagesManager({ initialImages = [] }) {
  const [kept, setKept] = useState(initialImages); // [{ url, category }]
  const [newFiles, setNewFiles] = useState([]); // [{ file, previewUrl, category }]

  const moveUp = (index) => {
    if (index === 0) return;
    setKept((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index) => {
    setKept((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const removeExisting = (index) => {
    setKept((prev) => prev.filter((_, i) => i !== index));
  };

  const setExistingCategory = (index, category) => {
    setKept((prev) => prev.map((p, i) => (i === index ? { ...p, category: category || null } : p)));
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.size > 0);
    setNewFiles((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file), category: null })),
    ]);
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setNewFileCategory = (index, category) => {
    setNewFiles((prev) => prev.map((f, i) => (i === index ? { ...f, category: category || null } : f)));
  };

  return (
    <div className="space-y-4">
      <input
        type="hidden"
        name="existing_images"
        value={JSON.stringify(kept.map(({ url, category }) => ({ url, category: category || null })))}
      />
      <input
        type="hidden"
        name="new_images_categories"
        value={JSON.stringify(newFiles.map((f) => f.category || null))}
      />

      {kept.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kept.map((photo, index) => (
            <div key={photo.url} className="relative border border-gray-200 rounded-lg p-2">
              {index === 0 && (
                <span className="absolute top-1 left-1 z-10 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  PORTADA
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="w-full h-28 object-cover rounded-md mb-2 bg-gray-100" />
              <CategorySelect
                value={photo.category}
                onChange={(value) => setExistingCategory(index, value)}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                    aria-label="Mover antes"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === kept.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                    aria-label="Mover después"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeExisting(index)}
                  className="w-7 h-7 flex items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Eliminar foto"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {newFiles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Fotos nuevas (se agregan al final)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newFiles.map((item, index) => (
              <div key={item.previewUrl} className="relative border border-dashed border-gray-300 rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => removeNewFile(index)}
                  className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Quitar foto nueva"
                >
                  ✕
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt="" className="w-full h-28 object-cover rounded-md mb-2 bg-gray-100" />
                <CategorySelect
                  value={item.category}
                  onChange={(value) => setNewFileCategory(index, value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agregar fotos
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ""; // permite volver a seleccionar el mismo archivo si se quita
          }}
          className="text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Podés seleccionar varias a la vez. La primera foto de la lista es la que se usa como portada.
          El ambiente (Cocina, Dormitorio, etc.) es opcional, pero es lo que arma el recorrido
          fotográfico agrupado en la ficha pública.
        </p>
      </div>

      {/* Los archivos reales viajan en un input file oculto sincronizado con newFiles,
          para poder quitarlos individualmente (un <input type=file> nativo no permite
          editar su FileList desde JS una vez seleccionado). */}
      <SyncedFileInput files={newFiles.map((f) => f.file)} />
    </div>
  );
}

function CategorySelect({ value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs rounded-md border border-gray-300 px-2 py-1.5 text-gray-700 focus:border-gray-900 focus:outline-none"
    >
      <option value="">Sin categoría</option>
      {PHOTO_CATEGORIES.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}

// Mantiene un <input type="file" multiple> con exactamente los archivos de
// `files` usando DataTransfer, para que el form los envíe tal cual al server
// action aunque el usuario haya quitado alguno de la selección original
// (un <input type=file> nativo no permite editar su FileList desde JS).
function SyncedFileInput({ files }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
  }, [files]);

  return <input type="file" name="new_images" multiple ref={inputRef} className="hidden" />;
}
