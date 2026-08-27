"use client";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { estadoDe, getDevelopmentSlug, unidadLabel } from "@/data/developments";

// Criterio visual (hereda el de PropertyCard y le suma lo propio de una obra):
//
// 1. Sin sombra ni borde: la foto redondeada es la única forma. La separación
//    entre tarjetas la hace el aire.
// 2. Sobre la foto se identifica primero que es un desarrollo inmobiliario y,
//    separado, el estado de la obra. Así no se confunde con una venta usada.
// 3. El avance de obra va como barra fina bajo el título. En un desarrollo es
//    el dato que separa "una idea" de "algo que existe".
// 4. Un solo color fuerte por tarjeta, el del estado. El precio va en negro:
//    le alcanza el peso tipográfico para ser lo más leído.
//
// Toda la tarjeta está escrita para bancarse datos faltantes. Un emprendimiento
// se carga antes de tener las fotos, el avance o la lista de lotes libres, y en
// ese hueco NO va un cero ni un "0%": va nada. Un "0 disponibles" en una obra
// que recién arranca es peor que no decir nada, porque se lee como agotado.

// Tailwind necesita ver las clases completas para incluirlas en el build, así
// que no se pueden armar con template strings (`bg-${color}-500` no compila).
const ESTADO_STYLES = {
  amber:   { dot: "bg-amber-500",   bar: "bg-amber-500" },
  blue:    { dot: "bg-blue-500",    bar: "bg-blue-500" },
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
  gray:    { dot: "bg-gray-400",    bar: "bg-gray-400" },
};

function DevelopmentCard({ development }) {
  // Mismo criterio que la ficha: un loteo no está "en construcción".
  const estado = estadoDe(development);
  const styles = ESTADO_STYLES[estado.color] ?? ESTADO_STYLES.gray;

  // null = no sabemos cuántos quedan. 0 = agotado de verdad. Son dos cosas
  // distintas y confundirlas le pone "AGOTADO" encima a un proyecto que recién
  // se carga.
  const disponibles = development.unidadesDisponibles;
  const seSabeStock = typeof disponibles === "number";
  const agotado = disponibles === 0;
  const ultimas = seSabeStock && disponibles > 0 && disponibles <= 3;

  const dormitorios = (development.tipologias ?? [])
    .map((t) => t.dormitorios)
    .filter((d) => d > 0);
  const rangoDorm =
    dormitorios.length === 0
      ? null
      : Math.min(...dormitorios) === Math.max(...dormitorios)
        ? `${dormitorios[0]} dorm`
        : `${Math.min(...dormitorios)} a ${Math.max(...dormitorios)} dorm`;

  // Una sola línea de atributos con separadores "·". El filter saca lo que no
  // aplica sin dejar separadores huérfanos.
  const specs = [
    development.unidadesTotales
      ? `${development.unidadesTotales} ${unidadLabel(development, development.unidadesTotales)}`
      : null,
    rangoDorm,
    development.fideicomiso ? "Fideicomiso" : null,
  ].filter(Boolean).join(" · ");

  // La barra solo aparece si hay un número de avance Y la obra está en marcha.
  // En un proyecto terminado sería una barra llena que no informa nada.
  const muestraAvance =
    typeof development.avance === "number" &&
    (development.estado === "pozo" || development.estado === "construccion");

  return (
    <Link
      href={`/desarrollos/${getDevelopmentSlug(development)}`}
      className="group block h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100">
        {/* Sin foto se dibuja un fondo neutro con el nombre. Antes acá iba un
            <Image src={null}>, que en Next 16 tira un error de consola por src
            vacío y deja un hueco roto en la grilla. */}
        {development.image ? (
          <Image
            src={development.image}
            alt={development.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${
              agotado ? "brightness-75 grayscale" : "group-hover:scale-[1.03]"
            }`}
          />
        ) : development.video?.youtubeId ? (
          // Sin foto propia pero con video del desarrollador, la portada del
          // video hace de tapa. Va como <img> y no como next/image a propósito:
          // usar next/image obligaría a sumar i.ytimg.com a los remotePatterns
          // de next.config, y no vale tocar la config de imágenes de todo el
          // sitio por una miniatura. La sirve YouTube, ya viene comprimida.
          <img
            src={`https://i.ytimg.com/vi/${development.video.youtubeId}/maxresdefault.jpg`}
            alt={development.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 ${
              agotado ? "brightness-75 grayscale" : "group-hover:scale-[1.03]"
            }`}
          />
        ) : (
          <SinFoto nombre={development.name} />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            Desarrollo inmobiliario
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {estado.label}
          </span>
          {development.destacado && !agotado && (
            <span className="rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Destacado
            </span>
          )}
        </div>

        {agotado && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-xl font-black tracking-[0.2em] text-white">
            AGOTADO
          </span>
        )}
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">
            {development.name}
          </h3>
          {development.entrega && (
            <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
              {development.entrega}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {[development.location, development.city].filter(Boolean).join(", ")}
        </p>
        {specs && <p className="text-sm text-gray-500">{specs}</p>}

        {muestraAvance && (
          <div className="mt-2.5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${styles.bar} transition-[width] duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, development.avance))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {development.avance}% de avance de obra
            </p>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
          {development.precioDesde > 0 && (
            <p className="text-[15px] text-gray-900">
              <span className="text-gray-500">Desde </span>
              <span className="font-semibold">
                USD {development.precioDesde.toLocaleString("es-AR")}
              </span>
            </p>
          )}
          {seSabeStock && !agotado && (
            <p className={`text-sm ${ultimas ? "font-semibold text-rose-600" : "text-gray-500"}`}>
              {ultimas
                ? `Últim${unidadLabel(development, disponibles).endsWith("s") ? "as" : "a"} ${disponibles} ${unidadLabel(development, disponibles)}`
                : `${disponibles} disponibles`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Fondo neutro para desarrollos sin fotos cargadas. Es a propósito sobrio y sin
// ícono de "imagen rota": mientras el proyecto esté publicado sin material
// propio, tiene que parecer una decisión y no un error.
export function SinFoto({ nombre }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 px-6">
      <span className="text-center font-jakarta text-lg font-black leading-tight text-gray-400">
        {nombre}
      </span>
    </div>
  );
}

export default memo(DevelopmentCard);
