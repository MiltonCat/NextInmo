import test from "node:test";
import assert from "node:assert/strict";
import { indexarSitio } from "../lib/indexadorSitio.mjs";

const SITIO = "https://sitio.test";
const SB = "https://sb.test";
const url = (i) => `${SITIO}/blog/nota-${i}/`;

// fetch simulado: sitemap, filas previas en Supabase y páginas cortas (se omiten,
// así la prueba mide solo la limpieza y no gasta embeddings).
function simular(t, { previas, enSitemap }) {
  const borradas = [];
  t.mock.method(globalThis, "fetch", async (destino, init = {}) => {
    const u = String(destino);
    const ok = (cuerpo) => new Response(typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo), { status: 200 });
    if (u === `${SITIO}/sitemap.xml`) return ok(enSitemap.map((x) => `<url><loc>${x}</loc></url>`).join(""));
    if (u.startsWith(`${SB}/rest/v1/`)) {
      if (init.method === "DELETE") { borradas.push(decodeURIComponent(u.split("url=eq.")[1])); return ok(""); }
      if (u.includes("orden=eq.0")) return ok(previas.map((x) => ({ url: x, pagina_hash: "h", actualizado_at: "2026-09-01" })));
      if (u.includes("url=like.casa")) return ok([]);
    }
    return ok("<html><body>corta</body></html>");
  });
  return borradas;
}

const opciones = { sitio: SITIO, supabaseUrl: SB, secret: "s", openaiKey: "k" };

test("una página que sale del sitemap se borra del índice", async (t) => {
  const previas = Array.from({ length: 10 }, (_, i) => url(i));
  const borradas = simular(t, { previas, enSitemap: previas.filter((x) => x !== url(3)) });
  const r = await indexarSitio(opciones);
  assert.deepEqual(borradas, [url(3)]);
  assert.equal(r.paginasRetiradas, 1);
});

test("si el sitemap llega recortado no se borra nada", async (t) => {
  const previas = Array.from({ length: 10 }, (_, i) => url(i));
  const borradas = simular(t, { previas, enSitemap: previas.slice(0, 5) });
  const r = await indexarSitio(opciones);
  assert.deepEqual(borradas, []);
  assert.ok(r.omitidas.some((x) => x.startsWith("limpieza suspendida")));
});

test("en modo soloVer no se borra nada", async (t) => {
  const previas = [url(1), url(2)];
  const borradas = simular(t, { previas, enSitemap: [url(1)] });
  await indexarSitio({ ...opciones, soloVer: true });
  assert.deepEqual(borradas, []);
});
