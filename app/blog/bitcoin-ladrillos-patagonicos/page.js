import { SITE_URL, canonicalUrl } from "@/config";
import Link from "next/link";
import PodcastPlayer from "@/components/PodcastPlayer";

export const metadata = {
  title: "El Bitcoin de los Ladrillos Patagónicos: Inversión Inmobiliaria en San Martín de los Andes",
  description: "Descubrí por qué invertir en propiedades en San Martín de los Andes es como comprar Bitcoin en 2013. Análisis de tokenización inmobiliaria, ROI proyectado y oportunidades de inversión en la Patagonia.",
  keywords: "invertir san martin andes, inversion inmobiliaria patagonia, propiedades san martin andes, roi inmobiliario, tokenizacion inmobiliaria",
  openGraph: {
    title: "El Bitcoin de los Ladrillos Patagónicos",
    description: "¿Por qué invertir en San Martín de los Andes es como comprar Bitcoin en sus inicios?",
    url: canonicalUrl("/blog/bitcoin-ladrillos-patagonicos"),
    type: "article",
    publishedTime: "2026-05-26T00:00:00Z",
    authors: ["Milton Catalán"],
    images: [
      {
        url: `${SITE_URL}/fintech.jpeg`,
        width: 1200,
        height: 630,
        alt: "Inversión inmobiliaria en San Martín de los Andes — Catalán Propiedades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Bitcoin de los Ladrillos Patagónicos",
    description: "¿Por qué invertir en San Martín de los Andes es como comprar Bitcoin en sus inicios?",
    images: [`${SITE_URL}/fintech.jpeg`],
  },
  alternates: {
    canonical: canonicalUrl("/blog/bitcoin-ladrillos-patagonicos"),
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "El Bitcoin de los Ladrillos Patagónicos: Inversión Inmobiliaria en San Martín de los Andes",
  description: "Descubrí por qué invertir en propiedades en San Martín de los Andes es como comprar Bitcoin en 2013. Análisis de tokenización inmobiliaria, ROI proyectado y oportunidades de inversión en la Patagonia.",
  image: `${SITE_URL}/fintech.jpeg`,
  datePublished: "2026-05-26",
  dateModified: "2026-05-26",
  author: {
    "@type": "Person",
    name: "Milton Catalán",
    url: canonicalUrl("/nosotros"),
  },
  publisher: {
    "@type": "Organization",
    name: "Catalán Propiedades",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logoMC.webp`,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": canonicalUrl("/blog/bitcoin-ladrillos-patagonicos"),
  },
  // Versión escuchada del artículo (ver components/PodcastPlayer).
  audio: {
    "@type": "AudioObject",
    name: "El Bitcoin de los Ladrillos Patagónicos — versión en audio",
    contentUrl: `${SITE_URL}/podcast/bitcoin-ladrillos-patagonicos.mp3`,
    encodingFormat: "audio/mpeg",
    duration: "PT21M39S",
    inLanguage: "es-AR",
  },
};

export default function BitcoinLadrillosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
    <article className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <header className="mb-8 sm:mb-12">
        <p className="text-rose-600 text-sm font-bold tracking-widest uppercase mb-3">
          Inversión Inmobiliaria
        </p>
        <h1 className="max-w-3xl text-[2rem] sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.08] mb-4">
          El Bitcoin de los Ladrillos Patagónicos
        </h1>
        <p className="text-base sm:text-xl text-gray-600 leading-relaxed mb-6">
          ¿Por qué invertir en propiedades en San Martín de los Andes es como comprar Bitcoin en 2013? 
          Descubrí la tokenización del mercado inmobiliario patagónico.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <time dateTime="2026-05-24">Mayo 2026</time>
          <span>·</span>
          <span>8 min de lectura</span>
        </div>

        {/* Autor */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <img
            src="/Milton.webp"
            alt="Milton Catalán"
            className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
          />
          <div>
            <p className="text-sm font-bold text-gray-900">Escrito por Milton Catalán</p>
            <p className="text-xs text-gray-600">Asesor inmobiliario con +10 años de experiencia en San Martín de los Andes</p>
          </div>
        </div>
      </header>

      {/* Versión escuchada — no se muestra si el post no tiene audio registrado */}
      <PodcastPlayer slug="bitcoin-ladrillos-patagonicos" />

      {/* Contenido */}
      <div className="prose prose-lg max-w-none">
        
        {/* Introducción */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed text-gray-700">
            Si te perdiste el boom de Bitcoin en 2013, esta podría ser tu segunda oportunidad. 
            Pero en lugar de criptomonedas, hablamos de metros cuadrados en uno de los destinos más codiciados de la Patagonia: 
            <strong> San Martín de los Andes</strong>.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            ¿Suena exagerado? Déjame explicarte por qué el mercado inmobiliario en esta zona está siguiendo 
            un patrón de crecimiento sorprendentemente similar al de los activos digitales más exitosos de la última década.
          </p>
        </section>

        {/* Tokenización Inmobiliaria */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            La Tokenización del Mercado Inmobiliario
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Imaginate que podés comprar una propiedad como si compraras acciones de una empresa. 
            En el caso de una propiedad de 94 m² en San Martín de los Andes, cada 0,1 m² funciona como un “token”
            que podés adquirir a <strong>USD 165</strong> (Q1 2026, con la obra al 65% de ejecución).
          </p>
          
          <div className="bg-rose-50 border-l-4 border-rose-600 p-6 my-8">
            <p className="text-rose-900 font-semibold mb-2">💡 Concepto Clave</p>
            <p className="text-rose-800">
              <strong>Market Cap de la Propiedad:</strong> 94 m² × 10 tokens/m² × USD 165/token = <strong>USD 155.000</strong>
            </p>
            <p className="text-rose-700 text-sm mt-2">
              Este valor refleja el precio en “preventa” antes de la entrega final de la obra.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            El Descuento por “Riesgo de Ejecución”
          </h3>
          <p className="text-lg leading-relaxed text-gray-700">
            ¿Por qué USD 165 y no más? Simple: estás asumiendo el <strong>riesgo de construcción</strong>. 
            La obra está al 65%, y aunque el proyecto avanza según lo planificado, existe la incertidumbre natural 
            de cualquier desarrollo inmobiliario. Este “descuento por riesgo” es lo que genera la oportunidad de inversión.
          </p>
        </section>

        {/* El Salto Cuántico */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            El “Mainnet Launch”: De USD 165 a USD 235
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Aquí es donde la analogía con crypto cobra sentido. Cuando un proyecto blockchain pasa de testnet a mainnet, 
            su valor se dispara. Lo mismo sucede en real estate cuando una obra pasa del 65% al 100%.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Q1 2026 (Obra al 65%)</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">USD 165</p>
              <p className="text-sm text-gray-600">Precio por 0,1 m²</p>
              <p className="text-sm text-rose-600 font-semibold mt-2">Riesgo de construcción activo</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-600 uppercase tracking-wide mb-2">Q4 2026 (Obra al 100%)</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">USD 235</p>
              <p className="text-sm text-gray-600">Precio por 0,1 m²</p>
              <p className="text-sm text-green-700 font-semibold mt-2">+42% de apreciación</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            Este salto de <strong>USD 155.000 a USD 220.000</strong> en el valor total de la propiedad no es especulación: 
            es el resultado de eliminar el riesgo de construcción y habilitar la <strong>entrega inmediata</strong> del activo.
          </p>
        </section>

        {/* Roadmap 2026-2031 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            El Roadmap de 5 Años: De USD 165 a USD 330
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            Todo proyecto crypto tiene un roadmap. El mercado inmobiliario patagónico también, 
            basado en dos pilares fundamentales: <strong>escasez de tierra con servicios</strong> y 
            <strong>crecimiento sostenido del turismo</strong>.
          </p>

          <div className="bg-gray-900 text-white rounded-2xl p-8 my-8">
            <h3 className="text-2xl font-bold mb-6">Proyección de Valor del Token (0,1 m²)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-gray-300">Q1 2026 (Punto de entrada)</span>
                <span className="text-2xl font-bold text-rose-400">USD 165</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-gray-300">Q4 2026 (Entrega)</span>
                <span className="text-2xl font-bold text-green-400">USD 235</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-gray-300">2028 (Staking activo)</span>
                <span className="text-2xl font-bold text-blue-400">USD 280</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">2031 (Ecosistema maduro)</span>
                <span className="text-2xl font-bold text-purple-400">USD 330</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              * Proyección basada en plusvalía histórica del 8-12% anual en San Martín de los Andes
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            <strong>La matemática es simple:</strong> Invertir a USD 165 significa comprar a exactamente 
            la mitad del valor proyectado para 2031. Es el equivalente a haber comprado Bitcoin a USD 20.000 
            cuando hoy vale USD 40.000.
          </p>
        </section>

        {/* Staking Inmobiliario */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            “Staking” de Ladrillos: Generando Renta Pasiva
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            En crypto, haces staking de tus tokens para generar rendimientos. En San Martín de los Andes, 
            hacés “staking” de tus metros cuadrados alquilándolos para turismo.
          </p>

          <div className="bg-blue-50 rounded-xl p-6 my-8 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Ejemplo de Staking Inmobiliario</h3>
            <div className="space-y-3 text-blue-900">
              <div className="flex justify-between">
                <span>Inversión inicial (94 m²):</span>
                <span className="font-bold">USD 155.000</span>
              </div>
              <div className="flex justify-between">
                <span>Ingreso por alquiler mensual:</span>
                <span className="font-bold">USD 2.000 - 2.500</span>
              </div>
              <div className="flex justify-between">
                <span>ROI anual (solo rentas):</span>
                <span className="font-bold text-green-700">~15-18%</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-blue-300">
                <span className="font-semibold">ROI total (renta + plusvalía):</span>
                <span className="font-bold text-green-700 text-lg">~25-30%</span>
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            A diferencia del staking crypto (que puede ser volátil), el staking inmobiliario en zonas turísticas 
            consolidadas como San Martín de los Andes ofrece <strong>flujos de caja predecibles</strong> 
            especialmente durante la temporada alta (junio-agosto, diciembre-febrero).
          </p>
        </section>

        {/* Respaldo Físico */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            El “Protocolo Físico”: Tierra que No Se Puede Imprimir
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Bitcoin tiene un supply máximo de 21 millones de monedas. San Martín de los Andes tiene algo mejor: 
            <strong>tierra limitada con vista al Lago Lácar</strong>.
          </p>

          <ul className="space-y-3 my-6">
            <li className="flex items-start gap-3">
              <span className="text-rose-600 font-bold">✓</span>
              <span className="text-gray-700">
                <strong>Escasez geográfica:</strong> No podés “mintear” más terrenos frente al lago
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-600 font-bold">✓</span>
              <span className="text-gray-700">
                <strong>Respaldo físico tangible:</strong> A diferencia de activos digitales, tocás y vivís el activo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-600 font-bold">✓</span>
              <span className="text-gray-700">
                <strong>Hedge contra inflación argentina:</strong> Históricamente, el real estate en USD mantiene su valor
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-rose-600 font-bold">✓</span>
              <span className="text-gray-700">
                <strong>Costo de reposición creciente:</strong> Materiales y mano de obra en la Patagonia suben constantemente
              </span>
            </li>
          </ul>

          <p className="text-lg leading-relaxed text-gray-700">
            Este “piso” de valor basado en costos de reposición actúa como un <strong>soporte técnico natural</strong>
            que históricamente ha demostrado recuperación incluso durante crisis económicas argentinas.
          </p>
        </section>

        {/* Riesgos */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Los “Bear Markets” del Ladrillo Patagónico
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Como toda inversión, existen riesgos que debés considerar:
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-8">
            <p className="text-yellow-900 font-semibold mb-4">⚠️ Riesgos a Considerar</p>
            <ul className="space-y-2 text-yellow-800">
              <li><strong>Incremento de costos de construcción:</strong> Materiales importados + inflación</li>
              <li><strong>Demora en obra:</strong> Clima patagónico puede afectar cronogramas</li>
              <li><strong>Liquidez limitada:</strong> Vender una propiedad toma más tiempo que vender crypto</li>
              <li><strong>Regulaciones cambiantes:</strong> Impuestos, restricciones de alquileres turísticos</li>
              <li><strong>Dependencia del turismo:</strong> Crisis globales pueden afectar demanda temporalmente</li>
            </ul>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">
            <strong>Sin embargo,</strong> a diferencia de crypto (que puede caer 80% en un bear market), 
            el real estate en zonas premium tiende a corregir moderadamente (10-20%) y recuperarse 
            más rápido gracias a su utilidad práctica y escasez física.
          </p>
        </section>

        {/* Conclusión */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            ¿Es Esta tu Ventana de Oportunidad?
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Los <strong>USD 165 del Q1 2026</strong> representan lo que en crypto llamaríamos 
            “comprar en la fase de construcción del protocolo”. Es el momento donde:
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200">
              <p className="text-4xl font-bold text-rose-600 mb-2">42%</p>
              <p className="text-sm text-gray-700">Apreciación al completarse la obra (Q4 2026)</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
              <p className="text-sm text-gray-700">Retorno proyectado en 5 años (capital + rentas)</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <p className="text-4xl font-bold text-blue-600 mb-2">15-18%</p>
              <p className="text-sm text-gray-700">ROI anual solo por alquileres turísticos</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-gray-700 mb-6">
            A diferencia de apostar por la próxima memecoin, estás invirtiendo en un activo con:
          </p>
          <ul className="space-y-2 mb-6 text-gray-700">
            <li>✓ Respaldo físico tangible</li>
            <li>✓ Flujo de caja predecible (staking)</li>
            <li>✓ Escasez geográfica real (no digital)</li>
            <li>✓ Historial de plusvalía de 40+ años en la zona</li>
          </ul>

          <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl p-8 my-12 text-center">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para Tokenizar tu Futuro en la Patagonia?
            </h3>
            <p className="text-rose-100 mb-6">
              Explorá propiedades disponibles en San Martín de los Andes y empezá a construir 
              tu portfolio inmobiliario con la misma visión estratégica que usarías en crypto.
            </p>
            <Link
              href="/propiedades"
              className="inline-block bg-white text-rose-600 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition-colors shadow-lg"
            >
              Ver Propiedades Disponibles →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Realmente puedo “tokenizar” una propiedad física?
              </h3>
              <p className="text-gray-700">
                La “tokenización” que mencionamos es una analogía didáctica. En la práctica, comprás metros cuadrados reales
                mediante escritura tradicional. No hay blockchain involucrado, pero el concepto de fraccionar el activo 
                y proyectar su valorización funciona de manera similar.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cuál es el monto mínimo de inversión?
              </h3>
              <p className="text-gray-700">
                Depende del tipo de propiedad. Desde monoambientes de USD 85.000 hasta casas de USD 790.000. 
                También existen opciones de financiación directa con desarrolladores en algunos proyectos.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cómo funciona el “staking” (alquiler turístico)?
              </h3>
              <p className="text-gray-700">
                Podés gestionar el alquiler vos mismo o contratar una administradora local. Las temporadas altas 
                (invierno para ski, verano para lago) generan los mayores ingresos. El ROI anual típico es 15-18% 
                sobre el valor de compra.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Qué pasa si necesito liquidez rápida?
              </h3>
              <p className="text-gray-700">
                El real estate es menos líquido que crypto. Vender puede tomar 3-6 meses. Sin embargo, 
                propiedades bien ubicadas en San Martín de los Andes tienen demanda constante, especialmente 
                en épocas de incertidumbre económica argentina.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mt-12">
          <p className="font-semibold text-gray-800 mb-2">Disclaimer Legal</p>
          <p>
            Este artículo utiliza analogías con criptomonedas con fines didácticos. No constituye asesoramiento 
            financiero ni recomendación de inversión. Los valores mencionados son proyecciones basadas en tendencias 
            históricas del mercado inmobiliario de San Martín de los Andes y pueden variar. Consultá con un asesor 
            inmobiliario profesional antes de tomar decisiones de inversión.
          </p>
        </div>

        {/* Posts relacionados */}
        <section className="not-prose border-t border-gray-100 pt-10 mt-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">También te puede interesar</p>
          <div className="space-y-3">
            <a href="/blog/cuanto-cuesta-una-casa-en-san-martin-de-los-andes" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/cartel-san-martin-de-los-andes.webp" alt="Cuánto cuesta una casa en San Martín de los Andes" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Precios</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  ¿Cuánto cuesta una casa en San Martín de los Andes? (2026)
                </p>
              </div>
            </a>
            <a href="/blog/creditos-hipotecarios-uva-2026" className="flex items-center gap-4 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow group">
              <img src="/hipotecario.jpeg" alt="Créditos hipotecarios UVA" className="w-20 h-16 object-cover rounded-xl flex-shrink-0" loading="lazy" decoding="async" />
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-1">Guía de Compra</p>
                <p className="font-bold text-gray-900 text-sm group-hover:text-rose-600 transition-colors">
                  Créditos Hipotecarios UVA 2026: La Llave para tu Casa Propia en la Patagonia
                </p>
              </div>
            </a>
          </div>
        </section>

      </div>
    </article>
    </>
  );
}
