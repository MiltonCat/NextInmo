// Endpoint de solo lectura que devuelve la foto de analítica del sitio
// (GA4 + Search Console) en un único JSON.
//
// Existe para que la revisión diaria pueda hacerse desde afuera —el skill
// /revision-web— sin bajar las credenciales de Google a una máquina local:
// corre en Vercel, donde GA_PRIVATE_KEY y compañía ya viven.
//
// El armado del payload vive en `lib/revisionWeb.js` porque lo comparte con
// `/api/cron/revision-web-mail`, que manda esta misma foto por correo.
//
// Auth: Bearer con CRON_SECRET, el mismo esquema que /api/cron/seo-radar.
// No usa requireUser porque eso hace redirect() al login, útil en páginas e
// inservible para un cliente que espera JSON.
//
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        "https://<tu-dominio>/api/revision-web?dias=7"

import { construirRevisionWeb, normalizarDias } from "@/lib/revisionWeb";

// La API de GA4 usa gRPC: necesita runtime Node y datos siempre frescos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const dias = normalizarDias(new URL(request.url).searchParams.get("dias"));

  return Response.json(await construirRevisionWeb(dias));
}
