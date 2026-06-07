// Endpoint público de captura de consultas del mini-CRM.
// Los formularios de la web lo llaman (fire-and-forget) antes de abrir WhatsApp
// o mandar el email, para que el lead quede guardado pase lo que pase.
import { NextResponse } from "next/server";
import { insertInquiry } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS = new Set(["tasacion", "propiedad", "visita", "contacto"]);

export async function POST(request) {
  try {
    const body = await request.json();

    // Honeypot: si un bot completó el campo invisible, fingimos éxito y no guardamos.
    if (body.website) return NextResponse.json({ ok: true });

    if (!TIPOS.has(body.tipo) || !body.nombre?.trim()) {
      return NextResponse.json({ ok: false, error: "datos_invalidos" }, { status: 400 });
    }

    await insertInquiry({
      tipo: body.tipo,
      nombre: body.nombre?.trim() || null,
      telefono: body.telefono?.trim() || null,
      email: body.email?.trim() || null,
      mensaje: body.mensaje?.trim() || null,
      property_id: Number.isFinite(Number(body.property_id)) && body.property_id != null
        ? Number(body.property_id) : null,
      property_title: body.property_title?.trim() || null,
      detalle: body.detalle && typeof body.detalle === "object" ? body.detalle : {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Nunca rompemos la UX del formulario: logueamos y devolvemos ok.
    console.error("[/api/consultas] error al guardar lead:", err);
    return NextResponse.json({ ok: true });
  }
}
