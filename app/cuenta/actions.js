"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
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
    return { error: "El acceso por correo todavía no está configurado." };
  }

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
  return { success: true };
}

export async function registerBuyerAccount(prevState, formData) {
  if (process.env.BUYER_SIGNUP_ENABLED !== "true") {
    return {
      error: "El registro estará disponible cuando terminemos de configurar el correo seguro.",
    };
  }

  const reason = automationReason(formData);
  if (reason === "stale") {
    return { error: "El formulario estuvo abierto demasiado tiempo. Recargá la página e intentá de nuevo." };
  }
  if (reason) {
    // Se descarta sin mandar correo. Responde igual que un alta exitosa para
    // que el bot no pueda deducir qué defensa lo frenó ni iterar contra ella.
    console.warn("Alta de comprador descartada:", reason);
    return { success: true };
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
    return { error: "El registro por correo todavía no está configurado." };
  }

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
    return { error: "No pudimos enviar el enlace. Esperá unos minutos e intentá nuevamente." };
  }

  return { success: true };
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
