// Registra una frase que la persona escribio y que el router mando al arbol
// guiado, asi que NUNCA paso por la IA. Existe para no perderlas: una busqueda
// escrita con las palabras de alguien ("busco algo con vista al lago hasta 200
// mil") dice tanto sobre lo que falta en el sitio como una pregunta.
//
// No llama a OpenAI ni contesta nada: solo escribe. Ver lib/luciaPreguntas.js
// para lo que se le borra al texto antes de guardarlo.
import { NextResponse } from "next/server";
import { registrarPregunta } from "@/lib/luciaPreguntas";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`lucia-frase:${ip}`, { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const question = clamp(body?.question, 600);
    if (!question || question.length < 2) {
      return NextResponse.json({ ok: false, error: "invalid_question" }, { status: 400 });
    }
    await registrarPregunta({
      pregunta: question,
      pagePath: clamp(body?.pagePath, 240) || null,
      ruta: "guiado",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/lucia-frase] error:", error?.message || error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
