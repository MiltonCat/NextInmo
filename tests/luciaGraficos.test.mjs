import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  barriosDelGrafico,
  graficoParaConsulta,
  serieDelGrafico,
} from "../lib/luciaGraficos.mjs";

// Se leen del JSON real y no de un fixture: si el relevamiento cambia de forma,
// estas pruebas tienen que enterarse.
const mercado = JSON.parse(fs.readFileSync(new URL("../app/data/mercado_sma.json", import.meta.url)));
const POR_BARRIO = mercado.valor_m2_usd.por_barrio;

test("una pregunta por el paso del tiempo pide la curva", () => {
  assert.equal(graficoParaConsulta("conviene comprar ahora?"), "evolucion");
  assert.equal(graficoParaConsulta("como viene el mercado"), "evolucion");
  // Pregunta las dos cosas: manda la curva, que es la que contesta el "cómo".
  assert.equal(graficoParaConsulta("como evoluciono el precio del m2"), "evolucion");
});

test("una pregunta por cuanto vale pide las barras", () => {
  assert.equal(graficoParaConsulta("cuanto vale el m2 en Vega Maipu"), "m2_barrio");
  assert.equal(graficoParaConsulta("que barrio es mas barato"), "m2_barrio");
});

test("una consulta que no es de precios no lleva grafico", () => {
  assert.equal(graficoParaConsulta("quien revisa los papeles"), null);
  assert.equal(graficoParaConsulta("busco casa de 3 dormitorios"), null);
  assert.equal(graficoParaConsulta("hola"), null);
});

test("el barrio nombrado entra aunque no sea de los mas relevados", () => {
  const barrios = barriosDelGrafico(POR_BARRIO, "cuanto sale el m2 en Caleuche");
  const caleuche = barrios.find((b) => b.barrio === "Caleuche");

  assert.ok(caleuche, "Caleuche tiene que estar en el grafico");
  assert.equal(caleuche.destacado, true);
});

test("no se publica una mediana sin respaldo ni el cajon de sastre", () => {
  const barrios = barriosDelGrafico(POR_BARRIO, "cuanto vale el m2");

  assert.ok(barrios.length > 1);
  for (const b of barrios) {
    assert.ok(b.relevadas >= 8, `${b.barrio} tiene solo ${b.relevadas} relevadas`);
    assert.notEqual(b.barrio, "General");
  }
  // Ordenadas de mayor a menor: el grafico se lee de arriba hacia abajo.
  const valores = barrios.map((b) => b.valor);
  assert.deepEqual(valores, [...valores].sort((a, b) => b - a));
});

test("la serie llega con las claves que espera el grafico del sitio", () => {
  const serie = serieDelGrafico(mercado.evolucion_precios.serie);

  assert.ok(serie.length > 1);
  for (const punto of serie) {
    assert.equal(typeof punto.anio, "number");
    assert.ok(punto.precio > 0);
    assert.ok(punto.fuente);
  }
});
