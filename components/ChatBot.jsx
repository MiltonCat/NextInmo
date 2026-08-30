"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { properties as fallbackProperties, getPropertySlug } from "@/data/properties";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAnalytics } from "@/hooks/useAnalytics";
import { contextualPageMessage, whatsappUrl } from "@/lib/whatsapp";
import { registrarConsulta } from "@/lib/registrarConsulta";

function filterProps(filters, list) {
  return list.filter((p) => {
    if (p.vendida) return false;
    if (filters.types?.length && !filters.types.some((t) => p.type.toLowerCase().includes(t.toLowerCase()))) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minBedrooms !== undefined && p.bedrooms < filters.minBedrooms) return false;
    if (filters.maxBedrooms !== undefined && p.bedrooms > filters.maxBedrooms) return false;
    return true;
  });
}

// Si lo ponés en false, las salidas a WhatsApp de visitantes que todavía no
// dejaron sus datos dejan de guardarse en el CRM (la analítica las sigue
// registrando igual).
const REGISTRAR_SALIDAS_WHATSAPP = true;

// Traduce los filtros de la búsqueda a texto legible. Lo usan el mensaje de
// WhatsApp y el detalle del lead, así siempre describen lo mismo.
function describeFilters(filters = {}) {
  return [
    filters.types?.length ? `Tipo: ${filters.types.join(", ")}` : "",
    filters.minPrice ? `Presupuesto mínimo: USD ${filters.minPrice.toLocaleString("es-AR")}` : "",
    filters.maxPrice ? `Presupuesto máximo: USD ${filters.maxPrice.toLocaleString("es-AR")}` : "",
    filters.minBedrooms !== undefined ? `Dormitorios desde: ${filters.minBedrooms}` : "",
    filters.maxBedrooms !== undefined ? `Dormitorios hasta: ${filters.maxBedrooms}` : "",
  ].filter(Boolean);
}

// ────────────────────────────────────────────────────────────────────────────
// Horario de atención
// ────────────────────────────────────────────────────────────────────────────
// Los tramos replican BUSINESS_HOURS de config.js ("Lun–Vie: 9:30 a 19:00 ·
// Sáb: 10:00 a 13:00"), en minutos desde la medianoche. Si el horario cambia
// allá, hay que moverlo también acá.
const TRAMOS_ATENCION = {
  Mon: [570, 1140],
  Tue: [570, 1140],
  Wed: [570, 1140],
  Thu: [570, 1140],
  Fri: [570, 1140],
  Sat: [600, 780],
};
const DIAS_ORDEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NOMBRE_DIA = {
  Sun: "domingo", Mon: "lunes", Tue: "martes", Wed: "miércoles",
  Thu: "jueves", Fri: "viernes", Sat: "sábado",
};

function comoHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}:${String(m).padStart(2, "0")}` : `${h}`;
}

// Resuelve si hay alguien del otro lado usando SIEMPRE la hora de Argentina y
// no la del dispositivo: buena parte de las consultas llegan de otro huso.
// Devuelve null si el navegador no sabe de husos horarios, y en ese caso el
// header no afirma nada en vez de mentir.
function estadoAtencion(ahora = new Date()) {
  let partes;
  try {
    partes = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .formatToParts(ahora)
        .map((p) => [p.type, p.value])
    );
  } catch {
    return null;
  }

  const dia = partes.weekday;
  const minutos = (Number(partes.hour) % 24) * 60 + Number(partes.minute);
  const tramo = TRAMOS_ATENCION[dia];

  if (tramo && minutos >= tramo[0] && minutos < tramo[1]) {
    return { abierto: true, cierra: comoHora(tramo[1]) };
  }

  // Próxima apertura: recorre como mucho una semana hacia adelante.
  const indiceHoy = DIAS_ORDEN.indexOf(dia);
  for (let salto = 0; salto < 8; salto++) {
    const nombre = DIAS_ORDEN[(indiceHoy + salto) % 7];
    const siguiente = TRAMOS_ATENCION[nombre];
    if (!siguiente) continue;
    if (salto === 0 && minutos >= siguiente[0]) continue; // hoy ya cerró
    const cuando = salto === 0 ? "hoy" : salto === 1 ? "mañana" : `el ${NOMBRE_DIA[nombre]}`;
    return { abierto: false, proximo: `${cuando} desde las ${comoHora(siguiente[0])}` };
  }
  return { abierto: false, proximo: "el lunes" };
}

// ────────────────────────────────────────────────────────────────────────────
// Saludo según la página
// ────────────────────────────────────────────────────────────────────────────
// Mismo criterio de rutas que contextualPageMessage() en lib/whatsapp.js: si
// allá se agrega una sección, conviene agregarla acá también. La última
// burbuja es siempre la pregunta, porque los botones cuelgan del último
// mensaje.
const SOY = "Hola, soy Lucía, la asistente de Catalán Propiedades.";

function contextualGreeting(pathname = "/") {
  const path = pathname || "/";
  const segmentos = path.split("/").filter(Boolean);

  if (path.startsWith("/blog/")) {
    return [SOY, "Si la nota te dejó con alguna duda, Milton te la contesta. ¿O preferís que busquemos una propiedad?"];
  }
  if (path.startsWith("/inversiones")) {
    return [SOY, "¿Estás mirando para invertir? Contame qué tenés en mente y vemos qué hay disponible."];
  }
  if (path.startsWith("/tasacion") || path.startsWith("/vender")) {
    return [SOY, "Si estás pensando en vender, Milton te da una asesoría sin cargo. ¿Querés que te ponga en contacto?"];
  }
  if (path.startsWith("/precio-m2")) {
    return [SOY, "¿Querés que veamos qué hay publicado en la zona que estabas mirando?"];
  }
  if (path.startsWith("/simulador-credito")) {
    return [SOY, "¿Vemos qué propiedades entran en el presupuesto que te da el crédito?"];
  }
  if (path.startsWith("/favoritos")) {
    return [SOY, "¿Querés que Milton te ayude a comparar las que guardaste?"];
  }
  if (path.startsWith("/desarrollos")) {
    return [SOY, "Los emprendimientos los comercializamos nosotros. ¿Te paso con Milton o preferís ver propiedades?"];
  }
  if (segmentos[0] === "propiedades" && segmentos.length > 1) {
    return [SOY, "¿Querés que busquemos otras parecidas a esta, o preferís hablar directo con Milton?"];
  }
  if (path.startsWith("/propiedades") || path.startsWith("/alquileres")) {
    return [SOY, "Te ayudo a filtrar entre todo lo que hay publicado. ¿Arrancamos?"];
  }
  if (path.startsWith("/centro-ayuda")) {
    return [SOY, "Si quedó algo sin responder ahí, lo vemos por acá. ¿Qué necesitás?"];
  }
  return [
    "¡Hola! Soy Lucía, la asistente de Catalán Propiedades.",
    "¿Te ayudo a encontrar tu propiedad en San Martín de los Andes?",
  ];
}

// Comenta el resultado según cuántas encontró, en vez del "¡Encontré N!" fijo.
function reaccionResultados(n) {
  if (n === 1) return "Tengo una sola que encaja con eso, y es bastante puntual:";
  if (n <= 3) return `Tengo ${n} que entran justo en lo que buscás:`;
  if (n <= 8) return `Encontré ${n} opciones. Te dejo las cuatro que mejor encajan:`;
  return `Hay ${n}, así que tenés de dónde elegir. Te dejo las primeras cuatro:`;
}

const STEPS = {
  welcome: {
    options: [
      { label: "🏠 Estoy buscando una propiedad", next: "ask_type" },
      { label: "📱 Quiero hablar con un asesor", next: "whatsapp" },
    ],
  },
  ask_type: {
    text: "¿Qué estás buscando?",
    options: [
      { label: "Una casa para vivir", filter: { types: ["Casa"] }, next: "ask_budget" },
      { label: "Un departamento o PH", filter: { types: ["Departamento", "PH", "Monoambiente"] }, next: "ask_budget" },
      { label: "Una cabaña", filter: { types: ["Cabaña", "Cabañas"] }, next: "ask_budget" },
      { label: "Un lote para construir", filter: { types: ["Lote"] }, next: "ask_budget" },
      { label: "Todavía no lo tengo claro", filter: {}, next: "ask_budget" },
    ],
  },
  ask_budget: {
    text: "¿Con qué presupuesto te estás manejando, en dólares?",
    options: [
      { label: "Hasta USD 100.000", filter: { maxPrice: 100000 }, next: "ask_bedrooms" },
      { label: "Entre 100 y 200 mil", filter: { minPrice: 100000, maxPrice: 200000 }, next: "ask_bedrooms" },
      { label: "Entre 200 y 400 mil", filter: { minPrice: 200000, maxPrice: 400000 }, next: "ask_bedrooms" },
      { label: "Más de USD 400.000", filter: { minPrice: 400000 }, next: "ask_bedrooms" },
      { label: "Prefiero no definirlo todavía", filter: {}, next: "ask_bedrooms" },
    ],
  },
  ask_bedrooms: {
    text: "¿Cuántos dormitorios necesitás?",
    options: [
      { label: "Con un monoambiente me alcanza", filter: { maxBedrooms: 0 }, next: "results" },
      { label: "Uno o dos", filter: { minBedrooms: 1, maxBedrooms: 2 }, next: "results" },
      { label: "Tres o más", filter: { minBedrooms: 3 }, next: "results" },
      { label: "Eso me da igual", filter: {}, next: "results" },
    ],
  },
  after_results: {
    text: "¿Seguimos?",
    options: [
      { label: "🔔 Avisame si entra algo así", next: "lead" },
      { label: "🔄 Buscar otra cosa", next: "ask_type" },
      { label: "📱 Prefiero hablar con Milton", next: "whatsapp" },
    ],
  },
  // Paso de captura: no tiene botones, renderiza el formulario de contacto.
  lead: { form: true },
  after_lead: {
    options: [
      { label: "🔄 Buscar otra cosa", next: "ask_type" },
      { label: "📱 Hablar con Milton", next: "whatsapp" },
    ],
  },
};

const AIRBNB = "#FF5A5F";

// Demoras cortas. La investigación dice que lo que sostiene la percepción es
// el indicador visible, no la espera: esperar de más se lee como lento, no
// como reflexivo. La única pausa larga es la del "no encontré nada".
const beat = (min = 400, max = 900) => Math.round(min + Math.random() * (max - min));

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [activeStep, setActiveStep] = useState("welcome");
  const [filters, setFilters] = useState({});
  const [lastSearchFilters, setLastSearchFilters] = useState({});
  // Arranca con el array estático de respaldo y se actualiza con datos frescos de la base.
  const [dataset, setDataset] = useState(fallbackProperties);
  const [leadSent, setLeadSent] = useState(false);
  const [atencion, setAtencion] = useState(null);
  const messagesEndRef = useRef(null);
  const pathname = usePathname();
  const { trackEvent, trackWhatsAppClick } = useAnalytics();

  // Una secuencia de burbujas puede quedar a mitad de camino cuando el
  // visitante reinicia o elige otra opción. flowRef marca cuál es la vigente y
  // las viejas se descartan sin llegar a escribir.
  const flowRef = useRef(0);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const wait = (ms) =>
    new Promise((resolve) => {
      timersRef.current.push(setTimeout(resolve, ms));
    });

  const cancelPending = () => {
    flowRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTyping(false);
  };

  // Publica una o varias burbujas del bot con los puntitos entre medio. El
  // stepKey (y por lo tanto los botones) se cuelga solo de la última.
  const sendBot = async (bubbles, stepKey) => {
    const flow = ++flowRef.current;
    setTyping(true);
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      await wait(bubble.delay ?? beat());
      if (flowRef.current !== flow) return;
      const ultima = i === bubbles.length - 1;
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: bubble.text, results: bubble.results, stepKey: ultima ? stepKey : undefined },
      ]);
      if (ultima) setTyping(false);
    }
  };

  const bubblesOf = (step) => {
    const text = step?.text;
    if (Array.isArray(text)) return text.map((t) => ({ text: t }));
    return [{ text }];
  };

  // Guarda en el CRM la salida a WhatsApp de alguien que todavía no dejó datos,
  // para no perder al que abre WhatsApp y después nunca escribe. Queda marcado
  // con sin_datos_de_contacto para poder separarlo de los leads reales.
  const registrarSalidaWhatsApp = (searchFilters, origen) => {
    if (!REGISTRAR_SALIDAS_WHATSAPP || leadSent) return;
    registrarConsulta({
      tipo: "contacto",
      nombre: "Visitante del chat",
      mensaje: "Abrió WhatsApp desde el asistente Lucía sin dejar sus datos.",
      detalle: {
        origen,
        sin_datos_de_contacto: true,
        filtros: searchFilters || {},
        busqueda: describeFilters(searchFilters),
      },
    });
  };

  const advisorMessage = (searchFilters = {}) => {
    const details = describeFilters(searchFilters);

    // Sin búsqueda hecha el mensaje lo arma el contexto de la página, igual que
    // hacía el botón flotante de WhatsApp que este chat reemplazó.
    if (!details.length) return whatsappUrl(contextualPageMessage(pathname));

    return whatsappUrl(
      `Hola Milton, usé el asistente de búsqueda de la web y quisiera que me ayudes a encontrar una propiedad.` +
      `\n\nMi búsqueda:\n${details.map((item) => `• ${item}`).join("\n")}`
    );
  };

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    supabase
      .from("properties")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data?.length) setDataset(data);
      });
  }, []);

  // El horario se calcula en el cliente (nunca en el HTML del servidor, que se
  // cachea) y se refresca cada vez que se abre el chat.
  useEffect(() => {
    setAtencion(estadoAtencion());
  }, [open]);

  const saludar = () => {
    cancelPending();
    const saludo = contextualGreeting(pathname);
    setActiveStep("welcome");
    sendBot(
      saludo.map((text, i) => ({ text, delay: i === 0 ? 350 : beat() })),
      "welcome"
    );
  };

  const abrirChat = () => {
    setOpen(true);
    if (messages.length === 0 && !typing) saludar();
  };

  const handleOption = (opt, currentFilters) => {
    cancelPending();
    setMessages((prev) => [...prev, { role: "user", text: opt.label }]);

    if (opt.next === "whatsapp") {
      const searchContext = Object.keys(currentFilters || {}).length ? currentFilters : lastSearchFilters;
      registrarSalidaWhatsApp(searchContext, "chatbot");
      trackWhatsAppClick(null, "chatbot");
      trackEvent("chatbot_whatsapp", { has_search_filters: Object.keys(searchContext).length > 0 });
      window.open(advisorMessage(searchContext), "_blank");
      setActiveStep("after_results");
      setFilters({});
      sendBot(
        [
          { text: "Te abrí WhatsApp con el resumen de tu búsqueda." },
          {
            text: atencion && !atencion.abierto
              ? `Ojo que ahora estamos fuera de horario, así que puede que Milton te conteste ${atencion.proximo}. Te responde él, no un automático.`
              : "Del otro lado te responde Milton, no un mensaje automático.",
          },
        ],
        "after_results"
      );
      return;
    }

    if (opt.next === "lead") {
      setActiveStep("lead");
      trackEvent("chatbot_lead_form", { has_search_filters: Object.keys(lastSearchFilters).length > 0 });
      sendBot(
        [
          { text: "Dale, te aviso apenas entre una que encaje con lo que buscás." },
          { text: "Necesito tu nombre y un WhatsApp donde ubicarte." },
        ],
        "lead"
      );
      return;
    }

    const merged = opt.filter ? { ...currentFilters, ...opt.filter } : currentFilters;

    if (opt.next === "results") {
      const found = filterProps(merged, dataset);
      setLastSearchFilters(merged);
      setActiveStep("after_results");
      setFilters({});

      if (found.length === 0) {
        trackEvent("chatbot_sin_resultados", { busqueda: describeFilters(merged).join(" · ") });
        // La única pausa larga del chat: cuando la noticia es mala, la demora
        // con lenguaje empático se recibe mejor que la respuesta instantánea.
        sendBot(
          [
            { text: "Uf. Con esos filtros exactos no tengo nada publicado en este momento.", delay: 1800 },
            { text: "Pero acá entran propiedades todas las semanas. Si querés, dejame tus datos y te aviso apenas aparezca algo así." },
          ],
          "after_results"
        );
        return;
      }

      sendBot(
        [{ text: reaccionResultados(found.length), results: found.slice(0, 4) }],
        "after_results"
      );
      return;
    }

    setActiveStep(opt.next);
    setFilters(merged);
    sendBot(bubblesOf(STEPS[opt.next]), opt.next);
  };

  // Envío optimista: registrarConsulta es fire-and-forget, igual que el resto
  // de los formularios del sitio.
  const handleLeadSubmit = ({ nombre, telefono }) => {
    cancelPending();
    registrarConsulta({
      tipo: "propiedad",
      nombre,
      telefono,
      mensaje: "Pidió que le avisemos cuando entre una propiedad como la que buscaba (asistente Lucía).",
      detalle: {
        origen: "chatbot",
        filtros: lastSearchFilters,
        busqueda: describeFilters(lastSearchFilters),
      },
    });
    trackEvent("chatbot_lead", { has_search_filters: Object.keys(lastSearchFilters).length > 0 });
    setLeadSent(true);
    setActiveStep("after_lead");
    setMessages((prev) => [...prev, { role: "user", text: `${nombre} · ${telefono}` }]);
    sendBot(
      [
        { text: `¡Listo, ${nombre.split(" ")[0]}! Ya quedaste anotado.` },
        { text: "Te escribo apenas entre algo que encaje. ¿Querés seguir mirando mientras tanto?" },
      ],
      "after_lead"
    );
  };

  // leadSent no se resetea a propósito: a quien ya dejó sus datos no se los
  // volvemos a pedir aunque reinicie el chat.
  const resetChat = () => {
    cancelPending();
    setMessages([]);
    setFilters({});
    saludar();
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "min(32rem, 70vh)" }}
        >
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: AIRBNB, flexShrink: 0 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl flex-shrink-0">
                👩‍💼
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">Asistente Lucía</p>
                <p className="text-xs text-white/70 leading-tight truncate">
                  {atencion === null
                    ? "Asistente de Catalán Propiedades"
                    : atencion.abierto
                      ? `En línea · Milton atiende hasta las ${atencion.cierra}`
                      : `Milton atiende ${atencion.proximo}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={resetChat} className="text-white/70 hover:text-white text-base leading-none" title="Reiniciar chat">↺</button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-2xl leading-none" aria-label="Cerrar">×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const stepOptions = msg.stepKey ? STEPS[msg.stepKey]?.options : null;

              return (
                <div key={i}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                      }`}
                      style={msg.role === "user" ? { backgroundColor: AIRBNB } : {}}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.results.map((prop) => (
                        <Link
                          key={prop.id}
                          href={`/propiedades/${getPropertySlug(prop)}`}
                          onClick={() => setOpen(false)}
                          className="flex gap-2 bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition border border-gray-100"
                        >
                          <img src={prop.image} alt={prop.title} className="w-16 h-14 object-cover rounded-lg flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{prop.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{prop.location.split(",")[1]?.trim() || prop.location}</p>
                            <p className="text-xs font-bold mt-0.5" style={{ color: AIRBNB }}>USD {prop.price.toLocaleString("es-AR")}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.role === "bot" && isLast && !typing && stepOptions && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                      {stepOptions
                        .filter((opt) => !(opt.next === "lead" && leadSent))
                        .map((opt, j) => (
                          <QuickReply key={j} label={opt.label} onClick={() => handleOption(opt, filters)} />
                        ))}
                    </div>
                  )}

                  {msg.role === "bot" && isLast && !typing && msg.stepKey === "lead" && (
                    <LeadForm onSubmit={handleLeadSubmit} />
                  )}
                </div>
              );
            })}

            {typing && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 pt-2 pb-3 bg-white" style={{ flexShrink: 0 }}>
            <a
              href={advisorMessage(lastSearchFilters)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                registrarSalidaWhatsApp(lastSearchFilters, "chatbot_footer");
                trackWhatsAppClick(null, "chatbot_footer");
                trackEvent("chatbot_whatsapp", { has_search_filters: Object.keys(lastSearchFilters).length > 0 });
              }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition"
            >
              <WhatsAppIcon />
              Hablar con un asesor
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => (open ? setOpen(false) : abrirChat())}
        className="fixed bottom-6 right-4 sm:right-6 z-50 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: AIRBNB }}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}

// Indicador gráfico, no textual: los tres puntitos suben la sensación de
// presencia, mientras que la palabra "escribiendo…" no tuvo efecto medible.
function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="Lucía está escribiendo" role="status">
      <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1">
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" />
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.18s" }} />
        <span className="lucia-dot block w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animationDelay: "0.36s" }} />
      </div>
    </div>
  );
}

function LeadForm({ onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [enviado, setEnviado] = useState(false);

  const listo = nombre.trim().length >= 2 && telefono.trim().length >= 6;

  const enviar = (e) => {
    e.preventDefault();
    if (!listo || enviado) return;
    setEnviado(true);
    onSubmit({ nombre: nombre.trim(), telefono: telefono.trim() });
  };

  return (
    <form
      onSubmit={enviar}
      className="mt-2 ml-1 bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 p-3 space-y-2"
    >
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Tu nombre"
        autoComplete="name"
        maxLength={100}
        className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400"
      />
      <input
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="Tu WhatsApp"
        autoComplete="tel"
        maxLength={40}
        className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400"
      />
      <button
        type="submit"
        disabled={!listo || enviado}
        className="w-full py-2 rounded-xl text-white text-sm font-medium transition disabled:opacity-40"
        style={{ backgroundColor: AIRBNB }}
      >
        {enviado ? "Enviando…" : "Avisame"}
      </button>
      <p className="text-[11px] text-gray-400 leading-tight">
        Solo lo usamos para avisarte de propiedades como la que buscás.
      </p>
    </form>
  );
}

function QuickReply({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-xs px-3 py-1.5 rounded-full border transition-all"
      style={{ borderColor: AIRBNB, backgroundColor: hovered ? AIRBNB : "white", color: hovered ? "white" : AIRBNB }}
    >
      {label}
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );
}
