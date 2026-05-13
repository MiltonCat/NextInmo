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
      <p className="text-5xl md:text-6xl font-black tracking-tight">
        <span className="text-gray-800">{prefix}</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-pink-400">{value}</span>
        <span className="text-gray-800">{suffix}</span>
      </p>
      <p className="text-gray-500 text-xs mt-3 font-semibold tracking-widest uppercase">{label}</p>
    </div>
  );
}

const statsData = [
  { end: 18, prefix: "+", suffix: "%", label: "ROI anual promedio *" },
  { end: 10, prefix: "", suffix: "+", label: "Años de experiencia" },
  { end: 100, prefix: "", suffix: "%", label: "Asesoría personalizada" },
];

const values = [
  { title: "Transparencia", desc: "Comunicación clara y honesta en cada paso del proceso.", gradient: "from-primary-500 to-pink-600", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { title: "Profesionalismo", desc: "Análisis financiero riguroso para maximizar tu inversión.", gradient: "from-pink-400 to-primary-600", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> },
  { title: "Compromiso", desc: "Tu éxito patrimonial es nuestra prioridad.", gradient: "from-primary-600 to-pink-500", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
  { title: "Calidad", desc: "Solo trabajamos con las mejores oportunidades del mercado.", gradient: "from-blue-400 to-cyan-500", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
];

const services = [
  { title: "Asesoría Inmobiliaria", desc: "Análisis completo de inversiones, propiedades y mercados en la Patagonia.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { title: "Gestión de Cartera", desc: "Administración profesional de tu portafolio inmobiliario con seguimiento continuo.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { title: "Análisis de Riesgo", desc: "Evaluación detallada del mercado y la propiedad para decisiones seguras.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { title: "Acompañamiento en la compra", desc: "Te guiamos en cada etapa del proceso: visita, negociación y documentación.", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

const gridStyle = { backgroundImage: `linear-gradient(rgba(232,50,90,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(232,50,90,0.08) 1px, transparent 1px)`, backgroundSize: "48px 48px" };

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
    <div className="min-h-screen bg-white">
      <section className="bg-white relative overflow-hidden" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Sobre mí</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight font-jakarta">
                Experto en guiar<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-pink-400">tu patrimonio</span>
              </h1>
              <p className="text-gray-600 leading-relaxed text-sm">
                Soy Milton Catalán, asesor inmobiliario con más de 10 años de experiencia en el mercado de San Martín de los Andes. Me especializo en inversiones inmobiliarias en la Patagonia, trabajando con compradores locales e inversores de todo el país que buscan hacer crecer su capital en uno de los mercados más sólidos de Argentina.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm">
                Mi enfoque combina análisis financiero riguroso con conocimiento profundo del territorio. No ofrezco propiedades — ofrezco oportunidades evaluadas, con datos reales de rentabilidad, riesgo y proyección. Cada inversión que recomiendo es una que yo mismo elegiría.
              </p>
              <a href="/contacto" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-sm group">
                Contactarme
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
              </a>
            </div>
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-pink-500/10 rounded-2xl blur-2xl scale-95" />
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 to-pink-400 rounded-2xl opacity-20 blur-sm" />
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img src="/Milton.jpeg" alt="Milton Catalán - Asesor inmobiliario" className="w-full h-96 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 via-white/50 to-transparent">
                    <p className="font-semibold text-gray-900 text-sm">Milton Catalán</p>
                    <p className="text-gray-600 text-xs mt-0.5">Asesor inmobiliario · San Martín de los Andes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {statsData.map((s) => <StatCounter key={s.label} {...s} started={statsStarted} />)}
          </div>
          <p className="text-center text-gray-600 text-xs mt-10">
            * Promedio ponderado de operaciones de alquiler turístico cerradas · Patagonia Argentina · 2019–2024
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Fundamentos</p>
            <h2 className="text-3xl font-black text-gray-800 font-jakarta">Lo que nos define</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { titulo: "Nuestra Misión", bullets: ["Potenciar el patrimonio de nuestros clientes a través de asesoría inmobiliaria de alto valor.", "Integrar análisis financiero riguroso, proyección estratégica de activos y evaluación experta.", "Transformar cada decisión en un paso hacia la libertad financiera."], accent: "from-primary-500 to-pink-600" },
              { titulo: "Nuestra Visión", bullets: ["Ser la firma inmobiliaria de referencia en la Patagonia.", "Fusionar la inteligencia financiera con el mercado de activos reales.", "Construir relaciones de confianza intergeneracional con nuestros inversores."], accent: "from-pink-400 to-primary-500" },
            ].map((card) => (
              <div key={card.titulo} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-8 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${card.accent} opacity-60 rounded-t-2xl`} />
                <h3 className="text-xl font-bold text-gray-800 mb-6 font-jakarta">{card.titulo}</h3>
                <div className="space-y-4">
                  {card.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0 opacity-70" />
                      <p className="text-gray-600 text-sm leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Principios</p>
            <h2 className="text-3xl font-black text-gray-800 font-jakarta">Nuestros Valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform duration-300`}>{v.icon}</div>
                <h3 className="text-base font-bold text-gray-800 mb-2 font-jakarta">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gray-100 bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-500 text-xs font-semibold tracking-widest uppercase mb-3">Qué ofrezco</p>
            <h2 className="text-3xl font-black text-gray-800 font-jakarta">Servicios</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">Soluciones integrales para cada etapa de tu proceso de inversión.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div key={s.title} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center mb-5 text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="text-base font-bold text-gray-800 mb-2 font-jakarta">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <a href="/contacto" className="inline-flex items-center gap-1 text-primary-600 text-xs font-semibold hover:text-primary-500 hover:gap-2 transition-all duration-200">Conocer más <span>→</span></a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
