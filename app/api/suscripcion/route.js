// Endpoint público de alta de suscriptores ("sé el primero en enterarte").
// A diferencia de /api/consultas (fire-and-forget), acá SÍ devolvemos el
// resultado para que el formulario muestre confirmación o error al instante.
import { NextResponse, after } from "next/server";
import { insertSubscriber, subscriberExists } from "@/lib/suscriptores";
import { sendWelcomeEmail } from "@/lib/emailBienvenida";
import { rateLimit, getClientIp, clamp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTERESES = new Set(["comprar", "alquilar", "invertir", "mirar"]);
// Orígenes válidos del alta: el sitio propio, el tasador (tasador-sma)
// y el test de perfil inversor de /inversiones.
const SOURCES = new Set(["web", "tasador", "test-inversor"]);
// Validación de email simple y suficiente (formato básico).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    // Máx. 5 altas por minuto por IP. Además de frenar spam en la base,
    // evita que un bot dispare emails de bienvenida en masa (costo + reputación
    // del remitente). El formulario muestra el error normalmente.
    if (!rateLimit(`suscripcion:${getClientIp(request)}`, { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot: si un bot completó el campo invisible, fingimos éxito y no guardamos.
    if (body.website) return NextResponse.json({ ok: true });

    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "email_invalido" }, { status: 400 });
    }

    const interes = INTERESES.has(body.interes) ? body.interes : null;

    const source = SOURCES.has(body.source) ? body.source : "web";
    const yaExistia = await subscriberExists(email);
    await insertSubscriber({
      email,
      nombre: clamp(body.nombre, 200),
      interes,
      source,
    });

    // Email de bienvenida solo para altas nuevas, enviado después de
    // responder para no demorar al formulario.
    if (!yaExistia) {
      after(() => sendWelcomeEmail({ email, interes, source }));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/suscripcion] error al guardar suscriptor:", err);
    return NextResponse.json({ ok: false, error: "error_servidor" }, { status: 500 });
  }
}
