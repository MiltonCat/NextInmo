"use client";
// Pantalla de resultado del tasador, en sus dos estados: con el número a la
// vista y con el número tapado esperando el correo.
//
// La decisión de fondo: se muestra un RANGO y no un número único. El modelo
// tiene un error promedio de dos dígitos; publicar "USD 312.480" sería fingir
// una precisión que no existe y quemar la confianza en cuanto la persona
// consulte a un segundo tasador. El rango dice la verdad y encima es más útil
// para decidir a cuánto publicar.
import { useState } from "react";
import Link from "next/link";
import { WA_NUMBER } from "@/config";
import { useAnalytics } from "@/hooks/useAnalytics";
import CampoTrampa from "./CampoTrampa";

const usd = (n) =>
  typeof n === "number" && Number.isFinite(n) ? `USD ${Math.round(n).toLocaleString("es-AR")}` : "—";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// El modelo informa su error como fracción (0.161) o ya en porcentaje (16.1)
// según la versión. Se acepta cualquiera de las dos en vez de atarse a una:
// el día que cambie, el sitio no publica un "0.2% de error" que sería mentira.
function porcentajeError(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) return null;
  return valor < 1 ? valor * 100 : valor;
}

function Etiqueta({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{children}</p>
  );
}

// Comparación del m² de la propiedad contra la mediana de su barrio. Es la
// parte del informe que más se mira: el total depende de los metros, pero el m²
// es lo único comparable contra el vecino.
function ComparacionBarrio({ valorM2, contexto }) {
  const { medianaBarrio, nBarrio, barrio } = contexto;
  if (!valorM2 || !medianaBarrio) return null;

  const diff = ((valorM2 - medianaBarrio) / medianaBarrio) * 100;
  const arriba = diff >= 0;
  // La barra se escala contra el doble de la mediana, así el 100% del ancho
  // representa "el doble del barrio" y las dos marcas casi nunca se superponen.
  const pos = (v) => Math.min(96, Math.max(4, (v / (medianaBarrio * 2)) * 100));

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <Etiqueta>Contra el barrio</Etiqueta>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        Tu m² da{" "}
        <span className="font-semibold text-gray-900 tabular-nums">{usd(valorM2)}</span>. La mediana
        de <span className="font-medium">{barrio}</span> es{" "}
        <span className="font-semibold text-gray-900 tabular-nums">{usd(medianaBarrio)}</span> —{" "}
        <span className={arriba ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
          {arriba ? "+" : ""}
          {diff.toFixed(0)}%
        </span>
        .
      </p>

      <div className="relative mt-5 mb-2 h-1.5 rounded-full bg-gray-100">
        <div
          className="absolute -top-1 h-3.5 w-0.5 rounded bg-gray-300"
          style={{ left: `${pos(medianaBarrio)}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-1.5 w-1 rounded bg-gray-900"
          style={{ left: `${pos(valorM2)}%`, height: "1.125rem" }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>mediana del barrio</span>
        {nBarrio ? <span className="tabular-nums">{nBarrio} propiedades relevadas</span> : null}
      </div>
    </div>
  );
}

// Rango de confianza, debajo del número y en letra chica.
//
// La barra anterior era puro adorno: el relleno estaba fijo en left-8%/right-8%
// y el marcador clavado en left:50%, así que dibujaba a la propiedad siempre en
// el centro exacto del rango. Como el rango que devuelve el modelo es
// asimétrico, esa imagen era falsa casi siempre —y en la única página del sitio
// que promete datos verificables, un gráfico que miente es más caro que no
// tener gráfico. Esta versión calcula la posición real.
function RangoEstimado({ min, max, valor }) {
  const numero = (n) => typeof n === "number" && Number.isFinite(n);
  if (!numero(min) || !numero(max) || max <= min) return null;

  const posicion = numero(valor)
    ? Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100))
    : null;

  return (
    <div className="mt-5">
      <div className="relative h-1.5 rounded-full bg-gray-100">
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        {posicion !== null && (
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-gray-900 bg-white"
            style={{ left: `${posicion}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-2 flex items-baseline justify-between text-xs text-gray-400 tabular-nums">
        <span>{usd(min)}</span>
        <span className="px-2 text-[11px] uppercase tracking-wider">puede moverse entre</span>
        <span>{usd(max)}</span>
      </p>
    </div>
  );
}

// Muro del correo. La persona ya ve la ficha completa —barrio, comparables,
// estructura del informe— con los números tapados. No es una pantalla en
// blanco pidiendo datos: es el resultado, a un campo de distancia.
function MuroCorreo({ contexto, onEnviar, enviando, error }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [trampa, setTrampa] = useState("");
  const [aviso, setAviso] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setAviso("Revisá el correo: parece que falta algo.");
      return;
    }
    setAviso("");
    onEnviar({ email: email.trim(), nombre: nombre.trim(), trampa });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
      {/* Ficha tapada: son bloques de relleno, no el valor real difuminado.
          El número no viaja al navegador hasta que la persona deja el correo. */}
      <div className="select-none p-6 sm:p-8" aria-hidden="true">
        <div className="blur-[7px]">
          <div className="h-3 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-10 w-72 max-w-full rounded bg-gray-300" />
          <div className="mt-3 h-4 w-52 rounded bg-gray-200" />
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="h-20 rounded-xl bg-gray-100" />
            <div className="h-20 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/85 to-white" />

      <div className="relative px-6 pb-7 sm:px-8">
        <div className="mx-auto max-w-md text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white">
            <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.015em] text-gray-900">
            Tu tasación está lista
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            La primera fue libre. Para esta —y todas las que quieras hacer después— dejanos un
            correo. Es lo único que pedimos.
          </p>

          <form onSubmit={enviar} className="mt-5 space-y-2.5 text-left">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre (opcional)"
              autoComplete="name"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              required
              aria-label="Tu correo"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <CampoTrampa valor={trampa} onChange={setTrampa} />
            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-gray-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Calculando…" : "Ver el resultado"}
            </button>
          </form>

          {(aviso || error) && (
            <p className="mt-3 text-sm text-rose-600" role="alert">
              {aviso || error}
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            Sin spam. Te llega un mail de bienvenida y después solo novedades del mercado de{" "}
            {contexto?.barrio ? "tu zona" : "San Martín"}. Te podés dar de baja cuando quieras.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link href="/cuenta/login" className="font-medium text-gray-900 underline underline-offset-2">
              Iniciá sesión
            </Link>{" "}
            y tasás sin límite.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TasadorResultado({
  resultado,
  contexto,
  datos,
  bloqueado,
  libresRestantes,
  guardadaEnCuenta,
  enviando,
  error,
  onDesbloquear,
  onReiniciar,
}) {
  const { trackEvent, trackWhatsAppClick } = useAnalytics();

  if (bloqueado) {
    return (
      <MuroCorreo contexto={contexto} onEnviar={onDesbloquear} enviando={enviando} error={error} />
    );
  }

  if (!resultado) return null;

  const { valorTotal, valorM2, rangoMin, rangoMax, errorPromedioPct, nEntrenamiento, advertencias } =
    resultado;

  const resumen =
    `Hola Milton, tasé mi propiedad en la web y me dio ${usd(valorTotal)} (rango ${usd(rangoMin)} a ${usd(rangoMax)}).\n\n` +
    `• Tipo: ${datos.tipo}\n` +
    `• Barrio: ${datos.barrio}\n` +
    `• Superficie cubierta: ${datos.superficie} m²\n` +
    (datos.superficieTerreno ? `• Terreno: ${datos.superficieTerreno} m²\n` : "") +
    `• Dormitorios: ${datos.dormitorios} · Baños: ${datos.banos} · Ambientes: ${datos.ambientes}\n` +
    (datos.extras?.length ? `• Extras: ${datos.extras.join(", ")}\n` : "") +
    `\nQuiero que la mires vos.`;

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(resumen)}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] sm:p-8">
        <Etiqueta>Valor estimado · {datos.tipo} en {datos.barrio}</Etiqueta>

        {/* La estimación va primero y sola. Antes el titular era el rango, y un
            rango de cien mil dólares de ancho no le responde la pregunta a nadie
            que quiera vender: la persona igual termina buscando un número, y si
            no se lo damos se lo inventa. Este número no es un promedio armado
            acá — es la predicción del modelo. */}
        <p className="mt-3 text-[38px] font-semibold leading-[1.05] tracking-[-0.025em] text-gray-900 tabular-nums sm:text-[52px]">
          {usd(valorTotal)}
        </p>

        {valorM2 ? (
          <p className="mt-1.5 text-sm text-gray-500">
            <span className="tabular-nums">{usd(valorM2)}</span> por m² cubierto
          </p>
        ) : null}

        {/* El rango baja a letra chica, pero no desaparece: es lo que evita que
            el número se lea como una certeza. Con casi 20% de error promedio,
            publicarlo pelado sería prometer una precisión que no existe. */}
        <RangoEstimado min={rangoMin} max={rangoMax} valor={valorTotal} />

        <p className="mt-4 text-xs leading-relaxed text-gray-400">
          Es una estimación, no una tasación cerrada: el modelo tiene un error promedio de
          {porcentajeError(errorPromedioPct) ? ` ${porcentajeError(errorPromedioPct).toFixed(1)}%` : " dos dígitos"}
          {nEntrenamiento ? ` y aprendió de ${nEntrenamiento.toLocaleString("es-AR")} propiedades reales de la zona` : ""}.
          Sirve para saber en qué orden de magnitud estás parado, no para poner el cartel.
        </p>
      </div>

      <ComparacionBarrio valorM2={valorM2} contexto={contexto} />

      {advertencias?.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <Etiqueta>Lo que el modelo quiere aclarar</Etiqueta>
          <ul className="mt-2 space-y-1.5">
            {advertencias.map((a) => (
              <li key={a} className="text-sm leading-relaxed text-amber-900">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50/70 p-6">
          <Etiqueta>Siguiente paso</Etiqueta>
          <p className="mt-2 text-[20px] font-semibold tracking-[-0.015em] text-gray-900">
            Convertí esta estimación en un precio de publicación
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Milton puede revisar personalmente los detalles que el modelo no ve y decirte si el
            rango se sostiene antes de publicar.
          </p>
        </div>

        <div className="p-6">
          <ul className="grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
            {["Revisión de la propiedad", "Comparables de la zona", "Estrategia de publicación"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
          La revisión inicial es gratuita y sin compromiso. El mensaje ya incluye los datos y el
          resultado de esta tasación para que no tengas que escribir todo de nuevo.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("tasador_resultado_whatsapp", { barrio: datos.barrio, tipo: datos.tipo });
              trackWhatsAppClick(null, "tasador_resultado");
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.186-1.622A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.658-.518-5.168-1.418l-.371-.22-3.673.963.981-3.585-.242-.38A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Pedir revisión por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              trackEvent("tasador_otra_propiedad", {});
              onReiniciar();
            }}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400"
          >
            Tasar otra propiedad
          </button>
        </div>
        </div>
      </div>

      {guardadaEnCuenta && (
        <p className="text-center text-sm text-gray-600">
          Guardada en tu cuenta.{" "}
          <Link href="/cuenta" className="font-medium text-gray-900 underline underline-offset-2">
            Ver mis tasaciones
          </Link>
        </p>
      )}

      {!guardadaEnCuenta && libresRestantes === 0 && (
        <p className="text-center text-sm text-gray-500">
          La próxima te vamos a pedir un correo.{" "}
          <Link href="/cuenta/registro" className="font-medium text-gray-900 underline underline-offset-2">
            Creá una cuenta
          </Link>{" "}
          y además te quedan guardadas.
        </p>
      )}
    </div>
  );
}
