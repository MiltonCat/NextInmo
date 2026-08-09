"use client";

// El zorro del tasador.
//
// La API del modelo vive en un plan gratuito de Render y se apaga sola cuando
// nadie la usa. Despertarla lleva cerca de un minuto, y ese minuto es el peor
// momento de la página: un spinner mudo se lee como "se colgó" y la persona
// cierra la pestaña justo cuando faltaba lo que vino a buscar.
//
// El zorro convierte esa espera en algo legible. No es decoración: su estado es
// el estado real del modelo. Duerme mientras el contenedor arranca, se despierta
// cuando contesta. Si alguna vez el zorro dijera algo distinto de lo que está
// pasando, sería peor que no tenerlo — por eso `estado` lo manda quien conoce
// la respuesta del servidor, no un temporizador.
//
// Zorro colorado, que es el que efectivamente vive en los cerros de acá. Un
// animal genérico de banco de imágenes habría dado lo mismo en cualquier lado.

const PELAJE = "#E8734A";
const PELAJE_OSCURO = "#C9552F";
const CLARO = "#FBEEE4";
const OSCURO = "#3A2A22";

const COPIA = {
  durmiendo: {
    titulo: "El modelo está durmiendo",
    detalle: "Lo estamos despertando. Tarda menos de un minuto y podés ir completando el formulario mientras tanto.",
  },
  despierto: {
    titulo: "El modelo está listo",
    detalle: "Cuando termines de completar, el resultado sale al instante.",
  },
  trabajando: {
    titulo: "Calculando tu tasación",
    detalle: "Comparando tu propiedad contra las relevadas en el barrio.",
  },
};

export default function MascotaModelo({ estado = "durmiendo", className = "" }) {
  const durmiendo = estado === "durmiendo";
  const copia = COPIA[estado] ?? COPIA.durmiendo;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <style>{`
        @keyframes cpZorroRespira {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50%      { transform: translateY(0.6px) scaleY(0.985); }
        }
        @keyframes cpZorroZ {
          0%   { opacity: 0; transform: translate(0, 0) scale(0.7); }
          25%  { opacity: 1; }
          100% { opacity: 0; transform: translate(7px, -16px) scale(1.15); }
        }
        @keyframes cpZorroOreja {
          0%, 92%, 100% { transform: rotate(0deg); }
          95%           { transform: rotate(-11deg); }
        }
        @keyframes cpZorroCola {
          0%, 100% { transform: rotate(0deg); }
          50%      { transform: rotate(4deg); }
        }
        .cp-zorro-respira { animation: cpZorroRespira 3.6s ease-in-out infinite; transform-origin: 70px 86px; }
        .cp-zorro-z       { animation: cpZorroZ 3.6s ease-out infinite; }
        .cp-zorro-oreja   { animation: cpZorroOreja 5s ease-in-out infinite; transform-origin: 52px 46px; }
        .cp-zorro-cola    { animation: cpZorroCola 2.4s ease-in-out infinite; transform-origin: 104px 82px; }
        /* Quien pidió menos movimiento ve al zorro quieto: el estado se sigue
           entendiendo por los ojos y por el texto de al lado. */
        @media (prefers-reduced-motion: reduce) {
          .cp-zorro-respira, .cp-zorro-z, .cp-zorro-oreja, .cp-zorro-cola { animation: none; }
        }
      `}</style>

      <svg
        viewBox="0 0 140 110"
        className="h-[72px] w-[92px] flex-shrink-0"
        role="img"
        aria-label={copia.titulo}
      >
        {/* Sombra en el piso: apoya al zorro y evita que flote sobre el blanco */}
        <ellipse cx="70" cy="96" rx="42" ry="6" fill={OSCURO} opacity="0.07" />

        <g className="cp-zorro-respira">
          {/* Cola enroscada por detrás del cuerpo */}
          <g className={durmiendo ? "" : "cp-zorro-cola"}>
            <path
              d="M104 86c14 2 24-8 22-20-2-11-12-16-20-12 6 3 9 9 7 15-2 7-9 10-17 8z"
              fill={PELAJE_OSCURO}
            />
            <path
              d="M106 54c8-4 18 1 20 12 1 6-1 11-5 14 2-4 2-9 1-13-2-8-9-13-16-13z"
              fill={CLARO}
            />
          </g>

          {/* Cuerpo acurrucado */}
          <ellipse cx="70" cy="76" rx="40" ry="20" fill={PELAJE} />
          <path d="M34 78c8 10 24 15 40 15s30-5 36-14c-6 12-21 19-38 19s-31-8-38-20z" fill={PELAJE_OSCURO} opacity="0.35" />

          {/* Pecho claro */}
          <ellipse cx="58" cy="82" rx="20" ry="11" fill={CLARO} opacity="0.9" />

          {/* Orejas. Van antes que la cabeza para que el borde quede tapado. */}
          <g className={durmiendo ? "" : "cp-zorro-oreja"}>
            <path
              d={durmiendo ? "M38 48l-4-14 15 7z" : "M38 44l-3-18 16 10z"}
              fill={PELAJE}
            />
            <path
              d={durmiendo ? "M39 46l-2-8 8 4z" : "M39 42l-2-11 9 6z"}
              fill={OSCURO}
              opacity="0.35"
            />
            <path
              d={durmiendo ? "M64 44l8-12 3 14z" : "M65 40l10-15 2 17z"}
              fill={PELAJE}
            />
            <path
              d={durmiendo ? "M65 43l5-7 2 8z" : "M66 40l6-9 1 10z"}
              fill={OSCURO}
              opacity="0.35"
            />
          </g>

          {/* Cabeza */}
          <circle cx="55" cy="59" r="19" fill={PELAJE} />

          {/* Hocico */}
          <path d="M36 62c-6 1-10 4-10 6s4 5 10 6c5 1 9-2 9-6s-4-7-9-6z" fill={CLARO} />
          <ellipse cx="27" cy="68" rx="3.4" ry="2.8" fill={OSCURO} />

          {/* Mejilla clara */}
          <path d="M46 70c4 3 10 4 16 3-5 4-13 4-19 1z" fill={CLARO} opacity="0.75" />

          {/* Ojos: cerrados mientras duerme, abiertos cuando el modelo contesta.
              Es el único detalle que hay que mirar para saber si va a andar. */}
          {durmiendo ? (
            <>
              <path d="M41 58c2.5 2.5 6 2.5 8.5 0" stroke={OSCURO} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M58 56c2.5 2.5 6 2.5 8.5 0" stroke={OSCURO} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="45" cy="57" r="3.1" fill={OSCURO} />
              <circle cx="46.1" cy="55.9" r="1.05" fill="#fff" />
              <circle cx="62" cy="55" r="3.1" fill={OSCURO} />
              <circle cx="63.1" cy="53.9" r="1.05" fill="#fff" />
            </>
          )}
        </g>

        {/* Los Zzz solo existen mientras duerme */}
        {durmiendo && (
          <g fill={OSCURO} opacity="0.5" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700">
            <text className="cp-zorro-z" x="82" y="42" fontSize="11" style={{ animationDelay: "0s" }}>z</text>
            <text className="cp-zorro-z" x="90" y="32" fontSize="14" style={{ animationDelay: "1.2s" }}>z</text>
            <text className="cp-zorro-z" x="99" y="20" fontSize="17" style={{ animationDelay: "2.4s" }}>z</text>
          </g>
        )}
      </svg>

      {/* `aria-live` en el contenedor y no en el SVG: quien usa lector de
          pantalla necesita enterarse del cambio de estado, no de la ilustración. */}
      <div className="min-w-0" aria-live="polite">
        <p className="text-[14px] font-semibold text-gray-900">{copia.titulo}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-gray-500">{copia.detalle}</p>
      </div>
    </div>
  );
}
