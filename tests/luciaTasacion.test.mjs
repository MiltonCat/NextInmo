import test from "node:test";
import assert from "node:assert/strict";
import { errorEnPorcentaje, normalizarTasacion } from "../lib/luciaTasacion.mjs";

const VALIDA = {
  tipo: "Casa",
  barrio: "Chacra 4",
  superficie: 120,
  superficieTerreno: 600,
  dormitorios: 3,
  banos: 2,
  ambientes: 4,
  extras: ["Pileta", "Inventado"],
  valorTotal: 312480,
  valorM2: 2604,
  rangoMin: 265000,
  rangoMax: 360000,
  errorPromedioPct: 0.161,
  nEntrenamiento: 512,
  medianaBarrio: 2200,
  nBarrio: 87,
  advertencias: ["Pocas comparables en el barrio"],
};

test("acepta una tasación completa y calcula el desvío contra la mediana", () => {
  const t = normalizarTasacion(VALIDA);
  assert.equal(t.tipo, "Casa");
  assert.equal(t.valorEstimadoUSD, 312480);
  assert.deepEqual(t.rangoUSD, { min: 265000, max: 360000 });
  assert.equal(t.errorPromedioPct, 16.1);
  assert.equal(t.desvioVsMedianaPct, 18.4);
  assert.deepEqual(t.extras, ["Pileta"]);
  assert.deepEqual(t.advertenciasDelModelo, ["Pocas comparables en el barrio"]);
});

test("descarta la tasación entera cuando falta lo que la identifica", () => {
  for (const parche of [{ tipo: "Cabaña" }, { tipo: "" }, { barrio: "" }, { valorTotal: 0 }, { valorTotal: "mucho" }]) {
    assert.equal(normalizarTasacion({ ...VALIDA, ...parche }), null, JSON.stringify(parche));
  }
  for (const valor of [null, undefined, "casa", 7, []]) assert.equal(normalizarTasacion(valor), null);
});

test("descarta campo por campo lo que viene fuera de rango, sin tirar el resto", () => {
  const t = normalizarTasacion({
    ...VALIDA,
    superficie: 9000,
    dormitorios: 99,
    valorM2: -3,
    rangoMin: 400000,
    rangoMax: 100000,
    nEntrenamiento: 0,
    advertencias: "una sola",
  });
  assert.equal(t.superficieCubiertaM2, null);
  assert.equal(t.dormitorios, null);
  assert.equal(t.valorM2USD, null);
  assert.equal(t.rangoUSD, null, "un rango invertido se cae entero");
  assert.equal(t.desvioVsMedianaPct, null);
  assert.equal(t.nEntrenamiento, null);
  assert.deepEqual(t.advertenciasDelModelo, []);
  assert.equal(t.valorEstimadoUSD, 312480, "lo válido sobrevive");
});

test("recorta el texto que llega de afuera", () => {
  const t = normalizarTasacion({ ...VALIDA, barrio: "x".repeat(400), advertencias: ["y".repeat(500), "", "a", "b", "c", "d"] });
  assert.equal(t.barrio.length, 120);
  assert.equal(t.advertenciasDelModelo.length, 4);
  assert.equal(t.advertenciasDelModelo[0].length, 240);
});

test("lee el error del modelo venga como fracción o como porcentaje", () => {
  assert.equal(errorEnPorcentaje(0.161), 16.1);
  assert.equal(errorEnPorcentaje(16.1), 16.1);
  for (const valor of [0, -1, null, "alto", 1000]) assert.equal(errorEnPorcentaje(valor), null);
});
