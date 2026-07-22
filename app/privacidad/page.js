import Link from "next/link";
import { canonicalUrl, CONTACT_EMAIL } from "@/config";

export const metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo Catalán Propiedades recopila, usa y protege tus datos personales, incluido el uso de Google Analytics y cookies.",
  alternates: {
    canonical: canonicalUrl("/privacidad"),
  },
  robots: {
    index: true,
    follow: false,
  },
};

const sections = [
  {
    id: "responsable",
    title: "Responsable de tus datos",
    content: `El responsable del tratamiento de los datos recopilados en este sitio es Catalan Propiedades, con domicilio en San Martín de los Andes, Neuquén, Argentina.

Para cualquier consulta sobre esta política o sobre tus datos personales, podés escribirnos a ${CONTACT_EMAIL}.`,
  },
  {
    id: "que-datos",
    title: "Qué datos recopilamos",
    content: `Recopilamos dos tipos de información:

1. Datos que nos das vos mismo. Cuando completás un formulario de contacto, una consulta sobre una propiedad, un pedido de tasación o te suscribís a nuestras novedades, nos proporcionás datos como tu nombre, correo electrónico, teléfono y el mensaje o preferencias que decidas incluir.

2. Datos de navegación (automáticos). Cuando visitás el sitio, se registran de forma automática y agregada datos como las páginas que ves, el tipo de dispositivo (celular, computadora o tablet), el navegador, la ubicación aproximada (ciudad o región) y la forma en que llegaste al sitio (buscador, redes sociales, enlace directo). Estos datos son estadísticos y no te identifican por nombre.`,
  },
  {
    id: "analytics-cookies",
    title: "Google Analytics y cookies",
    content: `Este sitio utiliza Google Analytics 4, un servicio de análisis web de Google LLC, para entender de forma agregada cómo se usa el sitio: qué propiedades y artículos se ven más, de dónde llegan los visitantes y qué dispositivos usan. Esto nos ayuda a mejorar el contenido y el servicio.

Para hacerlo, Google Analytics utiliza cookies: pequeños archivos que se guardan en tu navegador. Las cookies de Google Analytics se usan exclusivamente con fines estadísticos; no las usamos para identificarte personalmente ni para publicidad.

Cómo evitar la medición:
- Podés rechazar o eliminar las cookies desde la configuración de tu navegador.
- Podés instalar el complemento oficial de inhabilitación de Google Analytics: https://tools.google.com/dlpage/gaoptout

Para más información sobre cómo Google trata los datos, consultá la política de privacidad de Google en https://policies.google.com/privacy.`,
  },
  {
    id: "finalidad",
    title: "Para qué usamos tus datos",
    content: `Usamos la información recopilada únicamente para:

- Responder tus consultas y pedidos de tasación.
- Brindarte asesoramiento inmobiliario y mostrarte propiedades que puedan interesarte.
- Enviarte novedades, si te suscribiste voluntariamente.
- Analizar de forma estadística el uso del sitio para mejorarlo.

No tomamos decisiones automatizadas que produzcan efectos jurídicos sobre vos.`,
  },
  {
    id: "comparticion",
    title: "Con quién compartimos tus datos",
    content: `No vendemos ni alquilamos tus datos personales a terceros.

Compartimos información solamente en estos casos:
- Con Google, como proveedor de Google Analytics, en la medida descrita más arriba y de forma agregada.
- Cuando una ley o una autoridad competente nos lo requiera.

No transferimos tus datos a terceros con fines comerciales ajenos a la prestación de nuestros servicios.`,
  },
  {
    id: "derechos",
    title: "Tus derechos",
    content: `De acuerdo con la Ley N.º 25.326 de Protección de Datos Personales de Argentina, tenés derecho a acceder a tus datos personales, a rectificarlos cuando sean inexactos y a solicitar su actualización o supresión.

Para ejercer estos derechos, escribinos a ${CONTACT_EMAIL}. Responderemos tu solicitud en los plazos que establece la normativa vigente.

La Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley N.º 25.326, atiende las denuncias y reclamos de quienes vean afectados sus derechos.`,
  },
  {
    id: "seguridad",
    title: "Seguridad y conservación",
    content: `Adoptamos medidas razonables para proteger tus datos frente a accesos no autorizados, pérdida o alteración.

Conservamos tus datos únicamente durante el tiempo necesario para cumplir con las finalidades descritas en esta política, o el que exija la legislación aplicable. Una vez cumplida esa finalidad, los eliminamos o anonimizamos.`,
  },
  {
    id: "menores",
    title: "Menores de edad",
    content: `Este sitio está dirigido a personas mayores de edad. No recopilamos de forma consciente datos personales de menores. Si creés que un menor nos proporcionó datos, escribinos a ${CONTACT_EMAIL} para que los eliminemos.`,
  },
  {
    id: "cambios",
    title: "Cambios en esta política",
    content: `Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o en la legislación. Publicaremos la versión vigente en esta misma página, indicando la fecha de la última actualización.

El uso continuado del sitio tras la publicación de cambios implica la aceptación de la política actualizada.`,
  },
  {
    id: "contacto",
    title: "Contacto",
    content: `Para consultas sobre esta Política de Privacidad o sobre el tratamiento de tus datos:

Email: ${CONTACT_EMAIL}
Dirección: San Martín de los Andes, Neuquén, Argentina

Responderemos dentro de las 48 horas hábiles.`,
  },
];

const gridStyle = {
  backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white font-dm">
      <section className="relative overflow-hidden pt-24 pb-14 bg-[#0A0F1C]" style={gridStyle}>
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-white" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-rose-400 text-xs font-semibold tracking-widest uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-jakarta">
            Política de Privacidad
          </h1>
          <p className="text-gray-400 text-base">
            Última actualización: 23 de junio de 2026
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 font-jakarta">Resumen</h2>
            <p className="text-gray-600">
              Esta política explica qué datos recopilamos, cómo los usamos —incluido
              Google Analytics y las cookies— y qué derechos tenés sobre ellos. No
              vendemos tus datos ni los usamos para identificarte con fines publicitarios.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-12 sticky top-20 bg-white py-4 z-10 border-b border-gray-100">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>

          {sections.map((section) => (
            <div key={section.id} id={section.id} className="mb-12 scroll-mt-32">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-jakarta">
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-12 mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-jakarta">
            ¿Necesitás ayuda?
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/terminos"
              className="px-5 py-2.5 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-500 transition-colors"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/contacto"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <span>© 2026 Catalan Propiedades. Todos los derechos reservados.</span>
            <div className="flex gap-6">
              <Link href="/terminos" className="hover:text-gray-900 transition-colors">Términos</Link>
              <Link href="/contacto" className="hover:text-gray-900 transition-colors">Contacto</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
