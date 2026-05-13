"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function ImageWithSkeleton({ src, alt, className, aspectRatio = "aspect-video" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${aspectRatio} ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={error ? "https://via.placeholder.com/800x400?text=Imagen" : src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

const articles = [
  {
    id: 1,
    title: "Cómo invertir en bienes raíces en 2026: Guía completa para principiantes",
    excerpt: "Todo lo que necesitas saber para comenzar a construir patrimonio inmobiliario desde cero.",
    category: "Inversiones",
    image: "https://images.unsplash.com/photo-1560520653-9e180e2f8c1e?w=1200&q=80",
    date: "15 Mar 2026",
    readTime: "8 min",
    author: "Milton Catalan",
    content: `
      <p class="mb-6">El mercado inmobiliario en Argentina está experimentando una transformación significativa en 2026. Con la estabilización económica y el crecimiento del turismo en la Patagonia, ahora es el momento ideal para considerar inversiones en bienes raíces.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Por qué invertir en bienes raíces?</h2>
      <p class="mb-6">Los bienes raíces han demostrado históricamente ser una de las inversiones más estables y seguras. A diferencia de otros instrumentos financieros, la propiedad física ofrece:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Protección contra la inflación</li>
        <li>Generación de ingresos pasivos mediante alquileres</li>
        <li>Valorización a largo plazo</li>
        <li>Control directo sobre tu inversión</li>
      </ul>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Pasos para comenzar</h2>
      <p class="mb-6"><strong>1. Define tu objetivo:</strong> ¿Buscas alquiler temporal, alquiler tradicional o apreciación del capital?</p>
      <p class="mb-6"><strong>2. Establece tu presupuesto:</strong> Considera no solo el precio de compra, sino también impuestos, mantenimiento y gastos de cierre.</p>
      <p class="mb-6"><strong>3. Investiga la ubicación:</strong> La ubicación es el factor más importante. Busca zonas con potencial de crecimiento, servicios cercanos y buena conectividad.</p>
      <p class="mb-6"><strong>4. Analiza el mercado de alquileres:</strong> Asegúrate de que la demanda de alquiler en la zona sea suficiente para generar rentabilidad.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">La Patagonia como opción de inversión</h2>
      <p class="mb-6">San Martín de los Andes se ha consolidado como uno de los destinos más atractivos para inversores inmobiliarios. El crecimiento del turismo, la falta de oferta de alquileres y la escasez de tierra disponible han impulsado una valorización sostenida en los últimos años.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Conclusión</h2>
      <p class="mb-6">Invertir en bienes raíces requiere análisis cuidadoso y planificación. Sin embargo, con la orientación adecuada y una estrategia clara, puede ser una de las inversiones más gratificantes y seguras a largo plazo.</p>
    `,
  },
  {
    id: 2,
    title: "El mercado inmobiliario en la Patagonia: Análisis y perspectivas",
    excerpt: "El crecimiento exponencial de San Martín de los Andes y por qué todos miran al sur.",
    category: "Mercado",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    date: "10 Mar 2026",
    readTime: "12 min",
    author: "Milton Catalan",
    content: `
      <p class="mb-6">La Patagonia argentina está viviendo un boom inmobiliario sin precedentes. San Martín de los Andes, en particular, se ha convertido en el destino favorito de inversores de todo el país.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Factores que impulsan el crecimiento</h2>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Turismo en auge:</strong> El turismo interno e internacional en la región se ha triplicado en la última década.</li>
        <li><strong>Escasez de oferta:</strong> La demanda supera ampliamente la oferta disponible.</li>
        <li><strong>Inversiones en infraestructura:</strong> Nuevas rutas, mejoras en servicios y desarrollo de centros turísticos.</li>
        <li><strong>Cambio de estilo de vida:</strong> La pandemia aceleró el fenómeno de personas buscando espacios abiertos y naturaleza.</li>
      </ul>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Proyecciones futuras</h2>
      <p class="mb-6">Los expertos proyectan que los precios en la región seguirán en ascenso durante los próximos 5-10 años, impulsados por la limitación geográfica (escasez de tierra) y la creciente demanda.</p>
    `,
  },
  {
    id: 3,
    title: "Top 7 barrios para invertir en Argentina",
    excerpt: "Las zonas con mayor potencial de rendimiento hoy.",
    category: "Tendencias",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    date: "5 Mar 2026",
    readTime: "6 min",
    author: "Catalan Propiedades",
    content: `
      <p class="mb-6">Elegir la ubicación correcta es el factor más determinante en cualquier inversión inmobiliaria. No alcanza con una propiedad buena en el lugar equivocado. Acá van las zonas con mayor potencial en Argentina hoy.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">1. San Martín de los Andes, Neuquén</h2>
      <p class="mb-6">Lidera el ranking por un motivo claro: demanda en alza, oferta limitada y valorización sostenida. Con una apreciación promedio del 15% anual y alquileres temporales que pueden rentar hasta 8% bruto, es el destino más prometedor de la Patagonia para inversores.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Villa La Angostura</h2>
      <p class="mb-6">Complementaria a San Martín, más íntima y con precios todavía un 20% menores. El potencial de crecimiento es similar pero con menor volumen de competencia. Ideal para quienes buscan entrar antes de que la demanda suba más.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Bariloche</h2>
      <p class="mb-6">El destino más consolidado de la región. Con infraestructura desarrollada, conectividad aérea directa y demanda estable todo el año, ofrece menos riesgo y retornos más predecibles. Más competitivo, pero más líquido.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">4. Mendoza capital</h2>
      <p class="mb-6">El turismo del vino y la gastronomía generan una demanda constante de alquileres de corto plazo. El barrio de Chacras de Coria y el entorno de Luján de Cuyo concentran las oportunidades más atractivas.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">5. Puerto Madryn, Chubut</h2>
      <p class="mb-6">El turismo de avistaje de ballenas genera una demanda estacional intensa. Los precios siguen siendo accesibles en relación al rendimiento, con buenas oportunidades en departamentos céntricos.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">6. Palermo Soho / Hollywood, CABA</h2>
      <p class="mb-6">En el mercado porteño, estas zonas mantienen la mayor demanda de alquiler temporario. Los precios son más altos pero la liquidez también: si necesitás vender, encontrás comprador rápido.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">7. Salta capital</h2>
      <p class="mb-6">El crecimiento del turismo cultural y el bajo precio de entrada hacen de Salta una opción interesante para diversificar cartera. El centro histórico y el barrio de Limache concentran las mejores oportunidades.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Cómo elegir?</h2>
      <p class="mb-6">La elección depende de tu perfil: si buscás crecimiento de capital a largo plazo, la Patagonia ofrece las perspectivas más sólidas. Si querés flujo de caja inmediato, las zonas turísticas consolidadas son más predecibles. En cualquier caso, la asesoría profesional antes de comprar es la mejor inversión que podés hacer.</p>
    `,
  },
  {
    id: 4,
    title: "Guía completa para comprar tu primera propiedad",
    excerpt: "Todo lo que necesitas saber antes de dar el paso.",
    category: "Guía",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa0?w=1200&q=80",
    date: "1 Mar 2026",
    readTime: "15 min",
    author: "Milton Catalan",
    content: `
      <p class="mb-6">Comprar una propiedad es una de las decisiones financieras más importantes de tu vida. Esta guía te ayudará a navegar el proceso paso a paso.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Preparación financiera</h2>
      <p class="mb-6">Antes de buscar propiedades, asegurate de tener:</p>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Ahorro para la inicial (generalmente 20-30%)</li>
        <li>Historial crediticio saludable</li>
        <li>Estabilidad laboral (mínimo 2 años)</li>
        <li>Reserva para gastos de cierre (3-5% adicional)</li>
      </ul>
      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Definir presupuesto</h2>
      <p class="mb-6">Calculá cuánto podés pagar mensualmente. Una regla clásica es que la cuota no supere el 30% de tus ingresos netos.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Negociación y cierre</h2>
      <p class="mb-6">Una vez elegida la propiedad, viene la negociación de precio, firma del boleto y finalmente la escritura.</p>
    `,
  },
  {
    id: 5,
    title: "Por qué la Patagonia es el nuevo hotspot inmobiliario",
    excerpt: "Inversores de todo el país miran hacia el sur.",
    category: "Mercado",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    date: "25 Feb 2026",
    readTime: "7 min",
    author: "Milton Catalan",
    content: `
      <p class="mb-6">La Patagonia se ha convertido en el destino más buscado por inversores inmobiliarios en Argentina. San Martín de los Andes, en particular, combina tres condiciones que rara vez se dan juntas: demanda creciente, oferta limitada por geografía y un atractivo turístico que no depende de modas.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Los números que explican el interés</h2>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Valorización promedio estimada: 15% anual en los últimos 5 años</li>
        <li>Rendimiento de alquiler temporario: hasta 8% bruto anual en escenarios favorables</li>
        <li>Tasa de ocupación turística: 85% en temporada alta</li>
        <li>Escasez de oferta: demanda que supera ampliamente a las propiedades disponibles</li>
      </ul>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Por qué ahora?</h2>
      <p class="mb-6">El cambio de paradigma post-pandemia aceleró el proceso. Más personas buscan propiedades fuera de los grandes centros urbanos, con acceso a naturaleza y calidad de vida. San Martín de los Andes responde exactamente a esa demanda.</p>
      <p class="mb-6">A eso se suma la estabilización relativa del mercado en dólares: comprar en Argentina con dólares billete o transferencia sigue siendo una de las formas más directas de resguardar capital.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">La limitación geográfica como ventaja del inversor</h2>
      <p class="mb-6">San Martín de los Andes está rodeado de parques nacionales y lagos que hacen imposible una expansión urbana ilimitada. Esto significa que la tierra disponible es estructuralmente escasa. En cualquier mercado, la escasez sostenida presiona los precios hacia arriba.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Qué tipo de inversor conviene?</h2>
      <p class="mb-6">La Patagonia tiene mejor perfil para inversores de mediano y largo plazo que no necesitan liquidez inmediata. El mercado es menos líquido que Buenos Aires, pero el potencial de valorización y los rendimientos por alquiler temporario compensan ese factor para quienes tienen horizonte adecuado.</p>
    `,
  },
  {
    id: 6,
    title: "Estrategias para maximizar tu inversión inmobiliaria",
    excerpt: "Cómo sacarle el mayor provecho a tu capital.",
    category: "Inversiones",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c7d910?w=1200&q=80",
    date: "20 Feb 2026",
    readTime: "5 min",
    author: "Milton Catalan",
    content: `
      <p class="mb-6">No alcanza con comprar una propiedad para que la inversión funcione. La diferencia entre un resultado promedio y uno sobresaliente está en la estrategia. Estas son las que aplican los inversores con mejor desempeño en el mercado inmobiliario patagónico.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">1. Comprá con potencial, no solo con valor presente</h2>
      <p class="mb-6">Las propiedades que necesitan mejoras menores —pintura, equipamiento, jardín— suelen cotizar por debajo del mercado. El costo de esas mejoras es predecible; la diferencia de precio de compra puede ser significativa. Es una de las formas más directas de generar valor desde el primer día.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">2. Alquiler temporario vs. permanente: conocé los números reales</h2>
      <p class="mb-6">El alquiler temporario puede generar entre 40% y 60% más ingresos que el tradicional en zonas turísticas como San Martín de los Andes. Sin embargo, implica mayor gestión operativa, más desgaste de la propiedad y resultados estacionales. Evaluá si tenés capacidad de gestión o si trabajarás con un operador.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">3. Diversificá por zona y tipo de activo</h2>
      <p class="mb-6">Concentrar todo en un solo tipo de propiedad o zona amplifica el riesgo. Combinar un departamento urbano con una cabaña en área turística, por ejemplo, da flujos de caja complementarios: el primero es más estable durante el invierno, el segundo rinde más en temporada alta.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">4. Pensá en la liquidez desde el principio</h2>
      <p class="mb-6">Antes de comprar, preguntate cuánto tardarías en vender esa propiedad si necesitaras hacerlo. Las propiedades más líquidas son las más demandadas: buena ubicación, tamaño estándar, precio de mercado. Una propiedad muy específica puede tardar meses en encontrar comprador.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">5. Trabajá con asesoramiento local</h2>
      <p class="mb-6">El conocimiento del mercado local es una ventaja que no se compra en internet. Un asesor con presencia real en la zona conoce qué propiedades tienen historial de conflictos, qué barrios están creciendo y cuáles estancándose, y cuáles son los precios reales de cierre —no los de publicación.</p>
    `,
  },
  {
    id: 7,
    title: "Sectores emergentes en la Patagonia que debés conocer",
    excerpt: "Nuevas zonas de inversión en auge.",
    category: "Tendencias",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    date: "18 Feb 2026",
    readTime: "4 min",
    author: "Catalan Propiedades",
    content: `
      <p class="mb-6">San Martín de los Andes concentra gran parte de la atención, pero la región tiene varios sectores que están ganando protagonismo con precios todavía accesibles y proyecciones positivas. Estos son los más relevantes para tener en el radar.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Chapelco y la zona de montaña</h2>
      <p class="mb-6">El entorno del centro de ski ofrece propiedades de alta gama con demanda constante de alquiler temporario en invierno. Las cabañas con vista a la montaña tienen tasas de ocupación elevadas durante la temporada y margen para valorización. El ticket de entrada es más alto, pero el perfil del inquilino también lo es.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Lago Lácar y costanera</h2>
      <p class="mb-6">Las propiedades con acceso o vista al lago concentran la demanda de quienes buscan calidad de vida por sobre el rendimiento puro. La escasez de frentes de lago hace que estos activos mantengan valor incluso en escenarios de mercado más moderados.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Villa Meliquina</h2>
      <p class="mb-6">A 60 km de San Martín, esta zona está en etapa temprana de desarrollo turístico. Los precios son significativamente menores, con terrenos y cabañas que todavía permiten una entrada accesible. Es una apuesta de mayor plazo, con perfil de riesgo más alto pero también mayor potencial de valorización.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Aluminé y Zapala</h2>
      <p class="mb-6">Zonas menos conocidas del interior neuquino que están captando el desborde de demanda de Bariloche y San Martín. Adecuadas para inversores con horizonte largo y disposición a esperar el ciclo completo de desarrollo.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Vale la pena salir del centro?</h2>
      <p class="mb-6">Depende del perfil. Si buscás estabilidad y retorno predecible, el centro de San Martín sigue siendo la opción más sólida. Si aceptás mayor incertidumbre a cambio de precio de entrada más bajo y potencial de revalorización superior, los sectores emergentes ofrecen una alternativa genuina.</p>
    `,
  },
  {
    id: 8,
    title: "Crédito hipotecario: Opciones disponibles en Argentina",
    excerpt: "Comparativa de opciones de financiamiento.",
    category: "Guía",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    date: "15 Feb 2026",
    readTime: "9 min",
    author: "Catalan Propiedades",
    content: `
      <p class="mb-6">El crédito hipotecario en Argentina tiene una historia compleja, pero en 2026 el mercado ofrece más alternativas que en años anteriores. Si estás pensando en financiar la compra de una propiedad, estas son las opciones que tenés disponibles y lo que implica cada una.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Créditos UVA (Unidad de Valor Adquisitivo)</h2>
      <p class="mb-6">Los créditos UVA ajustan el capital por inflación. Esto significa que la cuota inicial puede ser más baja, pero el saldo de deuda crece con la inflación. En un escenario de baja inflación, son convenientes; en alta inflación, el saldo puede aumentar más rápido de lo esperado. Banco Nación, Banco Provincia y varios privados los ofrecen.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Créditos a tasa fija en pesos</h2>
      <p class="mb-6">Menos frecuentes, ofrecen previsibilidad en la cuota. La tasa nominal anual suele ser más alta, pero eliminan el riesgo de ajuste por inflación. Adecuados para quienes tienen ingresos en pesos y buscan certeza en el pago mensual.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Bancos privados: HSBC, Santander, Macro</h2>
      <p class="mb-6">Los bancos privados ofrecen condiciones más competitivas para perfiles con buenos ingresos demostrables y score crediticio sólido. Suelen financiar hasta el 75-80% del valor de tasación, con plazos de hasta 20-30 años según el banco.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Requisitos típicos para calificar</h2>
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Antigüedad laboral mínima de 2 años (relación de dependencia o monotributo estable)</li>
        <li>Ingresos demostrables: recibos de sueldo, declaración de ganancias o facturación</li>
        <li>Sin antecedentes financieros negativos (veraz limpio)</li>
        <li>Ahorro previo para la inicial: generalmente entre 20% y 30% del valor</li>
        <li>Relación cuota-ingreso: la cuota no debe superar el 25-35% del ingreso neto</li>
      </ul>
      <h2 class="text-2xl font-semibold mt-8 mb-4">¿Vale la pena endeudarse para comprar?</h2>
      <p class="mb-6">Depende del contexto. En un mercado con precios en dólares estables o crecientes y tasa de interés real razonable, el crédito puede ser una herramienta válida para adelantar la compra. La clave está en que la cuota sea sostenible en el tiempo sin comprometer la capacidad de ahorro.</p>
      <p class="mb-6">Si comprás en San Martín de los Andes como inversión y no como residencia propia, evaluá si el rendimiento por alquiler cubre la cuota. En muchos casos, con buena gestión de alquiler temporario, el ingreso de la propiedad puede cubrir una parte significativa del crédito.</p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">Recomendación final</h2>
      <p class="mb-6">Antes de tomar un crédito, simulá distintos escenarios de inflación y revisá el impacto en tu cuota a 5 y 10 años. Un asesor financiero o inmobiliario con experiencia en la zona puede ayudarte a estructurar la operación de forma inteligente.</p>
    `,
  },
];

export default function BlogPostClient({ id }) {
  const article = articles.find((a) => a.id === parseInt(id));
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Artículo no encontrado</h1>
          <Link href="/blog" className="text-rose-500 hover:underline">Volver al blog</Link>
        </div>
      </div>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3)
    .concat(
      articles.filter((a) => a.id !== article.id && a.category !== article.category).slice(0, Math.max(0, 3 - articles.filter((a) => a.id !== article.id && a.category === article.category).length))
    )
    .slice(0, 3);

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = encodeURIComponent(article.title);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-white font-dm">
      <div className="fixed top-20 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-rose-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gray-800">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto w-full">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              ← Volver al blog
            </Link>
            <span className="inline-block px-3 py-1 bg-rose-600 text-white text-sm font-medium rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold text-white font-jakarta leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-rose-600 font-semibold text-lg">
                {article.author.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{article.author}</p>
              <p className="text-sm text-gray-500">{article.date} · {article.readTime} de lectura</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Compartir:</span>
            <button
              onClick={() => handleShare("facebook")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Compartir en Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Compartir en Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Compartir por WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 font-jakarta">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.id}`}
                  className="group"
                >
                  <div className="relative h-40 overflow-hidden rounded-xl mb-4 bg-gray-200">
                    <ImageWithSkeleton
                      src={related.image}
                      alt={related.title}
                      className="rounded-xl"
                      aspectRatio="aspect-[4/3]"
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 bg-white/95 rounded-full text-xs font-medium">
                      {related.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{related.readTime} de lectura</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border-t border-gray-200 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">¿Querés saber más sobre inversiones?</h2>
          <p className="text-gray-500 mb-6">Nuestro equipo está disponible para ayudarte a encontrar la mejor opción.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contacto"
              className="px-6 py-3 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-500 transition-colors"
            >
              Contactanos
            </Link>
            <Link
              href="/inversiones"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              Ver inversiones
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
