import { NextResponse } from "next/server";
import { clamp, getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Le pone voz a una respuesta de Lucía. El cliente manda el texto que ya está
// en pantalla y recibe un MP3; no se guarda nada todavía. La caché (hash del
// texto → Supabase Storage) es la etapa 3, y solo se hace si el evento
// "lucia_audio_play" muestra que la gente lo usa.
const ENDPOINT = "https://api.fish.audio/v1/tts";

// "Locutora", de Camila vm. La eligió Milton el 04/09/2026 entre diez voces.
// Se puede pisar con FISH_AUDIO_VOZ sin tocar el código —sirve para probar
// otra voz en producción sin desplegar—.
const VOZ_POR_OMISION = "adde5b3c2b5e47f5b5601fe35856d3ba";

// El modelo viaja como header, no en el cuerpo. Si el valor no se reconoce,
// Fish cae SILENCIOSAMENTE al modelo pago: no tocar sin mirar la factura.
const MODELO_GRATIS = "s2.1-pro-free";

// El tope no es por el costo (una respuesta larga sale menos de un centavo):
// es para que nadie use esta ruta como su propio conversor de texto a voz.
// Las respuestas de Lucía rondan los 270 caracteres.
const MAX_CARACTERES = 700;

// Si Fish tarda más que esto, el botón muestra el error y el visitante sigue
// leyendo. Vale más un botón que falla rápido que un chat congelado.
const TIMEOUT_MS = 20_000;

export async function POST(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`lucia-voz:minuto:${ip}`, { limit: 15, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  if (!rateLimit(`lucia-voz:dia:${ip}`, { limit: 150, windowMs: 86_400_000 })) {
    return NextResponse.json({ ok: false, error: "daily_limit" }, { status: 429 });
  }

  const apiKey = process.env.FISH_AUDIO_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const texto = clamp(body?.texto, MAX_CARACTERES);
  if (!texto || texto.length < 2) {
    return NextResponse.json({ ok: false, error: "invalid_text" }, { status: 400 });
  }

  const controlador = new AbortController();
  const reloj = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: MODELO_GRATIS,
      },
      body: JSON.stringify({
        text: texto,
        reference_id: process.env.FISH_AUDIO_VOZ || VOZ_POR_OMISION,
        // Volvió a 0.7 (el valor por omisión de Fish) el 22/09/2026: con 0.9 el
        // modelo muestreaba de más y en respuestas largas metía palabras que no
        // estaban en el texto. La monotonía de 0.7 se arregla con la voz, no
        // subiendo el azar.
        temperature: 0.7,
        top_p: 0.7,
        format: "mp3",
        // 64 kbps alcanza de sobra para voz hablada y pesa la mitad que 128.
        // En un celular con datos, la mitad de peso es la mitad de espera.
        mp3_bitrate: 64,
        // "normal" y no "balanced": balanced baja la calidad del modelo y, sumado
        // a la temperatura alta, producía palabras inventadas (22/09/2026).
        // Cuesta uno o dos segundos más; se prefiere a que diga cualquier cosa.
        latency: "normal",
        prosody: { speed: 1, normalize_loudness: true },
      }),
    });

    if (!respuesta.ok) {
      // El cuerpo trae el motivo real (key vencida, voz borrada del catálogo,
      // sin crédito). Sin esto solo se ve un número y se pierde media hora.
      const detalle = await respuesta.text().catch(() => "");
      console.error(`[/api/lucia-voz] HTTP ${respuesta.status} — ${detalle.slice(0, 300)}`);
      return NextResponse.json({ ok: false, error: "tts_failed" }, { status: 502 });
    }

    const audio = await respuesta.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const motivo = error?.name === "AbortError" ? "timeout" : "server_error";
    console.error(`[/api/lucia-voz] ${motivo}:`, error?.message || error);
    return NextResponse.json({ ok: false, error: motivo }, { status: 504 });
  } finally {
    clearTimeout(reloj);
  }
}
