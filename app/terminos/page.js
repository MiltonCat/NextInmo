import Link from "next/link";

export const metadata = {
  title: "Términos de Servicio | Catalan Propiedades",
  description: "Términos y condiciones de uso del sitio web de Catalan Propiedades.",
};

const sections = [
  {
    id: "intro",
    title: "Introducción",
    content: `Bienvenido/a a Catalan Propiedades. Al acceder y utilizar nuestro sitio web, aceptás automáticamente los presentes Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, por favor no utilices nuestro sitio.`,
  },
  {
    id: "servicios",
    title: "Nuestros Servicios",
    content: `Catalan Propiedades es una plataforma inmobiliaria que conecta compradores, vendedores e inversores con propiedades en San Martín de los Andes y la Patagonia argentina.

Nuestros servicios incluyen:
- Búsqueda y publicación de propiedades en venta y alquiler
- Asesoramiento inmobiliario personalizado
- Gestión de inversiones inmobiliarias
- Conexión con profesionales del sector (abogados, notarios, arquitectos)`,
  },
  {
    id: "cuenta",
    title: "Cuenta de Usuario",
    content: `Para acceder a ciertas funciones del sitio, es posible que necesites crear una cuenta.

Al crear tu cuenta, aceptás:
- Proveer información verdadera, actualizada y completa
- Mantener la confidencialidad de tu contraseña
- Ser responsable de todas las actividades bajo tu cuenta
- Notificarnos inmediatamente ante cualquier uso no autorizado`,
  },
  {
    id: "propiedades",
    title: "Publicación de Propiedades",
    content: `Los usuarios pueden publicar propiedades en nuestro sitio bajo las siguientes condiciones:

- Toda la información proporcionada debe ser veraz y precisa
- Las imágenes deben ser propias o tener derecho de uso
- Está prohibido publicar propiedades que no correspondan a disponibilidad real
- El precio publicado debe ser el precio final de transacción
- Nos reservamos el derecho de eliminar publicaciones que incumplan estas normas`,
  },
  {
    id: "intelectual",
    title: "Propiedad Intelectual",
    content: `Todo el contenido del sitio web de Catalan Propiedades está protegido por derechos de autor:
- El diseño, logo y marca son propiedad de Catalan Propiedades
- Está prohibido copiar, modificar o distribuir contenido sin autorización
- Las fotografías publicadas son propiedad de sus respectivos autores`,
  },
  {
    id: "limitacion",
    title: "Limitación de Responsabilidad",
    content: `Catalan Propiedades actúa como intermediario entre partes. No garantizamos:

- La veracidad de toda la información publicada por terceros
- El resultado de transacciones entre usuarios
- La disponibilidad continua del sitio
- La ausencia de errores o virus

Nuestra responsabilidad está limitada al máximo permitido por la legislación vigente.`,
  },
  {
    id: "privacidad",
    title: "Privacidad",
    content: `Tu privacidad es importante para nosotros. Nuestro manejo de datos se detalla en la Política de Privacidad, que forma parte de estos términos.

Al usar nuestro sitio, aceptás el tratamiento de tus datos según lo descrito.`,
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al ser publicados en el sitio.

Es tu responsabilidad revisar periódicamente estos términos. El uso continuado del sitio constituye aceptación de las modificaciones.`,
  },
  {
    id: "contacto",
    title: "Contacto",
    content: `Para consultas sobre estos términos:

Email: info@catalanpropiedades.com
Teléfono: +54 9 2972 XXXXXX
Dirección: San Martín de los Andes, Neuquén, Argentina

Responderemos dentro de las 48 horas hábiles.`,
  },
];

const gridStyle = {
  backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
};

export default function TerminosPage() {
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
            Términos de Servicio
          </h1>
          <p className="text-gray-400 text-base">
            Última actualización: 21 de abril de 2026
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 font-jakarta">Resumen</h2>
            <p className="text-gray-600">
              Estos Términos de Servicio rigen el uso de nuestro sitio web y servicios.
              Al acceder o utilizar Catalan Propiedades, aceptás estos términos en su totalidad.
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
              href="/centro-ayuda"
              className="px-5 py-2.5 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-500 transition-colors"
            >
              Centro de Ayuda
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
              <Link href="/centro-ayuda" className="hover:text-gray-900 transition-colors">Ayuda</Link>
              <Link href="/contacto" className="hover:text-gray-900 transition-colors">Contacto</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
