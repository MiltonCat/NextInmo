import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { register } from "node:module";
register("./luciaKnowledge-loader.mjs", import.meta.url);
const { blogPosts, fechasDelPost } = await import("../lib/blogPosts.js");
const { elegirRelacionados, herramientaDelPost, GRUPOS, HERRAMIENTAS, MAX_RELACIONADOS } =
  await import("../lib/blogRelacionados.js");

// Las notas retiradas quedan como carpeta que solo redirige (permanentRedirect):
// no van en blogPosts ni en el sitemap.
const carpetas = readdirSync("app/blog", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((id) => !readFileSync(`app/blog/${id}/page.js`, "utf8").includes("permanentRedirect("));

test("cada carpeta de app/blog tiene su entrada en blogPosts y viceversa", () => {
  const ids = blogPosts.map((p) => p.id);
  assert.deepEqual([...carpetas].sort(), [...ids].sort());
});

test("cada post tiene published/updated válidos y updated >= published", () => {
  for (const p of blogPosts) {
    assert.match(p.published ?? "", /^\d{4}-\d{2}-\d{2}$/, `${p.id}: published`);
    assert.match(p.updated ?? "", /^\d{4}-\d{2}-\d{2}$/, `${p.id}: updated`);
    assert.ok(p.updated >= p.published, `${p.id}: updated anterior a published`);
    assert.ok(fechasDelPost(p.id).modificado.endsWith("-03:00"));
  }
});

test("ninguna página escribe fechas a mano ni tiene relacionados escritos a mano", () => {
  for (const id of carpetas) {
    const src = readFileSync(`app/blog/${id}/page.js`, "utf8");
    assert.doesNotMatch(src, /(datePublished|dateModified|publishedTime|modifiedTime):\s*"/, `${id}: fecha literal`);
    assert.match(src, new RegExp(`<SeguirLeyendo slug="${id}"`), `${id}: falta SeguirLeyendo`);
  }
});

test("todas las categorías tienen grupo y herramienta con una ruta existente", () => {
  for (const p of blogPosts) {
    assert.ok(GRUPOS[p.category], `categoría sin grupo: ${p.category}`);
    const h = herramientaDelPost(blogPosts, p.id);
    assert.ok(h, `${p.id}: sin herramienta`);
  }
  for (const { href } of Object.values(HERRAMIENTAS)) {
    assert.ok(existsSync(`app${href}/page.js`), `no existe la ruta ${href}`);
  }
});

test("relacionados: sin el propio post, sin repetidos, destacados primero y tope", () => {
  for (const p of blogPosts) {
    const r = elegirRelacionados(blogPosts, p.id, ["no-existe", blogPosts.at(-1).id]);
    const ids = r.map((x) => x.id);
    assert.ok(!ids.includes(p.id));
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.length <= MAX_RELACIONADOS);
    if (p.id !== blogPosts.at(-1).id) assert.equal(ids[0], blogPosts.at(-1).id);
  }
});

test("un post nuevo queda enlazado desde los de su mismo tema sin editarlos", () => {
  const nuevo = { id: "nuevo", category: "Guía legal", title: "x", image: "/x.jpg" };
  const posts = [nuevo, ...blogPosts];
  const legales = blogPosts.filter((p) => p.category === "Guía legal");
  assert.ok(legales.length > 0);
  for (const p of legales) {
    assert.ok(elegirRelacionados(posts, p.id, ["a", "b"]).some((x) => x.id === "nuevo"), p.id);
  }
});

test("recomendar: false saca el post de los automáticos pero respeta los destacados", () => {
  const posts = blogPosts.map((p, i) => (i === 0 ? { ...p, recomendar: false } : p));
  const oculto = posts[0].id;
  const otro = posts.find((p) => p.category === posts[0].category && p.id !== oculto) ?? posts[1];
  assert.ok(!elegirRelacionados(posts, otro.id).some((x) => x.id === oculto));
  assert.ok(elegirRelacionados(posts, otro.id, [oculto]).some((x) => x.id === oculto));
});

test("una guía legal no manda a notas de mercado o inversión", () => {
  for (const p of blogPosts.filter((x) => x.category === "Guía legal")) {
    const r = elegirRelacionados(blogPosts, p.id);
    assert.ok(r.length >= 2, p.id);
    assert.ok(!r.some((x) => GRUPOS[x.category] === "mercado"), `${p.id}: ${r.map((x) => x.id)}`);
  }
});

test("las notas retiradas redirigen a un post que existe y no aparecen en ningún destacado", () => {
  const retiradas = readdirSync("app/blog", { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((id) => !carpetas.includes(id));
  for (const id of retiradas) {
    const destino = readFileSync(`app/blog/${id}/page.js`, "utf8").match(/permanentRedirect\("\/blog\/([a-z0-9-]+)\/?"\)/)?.[1];
    assert.ok(blogPosts.some((p) => p.id === destino), `${id} redirige a algo que no existe`);
    for (const c of carpetas) {
      assert.ok(!readFileSync(`app/blog/${c}/page.js`, "utf8").includes(`"${id}"`), `${c} todavía destaca a ${id}`);
    }
  }
});
