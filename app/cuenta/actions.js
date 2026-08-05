"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { after } from "next/server";
import { ensureSubscriberFromAccount } from "@/lib/suscriptores";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/auth";
import { getProperties } from "@/lib/properties";
import { rateLimit } from "@/lib/rateLimit";

// El plan gratis de Supabase manda 2 correos por hora para TODO el proyecto,
// y /cuenta/login comparte esa misma cuota. Si un bot vacía el cupo, no solo
// se rompe el registro: tampoco entra el administrador. Estas tres defensas
// son invisibles para una persona real.
const MIN_FILL_MS = 2_500; // Nadie tipea su correo en menos de 2,5 segundos.
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000; // Formulario abierto hace mucho: recargar.

// El tope por IP protege la cuota de correos, pero no puede ser tan estricto
// como para frenar gente real. Tres cuartas partes del tráfico del sitio llega
// desde el celular, y las operadoras argentinas comparten una misma IP pública
// entre muchísimos usuarios: un tope bajo bloquearía a alguien que nunca
// intentó nada, solo porque otro cliente de la misma operadora pidió su enlace
// antes. Diez por hora deja pasar a cualquier persona y sigue conteniendo el
// abuso, sobre todo combinado con el honeypot y la trampa de tiempo.
//
// En desarrollo el tope es holgado: probar el alta varias veces seguidas es lo
// normal, y el límite terminaba bloqueando a quien está probando que funcione.
const EN_PRODUCCION = process.env.NODE_ENV === "production";
const SIGNUP_LIMIT_PER_HOUR = EN_PRODUCCION ? 10 : 50;
const LOGIN_LIMIT_PER_HOUR = EN_PRODUCCION ? 10 : 50;

// Un enlace por correo por minuto, sin importar de dónde venga el pedido.
//
// El tope por IP no alcanza: no frena que el MISMO correo reciba diez enlaces
// seguidos. Eso pasa cuando el navegador reenvía el POST al recargar, cuando
// alguien hace doble clic, o cuando el formulario no confirma nada y la persona
// insiste. El resultado es una bandeja con correos idénticos y la cuota de
// Resend (30/hora) quemada.
//
// La ventana es de un minuto porque Supabase ya impone un mínimo de 60 s entre
// correos por usuario: pedir de nuevo antes de eso nunca iba a mandar nada,
// solo consumía una llamada y devolvía un error que el usuario no veía.
const RESEND_WINDOW_MS = 60_000;

// Pantalla donde se escribe el código. Es una URL propia y no un estado en
// memoria porque así sobrevive a la recarga: recargar un GET no reenvía nada,
// mientras que recargar el POST del formulario dispara otro correo.
const SENT_PATH = "/cuenta/codigo/";

// A quién se le mandó el código, mientras lo escribe.
//
// Va en una cookie del servidor y no en la URL: el correo es un dato personal
// y no tiene por qué quedar en el historial del navegador, en los logs ni en
// el `Referer` que se manda a terceros. `httpOnly` impide que cualquier script
// de la página lo lea.
//
// Quince minutos alcanza de sobra para ir a la casilla y volver, y limita la
// ventana en que una sesión abandonada sigue apuntando a un correo ajeno.
const PENDING_EMAIL_COOKIE = "cp_auth_email";
const PENDING_EMAIL_MAX_AGE = 15 * 60;

// El largo del código lo decide Supabase (Authentication -> Sign In / Providers
// -> Email OTP Length) y admite de 6 a 10 dígitos. Se acepta todo el rango en
// vez de fijar un número: si algún día se cambia esa opción, el ingreso sigue
// funcionando y nadie se queda afuera por una validación desactualizada.
const CODE_MIN_LENGTH = 6;
const CODE_MAX_LENGTH = 10;

// Seis dígitos ya son un millón de combinaciones: sin tope, alguien puede
// probarlas todas. Cinco intentos por correo cada diez minutos deja margen
// para equivocarse tipeando y hace inviable la fuerza bruta.
const CODE_ATTEMPTS = 5;
const CODE_ATTEMPTS_WINDOW_MS = 10 * 60 * 1000;

// Lo que ve alguien cuando falta configuración del lado nuestro.
//
// Antes decía "el acceso por correo todavía no está configurado", que le
// cuenta a un visitante un problema de infraestructura con palabras que no
// significan nada para él y no le deja nada para hacer. Peor: el único que
// puede resolverlo no se entera. Ahora el motivo real va al log del servidor
// y la persona recibe una salida concreta.
const ERROR_SIN_CONFIGURAR =
  "No podemos enviarte el enlace en este momento. Escribinos por WhatsApp al " +
  "2944 30-1470 y te damos acceso a mano.";

// ¿Ya se le mandó un código a este correo hace menos de un minuto?
function pidioEnlaceHaceUnMomento(email) {
  return !rateLimit(`auth-link:${email}`, { limit: 1, windowMs: RESEND_WINDOW_MS });
}

async function recordarCorreoPendiente(email) {
  const store = await cookies();
  store.set(PENDING_EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/cuenta",
    maxAge: PENDING_EMAIL_MAX_AGE,
  });
}

export async function getPendingAuthEmail() {
  const store = await cookies();
  return store.get(PENDING_EMAIL_COOKIE)?.value || null;
}

async function olvidarCorreoPendiente() {
  const store = await cookies();
  store.delete({ name: PENDING_EMAIL_COOKIE, path: "/cuenta" });
}

// Server Action = endpoint HTTP público. Se puede invocar con curl sin abrir
// la página, así que la IP se lee acá y no se confía en nada del formulario.
async function getRequestIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headerList.get("x-real-ip") || "unknown";
}

// Motivo por el que se descarta el envío, o null si parece una persona.
// "stale" es el único caso que puede pasarle a alguien real (dejó la pestaña
// abierta), así que se responde distinto: al bot no se le dice qué lo delató.
function automationReason(formData) {
  // 1. Honeypot: campo oculto por CSS. Una persona no lo ve; un bot que parsea
  //    el HTML lo completa. Si trae algo, es un bot.
  if (String(formData.get("empresa") || "").trim()) return "honeypot";

  // 2. Trampa de tiempo: el formulario estampa cuándo se renderizó. Un POST
  //    directo no trae el campo; uno instantáneo no lo tipeó una persona.
  const renderedAt = Number(formData.get("ts"));
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return "no_timestamp";

  const elapsed = Date.now() - renderedAt;
  if (elapsed < MIN_FILL_MS) return "too_fast";
  if (elapsed > MAX_FORM_AGE_MS) return "stale";
  return null;
}

export async function signInAccount(prevState, formData) {
  const email = normalizeEmail(formData.get("email"));

  if (!isValidEmail(email)) {
    return { error: "Ingresá un correo electrónico válido." };
  }

  // El ingreso consume la misma cuota de correos que el registro, así que
  // también lleva tope. Es holgado para no dejar afuera a un usuario legítimo.
  const ip = await getRequestIp();
  if (!rateLimit(`account-login:${ip}`, { limit: LOGIN_LIMIT_PER_HOUR, windowMs: 60 * 60 * 1000 })) {
    return { error: "Demasiados intentos. Esperá una hora antes de volver a pedir un enlace." };
  }

  const redirectUrl = getAccountAuthRedirectUrl();
  if (!redirectUrl) {
    console.error("Falta ACCOUNT_AUTH_REDIRECT_URL: nadie puede ingresar.");
    return { error: ERROR_SIN_CONFIGURAR };
  }

  // Reenvío inmediato del mismo correo: se muestra la confirmación de siempre,
  // pero no se pide otro enlace. El que ya salió sigue siendo válido.
  if (!pidioEnlaceHaceUnMomento(email)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: false,
      },
    });

    // La respuesta no revela si el correo tiene una cuenta asociada.
    if (error) console.error("No se pudo solicitar el acceso de cuenta:", error.code);
  }

  await recordarCorreoPendiente(email);
  redirect(SENT_PATH);
}

export async function registerBuyerAccount(prevState, formData) {
  if (process.env.BUYER_SIGNUP_ENABLED !== "true") {
    console.error("BUYER_SIGNUP_ENABLED no es \"true\": el alta está cerrada.");
    return { error: ERROR_SIN_CONFIGURAR };
  }

  const reason = automationReason(formData);
  if (reason === "stale") {
    return { error: "El formulario estuvo abierto demasiado tiempo. Recargá la página e intentá de nuevo." };
  }
  if (reason) {
    // Se descarta sin mandar correo. Responde igual que un alta exitosa para
    // que el bot no pueda deducir qué defensa lo frenó ni iterar contra ella.
    console.warn("Alta de comprador descartada:", reason);
    redirect(SENT_PATH);
  }

  const email = normalizeEmail(formData.get("email"));
  if (!isValidEmail(email)) {
    return { error: "Ingresá un correo electrónico válido." };
  }

  // Tope por IP: protege la cuota de correos, que es el recurso escaso.
  // En desarrollo el tope es holgado: probar el flujo de alta varias veces
  // seguidas es normal, y un límite pensado para producción solo entorpece.
  const ip = await getRequestIp();
  if (!rateLimit(`buyer-signup:${ip}`, { limit: SIGNUP_LIMIT_PER_HOUR, windowMs: 60 * 60 * 1000 })) {
    return { error: "Ya pediste varios enlaces. Esperá una hora antes de volver a intentar." };
  }

  const redirectUrl = getAccountAuthRedirectUrl();
  if (!redirectUrl) {
    console.error("Falta ACCOUNT_AUTH_REDIRECT_URL: nadie puede registrarse.");
    return { error: ERROR_SIN_CONFIGURAR };
  }

  // Reenvío inmediato del mismo correo: no se pide otro enlace, pero se muestra
  // la misma confirmación. El enlace que ya salió sigue sirviendo.
  if (!pidioEnlaceHaceUnMomento(email)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("No se pudo solicitar el alta de comprador:", error.code);
      return { error: "No pudimos enviar el código. Esperá unos minutos e intentá nuevamente." };
    }
  }

  await recordarCorreoPendiente(email);
  redirect(SENT_PATH);
}

/**
 * Canjea el código del correo por una sesión.
 *
 * Este es el camino que reemplaza al enlace del correo. La diferencia que
 * importa: el código se escribe en la misma pestaña donde se pidió, así que no
 * hay nada que dependa de en qué dispositivo se lea el mail. Con tres cuartas
 * partes del tráfico en el celular, ese era el agujero más caro.
 *
 * El correo sale de la cookie, nunca del formulario: si viniera del cliente,
 * cualquiera podría pedir un código para su propia casilla y después canjearlo
 * declarando el correo de otra persona.
 */
export async function verifyAccountCode(prevState, formData) {
  const email = await getPendingAuthEmail();
  if (!email) {
    return { error: "Se venció el tiempo para escribir el código. Pedí uno nuevo." };
  }

  // Solo dígitos: se limpian espacios y guiones que la gente copia del correo.
  const code = String(formData.get("code") || "").replace(/\D/g, "");
  if (code.length < CODE_MIN_LENGTH || code.length > CODE_MAX_LENGTH) {
    return { error: "Escribí el código completo, tal como figura en el correo." };
  }

  if (!rateLimit(`code-attempt:${email}`, { limit: CODE_ATTEMPTS, windowMs: CODE_ATTEMPTS_WINDOW_MS })) {
    return { error: "Demasiados intentos. Pedí un código nuevo dentro de unos minutos." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });

  if (error) {
    console.error("Código de acceso rechazado:", error.code);
    return { error: "Ese código no es correcto o ya venció. Revisá el correo o pedí uno nuevo." };
  }

  // Mismo alta en la lista de correo que hace el callback del enlace, para que
  // las dos puertas de entrada dejen a la persona en el mismo estado.
  const correo = data?.user?.email;
  if (correo) after(() => ensureSubscriberFromAccount(correo));

  await olvidarCorreoPendiente();
  redirect("/cuenta/");
}

export async function signOutAccount() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/cuenta/login");
}

export async function syncLocalFavorites(favoriteIds) {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  const requestedIds = [...new Set(
    (Array.isArray(favoriteIds) ? favoriteIds : [])
      .map(Number)
      .filter(Number.isSafeInteger)
      .slice(0, 100)
  )];

  if (!requestedIds.length) return { ok: true, imported: 0 };

  // No se aceptan IDs arbitrarios del navegador: solo publicaciones reales.
  const validIds = new Set((await getProperties()).map((property) => Number(property.id)));
  const rows = requestedIds
    .filter((propertyId) => validIds.has(propertyId))
    .map((propertyId) => ({ user_id: user.id, property_id: propertyId }));

  if (!rows.length) return { ok: true, imported: 0 };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("client_favorites")
    .upsert(rows, { onConflict: "user_id,property_id", ignoreDuplicates: true });

  if (error) return { ok: false, error: "sync_failed" };
  return { ok: true, imported: rows.length };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAccountAuthRedirectUrl() {
  const configuredUrl = process.env.ACCOUNT_AUTH_REDIRECT_URL;
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const hasSafeProtocol = url.protocol === "https:" || (isLocal && url.protocol === "http:");

    const isCallbackPath = url.pathname === "/auth/callback" || url.pathname === "/auth/callback/";
    if (!hasSafeProtocol || url.username || url.password || !isCallbackPath) {
      return null;
    }

    url.pathname = "/auth/callback/";
    url.search = "";
    url.searchParams.set("next", "/cuenta");
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
