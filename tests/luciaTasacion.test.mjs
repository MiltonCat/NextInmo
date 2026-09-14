import test from "node:test";
import assert from "node:assert/strict";
import { crearTasacionParaLucia, errorEnPorcentaje, normalizarTasacion } from "../lib/luciaTasacion.mjs";

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

test("el resultado enviado al chat conserva entradas, rango y comparación del tipo", () => {
  const enviada = crearTasacionParaLucia({
    datos: { ...VALIDA, cocheras: 2, extras: ["Vista al lago o cerro"] },
    resultado: VALIDA,
    contexto: { medianaBarrio: 2200, nBarrio: 87, medianaBarrioTipo: 2400, nBarrioTipo: 30 },
  });
  const recibida = normalizarTasacion(JSON.parse(JSON.stringify(enviada)));
  assert.equal(recibida.cocheras, 2);
  assert.equal(recibida.superficieTerrenoM2, 600);
  assert.deepEqual(recibida.extras, ["Vista al lago o cerro"]);
  assert.equal(recibida.medianaComparadaM2USD, 2400);
  assert.equal(recibida.nBarrioTipoRelevadas, 30);
  assert.equal(recibida.errorPromedioPct, 16.1);
  assert.deepEqual(recibida.rangoUSD, { min: 265000, max: 360000 });
  assert.deepEqual(recibida.advertenciasDelModelo, VALIDA.advertencias);
});

test("una nueva tasación sin contexto no hereda la comparación anterior", () => {
  const recibida = normalizarTasacion(crearTasacionParaLucia({ datos: VALIDA, resultado: VALIDA }));
  assert.equal(recibida.medianaComparadaM2USD, null);
  assert.equal(recibida.cocheras, null);
  assert.equal(normalizarTasacion({ ...VALIDA, cocheras: 99 }).cocheras, null);
  assert.equal(normalizarTasacion({ ...VALIDA, cocheras: 0 }).cocheras, 0);
});

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

// Los dos casos de abajo son reales: salieron del tasador el 13 y el 14/09/2026
// con los datos de mercado_sma.json al 13/09. Son los que muestran para qué
// sirve comparar contra el tipo y no contra el barrio entero.
test("compara contra la mediana del tipo cuando el barrio la tiene", () => {
  // Casa en el Centro. Contra la mediana mezclada del barrio (3393, que son
  // casi puros departamentos: 280 contra 32 casas) daba -6%, como si estuviera
  // en línea con el barrio. Contra las casas del Centro (2571) está 24% arriba.
  const t = normalizarTasacion({
    ...VALIDA,
    barrio: "Centro",
    valorM2: 3190,
    medianaBarrio: 3393,
    nBarrio: 312,
    medianaBarrioTipo: 2571,
    nBarrioTipo: 32,
  });
  assert.equal(t.desvioVsMedianaPct, 24.1, "el signo se da vuelta contra la mediana correcta");
  assert.equal(t.medianaComparadaM2USD, 2571);
  assert.equal(t.medianaBarrioM2USD, 3393, "la mezclada no se pierde");
  assert.equal(t.nBarrioTipoRelevadas, 32);
  assert.match(t.baseDeComparacion, /casas de Centro/);
});

test("cae a la mediana mezclada, pero la deja declarada", () => {
  // Casa de 600 m² cubiertos en Chapelco Golf, sin desglose de casas del barrio.
  const t = normalizarTasacion({
    ...VALIDA,
    barrio: "Chapelco Golf & Resort",
    valorM2: 1356,
    medianaBarrio: 3122,
    nBarrio: 26,
    medianaBarrioTipo: null,
    nBarrioTipo: null,
  });
  assert.equal(t.desvioVsMedianaPct, -56.6);
  assert.equal(t.medianaComparadaM2USD, 3122);
  assert.equal(t.medianaBarrioTipoM2USD, null);
  assert.match(t.baseDeComparacion, /casas y departamentos juntos/);
});

test("una mediana por tipo fuera de rango no arrastra a la mezclada", () => {
  const t = normalizarTasacion({ ...VALIDA, medianaBarrioTipo: -5, nBarrioTipo: 0 });
  assert.equal(t.medianaBarrioTipoM2USD, null);
  assert.equal(t.nBarrioTipoRelevadas, null);
  assert.equal(t.medianaComparadaM2USD, 2200, "vuelve a la del barrio");
  assert.equal(t.desvioVsMedianaPct, 18.4);
});

test("sin ninguna mediana no hay desvío ni base de comparación", () => {
  const t = normalizarTasacion({ ...VALIDA, medianaBarrio: null, medianaBarrioTipo: null });
  assert.equal(t.desvioVsMedianaPct, null);
  assert.equal(t.medianaComparadaM2USD, null);
  assert.equal(t.baseDeComparacion, null);
});

test("lee el error del modelo venga como fracción o como porcentaje", () => {
  assert.equal(errorEnPorcentaje(0.161), 16.1);
  assert.equal(errorEnPorcentaje(16.1), 16.1);
  for (const valor of [0, -1, null, "alto", 1000]) assert.equal(errorEnPorcentaje(valor), null);
});
