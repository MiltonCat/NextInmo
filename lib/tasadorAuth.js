import "server-only";

// La credencial del modelo predictivo queda exclusivamente en el servidor.
export function headersTasador() {
  const key = process.env.TASADOR_API_KEY;
  return key ? { "X-API-Key": key } : {};
}
