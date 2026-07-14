// Motor puro del Radar SEO. No modifica páginas: transforma datos de Search
// Console en oportunidades priorizadas para revisión humana.

const BRAND_QUERY = /\b(catal[aá]n|milton|denise|ximena)\b/i;
const COMMERCIAL_QUERY = /(inmobiliari|propiedad|casa|departamento|monoambiente|lote|terreno|alquiler|comprar|venta|vender|tasar|tasaci[oó]n|precio|m2|m²|cr[eé]dito|hipotec|invertir|inversi[oó]n|rentabilidad|roi)/i;
const HIGH_INTENT_QUERY = /(comprar|venta|alquiler|tasar|tasaci[oó]n|precio|cr[eé]dito|hipotec|invertir|inversi[oó]n|rentabilidad|roi)/i;

function expectedCtr(position) {
  if (position <= 3) return 0.12;
  if (position <= 5) return 0.08;
  if (position <= 10) return 0.05;
  if (position <= 15) return 0.025;
  return 0.015;
}

function pagePath(url) {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url || "/";
  }
}

function rowKey(row) {
  return `${row.keys?.[0] || ""}\n${row.keys?.[1] || ""}`;
}

function recommendationFor({ query, page, ctrGap, position, clicks }) {
  if (/cr[eé]dito|hipotec/i.test(query)) {
    return "Revisar que título y descripción destaquen bancos, tasas, requisitos y fecha de actualización.";
  }
  if (/alquiler/i.test(query)) {
    return "Alinear el título con “alquiler permanente” y reforzar disponibilidad y contacto desde la página.";
  }
  if (/monoambiente|departamento|casa|lote|terreno/i.test(query)) {
    return "Reforzar esta búsqueda en el título, el H1 o un bloque de contenido y enlazar a las propiedades relacionadas.";
  }
  if (page === "/" && /inmobiliari/i.test(query)) {
    return "Mantener la búsqueda principal al comienzo del título y reforzar confianza local en la descripción.";
  }
  if (ctrGap >= 0.5 || clicks === 0) {
    return "Probar un título y una descripción más específicos para esta búsqueda, sin cambiar la URL.";
  }
  if (position > 10) {
    return "Agregar contenido útil y enlaces internos relacionados para intentar entrar al top 10.";
  }
  return "Revisar el snippet y la intención de búsqueda antes de hacer un cambio controlado.";
}

export function buildSeoRadar(currentRows = [], previousRows = [], rangeDays = 28) {
  const previousByKey = new Map(previousRows.map((row) => [rowKey(row), row]));

  const opportunities = currentRows
    .map((row) => {
      const page = pagePath(row.keys?.[0]);
      const query = row.keys?.[1] || "";
      const impressions = Number(row.impressions || 0);
      const clicks = Number(row.clicks || 0);
      const ctr = Number(row.ctr || 0);
      const position = Number(row.position || 0);
      const previous = previousByKey.get(rowKey(row));
      const previousImpressions = Number(previous?.impressions || 0);
      const targetCtr = expectedCtr(position);
      const ctrGap = Math.max(0, targetCtr - ctr) / targetCtr;
      const trend = previousImpressions > 0
        ? (impressions - previousImpressions) / previousImpressions
        : impressions > 0 ? 1 : 0;
      const intentWeight = HIGH_INTENT_QUERY.test(query) ? 1.35 : COMMERCIAL_QUERY.test(query) ? 1.1 : 0.85;
      const positionWeight = position <= 10 ? 1.25 : position <= 15 ? 1.1 : 0.9;
      const trendWeight = 1 + Math.max(-0.2, Math.min(0.35, trend * 0.2));
      const rawScore = Math.log1p(impressions) * 15 * (0.45 + ctrGap) * intentWeight * positionWeight * trendWeight;
      const score = Math.max(1, Math.min(100, Math.round(rawScore)));

      return {
        page,
        query,
        clicks,
        impressions,
        ctr,
        position,
        expectedCtr: targetCtr,
        ctrGap,
        previousImpressions,
        trend,
        score,
        priority: score >= 70 ? "alta" : score >= 45 ? "media" : "baja",
        recommendation: recommendationFor({ query, page, ctrGap, position, clicks }),
      };
    })
    .filter((item) =>
      item.query.length >= 3 &&
      !BRAND_QUERY.test(item.query) &&
      item.impressions >= 4 &&
      item.position >= 3 &&
      item.position <= 20 &&
      (COMMERCIAL_QUERY.test(item.query) || item.impressions >= 20) &&
      (item.ctrGap > 0.15 || item.clicks === 0)
    )
    .sort((a, b) => b.score - a.score || b.impressions - a.impressions)
    .slice(0, 12);

  return {
    rangeDays,
    generatedAt: new Date().toISOString(),
    analyzedRows: currentRows.length,
    highPriorityCount: opportunities.filter((item) => item.priority === "alta").length,
    opportunities,
  };
}
