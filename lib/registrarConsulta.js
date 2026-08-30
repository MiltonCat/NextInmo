// Helper de cliente: guarda una consulta en el CRM sin bloquear ni romper el
// flujo del formulario. Se llama justo antes de abrir WhatsApp / enviar el email.
// Es fire-and-forget: si falla (sin red, etc.) se ignora en silencio para no
// arruinar la experiencia del visitante.
import { origenDeLaVisita } from "@/lib/origenVisita";

export function registrarConsulta(payload) {
  try {
    // De dónde entró el visitante, pegado acá y no en cada formulario: así toda
    // consulta del sitio llega al CRM sabiendo si nació de una respuesta de IA.
    // Nunca pisa lo que el llamador ya haya puesto en `detalle`.
    let detalle = payload?.detalle;
    try {
      const origen = origenDeLaVisita();
      if (origen) {
        detalle = { ...(detalle || {}), origen_visita: `${origen.fuente} (${origen.canal})` };
      }
    } catch {
      // Si falla la detección se manda la consulta igual: el lead vale más que
      // saber de dónde vino.
    }

    fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detalle === payload?.detalle ? payload : { ...payload, detalle }),
      keepalive: true, // permite que el envío sobreviva a la navegación a WhatsApp
    }).catch(() => {});
  } catch {
    // ignorado a propósito
  }
}
