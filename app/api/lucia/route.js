import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLuciaKnowledge } from "@/lib/luciaKnowledge";
import { askOpenAILucia } from "@/lib/luciaOpenAI";
import { registrarPregunta } from "@/lib/luciaPreguntas";
import { normalizarTasacion } from "@/lib/luciaTasacion.mjs";
import { barriosDelGrafico, graficoParaConsulta, serieDelGrafico } from "@/lib/luciaGraficos";
import {
  EVOLUCION_SERIE,
  EVOLUCION_VARIACION_TOTAL,
  M2_POR_BARRIO,
  MERCADO_GENERADO,
} from "@/lib/mercado";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";

// Un grafico se manda solo cuando la pregunta es de las que un grafico contesta
// mejor que una frase, y siempre al lado de la respuesta escrita. La nota al pie
// no es decorativa: sin la fecha y el respaldo, una mediana de agosto se lee
// como el precio de hoy.
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const [ANIO_DATOS, MES_DATOS] = (MERCADO_GENERADO || "").split("-").map(Number);
const FECHA_DATOS = MES_DATOS ? `${MESES[MES_DATOS - 1]} de ${ANIO_DATOS}` : "el ultimo relevamiento";

function graficoParaRespuesta(question) {
  const tipo = graficoParaConsulta(question);
  if (!tipo) return null;

  if (tipo === "evolucion") {
    const serie = serieDelGrafico(EVOLUCION_SERIE);
    if (serie.length < 2) return null;
    const variacion = EVOLUCION_VARIACION_TOTAL;
    return {
      tipo,
      titulo: "Precio del m² publicado, año a año",
      serie,
      nota: variacion
        ? `Serie de referencia de mercado · ${String(variacion).replace(".", ",")} % entre ${serie[0].anio} y ${serie[serie.length - 1].anio}`
        : "Serie de referencia de mercado",
    };
  }

  const barrios = barriosDelGrafico(M2_POR_BARRIO, question);
  if (barrios.length < 2) return null;
  const relevadas = barrios.reduce((total, b) => total + (b.relevadas || 0), 0);
  return {
    tipo,
    titulo: "Precio del m² publicado, por barrio",
    barrios,
    nota: `Mediana de publicación sobre ${relevadas.toLocaleString("es-AR")} propiedades relevadas · ${FECHA_DATOS}. Son precios publicados, no de cierre.`,
  };
}

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
  // La tasación la manda el navegador, así que se valida campo por campo como
  // cualquier otra entrada. Si no pasa, vale null y la charla sigue sin ella:
  // preferible a que Lucía hable de "tu tasación" con datos a medias.
  const tasacion = normalizarTasacion(body?.tasacion);
  if (body?.stream === true) {
    const encoder = new TextEncoder();
    const abort = new AbortController();
    const answerId = randomUUID();
    let result = { respondida: false, error: "cancelled" };
    let finish;
    const finished = new Promise((resolve) => { finish = resolve; });
    after(async () => {
      await finished;
      await registrarPregunta({ pregunta: question, pagePath, interno: body?.interno === true, ...result });
    });
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (event) => {
          if (!abort.signal.aborted) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };
        try {
          emit({ type: "status", text: "Consultando información de la web" });
          const knowledge = await buildLuciaKnowledge(question, history, { tasacion });
          if (abort.signal.aborted || request.signal.aborted) return;
          emit({ type: "status", text: "Preparando tu respuesta" });
          const answer = await askOpenAILucia({
            question, history, context: knowledge.context,
            primeraRespuesta: body?.primeraRespuesta === true,
            signal: AbortSignal.any([abort.signal, request.signal]),
            onDelta: (text) => emit({ type: "delta", text }),
          });
          if (!answer.ok) {
            result = { respondida: false, error: answer.reason };
            emit({ type: "error", error: answer.reason });
          } else {
            result = { respondida: true, answerId, fuentes: knowledge.sources.length, model: answer.model };
            emit({ type: "done", ok: true, answer: answer.text, answerId, model: answer.model, sources: knowledge.sources, grafico: graficoParaRespuesta(question) });
          }
        } catch {
          result = { respondida: false, error: "stream_error" };
          if (!abort.signal.aborted) emit({ type: "error", error: "stream_error" });
        } finally {
          finish();
          if (!abort.signal.aborted) controller.close();
        }
      },
      cancel() { abort.abort(); },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
  }
  const knowledge = await buildLuciaKnowledge(question, history, { tasacion });
  const answer = await askOpenAILucia({
    question,
    history,
    context: knowledge.context,
    primeraRespuesta: body?.primeraRespuesta === true,
  });

  // Cada pregunta es una búsqueda real sobre San Martín escrita por una
  // persona: es el insumo para decidir qué contenido falta en el sitio. Se
  // guarda también cuando la respuesta falla — esas son las que más interesan.
  //
  // Va dentro de after(): la escritura corre DESPUÉS de que la respuesta salió,
  // así el visitante no espera por la base, pero la función no se congela antes
  // de terminarla —que es lo que pasa con un fire-and-forget suelto en Vercel—.
  // registrarPregunta además no lanza nunca.
  const interno = body?.interno === true;
  const guardar = (extra) =>
    after(() => registrarPregunta({ pregunta: question, pagePath, interno, ...extra }));

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
    grafico: graficoParaRespuesta(question),
  });
}
