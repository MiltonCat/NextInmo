"use client";
import dynamic from "next/dynamic";

// La curva de evolución ya existe y la comparten /precio-m2 e /inversiones. Se
// reusa tal cual: dos curvas distintas para el mismo dato terminan
// contradiciéndose. Entra por dynamic para que recharts no viaje en el bundle
// del chat, que casi siempre se abre sin pedir ningún gráfico.
const EvolucionChart = dynamic(() => import("@/components/InversionesEvolucionChart"), {
  ssr: false,
  loading: () => <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100" />,
});

const AIRBNB = "#E8325A";

const usd = (valor) => `USD ${Number(valor).toLocaleString("es-AR")}`;

// Barras horizontales y no una torta ni columnas: los nombres de los barrios son
// largos ("Las Pendientes Ski Village") y en 384 px de panel, apilados en
// vertical, es lo único que se lee sin rotar texto ni abreviar. Va en HTML plano
// —no en recharts— porque seis barras con su valor escrito al lado no necesitan
// ejes, y así el chat no carga una librería de gráficos para esto.
function BarrasPorBarrio({ barrios }) {
  const tope = Math.max(...barrios.map((b) => b.valor));

  return (
    <div className="space-y-2.5">
      {barrios.map((b) => (
        <div key={b.barrio}>
          <div className="flex min-w-0 items-baseline justify-between gap-2">
            <span
              className={`min-w-0 break-words text-[11px] leading-snug ${
                b.destacado ? "font-semibold text-gray-900" : "text-gray-600"
              }`}
            >
              {b.barrio}
            </span>
            <span className="flex-shrink-0 text-[11px] font-semibold tabular-nums text-gray-800">
              {usd(b.valor)}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, Math.round((b.valor / tope) * 100))}%`,
                // El barrio que la persona nombró va en el color de la marca y el
                // resto en el gris de los ejes del sitio: son la vara para leerlo,
                // no seis competidores. Gris y no un rosa claro porque dos tonos
                // del mismo rosa o se confunden entre sí o se pierden contra el
                // fondo —medido, no estimado—, y porque lo que distingue a cada
                // barra es su valor escrito al lado, no su color.
                backgroundColor: b.destacado ? AIRBNB : "#9CA3AF",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LuciaGrafico({ grafico }) {
  if (!grafico) return null;
  const { tipo, titulo, nota } = grafico;

  const cuerpo =
    tipo === "evolucion" && grafico.serie?.length > 1 ? (
      <EvolucionChart data={grafico.serie} alto="h-40" compacto />
    ) : tipo === "m2_barrio" && grafico.barrios?.length > 1 ? (
      <BarrasPorBarrio barrios={grafico.barrios} />
    ) : null;

  if (!cuerpo) return null;

  return (
    <figure className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      {titulo && (
        <figcaption className="mb-2.5 text-[11px] font-semibold leading-snug text-gray-800">
          {titulo}
        </figcaption>
      )}
      {cuerpo}
      {/* De cuándo es el dato y sobre cuántas propiedades: sin eso, un gráfico
          de precios se lee como si fuera de hoy y de todo el mercado. */}
      {nota && <p className="mt-2.5 break-words text-[10px] leading-snug text-gray-400">{nota}</p>}
    </figure>
  );
}
