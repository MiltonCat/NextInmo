// Helper de cliente: guarda una consulta en el CRM sin bloquear ni romper el
// flujo del formulario. Se llama justo antes de abrir WhatsApp / enviar el email.
// Es fire-and-forget: si falla (sin red, etc.) se ignora en silencio para no
// arruinar la experiencia del visitante.
export function registrarConsulta(payload) {
  try {
    fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // permite que el envío sobreviva a la navegación a WhatsApp
    }).catch(() => {});
  } catch {
    // ignorado a propósito
  }
}
