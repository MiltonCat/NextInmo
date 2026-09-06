// Parseo compartido: tolera UTF-8 y líneas partidas entre paquetes de red.
export async function readLines(stream, onLine) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = pending.split("\n");
      pending = lines.pop();
      for (const line of lines) onLine(line.replace(/\r$/, ""));
      if (done) break;
    }
    if (pending) onLine(pending.replace(/\r$/, ""));
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function readOpenAIStream(stream, onDelta) {
  let completed = null;
  await readLines(stream, (line) => {
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    const event = JSON.parse(data);
    if (event.type === "response.output_text.delta" && typeof event.delta === "string") onDelta(event.delta);
    if (event.type === "response.completed") completed = event.response;
    if (["error", "response.failed", "response.incomplete"].includes(event.type)) throw new Error("incomplete_response");
  });
  if (!completed) throw new Error("incomplete_response");
  return completed;
}
