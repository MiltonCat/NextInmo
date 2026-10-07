// Alta de "Seguí el valor de tu propiedad" desde el resultado del tasador.
//
// El navegador manda los mismos datos que le mandó a /api/tasar. Acá se
// normalizan con la misma función y se vuelve a tasar UNA vez: el número que
// queda guardado como punto de partida sale del modelo, no de lo que diga el
// navegador. El modelo está despierto (la persona acaba de tasar), así que es
// rápido; si igual falla, el alta se guarda sin valor y el cron lo completa.
//
// El correo puede venir en el pedido, o ya conocerse por la cookie del muro del
// tasador o por la sesión. Sin correo válido no hay alta.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizarEntrada, tasar } from "@/lib/tasador";
import { getSessionUser } from "@/lib/auth";
import { crearSeguimiento } from "@/lib/seguimientoValor";
import { rateLimit, getClientIp, clamp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CIUDADES = new Set(["sma", "neuquen", "villa-la-angostura", "bariloche"]);

export async function POST(request) {
  try {
    if (!rateLimit(`seguimiento:${getClientIp(request)}`, { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    // Campo trampa: el bot no se entera, pero no queda anotado.
    if (body.trampa) return NextResponse.json({ ok: true });

    // Sin el sí explícito no se guarda nada.
    if (body.consentimiento !== true) {
      return NextResponse.json({ ok: false, error: "sin_consentimiento" }, { status: 400 });
    }

    const ciudad = CIUDADES.has(String(body.ciudad)) ? String(body.ciudad) : "sma";
    const entrada = normalizarEntrada(body.pedido || {}, ciudad);
    if (!entrada.ok) return NextResponse.json({ ok: false, error: entrada.error }, { status: 400 });

    const galletas = await cookies();
    const usuario = await getSessionUser();
    const candidatos = [body.email, galletas.get("cp_tasador_email")?.value, usuario?.email];
    const email = candidatos
      .map((valor) => String(valor || "").trim().toLowerCase())
      .find((valor) => EMAIL_RE.test(valor));
    if (!email) return NextResponse.json({ ok: false, error: "email_requerido" }, { status: 400 });

    const respuesta = await tasar(entrada.payload);
    const seguimiento = await crearSeguimiento({
      email,
      nombre: clamp(body.nombre, 120),
      ciudad,
      payload: entrada.payload,
      resultado: respuesta.ok ? respuesta.resultado : null,
    });

    return NextResponse.json({ ok: true, yaExistia: Boolean(seguimiento?.yaExistia) });
  } catch (err) {
    console.error("[/api/seguimiento] error:", err);
    return NextResponse.json({ ok: false, error: "error_servidor" }, { status: 500 });
  }
}
