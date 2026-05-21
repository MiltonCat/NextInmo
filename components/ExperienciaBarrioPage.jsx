"use client";
import { useState, useEffect } from "react";
import { CONTACT_EMAIL } from "@/config";

// ─── TODO: reemplazar los youtubeId con los IDs reales de YouTube ──────────────
// Para obtener el ID: en youtube.com/watch?v=ESTE_ES_EL_ID
const BARRIO_VIDEOS = [
  {
    youtubeId: "REEMPLAZAR",
    titulo: "Atardecer sobre el Lago Lácar",
    descripcion: "Vistas únicas al lago desde las zonas residenciales elevadas",
    imagen: "/foto1.jpeg",
  },
  {
    youtubeId: "REEMPLAZAR",
    titulo: "San Martín de los Andes desde el aire",
    descripcion: "La ciudad integrada al bosque nativo con el lago Lácar de fondo",
    imagen: "/eme1.jpg",
  },
  {
    youtubeId: "REEMPLAZAR",
    titulo: "Ríos y naturaleza patagónica",
    descripcion: "Aguas cristalinas y vegetación virgen a minutos del centro",
    imagen: "/foto.jpeg",
  },
];

const BARRIOS = [
  "Centro",
  "Chapelco Golf",
  "Las Marías",
  "Costanera",
  "Las Pendientes",
  "Vía Blanca",
  "Arrayán",
  "Lacar",
  "Patagonia Norte",
  "Otro (especificá en el comentario)",
];

const RELACION = [
  "Vivo aquí actualmente",
  "Viví aquí antes",
  "Trabajo o tengo un negocio en la zona",
  "Tengo una propiedad ahí",
  "Conozco bien la zona",
];

const GUIDE_QUESTIONS = [
  {
    q: "¿Qué es lo mejor de tu barrio?",
    h: "Tranquilidad, vistas, vecinos, servicios…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    q: "¿Para qué perfil lo recomendarías?",
    h: "Familias, inversores, turistas, jubilados…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    q: "¿Cómo es la tranquilidad de la zona?",
    h: "Ruido, movimiento, seguridad…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    q: "¿Qué debería saber antes de mudarse?",
    h: "Accesos en invierno, servicios, particularidades…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    q: "¿Es una buena zona para invertir?",
    h: "Revalorización, alquiler turístico, demanda…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    q: "¿Qué aspectos podrían mejorar?",
    h: "Infraestructura, servicios, conectividad…",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
];

const EMPTY_FORM = {
  nombre: "",
  barrio: "",
  relacion: "",
  mejor_del_barrio: "",
  que_tener_en_cuenta: "",
  recomienda_vivir: "",
  recomienda_invertir: "",
  comentario: "",
  autorizo: false,
  website: "",
};

// ─── Card de barrio — retrato con escalonado ──────────────────────────────────
function VideoCard({ youtubeId, titulo, descripcion, imagen }) {
  const [playing, setPlaying] = useState(false);
  const esPlaceholder = youtubeId === "REEMPLAZAR";

  return (
    <div className="group">
      <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-gray-100">
        {playing && !esPlaceholder ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            <img
              src={imagen}
              alt={titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            {!esPlaceholder && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none"
                aria-label={`Reproducir: ${titulo}`}
              >
                <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-900 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>
              </button>
            )}
          </>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <p className="font-semibold text-gray-900 text-sm leading-snug">{titulo}</p>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{descripcion}</p>
      </div>
    </div>
  );
}

// ─── Drawer de la encuesta ────────────────────────────────────────────────────
function EncuestaDrawer({ open, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorDetail, setErrorDetail] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return;
    if (!form.autorizo) return;
    setStatus("loading");
    setErrorDetail("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject: `Nueva experiencia de barrio — ${form.barrio || "Sin especificar"} · Catalán Propiedades`,
          from_name: "Guía de Barrios · Catalán Propiedades",
          nombre: form.nombre || "Anónimo",
          barrio: form.barrio,
          relacion: form.relacion,
          mejor_del_barrio: form.mejor_del_barrio,
          que_tener_en_cuenta: form.que_tener_en_cuenta,
          recomienda_vivir: form.recomienda_vivir,
          recomienda_invertir: form.recomienda_invertir,
          comentario: form.comentario,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorDetail(data.message ?? `HTTP ${res.status}`);
        throw new Error();
      }
      setStatus("success");
      setForm(EMPTY_FORM);
    } catch (err) {
      if (!errorDetail) setErrorDetail(err.message || "fetch falló (posible CORS o red)");
      setStatus("error");
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Guía de Barrios</p>
            <h2 className="text-lg font-black text-gray-900 font-jakarta">Compartí tu experiencia</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 font-jakarta mb-3">¡Gracias por compartir!</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Recibimos tu experiencia. El equipo de Catalán Propiedades la va a revisar antes de considerarla para la Guía de Barrios.
              </p>
              <button
                onClick={() => { setStatus("idle"); onClose(); }}
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Honeypot — invisible para humanos, los bots lo completan */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className={labelCls}>Nombre <span className="text-gray-300 normal-case font-normal">(opcional)</span></label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Podés dejarlo en blanco para ser anónimo"
                  className={inputCls}
                />
              </div>

              {/* Barrio */}
              <div>
                <label className={labelCls}>Barrio <span className="text-red-400">*</span></label>
                <select
                  required
                  value={form.barrio}
                  onChange={(e) => set("barrio", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Seleccioná un barrio…</option>
                  {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Relación */}
              <div>
                <label className={labelCls}>¿Cuál es tu relación con esa zona? <span className="text-red-400">*</span></label>
                <select
                  required
                  value={form.relacion}
                  onChange={(e) => set("relacion", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Seleccioná una opción…</option>
                  {RELACION.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Mejor del barrio */}
              <div>
                <label className={labelCls}>¿Qué es lo mejor del barrio? <span className="text-red-400">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={form.mejor_del_barrio}
                  onChange={(e) => set("mejor_del_barrio", e.target.value)}
                  placeholder="Contanos qué destacarías de vivir o estar en esa zona…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Qué tener en cuenta */}
              <div>
                <label className={labelCls}>¿Qué debería saber alguien que quiere comprar ahí?</label>
                <textarea
                  rows={3}
                  value={form.que_tener_en_cuenta}
                  onChange={(e) => set("que_tener_en_cuenta", e.target.value)}
                  placeholder="Accesos en invierno, servicios, particularidades de la zona…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Recomendaciones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>¿Para vivir?</label>
                  {["Sí", "Tal vez", "No"].map((v) => (
                    <label key={v} className="flex items-center gap-2.5 py-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="recomienda_vivir"
                        value={v}
                        checked={form.recomienda_vivir === v}
                        onChange={() => set("recomienda_vivir", v)}
                        className="accent-primary-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{v}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className={labelCls}>¿Para invertir?</label>
                  {["Sí", "Tal vez", "No"].map((v) => (
                    <label key={v} className="flex items-center gap-2.5 py-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="recomienda_invertir"
                        value={v}
                        checked={form.recomienda_invertir === v}
                        onChange={() => set("recomienda_invertir", v)}
                        className="accent-primary-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comentario publicable */}
              <div>
                <label className={labelCls}>Comentario breve <span className="text-gray-300 normal-case font-normal">(podría publicarse)</span></label>
                <textarea
                  rows={3}
                  maxLength={280}
                  value={form.comentario}
                  onChange={(e) => set("comentario", e.target.value)}
                  placeholder="Una frase que resuma tu experiencia en el barrio…"
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.comentario.length}/280</p>
              </div>

              {/* Autorización */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  required
                  type="checkbox"
                  checked={form.autorizo}
                  onChange={(e) => set("autorizo", e.target.checked)}
                  className="mt-0.5 accent-primary-600 w-4 h-4 flex-shrink-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700">
                  Autorizo a Catalán Propiedades a usar fragmentos de mis respuestas de forma <strong className="text-gray-700">anónima y moderada</strong> como referencia orientativa en la Guía de Barrios.
                </span>
              </label>

              {status === "error" && (
                <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl space-y-1">
                  <p>Hubo un error al enviar. Intentá de nuevo o escribinos a{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a></p>
                  {errorDetail && <p className="text-xs text-red-400 font-mono break-all">{errorDetail}</p>}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading" || !form.autorizo}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando…
                  </>
                ) : (
                  "Enviar mi experiencia"
                )}
              </button>
              <p className="text-xs text-gray-400 text-center pb-2">
                Anónimo · Sin spam · Revisado antes de publicar
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Phone Animation Premium ──────────────────────────────────────────────────
const EASE_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";

function PhoneStatusBar() {
  return (
    <div style={{ height: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 0", flexShrink: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em" }}>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
          {[3, 5, 7, 9].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "#0f172a", borderRadius: 1, opacity: i === 3 ? 0.28 : 1 }} />
          ))}
        </div>
        <svg width="15" height="11" viewBox="0 0 18 14" fill="none">
          <path d="M9 11l1.8-2.2a2.5 2.5 0 00-3.6 0L9 11z" fill="#0f172a"/>
          <path d="M9 13.5l.6-.8a.85.85 0 00-1.2 0L9 13.5z" fill="#0f172a"/>
          <path d="M9 8.5l3.8-4.6a6 6 0 00-7.6 0L9 8.5z" fill="#0f172a" opacity="0.6"/>
          <path d="M9 5.5l6-7.3a10 10 0 00-12 0L9 5.5z" fill="#0f172a" opacity="0.28"/>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{ width: 22, height: 10, border: "1.5px solid #0f172a", borderRadius: 3, padding: "1.5px", display: "flex" }}>
            <div style={{ width: "78%", background: "#0f172a", borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: "#0f172a", borderRadius: "0 1px 1px 0", opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

function PhoneDynamicIsland() {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 8px", flexShrink: 0 }}>
      <div style={{ width: 108, height: 28, background: "#0f172a", borderRadius: 20 }} />
    </div>
  );
}

function PhoneHomeBar() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 4px", flexShrink: 0 }}>
      <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
    </div>
  );
}

function PhoneAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(null);
  const [typed, setTyped] = useState("");
  const DURATIONS = [3500, 3000, 2500, 4000, 2000, 3000];

  useEffect(() => {
    const t = setTimeout(() => {
      setPrevStep(currentStep);
      setCurrentStep((s) => (s + 1) % 6);
    }, DURATIONS[currentStep]);
    return () => clearTimeout(t);
  }, [currentStep]);

  useEffect(() => {
    if (prevStep === null) return;
    const t = setTimeout(() => setPrevStep(null), 600);
    return () => clearTimeout(t);
  }, [prevStep]);

  useEffect(() => {
    if (currentStep !== 3) { setTyped(""); return; }
    const text = "La tranquilidad del lago y los vecinos son increíbles...";
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => { i++; setTyped(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, 55);
      return () => clearInterval(iv);
    }, 900);
    return () => clearTimeout(t);
  }, [currentStep]);

  const inputBase = { width: "100%", height: 34, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", alignItems: "center", padding: "0 10px", fontSize: 10.5, color: "#374151", boxSizing: "border-box" };
  const lbl = { fontSize: 8.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, display: "block" };
  const drawerBase = { position: "absolute", bottom: 0, left: 0, right: 0, background: "white", borderRadius: "22px 22px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.13), 0 -1px 0 rgba(0,0,0,0.04)", animation: `phone-drawer-up 0.55s ${EASE_SPRING} forwards`, zIndex: 2 };
  const overlay = { position: "absolute", inset: 0, background: "rgba(15,23,42,0.42)", zIndex: 1 };
  const drawerHeader = { fontSize: 8, color: "#9ca3af", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 };
  const drawerTitle = { fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14, letterSpacing: "-0.03em" };
  const handle = { width: 32, height: 4, background: "#e5e7eb", borderRadius: 2, margin: "10px auto 14px" };

  const steps = [
    // 0 — Landing con testimonios
    <div key={0} style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ fontSize: 8, color: "#E8325A", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 7 }}>Catalán · Guía de Barrios</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", lineHeight: 1.08, marginBottom: 10, letterSpacing: "-0.04em" }}>Conocé cada barrio desde adentro.</div>

        {/* Testimonios con fotos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {[
            { img: 32, name: "Lucía M.", barrio: "Centro", text: "El lago a 5 minutos y todo cerca. No cambiaría nada." },
            { img: 45, name: "Martín S.", barrio: "Chapelco", text: "La mejor inversión que hice en años." },
          ].map((t, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8, animation: `phone-fade-up 0.4s ease ${0.1 + i * 0.15}s both` }}>
              <img src={`https://i.pravatar.cc/60?img=${t.img}`} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#0f172a" }}>{t.name}</span>
                  <span style={{ fontSize: 8.5, color: "#9ca3af" }}>· {t.barrio}</span>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", lineHeight: 1.4, margin: 0 }}>{t.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", alignSelf: "flex-start" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#0f172a", borderRadius: 22, padding: "8px 14px", boxShadow: "0 4px 16px rgba(15,23,42,0.28)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8325A" }} />
            <span style={{ fontSize: 9.5, color: "white", fontWeight: 700, letterSpacing: "-0.02em" }}>Compartir mi experiencia</span>
          </div>
          <div style={{ position: "absolute", right: -10, bottom: -10, width: 24, height: 24, borderRadius: "50%", background: "rgba(232,50,90,0.12)", animation: "phone-tap 1.3s ease-out infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#E8325A", opacity: 0.85 }} />
          </div>
        </div>
      </div>
      <PhoneHomeBar />
    </div>,

    // 1 — Drawer abre
    <div key={1} style={{ height: "100%", position: "relative", background: "white", display: "flex", flexDirection: "column" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1 }} />
      <div style={overlay} />
      <div style={{ ...drawerBase, padding: "0 0 6px" }}>
        <div style={handle} />
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <img src="https://i.pravatar.cc/60?img=32" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={drawerHeader}>Guía de Barrios</div>
              <div style={{ ...drawerTitle, marginBottom: 0 }}>Compartí tu experiencia</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={lbl}>Nombre <span style={{ color: "#d1d5db", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></span>
            <div style={{ ...inputBase, animation: "phone-fade-up 0.4s ease 0.1s both" }} />
          </div>
          <div>
            <span style={lbl}>Barrio <span style={{ color: "#E8325A" }}>*</span></span>
            <div style={{ ...inputBase, animation: "phone-fade-up 0.4s ease 0.2s both", color: "#9ca3af" }}>
              <span>Seleccioná un barrio…</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 2px" }}>
          <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
        </div>
      </div>
    </div>,

    // 2 — Barrio dropdown
    <div key={2} style={{ height: "100%", position: "relative", background: "white", display: "flex", flexDirection: "column" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1 }} />
      <div style={overlay} />
      <div style={{ ...drawerBase, padding: "0 0 6px" }}>
        <div style={handle} />
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <img src="https://i.pravatar.cc/60?img=32" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={drawerHeader}>Guía de Barrios</div>
              <div style={{ ...drawerTitle, marginBottom: 0 }}>Compartí tu experiencia</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={lbl}>Nombre</span>
            <div style={inputBase} />
          </div>
          <div>
            <span style={lbl}>Barrio <span style={{ color: "#E8325A" }}>*</span></span>
            <div style={{ border: "1.5px solid #818cf8", borderRadius: 10, overflow: "hidden" }}>
              {["Centro", "Chapelco Golf", "Las Marías", "Costanera"].map((b, i) => (
                <div key={b} style={{ padding: "7px 12px", fontSize: 10.5, background: i === 0 ? "#eef2ff" : "white", color: i === 0 ? "#4338ca" : "#6b7280", fontWeight: i === 0 ? 700 : 400, borderBottom: i < 3 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", gap: 8, animation: `phone-fade-up 0.3s ease ${i * 0.07}s both` }}>
                  {i === 0 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4338ca", flexShrink: 0 }} />}
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 2px" }}>
          <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
        </div>
      </div>
    </div>,

    // 3 — Escribiendo
    <div key={3} style={{ height: "100%", position: "relative", background: "white", display: "flex", flexDirection: "column" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1 }} />
      <div style={overlay} />
      <div style={{ ...drawerBase, padding: "0 0 6px" }}>
        <div style={handle} />
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <img src="https://i.pravatar.cc/60?img=32" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={drawerHeader}>Guía de Barrios</div>
              <div style={{ ...drawerTitle, marginBottom: 0 }}>Compartí tu experiencia</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={lbl}>Barrio</span>
            <div style={{ ...inputBase, background: "#f0f4ff", border: "1.5px solid #c7d2fe" }}>
              <span style={{ fontSize: 10.5, color: "#4338ca", fontWeight: 700 }}>Centro</span>
            </div>
          </div>
          <div>
            <span style={lbl}>¿Qué es lo mejor del barrio? <span style={{ color: "#E8325A" }}>*</span></span>
            <div style={{ minHeight: 56, background: "#f9fafb", border: "1.5px solid #818cf8", borderRadius: 10, padding: "8px 10px", fontSize: 10.5, color: "#374151", lineHeight: 1.55 }}>
              {typed}<span style={{ borderRight: "1.5px solid #4338ca", animation: "phone-blink 1s step-end infinite" }}>&nbsp;</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 2px" }}>
          <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
        </div>
      </div>
    </div>,

    // 4 — Enviando
    <div key={4} style={{ height: "100%", position: "relative", background: "white", display: "flex", flexDirection: "column" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1 }} />
      <div style={overlay} />
      <div style={{ ...drawerBase, padding: "0 0 6px" }}>
        <div style={handle} />
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <img src="https://i.pravatar.cc/60?img=32" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={drawerHeader}>Guía de Barrios</div>
              <div style={{ ...drawerTitle, marginBottom: 0 }}>Compartí tu experiencia</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <div style={{ height: 32, background: "#f0f4ff", border: "1px solid #e0e7ff", borderRadius: 10, display: "flex", alignItems: "center", padding: "0 10px" }}>
              <span style={{ fontSize: 10, color: "#4338ca", fontWeight: 600 }}>Centro</span>
            </div>
            <div style={{ height: 32, background: "#f3f4f6", borderRadius: 10 }} />
            <div style={{ height: 50, background: "#f3f4f6", borderRadius: 10 }} />
          </div>
          <div style={{ background: "#0f172a", borderRadius: 12, padding: "11px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, animation: "phone-press 0.4s ease forwards", boxShadow: "0 0 0 3px rgba(232,50,90,0.18)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "phone-spin 0.7s linear infinite" }} />
            <span style={{ fontSize: 10.5, color: "white", fontWeight: 600, letterSpacing: "-0.02em" }}>Enviando…</span>
          </div>
          <p style={{ textAlign: "center", fontSize: 8.5, color: "#9ca3af", marginTop: 8 }}>Anónimo · Sin spam · Revisado antes de publicar</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 2px" }}>
          <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
        </div>
      </div>
    </div>,

    // 5 — Éxito con comunidad
    <div key={5} style={{ height: "100%", position: "relative", background: "white", display: "flex", flexDirection: "column" }}>
      <PhoneStatusBar />
      <PhoneDynamicIsland />
      <div style={{ flex: 1 }} />
      <div style={overlay} />
      <div style={{ ...drawerBase, padding: "20px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 32, height: 4, background: "#e5e7eb", borderRadius: 2, marginBottom: 16 }} />

        {/* Community avatars */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, animation: "phone-fade-up 0.4s ease 0.05s both" }}>
          {[32, 45, 18, 7].map((n, i) => (
            <img key={n} src={`https://i.pravatar.cc/60?img=${n}`} alt="" style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid white", marginLeft: i === 0 ? 0 : -10, objectFit: "cover", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
          ))}
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid white", marginLeft: -10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, color: "#6b7280", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>+43</div>
        </div>

        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, animation: "phone-success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 7, letterSpacing: "-0.03em", animation: "phone-fade-up 0.4s ease 0.25s both" }}>¡Gracias por compartir!</div>
        <div style={{ fontSize: 9.5, color: "#6b7280", lineHeight: 1.65, maxWidth: 195, animation: "phone-fade-up 0.4s ease 0.38s both" }}>Te uniste a <strong style={{ color: "#0f172a" }}>+47 vecinos</strong> que construyen la guía más real de la Patagonia.</div>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 100, height: 4, background: "#0f172a", borderRadius: 2, opacity: 0.12 }} />
        </div>
      </div>
    </div>,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "55vh", padding: "40px 24px", background: "linear-gradient(155deg, #f8fafc 0%, #eef2f7 100%)", position: "relative" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 220, background: "radial-gradient(ellipse, rgba(232,50,90,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Phone frame */}
      <div style={{ width: 260, height: 530, borderRadius: 52, background: "linear-gradient(145deg, #2d2d2f, #1c1c1e)", padding: 11, position: "relative", boxShadow: "0 40px 100px rgba(0,0,0,0.18), 0 16px 32px rgba(0,0,0,0.09), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.13)" }}>
        <div style={{ position: "absolute", right: -3, top: 105, width: 3, height: 38, background: "#3c3c3e", borderRadius: "0 3px 3px 0" }} />
        <div style={{ position: "absolute", left: -3, top: 90, width: 3, height: 28, background: "#3c3c3e", borderRadius: "3px 0 0 3px" }} />
        <div style={{ position: "absolute", left: -3, top: 124, width: 3, height: 28, background: "#3c3c3e", borderRadius: "3px 0 0 3px" }} />
        {/* Screen */}
        <div style={{ width: "100%", height: "100%", borderRadius: 42, overflow: "hidden", position: "relative", background: "white" }}>
          {prevStep !== null && (
            <div style={{ position: "absolute", inset: 0, animation: "phone-step-out 0.5s ease forwards", zIndex: 1 }}>
              {steps[prevStep]}
            </div>
          )}
          <div key={currentStep} style={{ position: "absolute", inset: 0, animation: `phone-step-in 0.5s ${EASE_SPRING} forwards`, zIndex: 2 }}>
            {steps[currentStep]}
          </div>
        </div>
        {/* Screen glass reflection */}
        <div style={{ position: "absolute", top: 11, left: 11, right: 11, height: "38%", borderRadius: "42px 42px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.032) 0%, transparent 100%)", pointerEvents: "none", zIndex: 20 }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ width: i === currentStep ? 18 : 6, height: 6, borderRadius: 3, background: i === currentStep ? "#E8325A" : "rgba(15,23,42,0.15)", transition: `all 0.4s ${EASE_SPRING}` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function ExperienciaBarrioPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <EncuestaDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── HERO SPLIT ──────────────────────────── */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* Panel texto — fondo blanco */}
        <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-16 xl:px-20 py-32 lg:py-0 order-2 lg:order-1 bg-white">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-400 mb-6">
            Catalán Propiedades · Guía de Barrios
          </p>
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-gray-900 font-jakarta leading-[1.06] mb-6">
            Conocé cada barrio desde la mirada de quienes lo viven.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
            Tu experiencia local puede ayudar a otras personas a tomar mejores decisiones al comprar, invertir o mudarse en San Martín de los Andes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all text-base shadow-sm"
            >
              Compartir mi experiencia
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <a
              href="#barrios"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-full border border-gray-200 transition-all text-base"
            >
              Conocer los barrios
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-5">Anónimo · Menos de 5 minutos · Sin registro</p>
        </div>

        {/* Panel animación — Phone mockup */}
        <div className="order-1 lg:order-2 flex items-center justify-center bg-slate-50 min-h-[55vh] lg:min-h-0">
          <PhoneAnimation />
        </div>

      </section>

      {/* ── BARRIOS EN VIDEO / VISUAL ───────────────── */}
      <section id="barrios" className="py-20 sm:py-28 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">

          {/* Header centrado */}
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-400 mb-4">
              Recorridos por barrio
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 font-jakarta leading-[1.06] mb-5">
              Conocé los barrios<br className="hidden sm:block" /> desde adentro
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              Una mirada real de las zonas más consultadas por quienes buscan comprar en San Martín de los Andes.
            </p>
          </div>

          {/* Tres imágenes retrato alineadas */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {BARRIO_VIDEOS.map((v) => (
              <VideoCard key={v.titulo} {...v} />
            ))}
          </div>

        </div>
      </section>

      <div className="border-t border-gray-100 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16" />

      {/* ── POR QUÉ PARTICIPAR ──────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-jakarta">
              Tu experiencia puede cambiar<br className="hidden sm:block" /> una decisión
            </h2>
            <p className="text-gray-500 text-lg mt-3 max-w-xl">
              Nadie conoce mejor un barrio que quienes lo viven todos los días.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
                title: "Ayudás a otros a elegir mejor",
                desc: "Tu experiencia puede cambiar la decisión de alguien que está buscando dónde comprar, invertir o vivir.",
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.96 8.96 0 00.284 2.253" /></svg>,
                title: "Construís conocimiento local",
                desc: "Sos parte de la primera guía inmobiliaria barrial de San Martín de los Andes basada en experiencias reales.",
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
                title: "Con moderación y respeto",
                desc: "Todo lo que compartís es revisado por nuestro equipo antes de publicarse. Tu privacidad siempre está protegida.",
              },
            ].map((b) => (
              <div key={b.title} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">{b.icon}</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-base leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16" />

      {/* ── PREGUNTAS GUÍA ─────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-jakarta mb-5">
                Las preguntas que guían la experiencia
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                No es un cuestionario técnico. Es una conversación sobre lo que viviste.
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all text-sm shadow-sm shadow-primary-100"
              >
                Responder ahora
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {GUIDE_QUESTIONS.map((item) => (
                <button
                  key={item.q}
                  onClick={() => setDrawerOpen(true)}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.q}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.h}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODERACIÓN ────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1.5">Moderación antes de publicar</p>
                <p className="text-gray-500 text-sm leading-relaxed">Toda opinión es revisada por Catalán Propiedades antes de publicarse. Los fragmentos se usan de forma anónima, siempre con criterio y respeto.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1.5">Solo una herramienta orientativa</p>
                <p className="text-gray-500 text-sm leading-relaxed">La información publicada no representa una tasación ni garantía comercial. Es una referencia basada en experiencias reales y criterio inmobiliario local.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 font-jakarta leading-[1.08] mb-6">
                Ayudanos a construir la guía inmobiliaria más útil de la Patagonia
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Con tu experiencia, otras personas pueden entender mejor cada zona antes de tomar una decisión importante.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-base shadow-sm"
                >
                  Compartir mi experiencia
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all text-base"
                >
                  Consultar por email
                </a>
              </div>
              <p className="text-gray-400 text-sm mt-5">Anónimo · Menos de 5 minutos · Sin registro</p>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img src="/muelle.jpg" alt="San Martín de los Andes" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white font-black text-2xl font-jakarta leading-tight">San Martín de los Andes</p>
                <p className="text-white/70 text-sm mt-1">Patagonia · Argentina</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
