"use client";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { whatsappUrl } from "@/lib/whatsapp";

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
  // La opción del medio decía "Generar renta mensual estable" y quedó
  // inservible al realinear los perfiles (ver PERFILES, más abajo): el moderado
  // pasó a ser compra y reventa, que justamente no paga renta mensual. Alguien
  // podía elegir "quiero renta todos los meses" y terminar leyendo "el retorno
  // llega todo junto en la venta".
  //
  // El problema de fondo es que las otras tres preguntas miden tolerancia al
  // riesgo y esta se había colado midiendo preferencia de producto, con la
  // misma escala de 1 a 3 y sumando al mismo total. Una preferencia no es un
  // punto intermedio de nada: quien quiere renta mensual puede ser el más
  // conservador de todos. Ahora las cuatro preguntan lo mismo.
  {
    id: 3,
    pregunta: "¿Cuál es tu objetivo principal?",
    opciones: [
      { texto: "Proteger mi capital", puntaje: 1 },
      { texto: "Hacer crecer mi capital sin arriesgar de más", puntaje: 2 },
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

// Los tres perfiles apuntan a las tres estrategias que la página sabe medir, en
// el mismo orden de riesgo que publica su matriz y con las mismas tres opciones
// que tiene el simulador. Es una sola escalera dicha en tres lugares:
//
//   Conservador → alquiler permanente → matriz 3,5 / 7  → simulador "alquiler"
//   Moderado    → compra y reventa    → matriz 6,5 / 14 → simulador "reventa"
//   Dinámico    → alquiler turístico  → matriz 7,5 / 18 → simulador "turistico"
//
// Antes no cerraba en ninguno de los tres. El conservador recibía "terrenos y
// lotes", que se sacaron de la comparativa el 10-ago porque el modelo no los
// mide: terminaba el test, leía que le convenía un terreno y bajaba a una tabla
// donde los terrenos no existen. El moderado decía "departamentos" y la página
// le resaltaba la tarjeta de casas. Y el dinámico ofrecía dos estrategias en
// una sola línea ("turístico o reventa") que el simulador cotiza por separado y
// con retornos distintos.
//
// Los `roi` salen del simulador de /inversiones, no de la matriz. Son la misma
// cuenta que la persona ve dos clics después —"Simulá cuánto podrías ganar con
// este perfil"— y prometer acá un número que esa pantalla no confirma es la
// forma más rápida de que deje de creerle a las dos. La valorización de la
// serie del m² corre al 4,0% anual (2.450 → 2.650, últimos dos años).
const PERFILES = {
  conservador: {
    label: "Conservador",
    color: "rose",
    descripcion: "Priorizás la seguridad de tu dinero por encima del retorno. Preferís no asumir riesgos.",
    recomendacion: "Casa o departamento para alquiler permanente",
    detalle: "Cobrás todos los meses en dólares y la propiedad se valoriza mientras tanto, sin depender de la temporada ni de gestión activa. Es lo de menor riesgo de la comparativa y por donde entra la mayoría de los que invierten por primera vez.",
    // renta neta 4,9–6,6% (bruta 6,1–8,2% del relevamiento, menos 20% de
    // gastos y vacancia) + 4,0% de valorización.
    roi: "4–6% anual de renta neta estimada",
    riesgo: "Bajo",
  },
  moderado: {
    label: "Moderado",
    color: "green",
    descripcion: "Buscás más rendimiento que el de un alquiler y aceptás esperar a la venta para cobrarlo.",
    recomendacion: "Compra y reventa con refuncionalización",
    detalle: "Comprás por debajo del valor de mercado, mejorás la propiedad y vendés. El retorno llega todo junto en la venta: en el medio no entra renta, y cuándo se vende lo decide el mercado.",
    // 4,0% de valorización + 4 a 10 puntos de margen por comprar bien y mejorar.
    roi: "Margen único al vender, después de costos",
    riesgo: "Medio",
  },
  agresivo: {
    label: "Dinámico",
    color: "orange",
    descripcion: "Querés maximizar el retorno y estás dispuesto a gestionar más activamente tu inversión.",
    recomendacion: "Departamento para alquiler turístico",
    detalle: "Es lo que más rinde, pero el ingreso es estacional: fuerte en ski y verano, flojo el resto del año. Requiere gestión activa o delegarla en una administradora.",
    // renta neta 9,6% (12% bruto bien gestionado, menos 20%) + 4,0%.
    roi: "5–7% anual de renta neta estimada",
    riesgo: "Medio-alto",
  },
};

// Del colorMap sobrevive solo el acento de texto.
//
// Los fondos tintados y los botones de color se fueron al pasar el test al
// lenguaje de /tasacion, por dos motivos. El primero es un bug: desde la
// conversión a tema claro los botones saturados llevaban `text-gray-900`
// —negro sobre verde o naranja fuerte—, la misma clase de resto que dejó
// invisibles los campos del formulario de contacto. El segundo es que el
// fondo de color no distinguía nada que el título del perfil no dijera ya.
//
// El acento queda donde sí significa: el retorno y el nivel de riesgo, que es
// lo único que cambia de verdad entre un perfil y otro.
//
// El acento va en el tono 700 y no en el 600 en el que estaba. Sobre blanco,
// `primary-600` (#E8325A) da 4,17:1 de contraste y `orange-600` todavía menos:
// por debajo del 4,5:1 que pide WCAG AA para texto normal. Justo acá el color
// lo lleva el dato —el retorno y el riesgo—, que es lo último que conviene
// dejar en el borde de lo legible. En 700 sube a 5,4:1. Los puntos siguen en
// 500 porque son decorativos y no cargan texto.
const colorMap = {
  rose: { text: "text-primary-700", dot: "bg-primary-500" },
  green: { text: "text-emerald-700", dot: "bg-emerald-500" },
  orange: { text: "text-orange-700", dot: "bg-orange-500" },
};

// Primitivas de tipografía: las mismas de /tasacion, /precio-m2 y del cuerpo
// de /inversiones. Van inline porque todavía no hay un módulo compartido; si
// se extrae uno, este es uno de los cinco lugares a tocar.
const T_ANTETITULO = "text-[11px] font-semibold uppercase tracking-wider text-gray-400";
const T_TITULO = "text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900";
const T_CUERPO = "text-[15px] leading-relaxed text-gray-600";
const BTN_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800";
const BTN_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50";

// onResultado(perfilKey) se dispara al completar el test, para que la página
// pueda reaccionar (resaltar la card recomendada, preconfigurar el simulador).
// onVerSimulador muestra un CTA extra en el resultado que lleva al simulador.
export default function InvestorQuiz({ onResultado, onVerSimulador }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const { trackEvent, trackWhatsAppClick } = useAnalytics();

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
        onResultado?.(calcularPerfil(nuevas));
      }
    }, 350);
  };

  const reiniciar = () => {
    setPaso(0);
    setRespuestas([]);
    setSeleccion(null);
    setEmail("");
    setEnviando(false);
    setErrorEmail(false);
  };

  // Envía el email a /api/suscripcion y pasa al resultado completo.
  // Si el guardado falla, el usuario ve su estrategia igual: el lead
  // no vale más que la experiencia.
  const handleEmail = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorEmail(true);
      return;
    }
    setErrorEmail(false);
    setEnviando(true);
    try {
      await fetch("/api/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), interes: "invertir", source: "test-inversor" }),
      });
    } catch {
      // sin red: seguimos igual al resultado
    }
    setEnviando(false);
    setPaso(6);
  };

  const perfil = paso >= 5 ? PERFILES[calcularPerfil(respuestas)] : null;
  const colores = perfil ? colorMap[perfil.color] : null;
  const progreso = paso >= 1 && paso <= 4 ? (paso / QUESTIONS.length) * 100 : 0;

  const waLink = perfil
    ? whatsappUrl(
        `Hola Milton, hice el test de perfil inversor en la web y mi resultado fue ${perfil.label}.\n\n` +
        `Estrategia sugerida: ${perfil.recomendacion}\n` +
        `Objetivo orientativo: ${perfil.roi}\n\n` +
        `Quisiera recibir una propuesta personalizada según mi presupuesto.`
      )
    : "#";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="max-w-xl mx-auto">

        {/* Paso 0 — Intro */}
        {paso === 0 && (
          <div className="text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Test gratuito · 1 minuto
            </div>
            <h2 className={T_TITULO}>¿Qué tipo de propiedad te conviene?</h2>
            <p className={`mx-auto mt-3 mb-8 max-w-sm ${T_CUERPO}`}>
              Respondé 4 preguntas y te decimos qué inversión inmobiliaria se adapta mejor a tu objetivo y perfil de riesgo.
            </p>
            <button onClick={() => setPaso(1)} className={BTN_PRIMARIO}>
              Empezar el test gratuito →
            </button>
          </div>
        )}

        {/* Pasos 1–4 — Preguntas */}
        {paso >= 1 && paso <= 4 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className={T_ANTETITULO}>Pregunta {paso} de {QUESTIONS.length}</span>
              <div className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <button onClick={reiniciar} className="text-[11px] text-gray-400 transition-colors hover:text-gray-900">
                Reiniciar
              </button>
            </div>
            <h3 className="mb-6 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-gray-900 md:text-[22px]">
              {preguntaActual.pregunta}
            </h3>
            <div className="space-y-3">
              {preguntaActual.opciones.map((opcion) => (
                <button
                  key={opcion.puntaje}
                  onClick={() => handleOpcion(opcion.puntaje)}
                  className={`w-full rounded-xl border px-5 py-4 text-left text-[15px] font-medium transition-all duration-200 ${
                    seleccion === opcion.puntaje
                      ? "scale-[0.98] border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 5 — Perfil revelado + captura de email */}
        {paso === 5 && perfil && (
          <div>
            <div className="mb-6 text-center">
              <p className={`inline-flex items-center gap-1.5 ${T_ANTETITULO}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colores.dot}`} />
                Tu perfil de inversión
              </p>
              <h2 className={`mt-2 ${T_TITULO}`}>{perfil.label}</h2>
              <p className={`mx-auto mt-3 max-w-sm ${T_CUERPO}`}>{perfil.descripcion}</p>
            </div>

            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/60 p-5 text-center">
              <p className={T_ANTETITULO}>Tu estrategia está lista</p>
              <p className={`mx-auto mt-2 mb-4 max-w-sm ${T_CUERPO}`}>
                Dejá tu email y te mostramos qué tipo de propiedad te conviene, el retorno
                estimado y el nivel de riesgo de tu perfil.
              </p>
              <form onSubmit={handleEmail} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={`flex-1 rounded-xl border bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-gray-300 ${
                    errorEmail ? "border-red-500" : "border-gray-200 focus:border-gray-900"
                  }`}
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className={`${BTN_PRIMARIO} disabled:opacity-60`}
                >
                  {enviando ? "Un segundo..." : "Ver mi estrategia →"}
                </button>
              </form>
              {errorEmail && (
                <p className="mt-2 text-[11px] text-red-600">Ingresá un email válido.</p>
              )}
              <p className="mt-3 text-[11px] text-gray-400">Cero spam. Solo análisis y oportunidades del mercado de SMA.</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPaso(6)}
                className="text-[11px] text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-900"
              >
                Prefiero ver la estrategia sin dejar mi email
              </button>
            </div>
          </div>
        )}

        {/* Paso 6 — Resultado completo */}
        {paso === 6 && perfil && (
          <div>
            <div className="mb-6 text-center">
              <p className={`inline-flex items-center gap-1.5 ${T_ANTETITULO}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colores.dot}`} />
                Tu perfil de inversión
              </p>
              <h2 className={`mt-2 ${T_TITULO}`}>{perfil.label}</h2>
              <p className={`mx-auto mt-3 max-w-sm ${T_CUERPO}`}>{perfil.descripcion}</p>
            </div>

            <div className="mb-5 rounded-xl border border-gray-200 p-5">
              <p className={T_ANTETITULO}>Lo que te recomendamos</p>
              <p className={`mt-2 text-[17px] font-semibold tracking-[-0.01em] ${colores.text}`}>{perfil.recomendacion}</p>
              <p className={`mt-2 ${T_CUERPO}`}>{perfil.detalle}</p>
              <div className="mt-5 grid grid-cols-2 divide-x divide-gray-100 border-y border-gray-100 py-5">
                <div className="px-4 text-center">
                  <div className={`text-[17px] font-semibold tabular-nums ${colores.text}`}>{perfil.roi}</div>
                  <div className={`mt-1 ${T_ANTETITULO}`}>Retorno estimado</div>
                </div>
                <div className="px-4 text-center">
                  <div className={`text-[17px] font-semibold ${colores.text}`}>{perfil.riesgo}</div>
                  <div className={`mt-1 ${T_ANTETITULO}`}>Nivel de riesgo</div>
                </div>
              </div>
              {onVerSimulador && (
                <button onClick={onVerSimulador} className={`mt-5 w-full ${BTN_SECUNDARIO}`}>
                  Simulá cuánto podrías ganar con este perfil →
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppClick(null, "investor_quiz_result");
                  trackEvent("investor_quiz_whatsapp", { profile: calcularPerfil(respuestas) });
                }}
                className={`flex-1 ${BTN_PRIMARIO}`}
              >
                Quiero que me asesoren sobre esto →
              </a>
              <button onClick={reiniciar} className={`flex-1 ${BTN_SECUNDARIO}`}>
                Repetir el test
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
