import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLuciaKnowledge } from "@/lib/luciaKnowledge";
import { askOpenAILucia } from "@/lib/luciaOpenAI";
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
  const knowledge = await buildLuciaKnowledge(question);
  const answer = await askOpenAILucia({ question, history, context: knowledge.context });

  if (!answer.ok) {
    const status = answer.reason === "not_configured" ? 503 : 502;
    return NextResponse.json({ ok: false, error: answer.reason }, { status });
  }

  return NextResponse.json({
    ok: true,
    answer: answer.text,
    answerId: randomUUID(),
    model: answer.model,
    sources: knowledge.sources,
  });
}
