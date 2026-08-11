import Image from "next/image";

const STEPS = [
  {
    numero: "01",
    titulo: "Consulta inicial",
    descripcion: "Nos contás tu objetivo, capital disponible y plazo. Sin compromisos. Podés hacerlo por WhatsApp, email o videollamada.",
    icono: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    numero: "02",
    titulo: "Análisis personalizado",
    descripcion: "Filtramos oportunidades del mercado según tu perfil. Te presentamos opciones con datos de rentabilidad, zona y proyección real.",
    icono: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    numero: "03",
    titulo: "Visita y evaluación",
    descripcion: "Te acompañamos en la visita presencial o virtual. Evaluamos el inmueble con criterio técnico: estado, ubicación y potencial de valorización.",
    icono: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    numero: "04",
    titulo: "Cierre y seguimiento",
    descripcion: "Gestionamos el proceso de compra y, si lo necesitás, el alquiler posterior. Tu inversión sigue activa con nuestro acompañamiento.",
    icono: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AdvisoryProcess() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Cómo trabajamos
        </div>
        <h2 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900 md:text-[34px]">
          Así te acompañamos
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-gray-600 md:text-base">
          Cuatro pasos claros desde el primer contacto hasta que tu capital empieza a trabajar.
        </p>
      </div>

      <div className="relative">
        <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-100" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.numero} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-5 flex h-20 w-20 flex-col items-center justify-center rounded-full border border-gray-200 bg-white">
                <span className="text-gray-900">{step.icono}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-gray-400">{step.numero}</span>
              </div>
              <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.01em] text-gray-900">{step.titulo}</h3>
              <p className="text-[15px] leading-relaxed text-gray-600">{step.descripcion}</p>
              {index < STEPS.length - 1 && (
                <div className="md:hidden mt-6 text-gray-700">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* La cara de quien atiende.

          Esta sección eran cuatro iconos SVG grises: describía un
          acompañamiento personal sin mostrar a ninguna persona. En una página
          donde alguien está por decidir dónde pone USD 150.000, lo primero que
          quiere saber es a quién le está preguntando.

          Va la foto de Milton y no una pareja de banco de imágenes a propósito.
          Todas las fotos con gente del sitio ya están usadas dos veces —las de
          /tasacion las repite /precio-m2—, pero además una foto real gana:
          quien mira esto puede buscar el nombre, el LinkedIn y la matrícula, y
          que todo dé. Un modelo de stock no resiste esa comprobación.

          Todo lo que se afirma acá está publicado en /nosotros y en la home:
          nombre, rol y los más de 10 años en el mercado de San Martín. Si algo
          de eso cambia, se cambia en los tres lados. */}
      <div className="mt-14 border-t border-gray-100 pt-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <Image
            src="/Milton.webp"
            alt="Milton Catalán, asesor inmobiliario en San Martín de los Andes"
            width={96}
            height={96}
            sizes="96px"
            className="h-24 w-24 flex-shrink-0 rounded-full border border-gray-200 object-cover object-top"
          />
          <div>
            <p className="text-[15px] leading-relaxed text-gray-600">
              “Los números de esta página te dan el orden de magnitud. La decisión
              concreta —qué comprar, en qué barrio y a qué precio— la charlamos.”
            </p>
            <p className="mt-3 text-[15px] font-semibold text-gray-900">Milton Catalán</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Estratega de activos inmobiliarios · Más de 10 años en San Martín de los Andes
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="/contacto"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Empezar con la consulta inicial
          </a>
        </div>
      </div>
    </section>
  );
}
