import Link from "next/link";
import PrecioM2Chart from "@/components/PrecioM2Chart";

export const metadata = {
  title: "Precio del m² en San Martín de los Andes 2026 | Catalán Propiedades",
  description: "Consultá el precio del metro cuadrado en San Martín de los Andes por zona y tipo de propiedad. Evolución histórica 2021–2026 basada en más de 600 propiedades relevadas.",
};

const EVOLUCION = [
  { anio: 2021, precio: 1680, variacion: null, contexto: "Post-pandemia — Recuperación del mercado", fuente: "Diario 7 Lagos" },
  { anio: 2022, precio: 1950, variacion: 16.1, contexto: "San Martín de los Andes lidera precios en Argentina", fuente: "Diario 7 Lagos" },
  { anio: 2023, precio: 2180, variacion: 11.8, contexto: "Aumento de demanda turística e inversionista", fuente: "Estimado" },
  { anio: 2024, precio: 2450, variacion: 12.4, contexto: "Crecimiento sostenido — boom de construcciones", fuente: "Estimado" },
  { anio: 2025, precio: 2590, variacion: 5.7, contexto: "Estabilización de precios — mercado maduro", fuente: "Estimado" },
  { anio: 2026, precio: 2650, variacion: 2.3, contexto: "Consolidación — demanda internacional", fuente: "Argenprop / Zonaprop" },
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

export default function PrecioM2Page() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gray-50 border-b border-gray-100 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Actualizado — Abril 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
            Precio del m² en San Martín de los Andes 2026
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            Análisis actualizado del valor del metro cuadrado por zona y tipo de propiedad en San Martín de los Andes, basado en más de 600 propiedades relevadas en portales inmobiliarios locales.
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Datos orientativos basados en listings públicos · No constituyen tasación profesional
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Stat principal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { valor: "USD 2.650", label: "Precio promedio del m²", sub: "Mercado general 2026", color: "text-rose-600" },
            { valor: "+57,7%", label: "Revalorización en 5 años", sub: "2021 → 2026", color: "text-green-600" },
            { valor: "USD 3.400", label: "Máximo por zona", sub: "Chapelco Golf · Departamentos", color: "text-gray-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className={`text-3xl font-black ${s.color} mb-1`}>{s.valor}</p>
              <p className="text-sm font-semibold text-gray-700">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Gráfico de evolución */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Evolución histórica del precio del m² (USD)</h2>
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
        </div>

        {/* Tabla por zona */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">Precio del m² por zona y tipo de propiedad</h2>
          <p className="text-gray-400 text-sm mb-6">Valores orientativos en USD · Actualizado abril 2026</p>
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
          <p className="text-gray-400 text-xs mt-3">
            Estimaciones orientativas basadas en análisis de listings públicos en San Martín de los Andes. Los valores reales varían según la propiedad, estado y negociación.
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
                  <p className="text-sm font-semibold text-gray-800">{f.nombre}</p>
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
