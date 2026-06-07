// Endpoint público de alta de suscriptores ("sé el primero en enterarte").
// A diferencia de /api/consultas (fire-and-forget), acá SÍ devolvemos el
// resultado para que el formulario muestre confirmación o error al instante.
import { NextResponse } from "next/server";
import { insertSubscriber } from "@/lib/suscriptores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTERESES = new Set(["comprar", "alquilar", "invertir", "mirar"]);
// Validación de email simple y suficiente (formato básico).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();

    // Honeypot: si un bot completó el campo invisible, fingimos éxito y no guardamos.
    if (body.website) return NextResponse.json({ ok: true });

    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "email_invalido" }, { status: 400 });
    }

    const interes = INTERESES.has(body.interes) ? body.interes : null;

    await insertSubscriber({
      email,
      nombre: body.nombre?.trim() || null,
      interes,
      source: "web",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/suscripcion] error al guardar suscriptor:", err);
    return NextResponse.json({ ok: false, error: "error_servidor" }, { status: 500 });
  }
}
