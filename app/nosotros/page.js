"use client";
import { useEffect, useRef, useState } from "react";


function StatCounter({ end, prefix = "", suffix = "", label, started }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf;
    const t0 = performance.now();
    const duration = 1800;
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end]);

  return (
    <div className="text-center px-6 py-2">
      <p className="text-5xl md:text-6xl font-bold tracking-tight text-[#222222]">
        {prefix}{value}{suffix}
      </p>
      <p className="text-[#717171] text-xs mt-3 font-semibold tracking-widest uppercase">{label}</p>
    </div>
  );
}

const statsData = [
  { end: 18, prefix: "+", suffix: "%", label: "ROI anual promedio *" },
  { end: 10, prefix: "", suffix: "+", label: "Años de experiencia" },
  { end: 600, prefix: "", suffix: "+", label: "Propiedades relevadas" },
];

const values = [
  { title: "Transparencia", desc: "Te digo lo que muestran los datos, aunque no sea lo que querés escuchar. La información es tuya antes que la decisión.", gradient: "from-primary-500 to-pink-600", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { title: "Criterio", desc: "No opino, evalúo. Cada propiedad pasa por un análisis financiero antes de convertirse en una recomendación.", gradient: "from-pink-400 to-primary-600", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> },
  { title: "Independencia", desc: "Mi interés es que tomés la mejor decisión, no cerrar una operación. Si no es una buena inversión, te lo digo.", gradient: "from-primary-600 to-pink-500", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { title: "Precisión", desc: "Selecciono oportunidades, no acumulo cartera. Menos propiedades, mejor analizadas.", gradient: "from-blue-400 to-cyan-500", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
];

const services = [
  { title: "Asesoría de inversión", desc: "Analizo propiedades como activos financieros: rentabilidad esperada, nivel de riesgo y proyección de valor. Para que invertís con información, no con intuición.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { title: "Valuación predictiva", desc: "Mediante mi modelo de análisis inmobiliario, estimo el valor actual del metro cuadrado y su evolución proyectada hasta 2031 en San Martín de los Andes.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { title: "Análisis de mercado", desc: "Datos reales del mercado inmobiliario de la Patagonia: precios por zona, tendencias y comparativas. Más de 600 propiedades relevadas como base de consulta.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { title: "Acompañamiento en la compra", desc: "Te acompaño en cada etapa: búsqueda, visita, negociación y documentación. Sin atajos y con criterio en cada paso.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

const gridStyle = { backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`, backgroundSize: "48px 48px" };

export default function AboutPage() {
  const statsRef = useRef(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white" style={gridStyle}>
      <section className="bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Sobre mí</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#222222] leading-tight font-jakarta">
                Criterio financiero<br />
                para decisiones inmobiliarias
              </h1>
              <p className="text-[#484848] leading-relaxed text-sm">
                Mi formación como administrador de empresas me llevó a desarrollar mi carrera en el mundo financiero gestionando carteras de alto valor en Wealth Management en ING y elaborando proyecciones de mercado para Brasil y Estados Unidos en la industria salmonera —trabajo publicado en una de las revistas más reconocidas del sector a nivel internacional.
              </p>
              <p className="text-[#484848] leading-relaxed text-sm">
                Hoy aplico ese mismo rigor al mercado inmobiliario. Estoy desarrollando un modelo predictivo propio que opera como herramienta de tasación y proyecta la evolución del valor del metro cuadrado en San Martín de los Andes hasta 2031.
              </p>
              <p className="text-[#484848] leading-relaxed text-sm">
                Mi diferencial está en analizar propiedades como activos: con datos, criterio financiero y proyección de largo plazo.
              </p>
              <a href="/contacto" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm group">
                Hablemos de tu inversión
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
              </a>
            </div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="absolute w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative p-[3px] rounded-full bg-gradient-to-br from-primary-500 via-pink-400 to-primary-600 shadow-2xl shadow-primary-500/25">
                <div className="w-64 h-64 rounded-full overflow-hidden ring-4 ring-white">
                  <img src="/Milton.jpeg" alt="Milton Catalán - Asesor inmobiliario" className="w-full h-full object-cover object-top" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#222222] text-sm tracking-wide">Milton Catalán</p>
                <p className="text-[#717171] text-xs mt-1">Estratega de activos inmobiliarios · San Martín de los Andes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="border-y border-gray-100 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {statsData.map((s) => <StatCounter key={s.label} {...s} started={statsStarted} />)}
          </div>
          <p className="text-center text-[#717171] text-xs mt-10">
            * Promedio ponderado de operaciones de alquiler turístico cerradas · Patagonia Argentina · 2019–2024
          </p>
        </div>
      </section>

      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Fundamentos</p>
            <h2 className="text-3xl font-bold text-[#222222] font-jakarta">Lo que me define</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-8 hover:border-primary-200 hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary-500 to-pink-600 opacity-60 rounded-t-2xl" />
              <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Misión</p>
              <p className="text-[#484848] text-sm leading-relaxed">
                Ayudar a tomar decisiones inmobiliarias con más información, más criterio y menos especulación. Analizo cada propiedad como un activo —con datos de mercado, proyección financiera y evaluación de riesgo— para que cada operación esté respaldada por evidencia, no por intuición.
              </p>
            </div>
            <div className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-8 hover:border-primary-200 hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-pink-400 to-primary-500 opacity-60 rounded-t-2xl" />
              <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Visión</p>
              <p className="text-[#484848] text-sm leading-relaxed">
                Ser el referente en análisis inmobiliario de la Patagonia: un profesional que integra conocimiento del mercado local con modelado predictivo y criterio financiero de nivel internacional. Donde hoy hay intuición, quiero que haya datos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-100 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Principios</p>
            <h2 className="text-3xl font-bold text-[#222222] font-jakarta">Mis valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform duration-300`}>{v.icon}</div>
                <h3 className="text-base font-semibold text-[#222222] mb-2 font-jakarta">{v.title}</h3>
                <p className="text-[#717171] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-100 bg-transparent">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Qué ofrezco</p>
            <h2 className="text-3xl font-bold text-[#222222] font-jakarta">Servicios</h2>
            <p className="text-[#717171] text-sm mt-3 max-w-xl mx-auto">Soluciones para cada etapa de tu proceso de inversión.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div key={s.title} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center mb-5 text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="text-base font-semibold text-[#222222] mb-2 font-jakarta">{s.title}</h3>
                <p className="text-[#717171] text-sm leading-relaxed mb-4">{s.desc}</p>
                <a href="/contacto" className="inline-flex items-center gap-1 text-primary-600 text-xs font-semibold hover:text-primary-500 hover:gap-2 transition-all duration-200">Conocer más <span>→</span></a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
