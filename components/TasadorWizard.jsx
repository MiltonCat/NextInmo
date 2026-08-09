"use client";
// Tasador instantáneo, paso a paso.
//
// Por qué un wizard y no el formulario largo de antes: el formulario mostraba
// once campos a la vez, y once campos a la vez leen como trabajo. Una pregunta
// por pantalla, con la siguiente a un botón de distancia, lee como avance —es
// el mismo patrón del alta de anfitrión de Airbnb, y el motivo por el que
// funciona no es estético: cada pantalla decidida es una micro-recompensa, y
// la barra de progreso convierte "cuánto falta" en una respuesta visible en
// lugar de una ansiedad.
//
// El precio a pagar es que hay más clics. Se compensa de tres formas: Enter
// avanza, elegir una opción única avanza sola, y ningún paso vuelve a pedir
// algo que ya se contestó.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXTRAS_TASADOR, LIMITES, TIPOS_TASADOR } from "@/lib/tasadorOpciones";
import { referenciaBarrio } from "@/lib/mercado";
import { useAnalytics } from "@/hooks/useAnalytics";
import TasadorResultado from "./TasadorResultado";
import MascotaModelo from "./MascotaModelo";

const usd = (n) =>
  typeof n === "number" && Number.isFinite(n) ? `USD ${Math.round(n).toLocaleString("es-AR")}` : "—";

const MENSAJES_ERROR = {
  rate_limited: "Muchas tasaciones seguidas. Esperá un minuto y probá de nuevo.",
  tipo_invalido: "Ese tipo de propiedad no lo tasa el modelo. Escribinos y lo vemos a mano.",
  barrio_requerido: "Falta elegir el barrio.",
  superficie_invalida: `La superficie tiene que estar entre ${LIMITES.superficie.min} y ${LIMITES.superficie.max} m².`,
  datos_rechazados: "El modelo no pudo trabajar con esos datos. Revisá la superficie y el barrio.",
  modelo_dormido:
    "El modelo tardó demasiado en despertarse. Probá de nuevo: la segunda vez suele responder al toque.",
  modelo_caido: "El modelo no está respondiendo. Probá en un rato o escribinos por WhatsApp.",
  error_servidor: "Algo se rompió de nuestro lado. Probá de nuevo en un momento.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Piezas de interfaz

function Stepper({ label, ayuda, valor, onChange, min, max }) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-700 " +
    "transition hover:border-gray-900 hover:text-gray-900 disabled:cursor-not-allowed " +
    "disabled:border-gray-200 disabled:text-gray-300 disabled:hover:border-gray-200";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0">
      <div>
        <p className="text-[15px] font-medium text-gray-900">{label}</p>
        {ayuda ? <p className="mt-0.5 text-xs text-gray-400">{ayuda}</p> : null}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.max(min, valor - 1))}
          disabled={valor <= min}
          aria-label={`Quitar uno a ${label}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" d="M5 12h14" />
          </svg>
        </button>
        <span
          className="w-7 text-center text-[17px] font-semibold text-gray-900 tabular-nums"
          aria-live="polite"
          aria-label={`${label}: ${valor}`}
        >
          {valor}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(Math.min(max, valor + 1))}
          disabled={valor >= max}
          aria-label={`Sumar uno a ${label}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Selector de barrio con buscador. Son casi 40 barrios: un <select> nativo en
// mobile obliga a scrollear una rueda gigante, y los nombres largos se cortan.
// Con buscador se escribe "chape" y aparecen los tres del Chapelco.
function SelectorBarrio({ barrios, valor, onChange }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return barrios;
    return barrios.filter((b) => b.toLowerCase().includes(q));
  }, [barrios, busqueda]);

  return (
    <div>
      <label htmlFor="buscador-barrio" className="sr-only">
        Buscar barrio
      </label>
      <div className="relative">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          id="buscador-barrio"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscá tu barrio"
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-[15px] text-gray-900 placeholder-gray-400 transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      <div className="mt-3 max-h-[290px] overflow-y-auto rounded-xl border border-gray-100" role="listbox" aria-label="Barrios">
        {filtrados.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No encontramos ese barrio. Probá con &quot;General&quot; o &quot;Otros&quot;.
          </p>
        )}
        {filtrados.map((b) => {
          const activo = valor === b;
          const ref = referenciaBarrio(b);
          return (
            <button
              key={b}
              type="button"
              role="option"
              aria-selected={activo}
              onClick={() => onChange(b)}
              className={`flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 text-left text-gray-900 transition last:border-b-0 ${
                activo ? "bg-gray-50" : "bg-white hover:bg-gray-50"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {/* El tilde marca la elegida sin teñir la fila entera: en una
                    lista larga, una fila invertida se lee como un error. */}
                <svg
                  className={`h-4 w-4 flex-shrink-0 ${activo ? "text-gray-900" : "text-transparent"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className={`truncate text-[15px] ${activo ? "font-semibold" : "font-medium"}`}>
                  {b}
                </span>
              </span>
              {ref ? (
                <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
                  {usd(ref.medianaM2)}/m²
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-gray-400">
        El valor al costado es la mediana relevada de cada barrio. Los que no lo muestran tienen
        muy pocas propiedades como para publicar un número honesto.
      </p>
    </div>
  );
}

function CampoMetros({ id, label, ayuda, valor, onChange, placeholder, autoFocus }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-medium text-gray-900">
        {label}
      </label>
      {ayuda ? <p className="mt-1 text-sm text-gray-500">{ayuda}</p> : null}
      <div className="relative mt-3">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-4 pr-14 text-2xl font-semibold text-gray-900 placeholder-gray-300 tabular-nums transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-gray-400">
          m²
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_INICIAL = {
  tipo: "",
  barrio: "",
  superficie: "",
  superficieTerreno: "",
  dormitorios: 2,
  banos: 1,
  ambientes: 3,
  cocheras: 0,
  extras: [],
};

export default function TasadorWizard({ barrios = [] }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [paso, setPaso] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [lento, setLento] = useState(false);
  const [error, setError] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  // ¿Contestó el modelo el golpecito de bienvenida? Arranca en false —dormido—
  // porque es lo cierto hasta que responda, y es lo que decide qué muestra el
  // zorro. No hay un tercer estado "no sé": para la persona no habría diferencia.
  const [modeloDespierto, setModeloDespierto] = useState(false);
  const tope = useRef(null);
  const { trackEvent } = useAnalytics();

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const esCasa = form.tipo === "Casa";
  const superficieNum = parseFloat(form.superficie);

  const PASOS = useMemo(
    () => [
      {
        id: "tipo",
        titulo: "¿Qué querés tasar?",
        bajada: "Casas y departamentos son los dos tipos con datos suficientes para que el modelo diga algo serio.",
        valido: () => Boolean(form.tipo),
      },
      {
        id: "barrio",
        titulo: "¿Dónde está?",
        bajada: "En San Martín el barrio pesa más que cualquier otra variable: entre el más caro y el más barato hay casi el triple por m².",
        valido: () => Boolean(form.barrio),
      },
      {
        id: "superficie",
        titulo: "¿Cuántos metros tiene?",
        bajada: "Cubiertos, sin contar balcones ni galerías abiertas.",
        valido: () =>
          Number.isFinite(superficieNum) &&
          superficieNum >= LIMITES.superficie.min &&
          superficieNum <= LIMITES.superficie.max,
      },
      {
        id: "ambientes",
        titulo: "¿Cómo está distribuida?",
        bajada: "Dos propiedades de los mismos metros valen distinto según cómo estén repartidos.",
        valido: () => true,
      },
      {
        id: "extras",
        titulo: "¿Tiene alguna de estas?",
        bajada: "Marcá solo lo que tenga. Cada una afina la estimación; ninguna es obligatoria.",
        valido: () => true,
      },
    ],
    [form.tipo, form.barrio, superficieNum]
  );

  const ultimo = paso === PASOS.length - 1;
  const actual = PASOS[paso];
  const puedeAvanzar = actual ? actual.valido() : false;

  // Al cambiar de paso se lleva el foco visual al encabezado. Sin esto, en
  // mobile la pantalla queda mostrando el final del paso anterior y parece que
  // el botón no hizo nada.
  useEffect(() => {
    if (respuesta) return;
    tope.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [paso, respuesta]);

  // La API del modelo vive en un plan gratuito de Render y se duerme. Si a los
  // 6 segundos no volvió, se lo decimos: un spinner mudo durante 40 segundos se
  // lee como "se colgó" y la persona cierra la pestaña.
  // El aviso se apaga al arrancar cada pedido (ver pedirTasacion) y no acá:
  // resetear estado dentro del cuerpo de un efecto encadena renders de más.
  useEffect(() => {
    if (!cargando) return undefined;
    const t = setTimeout(() => setLento(true), 6000);
    return () => clearTimeout(t);
  }, [cargando]);

  // Se le da un golpecito al modelo apenas se abre el tasador, sin esperar a
  // que la persona termine. Completar las cinco pantallas lleva bastante más de
  // lo que Render tarda en levantar el contenedor, así que para cuando llega el
  // pedido real el modelo ya está en pie y el resultado sale al instante.
  //
  // Antes de esto, el primer visitante después de un rato de inactividad se
  // comía la espera entera y encima se la comía al final, cuando ya había hecho
  // todo el trabajo. Ese es el peor lugar posible para poner un minuto de
  // demora.
  useEffect(() => {
    let vigente = true;
    const controlador = new AbortController();

    fetch("/api/tasar/despertar", { signal: controlador.signal })
      .then((r) => r.json())
      .then((d) => {
        if (vigente) setModeloDespierto(Boolean(d?.despierto));
      })
      .catch(() => {
        // Que falle el golpecito no cambia nada: la tasación se pide igual y
        // tiene su propio reintento. El zorro se queda dormido, que es la
        // lectura honesta de "no sabemos si contesta".
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, []);

  const pedirTasacion = useCallback(
    async (extra = {}) => {
      setCargando(true);
      setLento(false);
      setError("");
      try {
        const res = await fetch("/api/tasar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipo: form.tipo,
            barrio: form.barrio,
            superficie: superficieNum,
            superficieTerreno: esCasa ? parseFloat(form.superficieTerreno) || null : null,
            dormitorios: form.dormitorios,
            banos: form.banos,
            ambientes: form.ambientes,
            cocheras: form.cocheras,
            extras: form.extras,
            ...extra,
          }),
        });
        const data = await res.json();

        if (!data.ok) {
          setError(MENSAJES_ERROR[data.error] || MENSAJES_ERROR.error_servidor);
          return;
        }

        setRespuesta(data);
        trackEvent(data.bloqueado ? "tasador_muro_email" : "tasador_resultado", {
          barrio: form.barrio,
          tipo: form.tipo,
          m2: superficieNum,
        });
      } catch {
        setError(MENSAJES_ERROR.modelo_caido);
      } finally {
        setCargando(false);
      }
    },
    [form, superficieNum, esCasa, trackEvent]
  );

  const avanzar = () => {
    if (!puedeAvanzar || cargando) return;
    if (ultimo) {
      trackEvent("tasador_submit", { barrio: form.barrio, tipo: form.tipo });
      pedirTasacion();
      return;
    }
    setPaso((p) => p + 1);
  };

  const reiniciar = () => {
    setRespuesta(null);
    setError("");
    setForm(ESTADO_INICIAL);
    setPaso(0);
  };

  // Enter avanza en cualquier paso: es lo que hace tolerable un flujo de cinco
  // pantallas para quien completa con teclado.
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      avanzar();
    }
  };

  // ── Resultado ──────────────────────────────────────────────────────────────
  if (respuesta) {
    const etiquetasExtras = form.extras
      .map((id) => EXTRAS_TASADOR.find((e) => e.id === id)?.label)
      .filter(Boolean);

    return (
      <div ref={tope}>
        <TasadorResultado
          resultado={respuesta.resultado}
          contexto={respuesta.contexto}
          bloqueado={respuesta.bloqueado}
          libresRestantes={respuesta.libresRestantes}
          guardadaEnCuenta={respuesta.guardadaEnCuenta}
          enviando={cargando}
          error={error}
          datos={{
            tipo: form.tipo,
            barrio: form.barrio,
            superficie: superficieNum,
            superficieTerreno: esCasa ? parseFloat(form.superficieTerreno) || null : null,
            dormitorios: form.dormitorios,
            banos: form.banos,
            ambientes: form.ambientes,
            extras: etiquetasExtras,
          }}
          onDesbloquear={({ email, nombre, trampa }) => pedirTasacion({ email, nombre, trampa })}
          onReiniciar={reiniciar}
        />
      </div>
    );
  }

  const ref = form.barrio ? referenciaBarrio(form.barrio) : null;

  return (
    // Sobre fondo blanco, la tarjeta necesita una sombra suave para separarse
    // de la página: solo el borde la dejaría plana. Es una sombra amplia y muy
    // tenue, no un recuadro marcado.
    <div
      ref={tope}
      // `scroll-mt-24` es lo que evita que el encabezado fijo se coma el arranque
      // de la tarjeta. Al cambiar de paso se llama a scrollIntoView, que respeta
      // scroll-margin: sin este margen, "Paso N de 5" y la barra de progreso
      // quedan debajo del menú y la pantalla nueva parece cortada —o directamente
      // parece que el clic no hizo nada.
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
    >
      {/* Progreso */}
      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-full bg-gray-900 transition-[width] duration-500 ease-out"
          style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={paso + 1}
          aria-valuemin={1}
          aria-valuemax={PASOS.length}
          aria-label={`Paso ${paso + 1} de ${PASOS.length}`}
        />
      </div>

      <div className="px-5 pb-5 pt-7 sm:px-8 sm:pb-8 sm:pt-9" onKeyDown={onKeyDown}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Paso {paso + 1} de {PASOS.length}
        </p>
        <h2 className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-gray-900 sm:text-[32px]">
          {actual.titulo}
        </h2>
        <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-gray-500">{actual.bajada}</p>

        <div className="mt-7" aria-live="polite">
          {/* Paso 1 · Tipo. Seleccionado = borde negro de 2px sobre gris casi
              blanco, y no relleno negro: invertir el color hace que la opción
              elegida grite más que la pregunta. El padding baja un píxel para
              compensar el borde que engorda y que la tarjeta no salte. */}
          {actual.id === "tipo" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TIPOS_TASADOR.map((t) => {
                const activo = form.tipo === t.valor;
                return (
                  <button
                    key={t.valor}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => {
                      set("tipo", t.valor);
                      // Opción única: avanza sola. Obligar a un clic más en
                      // "Siguiente" no aporta nada cuando la elección ya cerró.
                      setTimeout(() => setPaso(1), 160);
                    }}
                    className={`flex items-center gap-4 rounded-xl text-left text-gray-900 transition ${
                      activo
                        ? "border-2 border-gray-900 bg-gray-50 p-[19px]"
                        : "border border-gray-300 bg-white p-5 hover:border-gray-900 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <svg className="h-7 w-7 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d={t.icono} />
                    </svg>
                    <span>
                      <span className="block text-[17px] font-semibold">{t.label}</span>
                      <span className="block text-sm text-gray-500">{t.ayuda}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Paso 2 · Barrio */}
          {actual.id === "barrio" && (
            <SelectorBarrio barrios={barrios} valor={form.barrio} onChange={(b) => set("barrio", b)} />
          )}

          {/* Paso 3 · Superficie */}
          {actual.id === "superficie" && (
            <div className="space-y-6">
              <CampoMetros
                id="superficie-cubierta"
                label="Superficie cubierta"
                valor={form.superficie}
                onChange={(v) => set("superficie", v)}
                placeholder="120"
                autoFocus
              />
              {esCasa && (
                <CampoMetros
                  id="superficie-terreno"
                  label="Superficie del terreno"
                  ayuda="Opcional, pero en casas mueve bastante la estimación."
                  valor={form.superficieTerreno}
                  onChange={(v) => set("superficieTerreno", v)}
                  placeholder="600"
                />
              )}

              {/* Referencia en vivo: el número final no aparece de la nada, se
                  va anticipando mientras la persona completa. */}
              {ref && superficieNum > 0 && (
                <div className="rounded-xl border border-gray-200 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Mientras tanto, en {ref.barrio}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    A la mediana del barrio ({usd(ref.medianaM2)}/m²), {superficieNum} m² darían{" "}
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {usd(ref.medianaM2 * superficieNum)}
                    </span>
                    . Es una multiplicación, no una tasación: el modelo mira muchas más cosas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4 · Distribución */}
          {actual.id === "ambientes" && (
            <div className="rounded-xl border border-gray-200 px-5">
              <Stepper label="Dormitorios" valor={form.dormitorios} onChange={(v) => set("dormitorios", v)} min={LIMITES.dormitorios.min} max={LIMITES.dormitorios.max} />
              <Stepper label="Baños" valor={form.banos} onChange={(v) => set("banos", v)} min={LIMITES.banos.min} max={LIMITES.banos.max} />
              <Stepper label="Ambientes" ayuda="Contando living y comedor" valor={form.ambientes} onChange={(v) => set("ambientes", v)} min={LIMITES.ambientes.min} max={LIMITES.ambientes.max} />
              <Stepper label="Cocheras" valor={form.cocheras} onChange={(v) => set("cocheras", v)} min={LIMITES.cocheras.min} max={LIMITES.cocheras.max} />
            </div>
          )}

          {/* Paso 5 · Extras */}
          {actual.id === "extras" && (
            <div className="flex flex-wrap gap-2.5">
              {EXTRAS_TASADOR.map((e) => {
                const activo = form.extras.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() =>
                      set(
                        "extras",
                        activo ? form.extras.filter((x) => x !== e.id) : [...form.extras, e.id]
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-full text-sm text-gray-900 transition ${
                      activo
                        ? "border-2 border-gray-900 bg-gray-50 px-[15px] py-[9px] font-semibold"
                        : "border border-gray-300 bg-white px-4 py-2.5 font-medium hover:border-gray-900"
                    }`}
                  >
                    {activo && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {e.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Barra de acción. Pegada abajo en mobile para que "Siguiente" quede
          siempre bajo el pulgar sin tener que scrollear. */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
        <button
          type="button"
          onClick={() => setPaso((p) => Math.max(0, p - 1))}
          disabled={paso === 0 || cargando}
          className="text-sm font-semibold text-gray-700 underline underline-offset-4 transition disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
        >
          Atrás
        </button>

        <button
          type="button"
          onClick={avanzar}
          disabled={!puedeAvanzar || cargando}
          className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-lg bg-gray-900 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          {cargando ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {lento ? "Despertando el modelo…" : "Calculando…"}
            </>
          ) : ultimo ? (
            "Ver el valor"
          ) : (
            "Siguiente"
          )}
        </button>
      </div>

      {/* Estado del modelo, con zorro.
          Reemplaza al aviso de texto que aparecía solo cuando ya era tarde. Se
          muestra siempre: mientras el contenedor arranca explica la demora antes
          de que moleste, y una vez despierto avisa que el resultado va a salir
          al toque, que es información útil para quien está decidiendo si vale
          la pena completar cinco pantallas. */}
      <div className="border-t border-gray-100 px-5 py-4 sm:px-8">
        <MascotaModelo
          estado={cargando ? (lento ? "durmiendo" : "trabajando") : modeloDespierto ? "despierto" : "durmiendo"}
        />
      </div>
    </div>
  );
}
