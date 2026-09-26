import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
register("./luciaKnowledge-loader.mjs", import.meta.url);

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://catalogo.invalid";
process.env.SUPABASE_SECRET_KEY = "test-only";
const { getProperties, getPropertyById } = await import("../lib/properties.js");

test("respeta precio, disponibilidad y fotos de la base sin usar el respaldo", async (t) => {
  const row = { id: 22, price: "250000", alquilada: true, image: "/original.webp", image1: "/segunda.webp" };
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify([row])));
  const [property] = await getProperties();
  assert.equal(property.price, 250000);
  assert.equal(property.alquilada, true);
  assert.equal(property.image, row.image);
  assert.equal(property.image1, row.image1);
  assert.deepEqual(property.images.map((image) => image.url), [row.image, row.image1]);
  assert.equal(await getPropertyById(4), null);
});

test("un catálogo vacío no resucita propiedades del respaldo", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("[]"));
  assert.deepEqual(await getProperties(), []);
  assert.equal(await getPropertyById(22), null);
});

test("un error de base falla explícitamente y permite recuperar en la siguiente consulta", async (t) => {
  t.mock.method(console, "error", () => {});
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ message: "database unavailable" }), { status: 400 }));
  await assert.rejects(getProperties(), /No se pudo consultar el catálogo/);
  await assert.rejects(getPropertyById(22), /No se pudo consultar el catálogo/);
  fetchMock.mock.mockImplementation(async () => new Response(JSON.stringify([{ id: 22, price: 250000 }])));
  assert.equal((await getPropertyById(22)).price, 250000);
});

test("una respuesta inválida no se interpreta como catálogo vacío", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async () => new Response("null"));
  await assert.rejects(getProperties(), /No se pudo consultar el catálogo/);
});

test("sin credenciales no devuelve el catálogo estático", async (t) => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  t.after(() => { process.env.NEXT_PUBLIC_SUPABASE_URL = original; });
  t.mock.method(console, "error", () => {});
  const isolated = await import("../lib/properties.js?sin-credenciales");
  await assert.rejects(isolated.getProperties(), /No se pudo consultar el catálogo/);
});
