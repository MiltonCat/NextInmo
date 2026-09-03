import test from "node:test";
import assert from "node:assert/strict";
import {
  comparisonRows,
  eligibleProperties,
  nextLuciaStep,
  pareceRelatoPersonal,
  parseLuciaText,
  recommendProperties,
  rutaDelTexto,
} from "../lib/luciaAdvisor.mjs";

const property = (id, overrides = {}) => ({
  id,
  title: `Propiedad ${id}`,
  type: "Casa",
  modalidad: "venta",
  price: 150000,
  bedrooms: 2,
  bathrooms: 1,
  area: 100,
  location: "Centro, San Martín de los Andes",
  features: [],
  ...overrides,
});

test("recomienda como máximo tres propiedades y explica el encaje", () => {
  const catalog = Array.from({ length: 5 }, (_, index) => property(index + 1));
  const recommendations = recommendProperties(
    { types: ["Casa"], maxPrice: 200000, minBedrooms: 1, maxBedrooms: 2 },
    catalog
  );

  assert.equal(recommendations.length, 3);
  assert.ok(recommendations.every((item) => item.luciaReasons.length >= 2));
  assert.match(recommendations[0].luciaReasons.join(" "), /presupuesto/i);
});

test("nunca ofrece propiedades no disponibles", () => {
  const catalog = [
    property(1),
    property(2, { vendida: true }),
    property(3, { noDisponible: true }),
    property(4, { status: "no_disponible" }),
  ];

  assert.deepEqual(eligibleProperties({}, catalog).map((item) => item.id), [1]);
});

test("un alquiler ocupado o reservado queda fuera", () => {
  const catalog = [
    property(1, { modalidad: "alquiler_permanente", price: 0, precioAlquilerARS: 900000 }),
    property(2, { modalidad: "alquiler_permanente", price: 0, precioAlquilerARS: 900000, alquilada: true }),
    property(3, { modalidad: "alquiler_permanente", price: 0, precioAlquilerARS: 900000, reservada: true }),
  ];

  assert.deepEqual(
    eligibleProperties({ operacion: "alquiler" }, catalog).map((item) => item.id),
    [1]
  );
});

test("la prioridad de superficie ordena por datos reales", () => {
  const recommendations = recommendProperties(
    { priority: "space" },
    [property(1, { area: 80 }), property(2, { area: 300 })]
  );

  assert.equal(recommendations[0].id, 2);
  assert.match(recommendations[0].luciaReasons.join(" "), /300 m²/);
});

test("la comparación conserva moneda y campos publicados", () => {
  const rows = comparisonRows([
    property(1),
    property(2, { modalidad: "alquiler_permanente", price: 0, precioAlquilerARS: 850000 }),
  ]);

  assert.deepEqual(rows.map((row) => row.currency), ["USD", "ARS"]);
  assert.equal(rows[1].price, 850000);
  assert.equal(rows[0].area, 100);
});

test("interpreta una búsqueda escrita completa", () => {
  const parsed = parseLuciaText(
    "Busco una casa para vivir, 3 dormitorios, hasta USD 200.000 y con jardín"
  );

  assert.deepEqual(parsed.filters.types, ["Casa"]);
  assert.equal(parsed.filters.objective, "vivir");
  assert.equal(parsed.filters.maxPrice, 200000);
  assert.equal(parsed.filters.minBedrooms, 3);
  assert.equal(parsed.filters.priority, "exterior");
  assert.equal(nextLuciaStep(parsed.filters, parsed.answered), "results");
});

test("si faltan datos continúa calificando en vez de recomendar todo", () => {
  const parsed = parseLuciaText("Busco una casa");

  assert.equal(nextLuciaStep(parsed.filters, parsed.answered), "ask_goal");
});

test("entiende dormitorios escritos con palabras", () => {
  const parsed = parseLuciaText("Buscamos una casa de tres dormitorios hasta USD 220.000");

  assert.equal(parsed.filters.minBedrooms, 3);
  assert.equal(parsed.filters.maxBedrooms, 3);
  assert.equal(parsed.answered.bedrooms, true);
});

test("una búsqueda familiar con recomendación recibe respuesta conversacional", () => {
  const consulta = "Somos una pareja con dos chicos. Buscamos una casa de tres dormitorios, tranquila y con buen internet. ¿Qué zonas recomendarías?";
  const parsed = parseLuciaText(consulta);

  assert.equal(rutaDelTexto(consulta, "welcome", parsed), "ia");
  assert.equal(parsed.filters.minBedrooms, 3);
});

// Lo que Milton vio: quien cuenta su situacion sin signo de pregunta recibia el
// cuestionario, y le preguntaba dormitorios que ya habia dicho.
test("un relato personal sin signo de pregunta va a la IA", () => {
  const relato = "somos una familia con dos chicos, buscamos casa de tres dormitorios hasta 220 mil, tranquila y con buen internet porque trabajo desde casa";

  assert.equal(pareceRelatoPersonal(relato), true);
  assert.equal(rutaDelTexto(relato, "welcome"), "ia");
  assert.equal(parseLuciaText(relato).filters.minBedrooms, 3);
});

test("una busqueda corta por filtros sigue en el arbol guiado", () => {
  assert.equal(rutaDelTexto("busco casa de 3 dormitorios", "welcome"), "guiado");
  assert.equal(rutaDelTexto("busco un departamento chico", "welcome"), "guiado");
});

test("adentro del embudo el relato sigue leyendose como respuesta al paso", () => {
  const relato = "somos una familia con dos chicos y queremos algo tranquilo para vivir";

  assert.equal(rutaDelTexto(relato, "ask_goal"), "guiado");
});
