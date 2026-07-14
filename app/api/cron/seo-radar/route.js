import { getSeoRadar, isSearchConsoleConfigured } from "@/lib/searchConsole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSearchConsoleConfigured()) {
    return Response.json({ ok: false, error: "Search Console no está configurado" }, { status: 503 });
  }

  try {
    const radar = await getSeoRadar(28);
    console.info("[seo-radar] análisis semanal completado", {
      generatedAt: radar.generatedAt,
      analyzedRows: radar.analyzedRows,
      highPriorityCount: radar.highPriorityCount,
      topOpportunities: radar.opportunities.slice(0, 5).map(({ page, query, score }) => ({ page, query, score })),
    });
    return Response.json({ ok: true, ...radar });
  } catch (error) {
    console.error("[seo-radar] error al analizar Search Console", error);
    return Response.json({ ok: false, error: "No se pudo ejecutar el Radar SEO" }, { status: 500 });
  }
}
