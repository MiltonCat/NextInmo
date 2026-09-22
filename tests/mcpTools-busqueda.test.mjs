import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
register("./luciaKnowledge-loader.mjs", import.meta.url);

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://prueba.invalid";
process.env.SUPABASE_SECRET_KEY = "prueba";
const { ejecutarHerramienta, tiposDeLaBusqueda } = await import("../lib/mcpTools.js");

// Espejo del catálogo real del 22/09: alquileres con precio, algunos alquilados.
const CATALOGO = [
  { id: 1, title: "Hermosa Cabaña en las Nalcas", type: "Cabaña", modalidad: "alquiler_permanente", precioAlquilerARS: 1300000, bedrooms: 2, alquilada: false, reservada: false, status: "disponible" },
  { id: 2, title: "Departamento de 1 habitación en el centro", type: "Departamento", modalidad: "alquiler_permanente", precioAlquilerARS: 1000000, bedrooms: 1, alquilada: false, reservada: false, status: "disponible" },
  { id: 3, title: "Cabaña alquilada", type: "Cabaña", modalidad: "alquiler_permanente", precioAlquilerARS: 1200000, bedrooms: 2, alquilada: true, reservada: false, status: "disponible" },
  { id: 4, title: "Casa en venta", type: "Casa", modalidad: "venta", price: 200000, bedrooms: 3, status: "disponible" },
];

function conCatalogo(t) {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(CATALOGO)));
}
const textoDe = (salida) => salida.content.map((c) => c.text).join("\n");

test("'alquiler permanente' o 'alquilar' también buscan alquileres", async (t) => {
  conCatalogo(t);
  for (const operacion of ["alquiler", "alquilar", "alquiler permanente", "Alquiler"]) {
    const salida = await ejecutarHerramienta("buscar_propiedades", { operacion });
    assert.equal(salida.structuredContent.total, 2, operacion);
  }
});

test("un tipo que no es tipo no vacía el catálogo", async (t) => {
  conCatalogo(t);
  for (const tipo of ["alquiler", "propiedad", "cualquiera", "todos"]) {
    const salida = await ejecutarHerramienta("buscar_propiedades", { operacion: "alquiler", tipo });
    assert.equal(salida.structuredContent.total, 2, tipo);
  }
});

test("'Departamento o PH' filtra por departamento", async (t) => {
  conCatalogo(t);
  const salida = await ejecutarHerramienta("buscar_propiedades", { operacion: "alquiler", tipo: "Departamento o PH" });
  assert.equal(salida.structuredContent.total, 1);
  assert.equal(salida.structuredContent.aproximado, false);
});

test("sin coincidencia exacta muestra lo más cercano y lo avisa", async (t) => {
  conCatalogo(t);
  const salida = await ejecutarHerramienta("buscar_propiedades", { operacion: "alquiler", dormitorios_min: 4 });
  assert.equal(salida.structuredContent.aproximado, true);
  assert.equal(salida.structuredContent.total, 2);
  assert.match(textoDe(salida), /No hay coincidencia exacta/);
});

test("los alquilados no se ofrecen", async (t) => {
  conCatalogo(t);
  const salida = await ejecutarHerramienta("buscar_propiedades", { operacion: "alquiler" });
  assert.ok(!textoDe(salida).includes("Cabaña alquilada"));
});

test("tiposDeLaBusqueda reconoce solo tipos reales", () => {
  assert.deepEqual(tiposDeLaBusqueda("Departamento o PH"), ["departamento", "ph"]);
  assert.deepEqual(tiposDeLaBusqueda("Cabaña"), ["cabana"]);
  assert.equal(tiposDeLaBusqueda("alquiler"), undefined);
  assert.equal(tiposDeLaBusqueda(""), undefined);
});

test("sin dormitorios cargados, los lee del título (caso real id 106)", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify([
    { id: 106, title: "Departamento de 1 habitación en el centro, con una vista que enamora", type: "Departamento", modalidad: "alquiler_permanente", precioAlquilerARS: 1000000, bedrooms: null, alquilada: false, reservada: false, status: "disponible" },
    { id: 115, title: "Departamento premium en el centro. 80 mts2", type: "Departamento", modalidad: "alquiler_permanente", precioAlquilerARS: 1500000, bedrooms: null, alquilada: false, reservada: false, status: "disponible" },
  ])));
  const salida = await ejecutarHerramienta("buscar_propiedades", { operacion: "alquiler", dormitorios_min: 1 });
  assert.equal(salida.structuredContent.aproximado, false);
  assert.deepEqual(salida.structuredContent.propiedades.map((p) => p.id), [106]);
  assert.equal(salida.structuredContent.propiedades[0].dormitorios, 1);
});
