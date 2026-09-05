const normalizar = (text) => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function consultaConHistoria(question, history = []) {
  // Solo recuperar antecedentes en una continuación; un cambio explícito de
  // tema no debe traer las fuentes de la pregunta anterior.
  const text = normalizar(question).trim().replace(/^[¿¡\s]+/, "");
  if (!/^(?:y\b|eso\b|esa\b|ese\b|entonces\b|por que\b|contame mas\b|de donde\b|que fuente\b|a que te referis\b)/.test(text)) return question;
  const anterior = history.filter((item) => item.role === "user").slice(-2).map((item) => item.content).join(" ");
  return `${anterior.slice(-900)} ${question}`.trim();
}

export function pideTasacion(text) {
  const value = normalizar(text);
  if (/no (?:quiero|necesito|vamos a) tas|no tas/.test(value)) return false;
  return /\b(?:tasar|tasame|tasala|tasalo|tasemos)\b|quiero una tasacion|hacer una tasacion|cuanto vale mi (?:casa|departamento|depto|propiedad)/.test(value);
}

export function empaquetarContexto(snippets, warnings, maxChars = 14000) {
  const elegidos = [];
  const fuentes = new Map();
  const serializar = (items, refs) => JSON.stringify({ snippets: items, warnings, referencias: [...refs.values()] });
  // Cada bloque conserva sus referencias; nunca publicar una fuente cuyo
  // contenido se haya descartado para respetar el tamaño del contexto.
  for (const { referencias = [], ...snippet } of snippets) {
    const siguientes = new Map(fuentes);
    for (const item of referencias) siguientes.set(item.href, item);
    if (serializar([...elegidos, snippet], siguientes).length > maxChars) continue;
    elegidos.push(snippet);
    for (const [key, value] of siguientes) fuentes.set(key, value);
  }
  return { context: serializar(elegidos, fuentes), sources: [...fuentes.values()], warnings };
}
