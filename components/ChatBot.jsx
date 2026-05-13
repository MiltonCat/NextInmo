"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { properties } from "@/data/properties";
import { WA_URL } from "@/config";

const WHATSAPP_URL = WA_URL;

function filterProps(filters) {
  return properties.filter((p) => {
    if (filters.types?.length && !filters.types.some((t) => p.type.toLowerCase().includes(t.toLowerCase()))) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.minBedrooms !== undefined && p.bedrooms < filters.minBedrooms) return false;
    if (filters.maxBedrooms !== undefined && p.bedrooms > filters.maxBedrooms) return false;
    return true;
  });
}

const STEPS = {
  welcome: {
    text: "¡Hola! Soy Lucía, tu asistente inmobiliaria. ¿En qué te puedo ayudar hoy?",
    options: [
      { label: "🏠 Buscar una propiedad", next: "ask_type" },
      { label: "📱 Hablar con un asesor", next: "whatsapp" },
    ],
  },
  ask_type: {
    text: "¿Qué tipo de propiedad estás buscando?",
    options: [
      { label: "Casa", filter: { types: ["Casa"] }, next: "ask_budget" },
      { label: "Departamento / PH", filter: { types: ["Departamento", "PH", "Monoambiente"] }, next: "ask_budget" },
      { label: "Cabaña", filter: { types: ["Cabaña", "Cabañas"] }, next: "ask_budget" },
      { label: "Lote / Terreno", filter: { types: ["Lote"] }, next: "ask_budget" },
      { label: "Cualquier tipo", filter: {}, next: "ask_budget" },
    ],
  },
  ask_budget: {
    text: "¿Cuál es tu presupuesto aproximado en USD?",
    options: [
      { label: "Hasta USD 100.000", filter: { maxPrice: 100000 }, next: "ask_bedrooms" },
      { label: "USD 100.000 – 200.000", filter: { minPrice: 100000, maxPrice: 200000 }, next: "ask_bedrooms" },
      { label: "USD 200.000 – 400.000", filter: { minPrice: 200000, maxPrice: 400000 }, next: "ask_bedrooms" },
      { label: "Más de USD 400.000", filter: { minPrice: 400000 }, next: "ask_bedrooms" },
      { label: "Sin límite", filter: {}, next: "ask_bedrooms" },
    ],
  },
  ask_bedrooms: {
    text: "¿Cuántas habitaciones necesitás?",
    options: [
      { label: "Monoambiente", filter: { maxBedrooms: 0 }, next: "results" },
      { label: "1 – 2 habitaciones", filter: { minBedrooms: 1, maxBedrooms: 2 }, next: "results" },
      { label: "3 o más", filter: { minBedrooms: 3 }, next: "results" },
      { label: "No importa", filter: {}, next: "results" },
    ],
  },
  after_results: {
    text: "¿Querés hacer otra búsqueda o hablar con un asesor?",
    options: [
      { label: "🔄 Nueva búsqueda", next: "ask_type" },
      { label: "📱 Hablar con un asesor", next: "whatsapp" },
    ],
  },
};

const AIRBNB = "#FF5A5F";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: STEPS.welcome.text, stepKey: "welcome" },
  ]);
  const [activeStep, setActiveStep] = useState("welcome");
  const [filters, setFilters] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleOption = (opt, currentFilters) => {
    const userMsg = { role: "user", text: opt.label };

    if (opt.next === "whatsapp") {
      window.open(WHATSAPP_URL, "_blank");
      setMessages((prev) => [
        ...prev,
        userMsg,
        { role: "bot", text: "Te abrí WhatsApp. ¡Lucía y el equipo de PropIA te van a atender enseguida! 😊", stepKey: "after_results" },
      ]);
      setActiveStep("after_results");
      setFilters({});
      return;
    }

    const merged = opt.filter ? { ...currentFilters, ...opt.filter } : currentFilters;

    if (opt.next === "results") {
      const found = filterProps(merged);
      const botText =
        found.length === 0
          ? "No encontré propiedades con esos filtros exactos. Te recomiendo hablar con un asesor para explorar más opciones."
          : `¡Encontré ${found.length} propiedad${found.length > 1 ? "es" : ""} para vos!`;

      setMessages((prev) => [
        ...prev,
        userMsg,
        { role: "bot", text: botText, results: found.slice(0, 4), stepKey: "after_results" },
      ]);
      setActiveStep("after_results");
      setFilters({});
      return;
    }

    const nextStep = STEPS[opt.next];
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "bot", text: nextStep.text, stepKey: opt.next },
    ]);
    setActiveStep(opt.next);
    setFilters(merged);
  };

  const resetChat = () => {
    setMessages([{ role: "bot", text: STEPS.welcome.text, stepKey: "welcome" }]);
    setActiveStep("welcome");
    setFilters({});
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "32rem" }}
        >
          <div
            className="text-white px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: AIRBNB, flexShrink: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                👩‍💼
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Asistente Lucía</p>
                <p className="text-xs text-white/70">En línea · Siempre disponible</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                          href={`/propiedades/${prop.id}`}
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

                  {msg.role === "bot" && isLast && stepOptions && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                      {stepOptions.map((opt, j) => (
                        <QuickReply key={j} label={opt.label} onClick={() => handleOption(opt, filters)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 pt-2 pb-3 bg-white" style={{ flexShrink: 0 }}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition"
            >
              <WhatsAppIcon />
              Hablar con un asesor
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110"
        style={{ backgroundColor: AIRBNB }}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
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
