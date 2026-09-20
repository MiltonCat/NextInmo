"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { esRemota, PHOTO_CATEGORIES, UNCATEGORIZED } from "@/lib/photoImages";

// El video no es un ambiente más: no se agrupa con las fotos ni se abre en el
// Lightbox. Tiene su propia sección y va primero, porque es lo que mejor
// transmite una propiedad y lo que nadie se toma el trabajo de buscar si queda
// escondido al final.
const VIDEO_GROUP = { value: "__video__", label: "Video" };

// "Recorrido fotográfico" estilo Airbnb: nav pegajoso con las categorías
// presentes en esta propiedad + secciones agrupadas por ambiente debajo.
// Las fotos sin categoría (o con una categoría que ya no existe) caen en el
// grupo "Fotos adicionales" al final, para no perder ninguna foto de vista.
// Al clickear una foto se abre el Lightbox (una foto a la vez).
//
// OJO CON LOS ÍNDICES: `images` puede traer video mezclado, pero el Lightbox
// solo recibe las fotos. Por eso cada foto lleva `photoIndex`, que es su
// posición contando SOLO fotos, y es ese el número que viaja a onOpenPhoto. Si
// se le pasara el índice dentro de `images`, con un video adelante el Lightbox
// abriría corrida en uno.
export default function PhotoTour({ images, title, isOpen, onClose, onOpenPhoto }) {
  const sectionRefs = useRef({});

  const groups = useMemo(() => {
    const byCategory = new Map();
    for (const cat of PHOTO_CATEGORIES) byCategory.set(cat.value, []);
    byCategory.set(UNCATEGORIZED.value, []);

    const videos = [];
    let posicionEntreFotos = 0;

    (images || []).forEach((img) => {
      if (img.kind === "video") {
        videos.push(img);
        return;
      }
      const key = img.category && byCategory.has(img.category) ? img.category : UNCATEGORIZED.value;
      byCategory.get(key).push({ ...img, photoIndex: posicionEntreFotos++ });
    });

    const deFotos = [...PHOTO_CATEGORIES, UNCATEGORIZED]
      .map((cat) => ({ ...cat, photos: byCategory.get(cat.value) }))
      .filter((group) => group.photos.length > 0);

    return videos.length > 0
      ? [{ ...VIDEO_GROUP, photos: videos, esVideo: true }, ...deFotos]
      : deFotos;
  }, [images]);

  if (!isOpen) return null;

  const scrollToSection = (value) => {
    sectionRefs.current[value]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalFotos = groups.reduce((n, g) => n + (g.esVideo ? 0 : g.photos.length), 0);

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
                <div className="relative mb-1.5 h-20 w-28">
                  {group.esVideo ? (
                    // Un <Image> con src apuntando a un mp4 no dibuja nada. La
                    // miniatura del video es un botón de play sobre fondo
                    // oscuro, sin pedirle un cuadro al archivo.
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-900">
                      <PlayIcon className="h-7 w-7 text-white" />
                    </div>
                  ) : (
                    <Image
                      src={group.photos[0].url}
                      alt={group.label}
                      fill
                      unoptimized={esRemota(group.photos[0].url)}
                      sizes="112px"
                      className="rounded-lg object-cover"
                    />
                  )}
                </div>
                <span className="block w-28 truncate text-xs font-medium text-gray-700">{group.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-10 pb-10">
          {groups.map((group) => (
            <section key={group.value ?? "sin-categoria"} ref={(el) => { sectionRefs.current[group.value] = el; }}>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{group.label}</h3>

              {group.esVideo ? (
                <div className="space-y-6">
                  {group.photos.map((video) => (
                    <PropertyVideo key={video.url} src={video.url} title={title} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {group.photos.map((photo) => (
                    <div key={photo.photoIndex} className="relative h-48 w-full sm:h-64">
                      <Image
                        src={photo.url}
                        alt={`${title} - ${group.label}`}
                        fill
                        unoptimized={esRemota(photo.url)}
                        sizes="(max-width: 640px) 50vw, 480px"
                        className="cursor-pointer rounded-lg object-cover transition hover:opacity-90"
                        onClick={() => onOpenPhoto(photo.photoIndex)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {totalFotos === 0 && (
          <p className="pb-10 text-sm text-gray-500">Esta propiedad todavía no tiene fotos cargadas.</p>
        )}
      </div>
    </div>
  );
}

// Reproductor del recorrido en video.
//
// EL PROBLEMA QUE RESUELVE: un video a `w-full` dentro del recorrido queda
// gigante. Y no por el ancho, sino por el alto: los recorridos se graban con el
// celular en la mano, o sea VERTICALES, y un 9:16 estirado al ancho de la
// columna ocupa tres pantallas. Había que mirarlo haciendo scroll, que es
// exactamente lo contrario de lo que sirve un video.
//
// LA SOLUCIÓN: el propio archivo dice cómo quiere mostrarse. En cuanto el
// navegador lee los metadatos (unos kilobytes, no el video entero) sabemos
// `videoWidth` y `videoHeight`, y con eso el reproductor se acomoda solo:
//
//   - vertical  → columna angosta y centrada, como un reel
//   - apaisado  → ancho completo, como cualquier video
//
// En los dos casos el alto queda topeado a 72vh, así que el video entra en
// pantalla entero sin importar el formato ni el tamaño del monitor.
function PropertyVideo({ src, title }) {
  const [meta, setMeta] = useState(null);

  const esVertical = meta ? meta.alto > meta.ancho : false;

  const leerMetadatos = (e) => {
    const v = e.currentTarget;
    if (!v.videoWidth || !v.videoHeight) return;
    setMeta({ ancho: v.videoWidth, alto: v.videoHeight, duracion: v.duration });
  };

  return (
    <figure
      className={`mx-auto w-full transition-[max-width] duration-300 ${
        // Hasta que se conocen los metadatos se asume apaisado pero acotado:
        // si arrancara a ancho completo, un vertical daría un salto feo al
        // encogerse un segundo después.
        esVertical ? "max-w-[22rem]" : "max-w-3xl"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-black/10">
        <video
          src={src}
          controls
          playsInline
          // `metadata` baja unos kilobytes para tener el primer cuadro, la
          // duración y las medidas. Sin esto el navegador se trae el video
          // entero apenas se abre el recorrido: varios MB que la mayoría de la
          // gente no va a mirar, y que además se descuentan del ancho de banda.
          preload="metadata"
          onLoadedMetadata={leerMetadatos}
          className="block max-h-[72vh] w-full object-contain"
          aria-label={`Recorrido en video de ${title}`}
        >
          Tu navegador no puede reproducir este video.
        </video>

        {meta?.duracion > 0 && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {formatearDuracion(meta.duracion)}
          </span>
        )}
      </div>

      <figcaption className="mt-3 text-center text-xs text-gray-500">
        Recorrido en video · {title}
      </figcaption>
    </figure>
  );
}

// Segundos → m:ss. Un recorrido nunca llega a una hora, así que no hace falta
// contemplar el formato con horas.
function formatearDuracion(segundos) {
  const total = Math.round(segundos);
  const min = Math.floor(total / 60);
  const seg = String(total % 60).padStart(2, "0");
  return `${min}:${seg}`;
}

function PlayIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.14v13.72a.5.5 0 00.76.43l11.14-6.86a.5.5 0 000-.86L8.76 4.71a.5.5 0 00-.76.43z" />
    </svg>
  );
}
