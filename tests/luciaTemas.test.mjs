import test from "node:test";
import assert from "node:assert/strict";
import { contarPorTema, normalizar, temaDePregunta } from "../lib/luciaTemas.mjs";

test("los acentos y las mayusculas no cambian el tema", () => {
  assert.equal(temaDePregunta("¿Cuánto vale el m² en Vega Maipú?"), "precios");
  assert.equal(temaDePregunta("CUANTO VALE EL M2 EN VEGA MAIPU"), "precios");
  assert.equal(normalizar("  ¿Qué   TAL?  "), "¿que tal?");
});

test("las raices atrapan la familia de la palabra", () => {
  for (const q of ["busco alquiler", "quiero alquilar", "alquilo mi casa", "los alquileres"]) {
    assert.equal(temaDePregunta(q), "alquiler", q);
  }
});

test("temporario gana sobre alquiler: la casa no lo opera", () => {
  // Si cayera en "alquiler" se mezclaria con las consultas que si podemos
  // atender, y es justo la derivacion que hay que ver aparte.
  assert.equal(temaDePregunta("alquiler por el fin de semana"), "temporario");
  assert.equal(temaDePregunta("tienen alquiler temporario en verano"), "temporario");
});

test("gana el tema con mas raices tocadas", () => {
  assert.equal(temaDePregunta("que gastos de escritura y sellado tiene comprar"), "gastos");
  assert.equal(temaDePregunta("cuanto vale tasar mi casa, cuanto sale"), "precios");
});

test("lo que no toca ninguna raiz queda sin clasificar", () => {
  assert.equal(temaDePregunta("hola"), "sin_clasificar");
  assert.equal(temaDePregunta(""), "sin_clasificar");
  assert.equal(temaDePregunta(null), "sin_clasificar");
});

test("el conteo ordena de mayor a menor y deja sin_clasificar al final", () => {
  const filas = contarPorTema([
    { pregunta: "busco alquiler" },
    { pregunta: "alquilan casas?" },
    { pregunta: "cuanto vale el m2" },
    { pregunta: "hola" },
    { pregunta: "buenas" },
    { pregunta: "buenas tardes" },
  ]);
  assert.deepEqual(
    filas.map((f) => [f.id, f.cantidad]),
    [
      ["alquiler", 2],
      ["precios", 1],
      ["sin_clasificar", 3],
    ]
  );
});

test("un tema sin preguntas no aparece en la fila", () => {
  const ids = contarPorTema([{ pregunta: "busco alquiler" }]).map((f) => f.id);
  assert.deepEqual(ids, ["alquiler"]);
});
