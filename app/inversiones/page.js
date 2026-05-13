"use client";
import { useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { CONTACT_EMAIL } from "@/config";
import AdvisoryProcess from "@/components/AdvisoryProcess";
import InvestorQuiz from "@/components/InvestorQuiz";

const ZONA_DATA = {
  update: "20 Abril 2026",
  fuentes: [
    { nombre: "Diario 7 Lagos", url: "https://www.diario7lagos.com.ar", dato: "USD 2.520/m² - ciudad más cara de Argentina (2022)" },
    { nombre: "Argenprop", url: "https://www.argenprop.com/inmuebles/venta/san-martin-de-los-andes", dato: "1.066 propiedades en venta (2026)" },
    { nombre: "Zonaprop", url: "https://www.zonaprop.com.ar", dato: "202 terrenos (2026)" },
    { nombre: "Properati", url: "https://www.properati.com.ar", dato: "Terrenos ~USD 86/m² (ene 2026)" },
    { nombre: "Realigro", url: "https://argentina.realigro.com", dato: "Tendencias de precios EUR/m²" },
  ],
  nota: "No existe índice oficial para San Martín de los Andes. Datos referenciales basados en listings de portales y fuentes periodísticas.",
  zonas: [
    { nombre: "Centro", tipo: "Departamento", precioM2: 2735, variacion: 4.5, rentabilidad: 5.8 },
    { nombre: "Centro", tipo: "Casa", precioM2: 2180, variacion: 4.2, rentabilidad: 4.8 },
    { nombre: "Centro", tipo: "Terreno", precioM2: 560, variacion: 2.1, rentabilidad: null },
    { nombre: "Centro", tipo: "Local", precioM2: 2400, variacion: 3.5, rentabilidad: 6.2 },
    { nombre: "Chapelco Golf", tipo: "Departamento", precioM2: 3400, variacion: 6.5, rentabilidad: 4.2 },
    { nombre: "Chapelco Golf", tipo: "Casa", precioM2: 2950, variacion: 5.8, rentabilidad: 4.0 },
    { nombre: "Chapelco Golf", tipo: "Terreno", precioM2: 380, variacion: 8.2, rentabilidad: null },
    { nombre: "Las Marias", tipo: "Casa", precioM2: 1750, variacion: 3.5, rentabilidad: 4.2 },
    { nombre: "Las Marias", tipo: "Terreno", precioM2: 110, variacion: 2.8, rentabilidad: null },
    { nombre: "Costanera", tipo: "Departamento", precioM2: 2950, variacion: 5.5, rentabilidad: 6.5 },
    { nombre: "Costanera", tipo: "Casa", precioM2: 2400, variacion: 4.8, rentabilidad: 5.2 },
    { nombre: "Las Pendientes", tipo: "Casa", precioM2: 2950, variacion: 5.5, rentabilidad: 4.5 },
    { nombre: "Las Pendientes", tipo: "Terreno", precioM2: 72, variacion: 3.5, rentabilidad: null },
  ],
  promedioGeneral: 2650,
  promedioReferencia: 2520,
  evolucionHistorica: [
    { anio: 2021, precio: 1680, variacion: null, contexto: "Post-pandemia - Recuperación del mercado", fuente: "Diario 7 Lagos" },
    { anio: 2022, precio: 1950, variacion: 16.1, contexto: "San Martín de los Andes lidera precios en Argentina", fuente: "Diario 7 Lagos" },
    { anio: 2023, precio: 2180, variacion: 11.8, contexto: "Aumento de demanda turística e inversionista", fuente: "Estimado" },
    { anio: 2024, precio: 2450, variacion: 12.4, contexto: "Crecimiento sostenido - boom de construcciones", fuente: "Estimado" },
    { anio: 2025, precio: 2590, variacion: 5.7, contexto: "Estabilización de precios - mercado maduro", fuente: "Estimado" },
    { anio: 2026, precio: 2650, variacion: 2.3, contexto: "Consolidación - demanda internacional", fuente: "Argenprop/Zonaprop" },
  ],
  rentals: [
    { tipo: "Depto 1 dorm (40m²)", precioVenta: 95000, precioM2: 2375, alquiler: 650, rentabilidad: 8.2 },
    { tipo: "Depto 2 dorm (80m²)", precioVenta: 185000, precioM2: 2310, alquiler: 950, rentabilidad: 6.2 },
    { tipo: "Casa 2 dorm (96m²)", precioVenta: 210000, precioM2: 2187, alquiler: 1400, rentabilidad: 8.0 },
    { tipo: "Casa 3 dorm (165m²)", precioVenta: 330000, precioM2: 2000, alquiler: 1800, rentabilidad: 6.5 },
    { tipo: "Casa 4 dorm (225m²)", precioVenta: 490000, precioM2: 2177, alquiler: 2500, rentabilidad: 6.1 },
  ],
};

const PESOS = { Demanda: 0.35, Liquidez: 0.20, 'Revalorización': 0.30, Estabilidad: 0.15 };

function calcularScore(factores) {
  return Math.round(factores.reduce((acc, f) => acc + f.valor * (PESOS[f.nombre] ?? 0), 0));
}

const SCORE_DATA = [
  {
    tipo: 'Depto turístico', riesgo: 'Agresivo',
    riesgoColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    acento: 'from-amber-500 to-orange-400',
    factores: [
      { nombre: 'Demanda', valor: 90, fuente: 'Airbnb SMA: rating 4.9/5 · alta ocupación en temporadas' },
      { nombre: 'Liquidez', valor: 75, fuente: 'Mercado de alquiler turístico activo · salida vía plataformas' },
      { nombre: 'Revalorización', valor: 85, fuente: '+57.7% en 5 años (2021–2026) · Argenprop / Diario Andino' },
      { nombre: 'Estabilidad', valor: 60, fuente: 'Ingresos estacionales: pico en ski (jul) y trekking (ene)' },
    ],
    descripcion: 'Máximo retorno en temporada alta. Ideal para inversores con tolerancia al riesgo estacional.',
  },
  {
    tipo: 'Casa alquiler', riesgo: 'Moderado',
    riesgoColor: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
    acento: 'from-primary-500 to-pink-500',
    factores: [
      { nombre: 'Demanda', valor: 75, fuente: 'Solo 49 propiedades en alquiler en Argenprop · oferta muy limitada' },
      { nombre: 'Liquidez', valor: 55, fuente: 'Mercado de reventa moderado · stock disponible reducido' },
      { nombre: 'Revalorización', valor: 80, fuente: '+57.7% en 5 años (2021–2026) · Neuquén +4.93% anual · Zonaprop' },
      { nombre: 'Estabilidad', valor: 82, fuente: 'Alquiler residencial USD · ingreso mensual predecible (USD 1.200+)' },
    ],
    descripcion: 'Flujo de caja estable con buena apreciación a largo plazo.',
  },
  {
    tipo: 'Terreno', riesgo: 'Conservador',
    riesgoColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    acento: 'from-emerald-500 to-teal-400',
    factores: [
      { nombre: 'Demanda', valor: 50, fuente: '913 terrenos en venta en Zonaprop · alta oferta = absorción lenta' },
      { nombre: 'Liquidez', valor: 35, fuente: 'Sin generación de renta · venta con plazos largos de negociación' },
      { nombre: 'Revalorización', valor: 78, fuente: 'USD 15–200+/m² según zona · premium en Chapelco y lakefront' },
      { nombre: 'Estabilidad', valor: 88, fuente: 'Sin exposición a vacancia ni ciclo de alquiler · reserva de valor' },
    ],
    descripcion: 'Reserva de valor sólida. Baja liquidez, alta apreciación en zonas premium.',
  },
  {
    tipo: 'Local comercial', riesgo: 'Moderado',
    riesgoColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    acento: 'from-sky-500 to-cyan-400',
    factores: [
      { nombre: 'Demanda', valor: 65, fuente: '66 locales totales en Zonaprop · mercado acotado pero activo' },
      { nombre: 'Liquidez', valor: 58, fuente: 'Compradores de nicho · precio medio USD 350.000 · Zonaprop' },
      { nombre: 'Revalorización', valor: 88, fuente: '+21.8% vs ene 2025 · USD 2.640/m² (ene 2026) · Zonaprop' },
      { nombre: 'Estabilidad', valor: 70, fuente: 'Depende del ciclo económico · sostenido por turismo en SMA' },
    ],
    descripcion: 'Mayor revalorización medida del mercado. Rentabilidad sujeta al ciclo económico local.',
  },
];

const MATRIX_DATA = [
  { nombre: 'Terreno', riesgo: 1.8, retorno: 5, color: '#10b981' },
  { nombre: 'Casa alquiler', riesgo: 3.5, retorno: 7, color: '#E8325A' },
  { nombre: 'Local comercial', riesgo: 5, retorno: 9, color: '#f472b6' },
  { nombre: 'Casa reventa', riesgo: 6.5, retorno: 14, color: '#f59e0b' },
  { nombre: 'Depto turístico', riesgo: 7.5, retorno: 18, color: '#f97316' },
];

const gridStyle = {
  backgroundImage: `linear-gradient(rgba(232,50,90,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(232,50,90,0.12) 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
};

function MatrixDot(props) {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill={payload.color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={7} fill={payload.color} opacity={0.9} />
      <text x={cx} y={cy - 16} textAnchor="middle" fill="#6b7280" fontSize={9} fontWeight={600}>{payload.nombre}</text>
    </g>
  );
}

export default function InversionesPage() {
  const [activeTab, setActiveTab] = useState("zonas");
  const [calcMonto, setCalcMonto] = useState(150000);
  const [calcPlazo, setCalcPlazo] = useState(5);
  const [calcTipo, setCalcTipo] = useState("alquiler");

  const roiAnual = calcTipo === "alquiler" ? 0.065 : calcTipo === "turistico" ? 0.12 : 0.15;
  const scoredAssets = SCORE_DATA.map((activo) => ({ ...activo, score: calcularScore(activo.factores) })).sort((a, b) => b.score - a.score);
  const bestAsset = scoredAssets[0];

  const downloadReportTxt = () => {
    const currentDate = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
    const dataText = `VALORES POR M² - SAN MARTÍN DE LOS ANDES\n${"=".repeat(45)}\nFecha: ${currentDate}\n\n${ZONA_DATA.zonas.map((zona) => `${zona.nombre} | ${zona.tipo} | $${zona.precioM2}`).join("\n")}\n\nEVOLUCIÓN HISTÓRICA (USD/m²)\n${"=".repeat(45)}\n${ZONA_DATA.evolucionHistorica.map((item) => `${item.anio}: $${item.precio}/m² ${item.variacion ? `(+${item.variacion}%)` : ""} - ${item.contexto}`).join("\n")}\n\nFuentes: Diario 7 Lagos, Argenprop, Zonaprop, Properati`.trim();
    const blob = new Blob([dataText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CatalanPropiedades-Valores-SMA-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="bg-[#0a0a0f] relative overflow-hidden pt-24 pb-12" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Inversiones</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white font-jakarta">Inversiones Inmobiliarias</h1>
              <p className="text-gray-500 text-sm mt-2">San Martín de los Andes · Patagonia</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800 shadow-sm">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-400 font-medium">{ZONA_DATA.update}</span>
              </div>
              <button
                onClick={downloadReportTxt}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar reporte
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

          {/* Tabs chart */}
          <div className="bg-[#111118] rounded-xl border border-gray-800 p-4 sm:p-6 mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              {["zonas", "rentabilidad"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  {tab === "zonas" ? "Evolución" : "Rentabilidad"}
                </button>
              ))}
            </div>

            {activeTab === "zonas" && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Evolución de precios (USD/m²)</h3>
                <div className="h-48 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ZONA_DATA.evolucionHistorica} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrecio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E8325A" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#E8325A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="anio" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => `$${value / 1000}k`} stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin - 200", "dataMax + 200"]} width={40} />
                      <Tooltip
                        formatter={(value, _name, props) => {
                          const item = props.payload;
                          return [
                            <div key="tooltip" className="text-center">
                              <div className="font-bold text-lg text-white">USD {value.toLocaleString()}/m²</div>
                              {item.variacion && <div className="text-green-400 font-medium">+{item.variacion}% vs año anterior</div>}
                              <div className="text-xs text-gray-400 mt-1">{item.contexto}</div>
                              <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">{item.fuente}</div>
                            </div>,
                            "Precio",
                          ];
                        }}
                        contentStyle={{ borderRadius: "12px", border: "1px solid #1f2937", background: "#111118", boxShadow: "0 4px 24px rgba(0,0,0,0.5)", padding: "12px" }}
                      />
                      <Area type="monotone" dataKey="precio" stroke="#E8325A" strokeWidth={3} fillOpacity={1} fill="url(#colorPrecio)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 sm:mt-4 flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>2021: $1,680</span>
                  <span className="text-green-400 font-semibold">+57.7%</span>
                  <span>2026: $2,650</span>
                </div>
              </div>
            )}

            {activeTab === "rentabilidad" && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Rentabilidad por alquiler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {ZONA_DATA.rentals.map((item) => (
                    <div key={`${item.tipo}-${item.precioVenta}`} className="bg-green-950/20 rounded-xl p-4 border border-green-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-100">{item.tipo}</span>
                        <span className="text-2xl font-bold text-green-400">{item.rentabilidad}%</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex justify-between"><span>Precio venta:</span><span className="font-medium text-gray-300">USD {item.precioVenta.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Alquiler:</span><span className="font-medium text-gray-300">USD {item.alquiler}/mes</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-900/30">
                        <div className="text-xs text-green-400">ROI anual: USD {(item.alquiler * 12).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Investment Score */}
          <div className="bg-[#111118] rounded-2xl mb-8 p-6 sm:p-8 border border-gray-800 shadow-sm">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Análisis de activos</span>
                </div>
                <h2 className="text-2xl font-black text-white">Score de Inversión</h2>
                <p className="text-gray-500 text-sm mt-1">Puntaje compuesto por demanda, liquidez, revalorización y estabilidad · Elaboración propia</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 shadow-sm lg:min-w-[280px]">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">Mejor opción visual</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-bold leading-tight">{bestAsset.tipo}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{bestAsset.riesgo} · {bestAsset.descripcion}</p>
                  </div>
                  <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${bestAsset.acento}`}>{bestAsset.score}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(PESOS).map(([nombre, peso]) => (
                <div key={nombre} className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5">
                  <span className="text-gray-400 text-[10px] font-medium">{nombre}</span>
                  <span className="text-primary-500 text-[10px] font-black">{Math.round(peso * 100)}%</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SCORE_DATA.map((activo) => {
                const score = calcularScore(activo.factores);
                return (
                  <div key={activo.tipo} className={`group relative rounded-2xl p-6 transition-all duration-300 ${score === bestAsset.score ? "bg-gray-900 border border-primary-500/40 shadow-md ring-1 ring-primary-500/20" : "bg-gray-950/60 border border-gray-800 hover:border-gray-700 hover:shadow-md"}`}>
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${activo.acento} opacity-70 rounded-t-2xl`} />
                    {score === bestAsset.score && <div className="absolute -top-3 right-4 px-2.5 py-1 rounded-full bg-primary-600 text-white text-[10px] font-bold shadow">Mejor score</div>}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{activo.tipo}</h3>
                        <span className={`inline-flex items-center mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activo.riesgoColor}`}>{activo.riesgo}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${activo.acento}`}>{score}</span>
                        <p className="text-gray-600 text-[10px]">/100</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full mb-5 overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${activo.acento} rounded-full`} style={{ width: `${score}%` }} />
                    </div>
                    <div className="space-y-2.5">
                      {activo.factores.map((f) => (
                        <div key={f.nombre} title={f.fuente}>
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 text-[10px] font-medium">{f.nombre}</span>
                              <span className="text-gray-600 text-[9px]">·{Math.round(PESOS[f.nombre] * 100)}%</span>
                            </div>
                            <span className="text-gray-300 text-[10px] font-semibold">{f.valor}</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-1 rounded-full bg-gradient-to-r ${activo.acento}`} style={{ width: `${f.valor}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-[11px] mt-4 leading-relaxed">{activo.descripcion}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-gray-600 text-xs mt-6 text-center">
              * Score = Demanda×35% + Liquidez×20% + Revalorización×30% + Estabilidad×15% · Fuentes: Zonaprop, Argenprop, Airbnb, Diario Andino · 2026
            </p>
          </div>

          {/* Matriz Riesgo / Retorno */}
          <div className="bg-[#111118] rounded-2xl mb-8 p-6 sm:p-8 border border-gray-800 shadow-sm">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Comparativa</span>
              </div>
              <h2 className="text-2xl font-black text-white">Matriz Riesgo / Retorno</h2>
              <p className="text-gray-500 text-sm mt-1">Posicionamiento de cada activo según perfil de riesgo y retorno estimado anual</p>
            </div>
            <div className="relative h-80">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                <div className="bg-emerald-500/5 border-r border-b border-gray-800" />
                <div className="bg-amber-500/5 border-b border-gray-800" />
                <div className="bg-sky-500/5 border-r border-gray-800" />
                <div className="bg-primary-500/5" />
              </div>
              <div className="absolute top-2 left-2 text-[10px] font-semibold text-emerald-400 bg-gray-900/90 px-2 py-1 rounded-full border border-emerald-900/50 shadow-sm pointer-events-none">Conservador</div>
              <div className="absolute top-2 right-2 text-[10px] font-semibold text-amber-400 bg-gray-900/90 px-2 py-1 rounded-full border border-amber-900/50 shadow-sm pointer-events-none">Crecimiento</div>
              <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-sky-400 bg-gray-900/90 px-2 py-1 rounded-full border border-sky-900/50 shadow-sm pointer-events-none">Bajo retorno</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-primary-500 bg-gray-900/90 px-2 py-1 rounded-full border border-primary-900/50 shadow-sm pointer-events-none">Evitar</div>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 24, right: 24, bottom: 28, left: 8 }}>
                  <ReferenceArea x1={0} x2={5} y1={11} y2={22} fill="#10b981" fillOpacity={0.05} />
                  <ReferenceArea x1={5} x2={10} y1={11} y2={22} fill="#f59e0b" fillOpacity={0.05} />
                  <ReferenceArea x1={0} x2={5} y1={0} y2={11} fill="#0ea5e9" fillOpacity={0.04} />
                  <ReferenceArea x1={5} x2={10} y1={0} y2={11} fill="#E8325A" fillOpacity={0.04} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" dataKey="riesgo" name="Riesgo" domain={[0, 10]} stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Riesgo →', position: 'insideBottom', offset: -12, fill: '#4b5563', fontSize: 10 }} />
                  <YAxis type="number" dataKey="retorno" name="Retorno" domain={[0, 22]} stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={36} />
                  <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.08)' }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#1a1a2e] border border-gray-700 rounded-xl p-3 shadow-xl">
                        <p className="text-white text-xs font-bold mb-2">{d.nombre}</p>
                        <p className="text-gray-400 text-xs">Riesgo: <span className="text-gray-200 font-semibold">{d.riesgo}/10</span></p>
                        <p className="text-gray-400 text-xs">Retorno est.: <span className="text-primary-500 font-semibold">~{d.retorno}% anual</span></p>
                      </div>
                    );
                  }} />
                  <ReferenceLine x={5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <ReferenceLine y={11} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <Scatter data={MATRIX_DATA} shape={<MatrixDot />} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { arrow: '↙', color: 'text-emerald-400', label: 'Conservador', desc: 'Bajo riesgo · Bajo retorno' },
                { arrow: '↖', color: 'text-primary-500', label: 'Zona óptima', desc: 'Bajo riesgo · Alto retorno' },
                { arrow: '↗', color: 'text-orange-400', label: 'Crecimiento', desc: 'Alto riesgo · Alto retorno' },
                { arrow: '↘', color: 'text-red-400', label: 'Evitar', desc: 'Alto riesgo · Bajo retorno' },
              ].map((q) => (
                <div key={q.label} className="flex items-start gap-2 bg-gray-900 rounded-xl p-3">
                  <span className={`${q.color} text-base leading-none mt-0.5`}>{q.arrow}</span>
                  <div>
                    <p className={`${q.color} text-[10px] font-bold`}>{q.label}</p>
                    <p className="text-gray-600 text-[10px] mt-0.5">{q.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculadora */}
          <div id="calculadora" className="bg-[#111118] rounded-xl border border-gray-800 p-4 sm:p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Calculadora de Retorno</h2>
                <p className="text-sm text-gray-500">Simulá tu inversión</p>
              </div>
              <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start">Interactiva</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {[
                { label: "Monto (USD)", value: calcMonto, setter: (v) => setCalcMonto(Number(v)), options: [
                  [25000,"USD 25K"],[50000,"USD 50K"],[75000,"USD 75K"],[100000,"USD 100K"],[150000,"USD 150K"],[200000,"USD 200K"],[250000,"USD 250K"],[350000,"USD 350K"],[500000,"USD 500K"],[750000,"USD 750K"],[1000000,"USD 1M"],
                ]},
                { label: "Tipo", value: calcTipo, setter: (v) => setCalcTipo(v), options: [
                  ["alquiler","Alquiler"],["turistico","Turístico"],["reventa","Reventa"],
                ]},
                { label: "Plazo", value: calcPlazo, setter: (v) => setCalcPlazo(Number(v)), options: [
                  [1,"1 año"],[3,"3 años"],[5,"5 años"],[10,"10 años"],
                ]},
              ].map(({ label, value, setter, options }) => (
                <div key={label}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">{label}</label>
                  <select value={value} onChange={(e) => setter(e.target.value)} className="w-full px-2 sm:px-4 py-2 sm:py-3 border border-gray-700 bg-gray-900 text-gray-200 rounded-lg sm:rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-3 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-2 sm:p-4 bg-primary-500/10 rounded-lg sm:rounded-xl border border-primary-500/20">
                  <div className="text-lg sm:text-2xl font-bold text-primary-500">{`${roiAnual * 100}%`}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">ROI Anual</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-green-500/10 rounded-lg sm:rounded-xl border border-green-500/20">
                  <div className="text-lg sm:text-2xl font-bold text-green-400">USD {Math.round(calcMonto * roiAnual * calcPlazo).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Ganancia Total</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-purple-500/10 rounded-lg sm:rounded-xl border border-purple-500/20">
                  <div className="text-lg sm:text-2xl font-bold text-purple-400">USD {Math.round(calcMonto * (1 + roiAnual * calcPlazo)).toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Total Final</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-orange-500/10 rounded-lg sm:rounded-xl border border-orange-500/20">
                  <div className="text-lg sm:text-2xl font-bold text-orange-400">~{Math.ceil(1 / roiAnual)} años</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Para recuperar</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-gray-900 rounded-xl border border-gray-800">
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Ingreso mensual estimado</div>
                  <div className="text-xs text-gray-500">Promedio en {calcPlazo} año{calcPlazo > 1 ? "s" : ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-xl font-bold text-green-400">USD {Math.round((calcMonto * roiAnual) / 12).toLocaleString()}/mes</div>
                  <div className="text-xs text-green-500">estimado</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Comparativa a {calcPlazo} año{calcPlazo > 1 ? "s" : ""}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg text-center border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">Plazo fijo bancario</div>
                    <div className="text-base font-bold text-gray-300">USD {Math.round(calcMonto * (1 + 0.03 * calcPlazo)).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">~3% anual</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                    <div className="text-xs text-gray-500 mb-1">Inversión inmobiliaria</div>
                    <div className="text-base font-bold text-green-400">USD {Math.round(calcMonto * (1 + roiAnual * calcPlazo)).toLocaleString()}</div>
                    <div className="text-xs text-green-500">{roiAnual * 100}% anual</div>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">
                  Diferencia: <span className="font-semibold text-green-400">+USD {Math.round(calcMonto * ((roiAnual - 0.03) * calcPlazo)).toLocaleString()}</span> a favor del inmueble
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 text-center">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Propuesta%20de%20inversión%20-%20San%20Martín%20de%20los%20Andes`}
                className="inline-block w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-primary-700 transition-colors text-sm text-center"
              >
                Solicitar propuesta
              </a>
            </div>
          </div>

          <AdvisoryProcess />
          <InvestorQuiz />
        </div>
      </div>
    </div>
  );
}
