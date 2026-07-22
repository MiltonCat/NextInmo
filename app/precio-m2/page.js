import Link from "next/link";
import PrecioM2Chart from "@/components/PrecioM2Chart";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import mercado, {
  MERCADO_GENERADO,
  RELEVADAS_MODELO_FMT,
  RELEVADAS_TOTAL_FMT,
} from "@/lib/mercado";

export const metadata = {
  title: "Precio m² San Martín de los Andes 2026",
  description: "Consultá el precio del m² en San Martín de los Andes por zona y tipo de propiedad: casas, departamentos, terrenos y evolución 2021–2026.",
  openGraph: {
    title: "Precio del m² en San Martín de los Andes 2026 — Catalán Propiedades",
    description: "Evolución del precio del metro cuadrado 2021–2026 por zona y tipo de propiedad en la Patagonia Argentina.",
    url: canonicalUrl("/precio-m2"),
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Precio del m² San Martín de los Andes 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precio del m² en San Martín de los Andes 2026",
    description: `Evolución 2021–2026 por zona. ${RELEVADAS_TOTAL_FMT} propiedades relevadas.`,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: canonicalUrl("/precio-m2"),
  },
};

const numero = new Intl.NumberFormat("es-AR");

const fechaActualizacion = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${MERCADO_GENERADO}T12:00:00Z`));

const CONTEXTO_EVOLUCION = {
  2021: "Post-pandemia — recuperación del mercado",
  2022: "San Martín de los Andes lidera precios en Argentina",
  2023: "Aumento de demanda turística e inversionista",
  2024: "Crecimiento sostenido — boom de construcciones",
  2025: "Estabilización de precios — mercado maduro",
  2026: "Consolidación — demanda internacional",
};

const NOMBRES_BARRIO = {
  "Vega Maipu": "Vega Maipú",
};

const EVOLUCION = mercado.evolucion_precios.serie.map((item) => ({
  anio: item.anio,
  precio: item.usd_m2,
  variacion: item.variacion_pct,
  contexto: CONTEXTO_EVOLUCION[item.anio] ?? item.descripcion,
  fuente: "Serie orientativa curada · No es un índice oficial",
}));

// Solo se publican barrios con una muestra utilizable de al menos 10 avisos.
// Los barrios con menos casos siguen disponibles en el dataset, pero no se
// muestran como una referencia suficientemente sólida para el visitante.
const BARRIOS_CON_MUESTRA = mercado.valor_m2_usd.por_barrio.filter(
  (barrio) => barrio.estado === "usable" && barrio.barrio !== "General" && barrio.n >= 10,
);

const METRICAS_RESIDENCIALES = [
  {
    valor: mercado.valor_m2_usd.referencia_general_casa_depto,
    label: "Referencia residencial",
    sub: `Casas + departamentos · ${RELEVADAS_MODELO_FMT} avisos utilizables`,
  },
  {
    valor: mercado.valor_m2_usd.por_tipo.Departamento,
    label: "Mediana departamentos",
    sub: `${numero.format(mercado.relevadas.por_tipo.Departamento)} publicaciones relevadas`,
  },
  {
    valor: mercado.valor_m2_usd.por_tipo.Casa,
    label: "Mediana casas",
    sub: `${numero.format(mercado.relevadas.por_tipo.Casa)} publicaciones relevadas`,
  },
];

const FUENTES = [
  {
    nombre: "Relevamiento propio",
    dato: `${RELEVADAS_TOTAL_FMT} publicaciones consolidadas y depuradas · ${fechaActualizacion}`,
  },
  { nombre: "Argenprop", dato: "Publicaciones utilizadas como referencia de oferta", url: "https://www.argenprop.com/inmuebles/venta/san-martin-de-los-andes" },
  { nombre: "Zonaprop", dato: "Publicaciones utilizadas como referencia de oferta", url: "https://www.zonaprop.com.ar" },
  { nombre: "Properati", dato: "Publicaciones utilizadas como referencia complementaria", url: "https://www.properati.com.ar" },
];

export default function PrecioM2Page() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gray-50 border-b border-gray-100 pt-8 pb-10 md:pt-24 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Actualizado — {fechaActualizacion}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Precio del m² en San Martín de los Andes 2026
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl leading-relaxed">
            Análisis actualizado del valor del metro cuadrado por zona y tipo de propiedad en San Martín de los Andes, basado en {RELEVADAS_TOTAL_FMT} propiedades relevadas en portales inmobiliarios locales.
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Datos orientativos basados en listings públicos · No constituyen tasación profesional
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 md:space-y-12">

        {/* Stat principal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {METRICAS_RESIDENCIALES.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-2xl md:text-3xl font-black text-rose-600 mb-1">
                USD {numero.format(s.valor)}
              </p>
              <p className="text-sm font-semibold text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Cómo leer estos valores</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Son medianas de precios publicados, no precios de operaciones cerradas. El relevamiento completo reúne {RELEVADAS_TOTAL_FMT} avisos de casas, departamentos, terrenos y otros inmuebles; la referencia residencial usa {RELEVADAS_MODELO_FMT} avisos utilizables de casas y departamentos después de limpiar y consolidar la base.
          </p>
        </div>

        {/* Gráfico de evolución */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Evolución orientativa del precio del m² (USD)</h2>
          <p className="text-gray-400 text-sm mb-6">Serie de referencia curada · San Martín de los Andes · 2021–2026</p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6">
            <PrecioM2Chart data={EVOLUCION} />
            <div className="mt-4 flex flex-wrap gap-4">
              {EVOLUCION.filter(e => e.variacion).map((e) => (
                <div key={e.anio} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">{e.anio}</span>
                  <span className="text-xs text-green-600 font-semibold">+{e.variacion}%</span>
                  <span className="text-xs text-gray-400">{e.contexto}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mt-5 pt-4 border-t border-gray-200">
              Esta curva sirve como contexto general y no constituye un índice histórico oficial. La serie fue mantenida como referencia de mercado; el valor 2026 se contrasta con la mediana residencial del relevamiento vigente.
            </p>
          </div>
        </div>

        {/* Tabla por barrio */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Mediana publicada por barrio</h2>
          <p className="text-gray-400 text-sm mb-6">Solo barrios con al menos 10 avisos utilizables · Actualizado {fechaActualizacion}</p>
          <div className="border border-gray-200 rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Barrio</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Avisos</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Mediana USD / m²</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Muestra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {BARRIOS_CON_MUESTRA.map((barrio) => (
                  <tr key={barrio.barrio} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{NOMBRES_BARRIO[barrio.barrio] ?? barrio.barrio}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{numero.format(barrio.n)}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">USD {numero.format(barrio.mediana_m2_usd)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={barrio.n >= 20 ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                        {barrio.n >= 20 ? "Sólida" : "Moderada"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-xs mt-3">
            Medianas calculadas sobre precios de publicación. Se excluyen de esta tabla los barrios con menos de 10 casos; los valores reales varían según tipo, estado, ubicación exacta y negociación.
          </p>
        </div>

        {/* Contexto / por qué SMA */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">¿Por qué sube el precio del m² en SMA?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 leading-relaxed">
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Demanda turística sostenida.</strong> San Martín es uno de los destinos más elegidos de la Patagonia, lo que mantiene alta la demanda de alquileres turísticos y propiedades de inversión.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Oferta de alquiler permanente muy limitada.</strong> Solo 49 propiedades en alquiler permanente relevadas en Argenprop, frente a más de 1.000 en venta.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Boom de construcciones premium.</strong> Proyectos en Chapelco Golf y la Costanera traccionan el precio promedio hacia arriba.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Demanda internacional.</strong> Compradores de Buenos Aires, Mendoza y del exterior encuentran en SMA una reserva de valor en dólares con alta revalorización.</p>
            </div>
          </div>
        </div>

        {/* Fuentes */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Fuentes del análisis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FUENTES.map((f) => (
              <div key={f.nombre} className="flex gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                <div>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-800 hover:text-rose-600 transition-colors">
                      {f.nombre} ↗
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{f.nombre}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{f.dato}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4">
            No existe índice oficial para San Martín de los Andes. Los datos son referenciales y se actualizan periódicamente en base a relevamientos propios.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <p className="text-white text-xl font-black mb-2">¿Querés un análisis personalizado?</p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Más allá de los promedios, cada propiedad y cada zona tienen su propia dinámica. Podemos ayudarte a evaluar una oportunidad concreta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inversiones"
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Ver análisis completo de inversiones
            </Link>
            <Link
              href="/contacto"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-white/20"
            >
              Consultar con Milton
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
