// Mail mensual de "Seguí el valor de tu propiedad".
//
// Corre todos los días (vercel.json) y procesa los seguimientos que ya
// cumplieron su mes: vuelve a tasar la propiedad con el modelo, suma cómo se
// movió el barrio según el índice mensual y manda el correo.
//
// La API del modelo vive en Render gratis y se duerme: primero se la despierta
// y después se tasa de a uno, cortando antes de que se acabe el tiempo de la
// función. Lo que no entra hoy queda para mañana; si el modelo falla para una
// propiedad, esa se pospone un día en vez de esperar otro mes.
//
// Auth: Bearer con CRON_SECRET, igual que los otros crons.
import { NextResponse } from "next/server";
import { despertarModelo, tasar } from "@/lib/tasador";
import { movimientoDelBarrio, posponer, registrarEnvio, seguimientosPendientes } from "@/lib/seguimientoValor";
import { enviarMailSeguimiento } from "@/lib/emailSeguimiento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Margen para no quedar a mitad de una tasación cuando Vercel corta a los 60 s.
const PRESUPUESTO_MS = 45_000;
const POR_CORRIDA = 10;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "no_autorizado" }, { status: 401 });
  }

  const inicio = Date.now();
  const informe = { enviados: 0, pospuestos: 0, errores: 0, pendientes: 0 };

  try {
    const pendientes = await seguimientosPendientes(POR_CORRIDA);
    informe.pendientes = pendientes.length;
    if (!pendientes.length) return NextResponse.json({ ok: true, ...informe });

    await despertarModelo(pendientes[0].ciudad);
    const historias = new Map();

    for (const seguimiento of pendientes) {
      if (Date.now() - inicio > PRESUPUESTO_MS) break;
      try {
        const respuesta = await tasar(seguimiento.payload);
        if (!respuesta.ok) {
          await posponer(seguimiento.id);
          informe.pospuestos += 1;
          continue;
        }
        const barrio = await movimientoDelBarrio(seguimiento.ciudad, seguimiento.barrio, seguimiento.tipo, historias);
        await enviarMailSeguimiento({ seguimiento, resultado: respuesta.resultado, barrio });
        await registrarEnvio(seguimiento.id, respuesta.resultado);
        informe.enviados += 1;
      } catch (err) {
        console.error(`[cron/seguimiento-valor] seguimiento ${seguimiento.id}:`, err);
        await posponer(seguimiento.id).catch(() => {});
        informe.errores += 1;
      }
    }

    return NextResponse.json({ ok: true, ...informe });
  } catch (err) {
    console.error("[cron/seguimiento-valor] error:", err);
    return NextResponse.json({ ok: false, error: "error_servidor", ...informe }, { status: 500 });
  }
}
