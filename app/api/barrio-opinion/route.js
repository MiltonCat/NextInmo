// Endpoint público de la Guía de Barrios.
// Reemplaza el envío a Web3Forms: antes cada respuesta terminaba como un email
// suelto y el dataset no se construía nunca. Ahora se guarda estructurada, en
// estado 'pendiente', y se publica solo tras moderación.
//
// Defensas: honeypot (bots tontos), rate limit por IP (bots insistentes),
// tope diario por origen (alguien inflando un barrio a mano) y largo máximo por
// campo (payloads basura).
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp, clamp } from "@/lib/rateLimit";
import { SLUGS_VALIDOS, BARRIO_OTRO } from "@/lib/barrios";
import { insertOpinion, contarPorIpReciente } from "@/lib/barrioOpiniones";
import {
  DIMENSION_KEYS,
  RELACIONES,
  ANTIGUEDADES,
  PERFILES,
  REC_OPCIONES,
} from "@/lib/barrioEncuesta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELACIONES_OK = new Set(RELACIONES.map((r) => r.value));
const ANTIGUEDADES_OK = new Set(ANTIGUEDADES.map((a) => a.value));
const REC_OK = new Set(REC_OPCIONES.map((r) => r.value));
const PERFILES_OK = new Set(PERFILES);

// Máximo de opiniones por origen en 24 h. Una familia con IP compartida puede
// mandar varias legítimamente; 6 corta la carga masiva sin molestar a nadie real.
const TOPE_DIARIO = 6;

// Hash con sal del lado servidor: guardamos el hash, nunca la IP.
function hashIp(ip) {
  const sal = process.env.IP_HASH_SALT || process.env.SUPABASE_SECRET_KEY || "";
  return createHash("sha256").update(`${sal}:${ip}`).digest("hex").slice(0, 32);
}

// Puntaje 1..5 o null. Nunca guardamos un 0 ni un valor fuera de rango.
function puntaje(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function booleanoONull(valor) {
  return typeof valor === "boolean" ? valor : null;
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    if (!rateLimit(`barrio-opinion:${ip}`, { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot: si un bot completó el campo invisible, fingimos éxito y no guardamos.
    if (body.website) return NextResponse.json({ ok: true });

    // ── Validación de los campos obligatorios ────────────────────────────
    const barrio = String(body.barrio || "").trim();
    if (!SLUGS_VALIDOS.has(barrio)) {
      return NextResponse.json({ ok: false, error: "barrio_invalido" }, { status: 400 });
    }
    if (!RELACIONES_OK.has(body.relacion)) {
      return NextResponse.json({ ok: false, error: "relacion_invalida" }, { status: 400 });
    }
    if (!ANTIGUEDADES_OK.has(body.antiguedad)) {
      return NextResponse.json({ ok: false, error: "antiguedad_invalida" }, { status: 400 });
    }

    // Al menos una dimensión puntuada: si no, la respuesta no aporta nada al
    // dataset y solo ensucia la moderación.
    const dimensiones = {};
    for (const key of DIMENSION_KEYS) dimensiones[key] = puntaje(body[key]);
    if (DIMENSION_KEYS.every((k) => dimensiones[k] === null)) {
      return NextResponse.json({ ok: false, error: "sin_puntajes" }, { status: 400 });
    }

    const ipHash = hashIp(ip);

    // Tope diario por origen. Si falla la consulta no bloqueamos el alta: es
    // preferible aceptar una opinión de más que perder una legítima.
    try {
      if ((await contarPorIpReciente(ipHash)) >= TOPE_DIARIO) {
        return NextResponse.json({ ok: false, error: "tope_diario" }, { status: 429 });
      }
    } catch (err) {
      console.error("[/api/barrio-opinion] no se pudo verificar el tope diario:", err);
    }

    const perfiles = Array.isArray(body.perfiles)
      ? body.perfiles.filter((p) => PERFILES_OK.has(p)).slice(0, PERFILES.length)
      : [];

    await insertOpinion({
      barrio,
      barrio_otro: barrio === BARRIO_OTRO ? clamp(body.barrio_otro, 120) : null,
      relacion: body.relacion,
      antiguedad: body.antiguedad,
      ...dimensiones,
      rec_vivir: REC_OK.has(body.rec_vivir) ? body.rec_vivir : null,
      rec_invertir: REC_OK.has(body.rec_invertir) ? body.rec_invertir : null,
      volveria_elegir: booleanoONull(body.volveria_elegir),
      sin_auto: booleanoONull(body.sin_auto),
      perfiles,
      cita: clamp(body.cita, 280),
      nombre: clamp(body.nombre, 120),
      email: clamp(body.email, 200),
      quiere_informe: Boolean(body.quiere_informe),
      ip_hash: ipHash,
      user_agent: clamp(request.headers.get("user-agent"), 300),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Acá sí devolvemos error: a diferencia del CRM (fire-and-forget), el
    // visitante invirtió dos minutos y merece saber si su respuesta no se guardó.
    console.error("[/api/barrio-opinion] error al guardar opinión:", err);
    return NextResponse.json({ ok: false, error: "error_servidor" }, { status: 500 });
  }
}
