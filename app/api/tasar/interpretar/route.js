import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getBarrios } from "@/lib/tasador";
import { extraerDatosTasacion } from "@/lib/luciaExtraerTasacion";

export const runtime = "nodejs";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`tasacion_interpretar:${ip}`, { limit: 8, windowMs: 60000 })
    || !rateLimit(`tasacion_interpretar_dia:${ip}`, { limit: 60, windowMs: 86400000 })) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (!Array.isArray(body?.mensajes) || !body.mensajes.length || body.mensajes.length > 8
    || body.mensajes.some((m) => typeof m !== "string" || m.length > 1000)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const barrios = await getBarrios("sma");
  const resultado = await extraerDatosTasacion(body.mensajes, barrios, request.signal);
  return NextResponse.json({ ok: true, barrios, ...resultado }, { headers: { "Cache-Control": "no-store" } });
}
