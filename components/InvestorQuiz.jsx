"use client";
import { useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    pregunta: "¿Cuánto tiempo estás dispuesto a esperar para ver resultados?",
    opciones: [
      { texto: "Menos de 1 año", puntaje: 1 },
      { texto: "Entre 1 y 3 años", puntaje: 2 },
      { texto: "Más de 3 años", puntaje: 3 },
    ],
  },
  {
    id: 2,
    pregunta: "Si tu inversión baja un 15% temporalmente, ¿qué hacés?",
    opciones: [
      { texto: "Me preocupa mucho, prefiero seguridad", puntaje: 1 },
      { texto: "Lo acepto si a largo plazo sube", puntaje: 2 },
      { texto: "Es parte del juego, no me afecta", puntaje: 3 },
    ],
  },
  {
    id: 3,
    pregunta: "¿Cuál es tu objetivo principal?",
    opciones: [
      { texto: "Proteger mi capital", puntaje: 1 },
      { texto: "Generar renta mensual estable", puntaje: 2 },
      { texto: "Maximizar el retorno", puntaje: 3 },
    ],
  },
  {
    id: 4,
    pregunta: "¿Tenés experiencia invirtiendo?",
    opciones: [
      { texto: "No, es mi primera vez", puntaje: 1 },
      { texto: "Algo de experiencia", puntaje: 2 },
      { texto: "Sí, tengo cartera activa", puntaje: 3 },
    ],
  },
];

const PERFILES = {
  conservador: {
    label: "Conservador",
    color: "rose",
    emoji: "🛡️",
    descripcion: "Priorizás la seguridad del capital sobre el retorno. Tolerás poca volatilidad.",
    recomendacion: "Terrenos y lotes en zonas de desarrollo",
    detalle: "Baja volatilidad, alta plusvalía a largo plazo sin gestión activa. Ideal para preservar capital en dólares.",
    roi: "8–12% anual (valorización)",
    riesgo: "Bajo",
  },
  moderado: {
    label: "Moderado",
    color: "green",
    emoji: "⚖️",
    descripcion: "Buscás equilibrio entre seguridad y rendimiento. Aceptás algo de espera.",
    recomendacion: "Departamentos para alquiler tradicional",
    detalle: "Renta mensual estable en dólares con valorización sostenida del inmueble.",
    roi: "6–8% anual (renta)",
    riesgo: "Medio",
  },
  agresivo: {
    label: "Dinámico",
    color: "orange",
    emoji: "🚀",
    descripcion: "Maximizás el retorno y aceptás mayor gestión a cambio de mejor rendimiento.",
    recomendacion: "Alquiler turístico o reventa con refuncionalización",
    detalle: "Mayor retorno potencial. Requiere gestión activa o delegarla a una administradora.",
    roi: "12–18% anual",
    riesgo: "Medio-alto",
  },
};

const colorMap = {
  rose: {
    bg: "bg-primary-500/10",
    border: "border-primary-500/30",
    badge: "bg-primary-500/10 text-primary-400",
    btn: "bg-primary-600 hover:bg-primary-700",
    text: "text-primary-400",
    bar: "bg-primary-500",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    badge: "bg-green-500/10 text-green-400",
    btn: "bg-green-600 hover:bg-green-700",
    text: "text-green-400",
    bar: "bg-green-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "bg-orange-500/10 text-orange-400",
    btn: "bg-orange-500 hover:bg-orange-600",
    text: "text-orange-400",
    bar: "bg-orange-500",
  },
};

export default function InvestorQuiz() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [seleccion, setSeleccion] = useState(null);

  const preguntaActual = QUESTIONS[paso - 1];

  const calcularPerfil = (respuestasFinales) => {
    const total = respuestasFinales.reduce((a, b) => a + b, 0);
    if (total <= 6) return "conservador";
    if (total <= 9) return "moderado";
    return "agresivo";
  };

  const handleOpcion = (puntaje) => {
    setSeleccion(puntaje);
    setTimeout(() => {
      const nuevas = [...respuestas, puntaje];
      setRespuestas(nuevas);
      setSeleccion(null);
      if (paso < QUESTIONS.length) {
        setPaso(paso + 1);
      } else {
        setPaso(5);
      }
    }, 350);
  };

  const reiniciar = () => {
    setPaso(0);
    setRespuestas([]);
    setSeleccion(null);
  };

  const perfil = paso === 5 ? PERFILES[calcularPerfil(respuestas)] : null;
  const colores = perfil ? colorMap[perfil.color] : null;
  const progreso = paso >= 1 && paso <= 4 ? (paso / QUESTIONS.length) * 100 : 0;

  return (
    <div className="mt-4 sm:mt-6 bg-[#111118] rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-sm">
      <div className="max-w-xl mx-auto">
        {paso === 0 && (
          <div className="text-center">
            <p className="text-rose-400 text-xs font-semibold tracking-widest uppercase mb-2">Fintech tool</p>
            <h2 className="text-white text-2xl font-bold mb-3">¿Qué tipo de inversor sos?</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              4 preguntas. Menos de 1 minuto. Te decimos qué tipo de inversión inmobiliaria se adapta a tu perfil.
            </p>
            <button
              onClick={() => setPaso(1)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Descubrir mi perfil →
            </button>
          </div>
        )}

        {paso >= 1 && paso <= 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-500 text-xs">{paso} de {QUESTIONS.length}</span>
              <div className="flex-1 mx-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E8325A] rounded-full transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <button onClick={reiniciar} className="text-gray-500 hover:text-gray-700 text-xs transition-colors">
                Reiniciar
              </button>
            </div>
            <h3 className="text-white text-lg font-semibold mb-6 leading-snug">
              {preguntaActual.pregunta}
            </h3>
            <div className="space-y-3">
              {preguntaActual.opciones.map((opcion) => (
                <button
                  key={opcion.puntaje}
                  onClick={() => handleOpcion(opcion.puntaje)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    seleccion === opcion.puntaje
                      ? "bg-[#E8325A] border-[#E8325A] text-white scale-[0.98]"
                      : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 5 && perfil && (
          <div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{perfil.emoji}</div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Tu perfil de inversión</p>
              <h2 className="text-white text-2xl font-bold">{perfil.label}</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">{perfil.descripcion}</p>
            </div>
            <div className={`${colores.bg} ${colores.border} border rounded-xl p-5 mb-5`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Te recomendamos</p>
              <p className={`font-bold text-base ${colores.text} mb-2`}>{perfil.recomendacion}</p>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{perfil.detalle}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <div className={`font-bold text-sm ${colores.text}`}>{perfil.roi}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Retorno estimado</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center border border-gray-700">
                  <div className={`font-bold text-sm ${colores.text}`}>{perfil.riesgo}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Nivel de riesgo</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`/contacto?perfil=${perfil.label.toLowerCase()}`}
                className={`flex-1 text-center text-white font-semibold py-3 rounded-xl transition-colors text-sm ${colores.btn}`}
              >
                Quiero una propuesta para mi perfil
              </a>
              <button
                onClick={reiniciar}
                className="flex-1 text-center text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Volver a hacer el test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
