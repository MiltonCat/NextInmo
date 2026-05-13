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
    descripcion: "Te acompañamos en la visita presencial o virtual. Evaluamos el inmueble con criterio técnico: estado, ubicación, potencial de valorización.",
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
      <div className="text-center mb-12">
        <p className="text-rose-500 text-sm font-semibold tracking-widest uppercase mb-2">Cómo trabajamos</p>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Proceso de asesoría</h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          Cuatro pasos claros desde el primer contacto hasta que tu capital empieza a trabajar.
        </p>
      </div>

      <div className="relative">
        <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.numero} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 w-20 h-20 rounded-full bg-white border-2 border-rose-500 flex flex-col items-center justify-center mb-5 shadow-sm">
                <span className="text-rose-500">{step.icono}</span>
                <span className="text-[10px] font-bold text-gray-400 mt-0.5">{step.numero}</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-base mb-2">{step.titulo}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.descripcion}</p>
              {index < STEPS.length - 1 && (
                <div className="md:hidden mt-6 text-gray-300">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <a
          href="/contacto"
          className="inline-block bg-rose-600 hover:bg-rose-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm shadow"
        >
          Empezar con la consulta inicial
        </a>
      </div>
    </section>
  );
}
