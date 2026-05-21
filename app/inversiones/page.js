"use client";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { WA_NUMBER } from "@/config";
import AdvisoryProcess from "@/components/AdvisoryProcess";
import InvestorQuiz from "@/components/InvestorQuiz";

const InversionesEvolucionChart = dynamic(
  () => import("@/components/InversionesEvolucionChart"),
  { ssr: false, loading: () => <div className="h-48 sm:h-72 bg-gray-800/40 rounded-xl animate-pulse" /> }
);

const InversionesMatrizChart = dynamic(
  () => import("@/components/InversionesMatrizChart"),
  { ssr: false, loading: () => <div className="h-80 bg-gray-800/40 rounded-xl animate-pulse" /> }
);

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

const scoreLabel = (score) => {
  if (score >= 80) return { texto: "Muy favorable", color: "text-green-400 bg-green-500/10 border-green-500/30" };
  if (score >= 70) return { texto: "Favorable", color: "text-primary-400 bg-primary-500/10 border-primary-500/30" };
  if (score >= 60) return { texto: "Moderado", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  return { texto: "Bajo potencial", color: "text-gray-400 bg-gray-500/10 border-gray-500/30" };
};

const FACTOR_SIMPLE = {
  Demanda: '¿Cuánta gente lo quiere?',
  Liquidez: '¿Qué tan fácil es vender?',
  'Revalorización': '¿Cuánto subió su precio?',
  Estabilidad: '¿Genera ingresos regulares?',
};

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

export default function InversionesPage() {
  const [activeTab, setActiveTab] = useState("zonas");
  const [calcMonto, setCalcMonto] = useState(150000);
  const [calcPlazo, setCalcPlazo] = useState(5);
  const [calcTipo, setCalcTipo] = useState("alquiler");
  const [leadName, setLeadName] = useState("");
  const [leadWa, setLeadWa] = useState("");
  const [leadSent, setLeadSent] = useState(false);

  const roiAnual = calcTipo === "alquiler" ? 0.065 : calcTipo === "turistico" ? 0.12 : 0.15;

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadName.trim() || !leadWa.trim()) return;
    const tipoLabel = calcTipo === "alquiler" ? "Alquiler" : calcTipo === "turistico" ? "Turístico" : "Reventa";
    const msg = encodeURIComponent(
      `Hola Milton, soy ${leadName.trim()}. Usé la calculadora de inversiones y quiero recibir una propuesta personalizada.\n\n` +
      `📊 Mi simulación:\n` +
      `• Monto: USD ${calcMonto.toLocaleString()}\n` +
      `• Tipo: ${tipoLabel}\n` +
      `• Plazo: ${calcPlazo} año${calcPlazo > 1 ? "s" : ""}\n` +
      `• ROI anual estimado: ${roiAnual * 100}%\n` +
      `• Ganancia total estimada: USD ${Math.round(calcMonto * roiAnual * calcPlazo).toLocaleString()}\n\n` +
      `Mi WhatsApp: ${leadWa.trim()}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    setLeadSent(true);
  };
  const scoredAssets = useMemo(
    () => SCORE_DATA.map((activo) => ({ ...activo, score: calcularScore(activo.factores) })).sort((a, b) => b.score - a.score),
    []
  );
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
            <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Inversiones · San Martín de los Andes</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white font-jakarta leading-tight">Invertí mejor en<br className="hidden sm:block" /> San Martín de los Andes</h1>
              <p className="text-gray-400 text-sm sm:text-base mt-3 max-w-xl">No solo publicamos propiedades. Analizamos el mercado para ayudarte a tomar mejores decisiones de inversión.</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-gray-500 text-xs">Análisis basado en más de 600 propiedades relevadas en San Martín de los Andes · 2026</span>
              </div>
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

          {/* Bloque de confianza — modelo interno */}
          <div className="bg-[#111118] rounded-2xl p-6 sm:p-8 border border-gray-800 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">Análisis interno de mercado</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-3">Decisiones basadas en datos reales del mercado local</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Relevamos y analizamos de forma continua las propiedades publicadas en San Martín de los Andes. Esa información nos permite orientarte mejor sobre zonas, precios y oportunidades, sin depender de promedios nacionales que no reflejan la realidad de la Patagonia.
                </p>
                <p className="text-gray-600 text-xs leading-relaxed border-t border-gray-800 pt-4">
                  Las estimaciones son orientativas y no constituyen tasación profesional ni garantía de rentabilidad.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { valor: "600+", label: "Propiedades analizadas", desc: "Datos del mercado local" },
                  { valor: "2026", label: "Datos actualizados", desc: "Relevamiento continuo" },
                  { valor: "SMA", label: "Mercado focalizado", desc: "Sin promedios nacionales" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
                    <div className="text-xl sm:text-2xl font-black text-white mb-1">{item.valor}</div>
                    <div className="text-[11px] font-semibold text-gray-400 mb-1 leading-tight">{item.label}</div>
                    <div className="text-[10px] text-gray-600">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test de perfil inversor */}
          <div className="mb-8">
            <InvestorQuiz />
          </div>

          {/* ¿Qué conviene comprar? */}
          <div className="bg-[#111118] rounded-2xl mb-8 p-6 sm:p-8 border border-gray-800 shadow-sm">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Comparativa de activos</span>
                </div>
                <h2 className="text-2xl font-black text-white">¿Qué tipo de propiedad puede convenirte?</h2>
                <p className="text-gray-500 text-sm mt-1">Análisis orientativo basado en datos del mercado local · No constituye asesoramiento financiero</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 shadow-sm lg:min-w-[280px]">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">Mejor posicionado según el análisis</p>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-bold leading-tight">{bestAsset.tipo}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{bestAsset.riesgo} · {bestAsset.descripcion}</p>
                  </div>
                  <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${bestAsset.acento}`}>{bestAsset.score}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">¿Cómo leer esto?</span> Analizamos 4 preguntas clave del mercado para cada tipo de propiedad. El puntaje resume todo en un número del 1 al 100: a mayor puntaje, mejor posicionado está ese tipo de inversión según los datos actuales de San Martín de los Andes.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(FACTOR_SIMPLE).map(([key, simple]) => (
                  <span key={key} className="text-gray-500 text-[10px] bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">{simple}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SCORE_DATA.map((activo) => {
                const score = calcularScore(activo.factores);
                return (
                  <div key={activo.tipo} className={`group relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${score === bestAsset.score ? "bg-gray-900 border border-primary-500/40 shadow-md ring-1 ring-primary-500/20" : "bg-gray-950/60 border border-gray-800 hover:border-gray-700 hover:shadow-md"}`}>
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${activo.acento} opacity-70 rounded-t-2xl`} />
                    {score === bestAsset.score && <div className="absolute -top-3 right-4 px-2.5 py-1 rounded-full bg-primary-600 text-white text-[10px] font-bold shadow">Mejor posicionado</div>}

                    {/* Título y puntaje */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-bold text-white leading-tight">{activo.tipo}</h3>
                      <div className="text-right">
                        <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${activo.acento}`}>{score}</span>
                        <p className="text-gray-600 text-[10px]">/100</p>
                      </div>
                    </div>

                    {/* Label interpretación */}
                    <span className={`inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-3 ${scoreLabel(score).color}`}>
                      {scoreLabel(score).texto}
                    </span>

                    {/* Barra general */}
                    <div className="h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${activo.acento} rounded-full`} style={{ width: `${score}%` }} />
                    </div>

                    {/* Factores */}
                    <div className="space-y-2.5 flex-1">
                      {activo.factores.map((f) => (
                        <div key={f.nombre} title={f.fuente}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-[10px] font-medium">{FACTOR_SIMPLE[f.nombre] ?? f.nombre}</span>
                            <span className="text-gray-300 text-[10px] font-semibold">{f.valor}/100</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-1 rounded-full bg-gradient-to-r ${activo.acento}`} style={{ width: `${f.valor}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Descripción simple */}
                    <p className="text-gray-500 text-[11px] mt-4 leading-relaxed border-t border-gray-800 pt-3">{activo.descripcion}</p>

                    {/* Recomendación para el ganador */}
                    {score === bestAsset.score && (
                      <div className="mt-3 bg-primary-600/10 border border-primary-500/20 rounded-lg px-3 py-2 text-center">
                        <p className="text-primary-400 text-[11px] font-semibold">Mejor posicionado en el mercado actual de SMA</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-gray-600 text-xs mt-6 text-center">
              Análisis orientativo basado en datos del mercado local · Fuentes: Zonaprop, Argenprop, Airbnb, Diario Andino · 2026
            </p>
          </div>

          {/* Datos del mercado */}
          <div className="bg-[#111118] rounded-xl border border-gray-800 p-4 sm:p-6 mb-8">
            <div className="mb-4 sm:mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 bg-gray-900 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">Datos del mercado · San Martín de los Andes</span>
              </div>
              <p className="text-gray-600 text-[11px]">Información orientativa basada en análisis interno · No constituye tasación profesional</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              {["zonas", "rentabilidad"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  {tab === "zonas" ? "Evolución de precios" : "Estimación de rentabilidad"}
                </button>
              ))}
            </div>

            {activeTab === "zonas" && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Evolución del precio del m² (USD)</h3>
                <InversionesEvolucionChart data={ZONA_DATA.evolucionHistorica} />
                <div className="mt-3 sm:mt-4 flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>2021: $1.680/m²</span>
                  <span className="text-green-400 font-semibold">+57.7% en 5 años</span>
                  <span>2026: $2.650/m²</span>
                </div>
              </div>
            )}

            {activeTab === "rentabilidad" && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-3 sm:mb-4">Estimación de rentabilidad por alquiler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {ZONA_DATA.rentals.map((item) => (
                    <div key={`${item.tipo}-${item.precioVenta}`} className="bg-green-950/20 rounded-xl p-4 border border-green-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-100">{item.tipo}</span>
                        <span className="text-2xl font-bold text-green-400">{item.rentabilidad}%</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex justify-between"><span>Precio referencia:</span><span className="font-medium text-gray-300">USD {item.precioVenta.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Alquiler estimado:</span><span className="font-medium text-gray-300">USD {item.alquiler}/mes</span></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-900/30">
                        <div className="text-xs text-green-400">Renta anual estimada: USD {(item.alquiler * 12).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-[11px] mt-4">Estimaciones orientativas. Los valores reales varían según la propiedad y condiciones del mercado.</p>
              </div>
            )}
          </div>

          {/* Matriz Riesgo / Retorno */}
          <div className="bg-[#111118] rounded-2xl mb-8 p-6 sm:p-8 border border-gray-800 shadow-sm">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Comparativa</span>
              </div>
              <h2 className="text-2xl font-black text-white">¿Cuánto riesgo vale el retorno?</h2>
              <p className="text-gray-500 text-sm mt-1">Posicionamiento orientativo de cada tipo de activo según riesgo y retorno estimado anual</p>
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
              <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-primary-500 bg-gray-900/90 px-2 py-1 rounded-full border border-primary-900/50 shadow-sm pointer-events-none">Riesgo elevado</div>
              <InversionesMatrizChart data={MATRIX_DATA} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { arrow: '↙', color: 'text-emerald-400', label: 'Conservador', desc: 'Bajo riesgo · Bajo retorno' },
                { arrow: '↖', color: 'text-primary-500', label: 'Zona óptima', desc: 'Bajo riesgo · Alto retorno' },
                { arrow: '↗', color: 'text-orange-400', label: 'Crecimiento', desc: 'Alto riesgo · Alto retorno' },
                { arrow: '↘', color: 'text-red-400', label: 'Riesgo elevado', desc: 'Alto riesgo · Bajo retorno' },
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
                <h2 className="text-lg sm:text-xl font-semibold text-white">¿Cuánto podrías ganar con tu inversión?</h2>
                <p className="text-sm text-gray-500">Simulá tu escenario de retorno</p>
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

            <div className="mt-5 border-t border-gray-800 pt-5">
              {leadSent ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-400 font-semibold text-sm">¡Listo! Te redirigimos a WhatsApp</p>
                  <p className="text-gray-500 text-xs">Milton te responde en menos de 48 hs</p>
                  <button onClick={() => { setLeadSent(false); setLeadName(""); setLeadWa(""); }} className="text-gray-600 hover:text-gray-400 text-xs underline mt-1 transition-colors">
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit}>
                  <p className="text-gray-300 text-sm font-medium mb-1">Recibí una propuesta personalizada</p>
                  <p className="text-gray-500 text-xs mb-4">Basada en tu simulación · Sin compromiso</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Tu nombre</label>
                      <input
                        type="text"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Ej: María González"
                        required
                        className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Tu WhatsApp</label>
                      <input
                        type="tel"
                        value={leadWa}
                        onChange={(e) => setLeadWa(e.target.value)}
                        placeholder="Ej: +54 9 11 1234-5678"
                        required
                        className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.186-1.622A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.658-.518-5.168-1.418l-.371-.22-3.673.963.981-3.585-.242-.38A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Solicitar propuesta por WhatsApp
                  </button>
                  <p className="text-gray-600 text-[11px] mt-2.5">Tu información no se comparte con terceros · Respuesta en menos de 48 hs</p>
                </form>
              )}
            </div>
          </div>

          <AdvisoryProcess />
        </div>
      </div>
    </div>
  );
}
