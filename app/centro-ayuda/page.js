"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { WA_URL, CONTACT_EMAIL, PHONE_DISPLAY } from "@/config";

const CATEGORIAS = ["Todas", "Compra", "Alquiler", "Inversión", "Zona", "Proceso"];

const faqs = [
  {
    categoria: "Compra",
    question: "¿Puedo comprar una propiedad en San Martín siendo extranjero?",
    answer: "Sí. Los extranjeros pueden comprar propiedades en Argentina. Necesitás obtener un CDI (Clave de Identificación) ante la AFIP y contar con una cuenta bancaria local. El proceso es similar al de un ciudadano argentino y te asesoramos en cada paso.",
  },
  {
    categoria: "Proceso",
    question: "¿Cómo es el proceso de compra de una propiedad en Neuquén?",
    answer: "El proceso consta de: 1) Reserva con seña (generalmente 10% del valor), 2) Boleto de compraventa, 3) Escritura ante escribano público. El tiempo estimado desde la reserva hasta la escritura es de 30 a 90 días según la documentación.",
  },
  {
    categoria: "Proceso",
    question: "¿Qué documentos necesito para comprar?",
    answer: "DNI vigente, CUIL/CUIT, comprobante de domicilio y, si comprás con financiación, comprobante de ingresos. En el caso de extranjeros, pasaporte y CDI.",
  },
  {
    categoria: "Compra",
    question: "¿Qué impuestos y gastos tiene una compra en la zona?",
    answer: "Los gastos de escritura rondan el 3–4% del valor de venta (honorarios del escribano, sellos e impuestos provinciales). El impuesto a la transferencia de inmuebles (ITI) es del 1,5% a cargo del vendedor. Te detallamos todos los costos antes de avanzar.",
  },
  {
    categoria: "Inversión",
    question: "¿Es buen momento para invertir en San Martín de los Andes?",
    answer: "Sí. San Martín de los Andes tiene el m² más caro del país con una valorización sostenida. Es un destino de 4 estaciones con alta demanda turística, lo que garantiza rentabilidad por alquiler y plusvalía a largo plazo.",
  },
  {
    categoria: "Inversión",
    question: "¿Qué rentabilidad puedo esperar por alquiler turístico?",
    answer: "Las propiedades en zonas turísticas como Chapelco o el Centro generan entre USD 60 y USD 90 por día en temporada alta. La rentabilidad anual promedio ronda el 8–18% en dólares según el tipo de operación.",
  },
  {
    categoria: "Inversión",
    question: "¿Cuáles son las zonas con mayor potencial de valorización?",
    answer: "Altos del Chapelco y Faldeos del Chapelco son las zonas premium con mayor crecimiento. Para quienes buscan entrada a menor precio con alto potencial, Meliquina es la zona en desarrollo más prometedora actualmente.",
  },
  {
    categoria: "Alquiler",
    question: "¿Puedo alquilar temporalmente sin comprar?",
    answer: "Sí. Gestionamos alquileres temporarios y mensuales. Los contratos temporarios (turísticos) no están regulados por la Ley de Alquileres y ofrecen mayor flexibilidad tanto para el propietario como para el inquilino.",
  },
  {
    categoria: "Alquiler",
    question: "¿Cómo funciona el alquiler con fines turísticos?",
    answer: "El propietario pone la propiedad a disposición por períodos cortos (días o semanas). Nos encargamos de la publicación, coordinación de ingresos y pagos. El ingreso se liquida mensualmente descontando la comisión de administración.",
  },
  {
    categoria: "Zona",
    question: "¿Qué hace única a San Martín de los Andes como destino?",
    answer: "Es una ciudad de 4 estaciones con esquí en invierno (Chapelco), pesca y trekking en verano, y gastronomía y naturaleza todo el año. A diferencia de Bariloche, mantiene un perfil boutique con menor masificación, lo que preserva el valor de las propiedades.",
  },
  {
    categoria: "Zona",
    question: "¿Hay servicios e infraestructura desarrollada en la zona?",
    answer: "Sí. San Martín cuenta con hospital, colegios, aeropuerto (Chapelco), supermercados, gastronomía de nivel y conectividad de fibra óptica. Es una ciudad completa para vivir de forma permanente o como segunda residencia.",
  },
];

const PROCESO = [
  {
    paso: "01",
    titulo: "Diagnóstico",
    texto: "Entendemos tu objetivo, presupuesto y plazo para filtrar opciones útiles desde el inicio.",
  },
  {
    paso: "02",
    titulo: "Curaduría",
    texto: "Seleccionamos propiedades y zonas con criterios claros de rentabilidad, riesgo y contexto.",
  },
  {
    paso: "03",
    titulo: "Acompañamiento",
    texto: "Te acompañamos en negociación, documentación y cierre para que tengas visibilidad en cada paso.",
  },
];

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(255,90,95,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,90,95,0.08) 1px, transparent 1px)
  `,
  backgroundSize: "48px 48px",
};

export default function CentroAyudaPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredFaqs = faqs.filter((faq) => {
    const matchCategoria = categoriaActiva === "Todas" || faq.categoria === categoriaActiva;
    const matchSearch =
      faq.question.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(debouncedTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <section className="relative overflow-hidden pt-24 pb-16 bg-black" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-rose-400 text-xs font-semibold tracking-widest uppercase">Soporte</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-jakarta">
            Centro de Ayuda
          </h1>
          <p className="text-gray-300 text-base mb-8 max-w-xl mx-auto">
            Respondemos las dudas más comunes sobre compra, alquiler e inversión en la Patagonia.
          </p>

          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Buscar pregunta..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCategoriaActiva("Todas"); }}
              className="w-full px-5 py-4 pl-12 rounded-2xl bg-[#111827] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:bg-[#141a24] transition text-sm shadow-sm"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { label: `${faqs.length} preguntas`, icon: "◎" },
              { label: "Respuesta en 48h", icon: "◈" },
              { label: "WhatsApp disponible", icon: "↗" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 bg-[#111827] border border-white/10 rounded-full px-3 py-1.5 shadow-sm">
                <span className="text-rose-400 text-xs">{s.icon}</span>
                <span className="text-gray-300 text-xs font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-2">Cómo trabajamos</p>
              <h2 className="text-2xl font-black text-white font-jakarta">Acompañamiento con criterio y claridad</h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-[#111827] border border-white/10 rounded-full px-4 py-2 shadow-sm">
              <span className="text-rose-400 text-sm">◎</span>
              <span className="text-white text-sm font-bold">3 pasos</span>
              <span className="text-gray-400 text-xs">para avanzar</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PROCESO.map((item) => (
              <div key={item.paso} className="relative rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-sm hover:border-rose-400/30 hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-rose-500 to-[#FF385C] opacity-40 rounded-t-2xl" />
                <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-4">Paso {item.paso}</p>
                <h3 className="text-white text-lg font-bold mb-2">{item.titulo}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-2">Contacto</p>
            <h2 className="text-2xl font-black text-white font-jakarta">Canales de atención</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/contacto"
              className="group relative rounded-2xl border border-white/10 bg-[#111827] p-6 text-center shadow-sm hover:border-rose-400/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-[#FF385C] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Email</h3>
              <p className="text-gray-500 text-xs">{CONTACT_EMAIL}</p>
            </Link>

            <Link
              href="/contacto"
              className="group relative rounded-2xl border border-white/10 bg-[#111827] p-6 text-center shadow-sm hover:border-rose-400/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-[#FF385C] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Teléfono</h3>
              <p className="text-gray-500 text-xs">{PHONE_DISPLAY}</p>
              <p className="text-gray-400 text-[10px] mt-1">Lun–Vie 9 a 18hs</p>
            </Link>

            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl border border-white/10 bg-[#111827] p-6 text-center shadow-sm hover:border-rose-400/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-[#FF385C] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-sm mb-1">WhatsApp</h3>
              <p className="text-gray-500 text-xs">Chateá con nosotros</p>
              <div className="inline-flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <p className="text-rose-400 text-[10px] font-medium">Respuesta rápida</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-2">FAQ</p>
            <h2 className="text-2xl font-black text-white font-jakarta">Preguntas frecuentes</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoriaActiva(cat); setSearchTerm(""); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  categoriaActiva === cat
                    ? "bg-rose-600 border-rose-600 text-white"
                    : "bg-[#111827] border-white/10 text-gray-300 hover:border-rose-300 hover:text-rose-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    openFaq === index
                      ? "border-rose-400/30 bg-rose-500/10"
                      : "border-white/10 bg-[#111827] hover:border-rose-300/30"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {faq.categoria}
                      </span>
                      <span className="text-white text-sm font-medium">{faq.question}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? "rotate-180 text-rose-400" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5">
                      <div className="h-px bg-white/10 mb-4" />
                      <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border border-white/10 bg-[#111827]">
                <p className="text-gray-400 text-sm">No se encontraron preguntas que coincidan.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-black border-t border-white/5" style={gridStyle}>
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
          <div className="relative">
            <h2 className="text-3xl font-black text-white mb-3 font-jakarta">
              ¿Tenés una consulta<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-[#FF385C]">
                específica?
              </span>
            </h2>
            <p className="text-gray-300 text-sm mb-8">
              Cada operación es única. Contactanos y te asesoramos sin compromiso.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 text-sm group"
            >
              Hablar con Milton
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
