import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLuciaKnowledge } from "@/lib/luciaKnowledge";
import { askOpenAILucia } from "@/lib/luciaOpenAI";
import { registrarPregunta } from "@/lib/luciaPreguntas";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = new Set(["user", "assistant"]);

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-8)
    .map((item) => ({
      role: ALLOWED_ROLES.has(item?.role) ? item.role : null,
      content: clamp(item?.content, 700),
    }))
    .filter((item) => item.role && item.content);
}

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`lucia:minuto:${ip}`, { limit: 12, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  if (!rateLimit(`lucia:dia:${ip}`, { limit: 200, windowMs: 86_400_000 })) {
    return NextResponse.json({ ok: false, error: "daily_limit" }, { status: 429 });
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

  const history = cleanHistory(body?.history);
  const pagePath = clamp(body?.pagePath, 240) || null;
  const knowledge = await buildLuciaKnowledge(question);
  const answer = await askOpenAILucia({ question, history, context: knowledge.context });

  // Cada pregunta es una búsqueda real sobre San Martín escrita por una
  // persona: es el insumo para decidir qué contenido falta en el sitio. Se
  // guarda también cuando la respuesta falla — esas son las que más interesan.
  //
  // Va dentro de after(): la escritura corre DESPUÉS de que la respuesta salió,
  // así el visitante no espera por la base, pero la función no se congela antes
  // de terminarla —que es lo que pasa con un fire-and-forget suelto en Vercel—.
  // registrarPregunta además no lanza nunca.
  const guardar = (extra) => after(() => registrarPregunta({ pregunta: question, pagePath, ...extra }));

  if (!answer.ok) {
    guardar({ respondida: false, error: answer.reason });
    const status = answer.reason === "not_configured" ? 503 : 502;
    return NextResponse.json({ ok: false, error: answer.reason }, { status });
  }

  const answerId = randomUUID();
  guardar({
    respondida: true,
    answerId,
    fuentes: knowledge.sources.length,
    model: answer.model,
  });

  return NextResponse.json({
    ok: true,
    answer: answer.text,
    answerId,
    model: answer.model,
    sources: knowledge.sources,
  });
}
