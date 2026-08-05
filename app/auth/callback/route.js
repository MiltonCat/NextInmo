import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// El callback nunca acepta destinos externos ni rutas elegidas libremente.
const NEXT_PATH = "/cuenta";

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

  if (tokenHash && ALLOWED_OTP_TYPES.has(type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      return NextResponse.redirect(new URL(NEXT_PATH, requestUrl.origin));
    }
    console.error("No se pudo verificar el enlace de acceso:", error.code);
  } else if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(NEXT_PATH, requestUrl.origin));
    }
    console.error("No se pudo canjear el código de acceso:", error.code);
  }

  return NextResponse.redirect(new URL("/cuenta/login?auth_error=1", requestUrl.origin));
}
