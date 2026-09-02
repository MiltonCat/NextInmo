// Las preguntas y respuestas publicadas en /inversiones. Viven acá, y no dentro
// de la página, porque las lee ADEMÁS Lucía: el chat no puede decir sobre
// rentabilidad o valorización nada distinto de lo que el visitante ve en el
// sitio. Mismo criterio que el bloque EQUIPO de lib/luciaKnowledge.js.
//
// La página las envuelve en un FAQPage de schema.org —o sea que Google las
// puede levantar como respuesta destacada—, así que ningún número acá puede
// estar escrito a mano: el del m² sale del modelo, igual que /tasacion y
// /precio-m2.
import { VALOR_M2_CASA, VALOR_M2_DEPTO, RANGO_M2 } from "@/lib/mercado";

const usd = (v) => `USD ${Number(v).toLocaleString("es-AR")}`;

export const FAQ_INVERSIONES = [
  {
    pregunta: "¿Conviene invertir en propiedades en San Martín de los Andes en 2026?",
    respuesta:
      "San Martín de los Andes muestra una tendencia sostenida de valorización del m² en dólares. La combinación de destino turístico consolidado, oferta limitada de suelo y demanda creciente lo posiciona como uno de los mercados inmobiliarios más estables de la Patagonia para inversores.",
  },
  {
    pregunta: "¿Cuál es el ROI promedio de una propiedad en San Martín de los Andes?",
    respuesta:
      "La rentabilidad estimada depende del tipo de inversión: un alquiler permanente ronda el 6-8% anual, el alquiler turístico puede alcanzar el 12% y las operaciones de compra y reventa, hasta el 15%. A eso se suma la valorización del m² en dólares: San Martín es un mercado maduro, con precios entre los más altos del país y estables en el tiempo, más que de subas fuertes año a año. Estos valores son estimaciones orientativas y los resultados varían según la zona, la propiedad y la gestión.",
  },
  {
    pregunta: "¿Qué tipo de propiedad rinde más en San Martín de los Andes?",
    respuesta:
      "Las cabañas y departamentos en zonas turísticas tienen mayor rentabilidad por alquiler temporario. Los lotes en zonas de expansión muestran la mayor valorización de capital a largo plazo. Los departamentos céntricos ofrecen el mejor equilibrio entre demanda de alquiler permanente y valorización.",
  },
  {
    pregunta: "¿Cuánto cuesta el m² en San Martín de los Andes?",
    // Decía "entre USD 1.200 y USD 3.500 aproximadamente", los dos escritos a
    // mano. El techo era falso: el modelo pone el p75 de departamentos en
    // USD 3.923. Ahora sale del modelo.
    get respuesta() {
      return `El precio del m² en San Martín de los Andes depende sobre todo del tipo de propiedad: la mediana está en ${usd(VALOR_M2_CASA)}/m² para casas y ${usd(VALOR_M2_DEPTO)}/m² para departamentos. El 50 % central del mercado va de ${usd(RANGO_M2.Casa?.p25)} a ${usd(RANGO_M2.Departamento?.p75)} por m². Las zonas céntricas y con vista al lago o a la montaña concentran los valores más altos. Podés consultar el análisis actualizado por zona en nuestra página de precio del m².`;
    },
  },
];

// El mismo contenido en el formato que entiende Google.
export const faqInversionesJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_INVERSIONES.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: { "@type": "Answer", text: item.respuesta },
  })),
};
