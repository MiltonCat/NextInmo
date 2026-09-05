import test from "node:test";
import assert from "node:assert/strict";
import { consultaConHistoria, empaquetarContexto, pideTasacion } from "../lib/luciaContexto.mjs";

test("recupera el tema para pedir fuentes sin contaminar un cambio de tema", () => {
  const history = [{ role: "user", content: "Quiero invertir para obtener renta" }, { role: "assistant", content: "Respuesta" }];
  assert.match(consultaConHistoria("¿De dónde sale ese dato?", history), /invertir/);
  assert.equal(consultaConHistoria("Quién es Carolina", history), "Quién es Carolina");
});

test("al recortar contexto no deja referencias a contenido descartado", () => {
  const source = { title: "Inversiones", href: "/inversiones/" };
  const result = empaquetarContexto([
    { topic: "inversion", texto: "Estimaciones publicadas", referencias: [source] },
    { topic: "blog", texto: "x".repeat(1000), referencias: [{ title: "Blog", href: "/blog/nota/" }] },
    { topic: "tasador", texto: "Estimación orientativa", referencias: [{ title: "Tasador", href: "/tasacion/" }] },
  ], [], 450);
  assert.ok(result.context.length <= 450);
  assert.deepEqual(result.sources.map((item) => item.href), ["/inversiones/", "/tasacion/"]);
  assert.equal(JSON.parse(result.context).snippets.length, 2);
});

test("distingue ejecutar una tasación de consultar cómo funciona", () => {
  for (const text of ["Quiero tasar mi casa", "Tasame este departamento", "Cuánto vale mi propiedad"]) assert.equal(pideTasacion(text), true, text);
  for (const text of ["Cómo funciona el tasador", "No quiero tasar", "Quiero invertir"]) assert.equal(pideTasacion(text), false, text);
});
