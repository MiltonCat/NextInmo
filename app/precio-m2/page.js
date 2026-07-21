import Link from "next/link";
import PrecioM2Chart from "@/components/PrecioM2Chart";
import { canonicalUrl, DEFAULT_OG_IMAGE } from "@/config";
import { RELEVADAS_TOTAL_FMT } from "@/lib/mercado";

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

// Etiquetas de confianza de los datos
const BADGES = {
  verificado: { label: "Verificado", cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  estimado: { label: "Estimación propia", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  historico: { label: "Referencia histórica", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
};

function Badge({ tipo, className = "" }) {
  const b = BADGES[tipo];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${b.cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
      {b.label}
    </span>
  );
}

// Curva recalculada para ser coherente con el único dato duro (2022, USD 2.520)
// y con el promedio verificado de 2026. Refleja un mercado maduro y estable.
const EVOLUCION = [
  { anio: 2021, precio: 2350, variacion: null, contexto: "Salida de pandemia — los precios ya estaban entre los más altos del país", fuente: "Estimación propia" },
  { anio: 2022, precio: 2520, variacion: 7.2, contexto: "San Martín, el m² más caro de Argentina", fuente: "Verificado · Diario 7 Lagos / DiarioAndino" },
  { anio: 2023, precio: 2545, variacion: 1.0, contexto: "Mercado maduro — precios estables en dólares", fuente: "Estimación propia" },
  { anio: 2024, precio: 2570, variacion: 1.0, contexto: "Demanda turística e inversora sostenida", fuente: "Estimación propia" },
  { anio: 2025, precio: 2590, variacion: 0.8, contexto: "Estabilización — mercado consolidado", fuente: "Estimación propia" },
  { anio: 2026, precio: 2600, variacion: 0.4, contexto: "Sigue entre los más caros del país", fuente: "Verificado · Argenprop / Zonaprop" },
];

const ZONAS = [
  { nombre: "Centro", tipo: "Departamento", precioM2: 2735, variacion: 4.5 },
  { nombre: "Centro", tipo: "Casa", precioM2: 2180, variacion: 4.2 },
  { nombre: "Centro", tipo: "Terreno", precioM2: 560, variacion: 2.1 },
  { nombre: "Centro", tipo: "Local comercial", precioM2: 2400, variacion: 3.5 },
  { nombre: "Chapelco Golf", tipo: "Departamento", precioM2: 3400, variacion: 6.5 },
  { nombre: "Chapelco Golf", tipo: "Casa", precioM2: 2950, variacion: 5.8 },
  { nombre: "Chapelco Golf", tipo: "Terreno", precioM2: 380, variacion: 8.2 },
  { nombre: "Costanera", tipo: "Departamento", precioM2: 2950, variacion: 5.5 },
  { nombre: "Costanera", tipo: "Casa", precioM2: 2400, variacion: 4.8 },
  { nombre: "Las Marías", tipo: "Casa", precioM2: 1750, variacion: 3.5 },
  { nombre: "Las Marías", tipo: "Terreno", precioM2: 110, variacion: 2.8 },
  { nombre: "Las Pendientes", tipo: "Casa", precioM2: 2950, variacion: 5.5 },
  { nombre: "Las Pendientes", tipo: "Terreno", precioM2: 72, variacion: 3.5 },
];

const FUENTES = [
  { nombre: "Diario 7 Lagos", dato: "USD 2.520/m² — ciudad más cara de Argentina (2022)" },
  { nombre: "Argenprop", dato: "1.066 propiedades en venta relevadas (2026)" },
  { nombre: "Zonaprop", dato: "202 terrenos y 66 locales analizados (2026)" },
  { nombre: "Properati", dato: "Terrenos ~USD 86/m² promedio (enero 2026)" },
];

const STATS = [
  { valor: "USD 2.500 – 2.650", label: "Precio promedio del m²", sub: "El m² más caro de Argentina (2026)", color: "text-rose-600", badge: "verificado" },
  { valor: "+10% aprox.", label: "Revalorización en 5 años", sub: "Cuánto subió de valor desde 2021", color: "text-green-600", badge: "estimado" },
  { valor: "USD 3.400", label: "Máximo por zona", sub: "Chapelco Golf · Departamentos", color: "text-gray-900", badge: "estimado" },
];

export default function PrecioM2Page() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gray-50 border-b border-gray-100 pt-8 pb-10 md:pt-24 md:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Actualizado — Julio 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Precio del m² en San Martín de los Andes 2026
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl leading-relaxed">
            ¿Cuánto cuesta comprar en San Martín de los Andes? Te lo explicamos en palabras simples. El <strong className="text-gray-700">precio del m²</strong> (metro cuadrado) es cuánto vale cada metro de una propiedad. Sirve para comparar si algo está caro o barato sin importar el tamaño.
          </p>
          <div className="mt-4 inline-flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-xl">
            <span className="text-rose-500 mt-0.5 flex-shrink-0 text-lg">💡</span>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Ejemplo sencillo:</strong> si el m² vale USD 2.500, una casa de 100 m² ronda los <strong className="text-gray-800">USD 250.000</strong>.
            </p>
          </div>
          <p className="text-gray-400 text-xs mt-4">
            Estos son valores orientativos para ayudarte a entender el mercado. No reemplazan una tasación profesional.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 md:space-y-12">

        {/* Leyenda de etiquetas */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <span className="font-semibold text-gray-600">¿De dónde salen los datos?</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Verificado con una fuente pública</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Estimación nuestra (sin dato oficial)</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Referencia de años anteriores</span>
        </div>

        {/* Stat principal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <Badge tipo={s.badge} className="mb-3" />
              <p className={`text-2xl md:text-3xl font-black ${s.color} mb-1`}>{s.valor}</p>
              <p className="text-sm font-semibold text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs -mt-6">
          <strong>Revalorización</strong> = cuánto aumentó el valor de una propiedad con el paso del tiempo.
        </p>

        {/* Dato verificado destacado */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-7">
          <Badge tipo="verificado" className="mb-3" />
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
            San Martín de los Andes es la ciudad con <strong>el metro cuadrado más caro de Argentina</strong>, y está entre las 10 más caras de América Latina (7º lugar, con USD 2.520), detrás de destinos como Punta del Este y la Riviera Maya.
          </p>
          <p className="text-green-700/70 text-xs mt-3">
            Fuentes: Diario 7 Lagos · LM Neuquén · DiarioAndino
          </p>
        </div>

        {/* Gráfico de evolución */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Cómo evolucionó el precio del m² (en dólares)</h2>
          <p className="text-gray-400 text-sm mb-6">San Martín de los Andes · 2021–2026</p>
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
          </div>
          <p className="text-gray-400 text-xs mt-3">
            Los años <strong>2022</strong> y <strong>2026</strong> están verificados con fuentes públicas. Los años intermedios son estimaciones nuestras: el mercado de San Martín está maduro, por eso los precios se mantienen altos y estables, sin grandes saltos.
          </p>
        </div>

        {/* Tabla por zona */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Precio del m² por zona y tipo de propiedad</h2>
          <p className="text-gray-400 text-sm mb-4">Valores orientativos en USD · Actualizado julio 2026</p>
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <Badge tipo="estimado" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800/90 leading-relaxed">
              Estos valores por zona son <strong>estimaciones nuestras</strong> basadas en relevamientos de portales inmobiliarios. <strong>No existe un índice oficial por barrio</strong> en San Martín, así que tomalos como una guía orientativa, no como precios exactos.
            </p>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Zona</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tipo</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">USD / m²</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Var. anual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ZONAS.map((z, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{z.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{z.tipo}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">USD {z.precioM2.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-medium">+{z.variacion}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contexto / por qué SMA */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">¿Por qué sube el precio del m² en San Martín?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 leading-relaxed">
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Mucha gente quiere venir.</strong> San Martín es uno de los destinos más elegidos de la Patagonia, y eso mantiene alta la demanda de alquileres turísticos y de propiedades para invertir.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Hay muy pocas casas para alquilar todo el año.</strong> Se consiguen apenas unas 49, mientras que en venta hay más de 1.000. Al haber poca oferta, los precios suben.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Se construye cada vez más y mejor.</strong> Los proyectos nuevos en Chapelco Golf y la Costanera son de alta gama y empujan el precio promedio hacia arriba.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-rose-500 mt-0.5 flex-shrink-0">→</span>
              <p><strong className="text-gray-800">Llega gente de todos lados.</strong> Compradores de Buenos Aires, Mendoza y del exterior ven en San Martín una forma segura de guardar su dinero en dólares.</p>
            </div>
          </div>
        </div>

        {/* Fuentes */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">¿De dónde sacamos estos datos?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FUENTES.map((f) => (
              <div key={f.nombre} className="flex gap-3 p-4 bg-white border border-gray-200 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.dato}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4">
            No existe un índice oficial de precios para San Martín de los Andes. Los datos son referenciales y los actualizamos periódicamente con nuestros propios relevamientos.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <p className="text-white text-xl font-black mb-2">¿Querés saber cuánto vale una propiedad puntual?</p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Los promedios sirven para tener una idea, pero cada propiedad es distinta. Te ayudamos a evaluar un caso concreto, sin compromiso.
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
