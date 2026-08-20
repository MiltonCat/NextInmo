"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTO_CATEGORIES, esVideo } from "@/lib/photoImages";
import { subirFotoAdmin } from "@/lib/subirFotoAdmin";

// Tope por archivo del bucket `property-images` (50 MB). Se chequea acá además
// de en Supabase porque el rechazo del Storage llega recién al final de la
// subida: con un video de 200 MB por una conexión de San Martín eso es esperar
// varios minutos para recibir un error que se sabía de entrada.
const TOPE_BYTES = 50 * 1024 * 1024;

const TIPOS_ACEPTADOS = "image/*,video/mp4,video/quicktime,video/webm";

// Un archivo recién elegido todavía no tiene URL, así que el tipo se decide por
// el MIME que informa el navegador y, si no lo informa (pasa con algunos .mov),
// por la extensión del nombre.
function esArchivoDeVideo(file) {
  return String(file?.type || "").startsWith("video/") || esVideo(file?.name);
}

function pesoLegible(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Gestor de fotos del formulario de propiedades. Reemplaza los 5 casilleros
// fijos por una galería de cantidad libre:
//
// - Cada foto se puede reordenar (arriba/abajo) y eliminar. La primera es la
//   portada, y es la que sale en las tarjetas, en el SEO y en los correos.
// - Cada foto lleva un "ambiente" (Cocina, Dormitorio, Baño, Exterior, Otros)
//   para agruparlas en la ficha pública como el recorrido fotográfico de
//   Airbnb. Dejarlo en "Sin categoría" está bien: esas fotos caen en un grupo
//   genérico ("Fotos adicionales") al final del recorrido.
//
// DIFERENCIA CON LA VERSIÓN DE JULIO 2026: aquella mandaba los archivos nuevos
// dentro del envío del formulario (`<input type="file" multiple>`). Con el tope
// de 4,5 MB de Vercel eso no sobrevive ni con cinco fotos, mucho menos con
// quince. Acá cada foto se sube al Storage apenas se la elige, y al formulario
// le queda un único campo de texto (`images_json`) con la galería final.
//
// Consecuencia visible: hay un momento en que la foto está en pantalla pero
// todavía no en el servidor. Se muestra atenuada con un cartel de progreso, y
// el botón de guardar queda bloqueado hasta que no falte ninguna.
export default function ImagesManager({ initialImages = [], onSubiendoChange }) {
  const [photos, setPhotos] = useState(() =>
    initialImages.map((img, i) => ({
      key: `inicial-${i}-${img.url}`,
      url: img.url,
      preview: img.url,
      category: img.category || null,
      kind: img.kind === "video" || esVideo(img.url) ? "video" : "image",
      estado: "listo",
      error: null,
    }))
  );

  // Contador para las claves de React. No sirve el índice (las fotos se
  // reordenan y se borran) ni la URL (todavía no existe mientras sube).
  const contador = useRef(0);

  const subiendo = photos.some((p) => p.estado === "subiendo");

  // Le avisa al formulario si hay subidas en curso, para que no deje guardar
  // una propiedad a la que le faltarían fotos.
  useEffect(() => {
    onSubiendoChange?.(subiendo);
  }, [subiendo, onSubiendoChange]);

  // Las previsualizaciones locales son objetos en memoria del navegador; si no
  // se liberan, quedan retenidas hasta recargar la página.
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.preview && p.preview !== p.url && p.preview.startsWith("blob:")) {
          URL.revokeObjectURL(p.preview);
        }
      });
    };
    // Solo al desmontar: adentro se lee el último valor de photos por closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizar = useCallback((key, cambios) => {
    setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, ...cambios } : p)));
  }, []);

  const agregarArchivos = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []).filter((f) => f.size > 0);
      if (files.length === 0) return;

      const nuevas = files.map((file) => {
        const pesado = file.size > TOPE_BYTES;
        return {
          key: `nueva-${contador.current++}`,
          // Un archivo que ya sabemos que el bucket va a rechazar no se manda:
          // queda en error desde el arranque, con el peso a la vista.
          file: pesado ? null : file,
          url: null,
          preview: URL.createObjectURL(file),
          category: null,
          kind: esArchivoDeVideo(file) ? "video" : "image",
          estado: pesado ? "error" : "subiendo",
          error: pesado
            ? `Pesa ${pesoLegible(file.size)} y el máximo por archivo es 50 MB. Comprimilo antes de subirlo.`
            : null,
        };
      });

      setPhotos((prev) => [...prev, ...nuevas]);

      // De a una y en orden: subir quince fotos en paralelo satura la conexión
      // de subida (que en San Martín suele ser la mitad que la de bajada) y
      // hace que todas tarden, en vez de ir viéndolas aparecer.
      for (const foto of nuevas) {
        if (!foto.file) continue;
        try {
          const url = await subirFotoAdmin(foto.file);
          actualizar(foto.key, { url, estado: "listo", file: null });
        } catch (e) {
          actualizar(foto.key, { estado: "error", error: e.message });
        }
      }
    },
    [actualizar]
  );

  const reintentar = useCallback(
    async (key) => {
      const foto = photos.find((p) => p.key === key);
      if (!foto?.file) return;
      actualizar(key, { estado: "subiendo", error: null });
      try {
        const url = await subirFotoAdmin(foto.file);
        actualizar(key, { url, estado: "listo", file: null });
      } catch (e) {
        actualizar(key, { estado: "error", error: e.message });
      }
    },
    [photos, actualizar]
  );

  // La primera de la lista es la portada, y la portada TIENE que ser una foto:
  // de ahí salen la tarjeta del listado, la imagen del SEO y la del correo de
  // aviso, y ninguna de las tres sabe mostrar un video. Si el primer lugar
  // quedó ocupado por un video, sube la primera foto que haya.
  const conPortadaValida = (lista) => {
    const primeraFoto = lista.findIndex((p) => p.kind !== "video");
    if (primeraFoto <= 0) return lista;
    return [lista[primeraFoto], ...lista.filter((_, i) => i !== primeraFoto)];
  };

  const mover = (index, delta) => {
    setPhotos((prev) => {
      const destino = index + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[destino]] = [next[destino], next[index]];
      // El movimiento se descarta si deja un video de portada. Se prefiere no
      // hacer nada antes que reacomodar por atrás: si el botón moviera la cosa
      // a un lugar distinto del que se pidió, no se entendería por qué.
      if (next[0]?.kind === "video" && next.some((p) => p.kind !== "video")) return prev;
      return next;
    });
  };

  const eliminar = (key) => {
    // La foto ya subida NO se borra del bucket: si el guardado falla o el admin
    // se arrepiente y cancela, la propiedad tiene que quedar como estaba. Los
    // archivos sueltos son tarea de mantenimiento, no del formulario.
    //
    // Acá sí se reacomoda solo: al borrar la portada, el video que venía atrás
    // pasaría a primer lugar sin que nadie lo haya pedido.
    setPhotos((prev) => conPortadaValida(prev.filter((p) => p.key !== key)));
  };

  // Lo único que viaja al servidor. Solo las que terminaron de subir: una foto
  // a medio camino no tiene URL que guardar.
  const valorEnviado = JSON.stringify(
    photos
      .filter((p) => p.estado === "listo" && p.url)
      .map(({ url, category, kind }) => ({
        url,
        // Un video no tiene ambiente: no es "la cocina", es el recorrido entero.
        category: kind === "video" ? null : category || null,
        kind: kind === "video" ? "video" : "image",
      }))
  );

  const listas = photos.filter((p) => p.estado === "listo").length;
  const fallidas = photos.filter((p) => p.estado === "error").length;
  const videos = photos.filter((p) => p.estado === "listo" && p.kind === "video").length;

  return (
    <div className="space-y-4">
      <input type="hidden" name="images_json" value={valorEnviado} />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.key}
              className={`relative rounded-lg border p-2 ${
                photo.estado === "error" ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            >
              {index === 0 && photo.estado === "listo" && photo.kind !== "video" && (
                <span className="absolute left-1 top-1 z-10 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  PORTADA
                </span>
              )}
              {photo.kind === "video" && (
                <span className="absolute right-1 top-1 z-10 rounded bg-gray-900/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  VIDEO
                </span>
              )}

              <div className="relative mb-2 h-28 overflow-hidden rounded-md bg-gray-100">
                {photo.kind === "video" ? (
                  <video
                    src={photo.preview}
                    // `metadata` alcanza para sacar el primer cuadro y saber
                    // cuánto dura. Precargar el video entero de quince fichas
                    // abiertas en el panel sería absurdo.
                    preload="metadata"
                    muted
                    playsInline
                    controls={photo.estado === "listo"}
                    className={`h-full w-full object-cover ${photo.estado !== "listo" ? "opacity-40" : ""}`}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo.preview}
                    alt=""
                    className={`h-full w-full object-cover ${photo.estado !== "listo" ? "opacity-40" : ""}`}
                  />
                )}
                {photo.estado === "subiendo" && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    Subiendo…
                  </span>
                )}
                {/* Sin `file` no hay nada que reintentar: es un archivo que ni
                    se llegó a mandar (pesa más que el tope). Ahí el único
                    camino es quitarlo y subir una versión más liviana. */}
                {photo.estado === "error" && photo.file && (
                  <button
                    type="button"
                    onClick={() => reintentar(photo.key)}
                    className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-red-700 underline"
                  >
                    Reintentar
                  </button>
                )}
              </div>

              {photo.kind === "video" ? (
                // El ambiente agrupa fotos dentro del recorrido; un video no
                // pertenece a un ambiente, tiene su propia sección arriba de
                // todo. Se deja el lugar ocupado para que la grilla no se
                // desalinee cuando hay fotos al lado.
                <p className="rounded-md bg-gray-100 px-2 py-1.5 text-xs text-gray-500">
                  Se muestra al inicio del recorrido
                </p>
              ) : (
                <select
                  value={photo.category || ""}
                  onChange={(e) => actualizar(photo.key, { category: e.target.value || null })}
                  disabled={photo.estado !== "listo"}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-gray-900 focus:outline-none disabled:bg-gray-100"
                >
                  <option value="">Sin categoría</option>
                  {PHOTO_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              )}

              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => mover(index, -1)}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                    aria-label="Mover antes"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(index, 1)}
                    disabled={index === photos.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                    aria-label="Mover después"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => eliminar(photo.key)}
                  className="flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>

              {photo.error && (
                <p className="mt-1 text-[11px] leading-snug text-red-700">{photo.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-gray-300 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="agregar-fotos">
          Agregar fotos o video
        </label>
        <input
          id="agregar-fotos"
          type="file"
          accept={TIPOS_ACEPTADOS}
          multiple
          onChange={(e) => {
            agregarArchivos(e.target.files);
            e.target.value = ""; // permite volver a elegir el mismo archivo si se quitó
          }}
          className="text-sm"
        />
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Podés seleccionar varias a la vez, sin límite de cantidad. Cada una se sube apenas la
          elegís. La primera de la lista es la portada. El ambiente es opcional, pero es lo que
          arma el recorrido fotográfico agrupado en la ficha pública.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          También podés subir un video (mp4, mov o webm), hasta 50 MB. Va al principio del
          recorrido, no puede ser la portada, y conviene comprimirlo: un recorrido de un minuto en
          720p pesa unos 10 MB, y el mismo archivo sin comprimir puede irse a 80.
        </p>
      </div>

      {photos.length > 0 && (
        <p className="text-xs text-gray-500">
          {listas} {listas === 1 ? "archivo listo" : "archivos listos"}
          {videos > 0 && ` (${videos === 1 ? "1 video" : `${videos} videos`})`}
          {subiendo && " · subiendo…"}
          {fallidas > 0 && ` · ${fallidas} con error`}
        </p>
      )}
    </div>
  );
}
