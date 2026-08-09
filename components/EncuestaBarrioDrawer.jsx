"use client";

// Formulario de la Guía de Barrios — el instrumento de recolección.
//
// Regla de diseño: todo lo que queramos AGREGAR es cerrado; lo único abierto es
// la cita, que es lo que queremos CITAR. El formulario anterior era casi todo
// texto libre, así que ninguna respuesta servía para afirmar nada.
//
// Va en 3 pasos para que 13 preguntas no se vean como un muro: quién sos,
// puntuar el barrio, y recomendación + cita. El email se pide al final, después
// de que la persona ya invirtió esfuerzo.
import { useState } from "react";
import { CONTACT_EMAIL } from "@/config";
import { BARRIOS, BARRIO_OTRO } from "@/lib/barrios";
import {
  DIMENSIONES,
  RELACIONES,
  ANTIGUEDADES,
  PERFILES,
  REC_OPCIONES,
} from "@/lib/barrioEncuesta";

const EMPTY = {
  barrio: "",
  barrio_otro: "",
  relacion: "",
  antiguedad: "",
  tranquilidad: null,
  seguridad: null,
  acceso_invierno: null,
  servicios: null,
  conectividad: null,
  transporte: null,
  vida_barrio: null,
  rec_vivir: "",
  rec_invertir: "",
  volveria_elegir: null,
  sin_auto: null,
  perfiles: [],
  cita: "",
  nombre: "",
  email: "",
  quiere_informe: false,
};

const ERRORES = {
  barrio_invalido: "Elegí un barrio de la lista.",
  relacion_invalida: "Contanos cuál es tu relación con la zona.",
  antiguedad_invalida: "Falta indicar hace cuánto conocés el barrio.",
  sin_puntajes: "Puntuá al menos un aspecto del barrio.",
  rate_limited: "Demasiados envíos seguidos. Esperá un minuto e intentá de nuevo.",
  tope_diario: "Ya recibimos varias respuestas desde esta conexión hoy.",
};

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

// ── Escala 1..5 ─────────────────────────────────────────────────────────────
function Escala({ valor, onChange, label, ayuda }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{ayuda}</p>
        </div>
        {valor != null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-gray-400 hover:text-gray-600 underline flex-shrink-0"
          >
            no sé
          </button>
        )}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label}: ${n} de 5`}
            aria-pressed={valor === n}
            className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${
              valor === n
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-300">Malo</span>
        <span className="text-[10px] text-gray-300">Excelente</span>
      </div>
    </div>
  );
}

// ── Grupo de opciones tipo chip ─────────────────────────────────────────────
function Opciones({ label, opciones, valor, onChange, columnas = 1 }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className={`grid gap-2 ${columnas === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {opciones.map((o) => {
          const activo = valor === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={activo}
              className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                activo
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SiNo({ label, ayuda, valor, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {ayuda && <p className="text-xs text-gray-400 -mt-1 mb-2">{ayuda}</p>}
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: true, t: "Sí" },
          { v: false, t: "No" },
        ].map(({ v, t }) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(valor === v ? null : v)}
            aria-pressed={valor === v}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              valor === v
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EncuestaBarrioDrawer({ open, onClose, barrioInicial = "" }) {
  const [form, setForm] = useState({ ...EMPTY, barrio: barrioInicial });
  const [paso, setPaso] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const togglePerfil = (p) =>
    setForm((f) => ({
      ...f,
      perfiles: f.perfiles.includes(p)
        ? f.perfiles.filter((x) => x !== p)
        : [...f.perfiles, p],
    }));

  // Paso 1 completo: barrio + relación + antigüedad.
  const paso0Ok =
    Boolean(form.barrio) &&
    (form.barrio !== BARRIO_OTRO || form.barrio_otro.trim().length > 1) &&
    Boolean(form.relacion) &&
    Boolean(form.antiguedad);

  // Paso 2: al menos una dimensión puntuada (lo mismo que valida el servidor).
  const paso1Ok = DIMENSIONES.some((d) => form[d.key] != null);

  function reiniciar() {
    setForm({ ...EMPTY, barrio: barrioInicial });
    setPaso(0);
    setStatus("idle");
    setError("");
  }

  function cerrar() {
    onClose();
    // Si ya se envió, limpiamos para que la próxima apertura arranque de cero.
    if (status === "success") setTimeout(reiniciar, 300);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Se sacó el descarte silencioso por campo trampa. Los gestores de
    // contraseñas completan campos ocultos, y acá eso significaba que alguien
    // escribía la opinión de su barrio, apretaba enviar y no pasaba nada, sin
    // mensaje de error. Conseguir estas opiniones es justamente lo más difícil
    // del proyecto: perder una por una trampa antibots no compensa.
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/barrio-opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(ERRORES[data.error] || "No pudimos guardar tu respuesta. Intentá de nuevo.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Parece que no hay conexión. Intentá de nuevo en un momento.");
      setStatus("error");
    }
  }

  const pasos = ["Tu barrio", "Puntuá", "Recomendación"];

  return (
    <>
      <div
        onClick={cerrar}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compartí tu experiencia de barrio"
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Guía de Barrios
              </p>
              <h2 className="text-lg font-black text-gray-900 font-jakarta">
                Contanos cómo es tu barrio
              </h2>
            </div>
            <button
              onClick={cerrar}
              aria-label="Cerrar"
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {status !== "success" && (
            <div className="flex gap-1.5">
              {pasos.map((p, i) => (
                <div key={p} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      i <= paso ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  />
                  <p
                    className={`text-[10px] mt-1.5 font-medium ${
                      i <= paso ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    {p}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 font-jakarta mb-3">
                Gracias por compartir
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Tu respuesta ya está guardada. La revisamos antes de sumarla a la ficha del
                barrio — publicamos los promedios recién cuando hay suficientes opiniones
                como para que el número signifique algo.
              </p>
              <button
                onClick={cerrar}
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6">
              {/* ── PASO 1 — Quién responde ─────────────────────────────── */}
              {paso === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className={labelCls} htmlFor="barrio">
                      ¿De qué barrio nos hablás?
                    </label>
                    <select
                      id="barrio"
                      value={form.barrio}
                      onChange={(e) => set("barrio", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Elegí un barrio…</option>
                      {BARRIOS.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.nombre}
                        </option>
                      ))}
                      <option value={BARRIO_OTRO}>Otro (no está en la lista)</option>
                    </select>
                  </div>

                  {form.barrio === BARRIO_OTRO && (
                    <div>
                      <label className={labelCls} htmlFor="barrio_otro">
                        ¿Cuál?
                      </label>
                      <input
                        id="barrio_otro"
                        type="text"
                        value={form.barrio_otro}
                        onChange={(e) => set("barrio_otro", e.target.value)}
                        placeholder="Nombre del barrio o zona"
                        className={inputCls}
                      />
                    </div>
                  )}

                  <Opciones
                    label="¿Cuál es tu relación con la zona?"
                    opciones={RELACIONES}
                    valor={form.relacion}
                    onChange={(v) => set("relacion", v)}
                  />

                  <Opciones
                    label="¿Hace cuánto la conocés?"
                    opciones={ANTIGUEDADES}
                    valor={form.antiguedad}
                    onChange={(v) => set("antiguedad", v)}
                    columnas={2}
                  />

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Esto nos permite mostrar el dato con contexto — no pesa igual la opinión de
                    quien llegó hace tres meses que la de quien vive ahí hace diez años.
                  </p>
                </div>
              )}

              {/* ── PASO 2 — Dimensiones ────────────────────────────────── */}
              {paso === 1 && (
                <div>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    Puntuá del 1 al 5. Si algo no lo sabés, salteálo — es mejor un dato menos
                    que un dato inventado.
                  </p>
                  <div>
                    {DIMENSIONES.map((d) => (
                      <Escala
                        key={d.key}
                        label={d.label}
                        ayuda={d.ayuda}
                        valor={form[d.key]}
                        onChange={(v) => set(d.key, v)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── PASO 3 — Recomendación + cita + contacto ────────────── */}
              {paso === 2 && (
                <div className="space-y-6">
                  <Opciones
                    label="¿Lo recomendás para vivir todo el año?"
                    opciones={REC_OPCIONES}
                    valor={form.rec_vivir}
                    onChange={(v) => set("rec_vivir", v)}
                  />

                  <Opciones
                    label="¿Y para invertir o alquilar?"
                    opciones={REC_OPCIONES}
                    valor={form.rec_invertir}
                    onChange={(v) => set("rec_invertir", v)}
                  />

                  <SiNo
                    label="¿Volverías a elegir este barrio?"
                    ayuda="Si tuvieras que decidir de nuevo, hoy."
                    valor={form.volveria_elegir}
                    onChange={(v) => set("volveria_elegir", v)}
                  />

                  <SiNo
                    label="¿Se puede vivir ahí sin auto?"
                    valor={form.sin_auto}
                    onChange={(v) => set("sin_auto", v)}
                  />

                  <div>
                    <label className={labelCls}>¿Para qué perfil lo recomendarías?</label>
                    <div className="flex flex-wrap gap-2">
                      {PERFILES.map((p) => {
                        const activo = form.perfiles.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => togglePerfil(p)}
                            aria-pressed={activo}
                            className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
                              activo
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* La única pregunta abierta */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className={labelCls} htmlFor="cita">
                      ¿Qué te hubiera gustado que alguien te dijera antes de mudarte acá?
                    </label>
                    <textarea
                      id="cita"
                      rows={3}
                      maxLength={280}
                      value={form.cita}
                      onChange={(e) => set("cita", e.target.value)}
                      placeholder="Lo que nadie te cuenta hasta que ya estás viviendo ahí…"
                      className={`${inputCls} resize-none`}
                    />
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-gray-400">
                        Puede publicarse de forma anónima.
                      </p>
                      <p className="text-xs text-gray-400">{form.cita.length}/280</p>
                    </div>
                  </div>

                  {/* Contacto, al final */}
                  <div className="pt-2 border-t border-gray-100 space-y-4">
                    <div>
                      <label className={labelCls} htmlFor="nombre">
                        Nombre <span className="text-gray-300 normal-case font-normal">(opcional)</span>
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        value={form.nombre}
                        onChange={(e) => set("nombre", e.target.value)}
                        placeholder="Podés dejarlo vacío y ser anónimo"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="email">
                        Email <span className="text-gray-300 normal-case font-normal">(opcional)</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className={inputCls}
                      />
                      <label className="flex items-start gap-3 cursor-pointer group mt-3">
                        <input
                          type="checkbox"
                          checked={form.quiere_informe}
                          onChange={(e) => set("quiere_informe", e.target.checked)}
                          className="mt-0.5 accent-primary-600 w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700">
                          Avisame cuando la ficha de mi barrio tenga suficientes opiniones y
                          mandame el resumen de lo que dijeron los vecinos.
                        </span>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Revisamos cada respuesta antes de publicarla. Tu nombre y tu email nunca se
                    muestran.
                  </p>
                </div>
              )}

            </form>
          )}
        </div>

        {/* Footer de navegación */}
        {status !== "success" && (
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
            {/* El error va acá, en el pie fijo, y NO dentro del formulario:
                ahí abajo quedaba fuera de la vista y el envío fallido parecía
                no hacer nada. */}
            {status === "error" && (
              <div
                role="alert"
                className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
              >
                <p>{error}</p>
                <p className="text-xs text-red-400 mt-1">
                  Si sigue fallando, escribinos a{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            )}
            <div className="flex gap-3">
              {paso > 0 && (
                <button
                  type="button"
                  onClick={() => setPaso((p) => p - 1)}
                  className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Atrás
                </button>
              )}
              {paso < 2 ? (
                <button
                  type="button"
                  onClick={() => setPaso((p) => p + 1)}
                  disabled={paso === 0 ? !paso0Ok : !paso1Ok}
                  className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  className="flex-1 py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando…
                    </>
                  ) : (
                    "Enviar mi experiencia"
                  )}
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Anónimo · 2 minutos · Sin registro
            </p>
          </div>
        )}
      </div>
    </>
  );
}
