import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
register("./luciaKnowledge-loader.mjs", import.meta.url);
const { getBarrios } = await import("../lib/tasador.js");

test("barrios: distingue timeout con respaldo de fallos reales", async (t) => {
  const info = t.mock.method(console, "info", () => {});
  const error = t.mock.method(console, "error", () => {});
  const erroresDeSalud = () => error.mock.calls.filter((call) => String(call.arguments[0]).startsWith("[salud]")).length;
  const fetchMock = t.mock.method(globalThis, "fetch");
  t.mock.timers.enable({ apis: ["setTimeout"] });

  fetchMock.mock.mockImplementation(async () => new Response(JSON.stringify({ barrios: ["Centro"] })));
  assert.deepEqual(await getBarrios(), ["Centro"]);
  assert.equal(info.mock.callCount(), 0);
  assert.equal(erroresDeSalud(), 0, JSON.stringify(error.mock.calls.map((call) => call.arguments)));

  const abortar = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("This operation was aborted", "AbortError")), { once: true });
  });
  fetchMock.mock.mockImplementation(abortar);
  const pendiente = getBarrios();
  t.mock.timers.tick(8000);
  const respaldo = await pendiente;
  assert.ok(respaldo.length > 0);
  assert.equal(info.mock.callCount(), 1);
  assert.equal(erroresDeSalud(), 0, JSON.stringify(error.mock.calls.map((call) => call.arguments)));

  const sinRespaldo = getBarrios("otra-ciudad");
  t.mock.timers.tick(8000);
  assert.deepEqual(await sinRespaldo, []);
  assert.equal(erroresDeSalud(), 1);

  for (const respuesta of [
    async () => new Response("", { status: 503 }),
    async () => new Response(JSON.stringify({ barrios: [] })),
    async () => { throw new TypeError("fetch failed"); },
    async () => { throw new DOMException("aborted externally", "AbortError"); },
  ]) {
    fetchMock.mock.mockImplementation(respuesta);
    assert.deepEqual(await getBarrios(), respaldo);
  }
  assert.equal(erroresDeSalud(), 5);
  assert.equal(info.mock.callCount(), 1);
});
