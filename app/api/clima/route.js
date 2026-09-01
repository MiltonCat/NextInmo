// Endpoint público del clima de San Martín, para el asistente Lucía.
//
// Es delgado a propósito: toda la lógica y la regla de "sin dato no se inventa
// nada" viven en lib/clima.js. Acá solo queda el contrato con el navegador.
//
// Público como /api/salud: no hay nada que proteger en un pronóstico. El rate
// limit está por las dudas de un loop en el cliente, no por seguridad; la
// llamada a Open-Meteo ya está cacheada media hora, así que ni siquiera pega
// afuera en cada pedido.
import { NextResponse } from "next/server";
import { climaSanMartin, CLIMA_REVALIDATE } from "@/lib/clima";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET(request) {
  if (!rateLimit(`clima:${getClientIp(request)}`, { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const clima = await climaSanMartin();

  // 200 con ok:false, no un 5xx: que Open-Meteo esté caída no es un error del
  // sitio, y el chat solo necesita saber que no hay dato para no decir nada.
  if (!clima) return NextResponse.json({ ok: false }, { status: 200 });

  return NextResponse.json(
    { ok: true, ...clima },
    { headers: { "Cache-Control": `public, max-age=0, s-maxage=${CLIMA_REVALIDATE}` } }
  );
}
