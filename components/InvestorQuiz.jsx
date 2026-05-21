"use client";
import { useState } from "react";
import { WA_NUMBER } from "@/config";

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
    descripcion: "Priorizás la seguridad de tu dinero por encima del retorno. Preferís no asumir riesgos.",
    recomendacion: "Terrenos y lotes en zonas de desarrollo",
    detalle: "Baja volatilidad y alta valorización a largo plazo sin necesidad de gestión activa. Ideal para preservar capital en dólares.",
    roi: "8–12% anual (valorización)",
    riesgo: "Bajo",
  },
  moderado: {
    label: "Moderado",
    color: "green",
    descripcion: "Buscás equilibrio entre seguridad y rendimiento. Aceptás algo de espera a cambio de una renta estable.",
    recomendacion: "Departamentos para alquiler tradicional",
    detalle: "Renta mensual estable en dólares con valorización sostenida del inmueble. La opción más elegida por inversores de primera vez.",
    roi: "6–8% anual (renta)",
    riesgo: "Medio",
  },
  agresivo: {
    label: "Dinámico",
    color: "orange",
    descripcion: "Querés maximizar el retorno y estás dispuesto a gestionar más activamente tu inversión.",
    recomendacion: "Alquiler turístico o reventa con refuncionalización",
    detalle: "Mayor retorno potencial. Requiere gestión activa o delegar en una administradora. Alta demanda en temporadas de ski y trekking.",
    roi: "12–18% anual",
    riesgo: "Medio-alto",
  },
};

const colorMap = {
  rose: {
    bg: "bg-primary-500/10",
    border: "border-primary-500/30",
    btn: "bg-primary-600 hover:bg-primary-700",
    text: "text-primary-400",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    btn: "bg-green-600 hover:bg-green-700",
    text: "text-green-400",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    btn: "bg-orange-500 hover:bg-orange-600",
    text: "text-orange-400",
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

  const waLink = perfil
    ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Hice el test de perfil inversor en la web y me salió perfil ${perfil.label}. Me gustaría recibir una propuesta personalizada.`)}`
    : "#";

  return (
    <div className="bg-[#111118] rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-sm">
      <div className="max-w-xl mx-auto">

        {/* Paso 0 — Intro */}
        {paso === 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span className="text-primary-500 text-xs font-semibold tracking-widest uppercase">Test gratuito · 1 minuto</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">¿Qué tipo de propiedad te conviene?</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              Respondé 4 preguntas y te decimos qué inversión inmobiliaria se adapta mejor a tu objetivo y perfil de riesgo.
            </p>
            <button
              onClick={() => setPaso(1)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Empezar el test gratuito →
            </button>
          </div>
        )}

        {/* Pasos 1–4 — Preguntas */}
        {paso >= 1 && paso <= 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-500 text-xs">Pregunta {paso} de {QUESTIONS.length}</span>
              <div className="flex-1 mx-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <button onClick={reiniciar} className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
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
                      ? "bg-primary-600 border-primary-500 text-white scale-[0.98]"
                      : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 5 — Resultado */}
        {paso === 5 && perfil && (
          <div>
            <div className="text-center mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tu perfil de inversión</p>
              <h2 className="text-white text-2xl font-bold mb-2">{perfil.label}</h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">{perfil.descripcion}</p>
            </div>

            <div className={`${colores.bg} ${colores.border} border rounded-xl p-5 mb-5`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lo que te recomendamos</p>
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
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 text-center text-white font-semibold py-3 rounded-xl transition-colors text-sm ${colores.btn}`}
              >
                Quiero que me asesoren sobre esto →
              </a>
              <button
                onClick={reiniciar}
                className="flex-1 text-center text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Repetir el test
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
