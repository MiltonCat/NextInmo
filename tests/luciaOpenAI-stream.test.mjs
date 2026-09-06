import { register } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
register("./luciaKnowledge-loader.mjs", import.meta.url);
const { askOpenAILucia } = await import("../lib/luciaOpenAI.js");

test("stream conserva privacidad y devuelve respuesta final sin perder acentos", async (t) => {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  t.after(() => { if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous; });
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(body.stream, true);
    return new Response('data: {"type":"response.output_text.delta","delta":"Hola Lucía"}\n\ndata: {"type":"response.completed","response":{"model":"test","output":[{"type":"message","content":[{"type":"output_text","text":"Hola Lucía"}]}]}}\n\n');
  });
  const deltas = [];
  const answer = await askOpenAILucia({ question: "Hola", context: "test", onDelta: (text) => deltas.push(text) });
  assert.deepEqual(deltas, ["Hola Lucía"]);
  assert.equal(answer.text, "Hola Lucía");
  assert.equal(answer.ok, true);
});

test("cancelar propaga la señal al proveedor", async (t) => {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";
  t.after(() => { if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous; });
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    controller.abort();
    assert.equal(options.signal.aborted, true);
    throw new DOMException("Aborted", "AbortError");
  });
  const answer = await askOpenAILucia({ question: "Hola", context: "test", onDelta() {}, signal: controller.signal });
  assert.equal(answer.ok, false);
});
