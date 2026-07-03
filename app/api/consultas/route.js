// Endpoint público de captura de consultas del mini-CRM.
// Los formularios de la web lo llaman (fire-and-forget) antes de abrir WhatsApp
// o mandar el email, para que el lead quede guardado pase lo que pase.
// Defensas: honeypot (bots tontos), rate limit por IP (bots insistentes) y
// largo máximo por campo (payloads basura).
import { NextResponse } from "next/server";
import { insertInquiry } from "@/lib/crm";
import { rateLimit, getClientIp, clamp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS = new Set(["tasacion", "propiedad", "visita", "contacto"]);

export async function POST(request) {
  try {
    // Máx. 10 consultas por minuto por IP: ningún usuario real llega a eso.
    // (El formulario es fire-and-forget, así que el 429 no rompe la UX.)
    if (!rateLimit(`consultas:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot: si un bot completó el campo invisible, fingimos éxito y no guardamos.
    if (body.website) return NextResponse.json({ ok: true });

    if (!TIPOS.has(body.tipo) || !body.nombre?.trim()) {
      return NextResponse.json({ ok: false, error: "datos_invalidos" }, { status: 400 });
    }

    // detalle: solo objetos chicos (evita guardar JSON arbitrario gigante).
    let detalle = body.detalle && typeof body.detalle === "object" ? body.detalle : {};
    if (JSON.stringify(detalle).length > 10_000) detalle = {};

    await insertInquiry({
      tipo: body.tipo,
      nombre: clamp(body.nombre, 200),
      telefono: clamp(body.telefono, 50),
      email: clamp(body.email, 200),
      mensaje: clamp(body.mensaje, 5000),
      property_id: Number.isFinite(Number(body.property_id)) && body.property_id != null
        ? Number(body.property_id) : null,
      property_title: clamp(body.property_title, 300),
      detalle,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Nunca rompemos la UX del formulario: logueamos y devolvemos ok.
    console.error("[/api/consultas] error al guardar lead:", err);
    return NextResponse.json({ ok: true });
  }
}
