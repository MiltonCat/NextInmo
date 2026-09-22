// Modo sombra de Jev. El navegador avisa acá cada frase escrita, junto con la
// ruta que ya tomó el router actual. Se contesta al instante y la comparación
// corre después, en after(): el visitante no espera ni ve nada distinto.
//
// Apagado por defecto: sin LUCIA_JEV_SOMBRA=1 y JEV_API_KEY devuelve 204 y no
// llama a nadie.
import { NextResponse, after } from "next/server";
import { RUTAS_REALES, procesarSombra, sombraActiva } from "@/lib/luciaSombra";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!sombraActiva()) return new Response(null, { status: 204 });

  const ip = getClientIp(request);
  if (!rateLimit(`lucia-sombra:${ip}`, { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const question = clamp(body?.question, 600);
  if (!question || question.length < 2) {
    return NextResponse.json({ ok: false, error: "invalid_question" }, { status: 400 });
  }
  const rutaReal = RUTAS_REALES.has(body?.ruta) ? body.ruta : null;
  if (!rutaReal) return NextResponse.json({ ok: false, error: "invalid_route" }, { status: 400 });

  after(() =>
    procesarSombra({
      question,
      history: Array.isArray(body?.history) ? body.history : [],
      paso: clamp(body?.paso, 40) || "welcome",
      rutaReal,
      pagePath: clamp(body?.pagePath, 240) || null,
      interno: body?.interno === true,
    })
  );

  return NextResponse.json({ ok: true }, { status: 202 });
}
