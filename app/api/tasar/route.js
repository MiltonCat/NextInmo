// Tasación instantánea. Es el único camino por el que el navegador llega al
// modelo predictivo: la URL de la API del modelo nunca sale al cliente, y el
// muro del correo se decide acá y no en el componente, donde bastaría abrir la
// consola para saltearlo.
//
// La regla: la primera tasación es libre. A partir de la segunda hace falta un
// correo — salvo que la persona tenga sesión iniciada, en cuyo caso ya nos dio
// el correo al crear la cuenta y encima le guardamos cada tasación.
import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { normalizarEntrada, tasar } from "@/lib/tasador";
import { TASACIONES_LIBRES } from "@/lib/tasadorOpciones";
import { referenciaBarrio, VALOR_M2 } from "@/lib/mercado";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { insertSubscriber, subscriberExists } from "@/lib/suscriptores";
import { sendWelcomeEmail } from "@/lib/emailBienvenida";
import { rateLimit, getClientIp, clamp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// `tasar()` se da dos intentos de 25 s contra un modelo que puede estar
// arrancando. El tope por defecto de una función en Vercel es más corto que
// eso: sin esta línea la plataforma cortaría la respuesta antes de que el
// propio timeout del tasador tuviera oportunidad de actuar, y la persona
// recibiría un error de red en lugar del aviso de "el modelo está despertando".
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cuántas tasaciones completas lleva hecha este navegador, y si ya dejó el
// correo. Van en cookies httpOnly y no en localStorage a propósito: el conteo
// es la condición del muro, y una condición que el cliente puede reescribir no
// es una condición. Un año de vida — el que vuelve a los seis meses a tasar
// otra propiedad no debería tener que dejar el mail de nuevo.
const COOKIE_CONTEO = "cp_tasaciones";
const COOKIE_EMAIL = "cp_tasador_email";
const UN_ANIO = 60 * 60 * 24 * 365;
const cookieBase = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: UN_ANIO,
  secure: process.env.NODE_ENV === "production",
};

// Contexto de mercado que acompaña al número. Se manda SIEMPRE, incluso con el
// resultado bloqueado: es lo que hace que el muro no sea una pared en blanco —
// la persona ve que hay datos reales del otro lado antes de decidir si deja el
// correo.
function contextoDeMercado(barrio, tipo) {
  const ref = referenciaBarrio(barrio);
  return {
    barrio,
    tipo,
    medianaBarrio: ref?.medianaM2 ?? null,
    nBarrio: ref?.n ?? null,
    medianaTipo: VALOR_M2?.[tipo] ?? null,
  };
}

// Guarda la tasación en la cuenta. Nunca lanza: que falle el guardado no puede
// impedir que la persona vea el número que vino a buscar.
async function guardarEnCuenta(userId, payload, resultado, etiqueta) {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("saved_valuations").insert({
      user_id: userId,
      label: etiqueta,
      payload,
      result: resultado,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (err) {
    console.error("[/api/tasar] no se pudo guardar la tasación:", err);
    return false;
  }
}

export async function POST(request) {
  try {
    // 20 tasaciones por minuto y por IP. Es holgado para una persona que
    // prueba variantes de su propiedad —que es exactamente lo que queremos que
    // haga— y corta en seco un script que quiera raspar el modelo.
    if (!rateLimit(`tasar:${getClientIp(request)}`, { limit: 20, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    // Campo trampa. Antes cortaba el pedido con un 400 y eso resultó ser un
    // error: los gestores de contraseñas completan campos ocultos, así que a la
    // persona le aparecía "el modelo no pudo trabajar con esos datos" sin que el
    // modelo se hubiera enterado de nada.
    //
    // Ahora la trampa no le cuesta la tasación a nadie: lo único que hace es
    // saltear el alta en la lista de correo. Para el abuso del modelo ya está el
    // rate limit de arriba, que es la herramienta correcta para eso.
    const pareceBot = Boolean(body.trampa);
    if (pareceBot) console.warn("[/api/tasar] campo trampa completado; no se da de alta el suscriptor");

    const ciudadesValidas = new Set(["sma", "neuquen", "villa-la-angostura", "bariloche"]);
    const ciudad = ciudadesValidas.has(String(body.ciudad)) ? String(body.ciudad) : "sma";
    const entrada = normalizarEntrada(body, ciudad);
    if (!entrada.ok) {
      return NextResponse.json({ ok: false, error: entrada.error }, { status: 400 });
    }

    const contexto = contextoDeMercado(entrada.barrio, entrada.tipo);
    const galletas = await cookies();
    const usuario = await getSessionUser();

    const conteo = Number(galletas.get(COOKIE_CONTEO)?.value || 0) || 0;
    const emailGuardado = galletas.get(COOKIE_EMAIL)?.value || null;
    const emailNuevo = String(body.email || "").trim().toLowerCase();
    const emailValido = EMAIL_RE.test(emailNuevo) ? emailNuevo : null;

    // Tres formas de tener derecho al número: sesión iniciada, correo ya dejado
    // en una visita anterior, o correo entregado en este mismo pedido.
    const identificado = Boolean(usuario) || Boolean(emailGuardado) || Boolean(emailValido);
    const bloqueado = !identificado && conteo >= TASACIONES_LIBRES;

    if (bloqueado) {
      // No se llama al modelo: además de ahorrarnos la llamada, garantiza que
      // el número no viaja al navegador de nadie que no deba verlo. El
      // difuminado de la UI tapa un placeholder, no el valor real.
      return NextResponse.json({
        ok: true,
        bloqueado: true,
        motivo: "email",
        contexto,
      });
    }

    const respuesta = await tasar(entrada.payload);
    if (!respuesta.ok) {
      return NextResponse.json({ ok: false, error: respuesta.error }, { status: 502 });
    }

    // Guardar en la cuenta va antes de responder porque el resultado le dice a
    // la UI si mostrar el enlace a /cuenta. Nunca lanza (ver la función).
    let guardadaEnCuenta = false;
    if (usuario) {
      guardadaEnCuenta = await guardarEnCuenta(
        usuario.id,
        entrada.payload,
        respuesta.resultado,
        `${entrada.tipo} en ${entrada.barrio} · ${entrada.payload.superficie_cubierta} m²`
      );
    }

    const res = NextResponse.json({
      ok: true,
      bloqueado: false,
      resultado: respuesta.resultado,
      contexto,
      // Le decimos a la UI cuántas le quedan antes del muro, para poder
      // avisarlo con tiempo en vez de sorprenderla.
      libresRestantes: identificado ? null : Math.max(0, TASACIONES_LIBRES - (conteo + 1)),
      guardadaEnCuenta,
    });

    res.cookies.set(COOKIE_CONTEO, String(conteo + 1), cookieBase);

    // El correo entregado para desbloquear entra a la lista de suscriptores con
    // source "tasador", que /api/suscripcion ya contempla, así aparece en el
    // panel junto al resto y recibe el mismo email de bienvenida.
    if (emailValido && !emailGuardado && !pareceBot) {
      res.cookies.set(COOKIE_EMAIL, emailValido, cookieBase);
      const nombre = clamp(body.nombre, 200);
      after(async () => {
        try {
          const yaExistia = await subscriberExists(emailValido);
          await insertSubscriber({ email: emailValido, nombre, source: "tasador" });
          if (!yaExistia) await sendWelcomeEmail({ email: emailValido, source: "tasador" });
        } catch (err) {
          console.error("[/api/tasar] no se pudo dar de alta el suscriptor:", err);
        }
      });
    }

    return res;
  } catch (err) {
    console.error("[/api/tasar] error inesperado:", err);
    return NextResponse.json({ ok: false, error: "error_servidor" }, { status: 500 });
  }
}
