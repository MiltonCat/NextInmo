import test from "node:test";
import assert from "node:assert/strict";
import { readLines, readOpenAIStream } from "../lib/luciaStream.mjs";

function chunks(text) {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); } });
}
test("recupera UTF-8 y líneas fragmentadas, incluida la última sin salto", async () => {
  const lines = [];
  await readLines(chunks('Lucía\r\n12°\núltima'), (line) => lines.push(line));
  assert.deepEqual(lines, ['Lucía', '12°', 'última']);
});
test("publica deltas y exige confirmación final de OpenAI", async () => {
  const seen = [];
  const final = await readOpenAIStream(chunks('event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Hola Lucía"}\n\ndata: {"type":"response.completed","response":{"model":"test"}}\n\n'), (text) => seen.push(text));
  assert.deepEqual(seen, ['Hola Lucía']);
  assert.equal(final.model, 'test');
});
test("una desconexión no convierte una respuesta parcial en completa", async () => {
  await assert.rejects(readOpenAIStream(chunks('data: {"type":"response.output_text.delta","delta":"parcial"}\n'), () => {}), /incomplete_response/);
});
test("rechaza respuestas incompletas aunque hayan emitido texto", async () => {
  await assert.rejects(readOpenAIStream(chunks('data: {"type":"response.incomplete"}\n'), () => {}), /incomplete_response/);
});
