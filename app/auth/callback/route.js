import { NextResponse, after } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { ensureSubscriberFromAccount } from "@/lib/suscriptores";

// El callback nunca acepta destinos externos ni rutas elegidas libremente.
// Van con barra final porque `next.config.mjs` tiene `trailingSlash: true`:
// sin ella Next agrega un 308 de normalización que se come el query string, y
// `?auth_error=1` no llega nunca a la pantalla de ingreso.
const NEXT_PATH = "/cuenta/";

// Motivos que entiende la pantalla de ingreso. Van por la URL, así que son
// palabras cerradas y no texto libre: nadie puede inyectar un mensaje propio.
const ERROR_VENCIDO = "/cuenta/login/?auth_error=vencido";
const ERROR_GENERICO = "/cuenta/login/?auth_error=1";

// Tipos de verificación por correo que admite Supabase. Se valida contra esta
// lista porque el valor llega por la URL: cualquier otra cosa se descarta.
const ALLOWED_OTP_TYPES = new Set([
  "email",
  "magiclink",
  "signup",
  "recovery",
  "invite",
  "email_change",
]);

/**
 * Dos formas de llegar acá, y el orden importa:
 *
 * 1. `token_hash` + `type` — el camino bueno. El enlace del correo trae un
 *    token de un solo uso que el servidor canjea por una sesión. No depende de
 *    nada guardado en el navegador, así que funciona aunque el enlace se abra
 *    en un dispositivo distinto del que lo pidió. Tres cuartas partes del
 *    tráfico del sitio son móviles y mucha gente pide el enlace en la
 *    computadora y abre el correo en el celular: ese caso tiene que andar.
 *
 * 2. `code` — el flujo PKCE de `@supabase/ssr`. Guarda el verificador en una
 *    cookie del navegador que pidió el enlace, así que SOLO funciona si se
 *    abre en ese mismo navegador. Se mantiene como respaldo para los correos
 *    ya enviados y por si alguna plantilla de Supabase todavía usa
 *    `{{ .ConfirmationURL }}`. Se puede borrar cuando todas usen `token_hash`.
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") || "email";
  const code = requestUrl.searchParams.get("code");

  // Supabase rebota acá con ?error=...&error_code=... cuando rechaza el enlace,
  // sin token ni code. Antes esos parámetros se ignoraban y la persona caía en
  // el error genérico de casualidad, porque no había nada que canjear.
  //
  // `otp_expired` es el caso normal y cubre tanto el enlace vencido como el ya
  // usado: Supabase devuelve el mismo código para los dos, así que el mensaje
  // no los separa. Inventar la distinción sería mentirle al usuario.
  const errorCode = requestUrl.searchParams.get("error_code");
  const error = requestUrl.searchParams.get("error");

  if (errorCode || error) {
    console.error(
      "Supabase rechazó el enlace de acceso:",
      errorCode || error,
      requestUrl.searchParams.get("error_description") || ""
    );
    return redirigirA(request, errorCode === "otp_expired" ? ERROR_VENCIDO : ERROR_GENERICO);
  }

  if (tokenHash && ALLOWED_OTP_TYPES.has(type)) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return sesionIniciada(data?.user?.email, request);
    }
    console.error("No se pudo verificar el enlace de acceso:", error.code);
  } else if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return sesionIniciada(data?.user?.email, request);
    }
    console.error("No se pudo canjear el código de acceso:", error.code);
  }

  return redirigirA(request, ERROR_GENERICO);
}

/**
 * Redirige a la cuenta y, después de responder, se asegura de que la persona
 * figure en la lista de correo.
 *
 * Va en `after()` para no meter una consulta a Supabase en el medio del
 * redirect: quien abre el enlace del correo tiene que entrar sin demora. El
 * alta es idempotente, así que correrla en cada ingreso no duplica nada y de
 * paso incorpora a las cuentas creadas antes de este cambio.
 */
function sesionIniciada(email, request) {
  if (email) after(() => ensureSubscriberFromAccount(email));
  return redirigirA(request, NEXT_PATH);
}

/**
 * Redirige conservando el host por el que entró la persona.
 *
 * Ni `request.url` ni `request.nextUrl` sirven acá: dentro de un Route Handler
 * ambos reportan el host con el que arrancó el servidor (`localhost`) aunque la
 * petición haya entrado por `127.0.0.1`. Mandar al navegador al otro origen lo
 * deja en un tarro de cookies distinto del que acaba de recibir la sesión, y la
 * persona aterriza deslogueada. La cabecera `host` sí trae el host real.
 *
 * `x-forwarded-host` va primero porque es la que pone Vercel en producción.
 */
function redirigirA(request, destino) {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) return NextResponse.redirect(new URL(destino, request.nextUrl.origin));

  const protocolo =
    request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");

  return NextResponse.redirect(new URL(destino, `${protocolo}://${host}`));
}
