// Golpecito al modelo para que Render levante el contenedor mientras la
// persona completa el formulario.
//
// Existe como ruta propia y no como parte de /api/tasar porque no tasa nada:
// no recibe datos, no devuelve un número y no toca el conteo de tasaciones
// gratis. Lo único que informa es si el modelo está en pie, que es lo que la
// UI necesita para mostrar el estado de espera en vez de un spinner mudo.
//
// La URL del modelo sigue sin salir al navegador: el golpecito lo da el
// servidor, igual que la tasación.
import { NextResponse } from "next/server";
import { despertarModelo } from "@/lib/tasador";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Arrancar el contenedor dormido puede llevar cerca de un minuto y el tope por
// defecto de una función es bastante menor. Sin esto, el warmup se cortaría
// solo justo en el caso para el que existe.
export const maxDuration = 60;

export async function GET(request) {
  // Holgado para una persona que recarga o abre el tasador en dos pestañas, y
  // suficiente para que nadie use esta ruta para martillar la API del modelo.
  if (!rateLimit(`despertar:${getClientIp(request)}`, { limit: 6, windowMs: 60_000 })) {
    return NextResponse.json({ despierto: false }, { status: 429 });
  }

  const despierto = await despertarModelo();
  return NextResponse.json({ despierto });
}
