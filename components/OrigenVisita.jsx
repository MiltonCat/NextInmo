"use client";
import { useEffect } from "react";
import { origenDeLaVisita } from "@/lib/origenVisita";

// Marca una sola vez por sesión que esta visita entró desde un asistente de IA.
// El evento va a GA4 aparte del canal propio de Google, que a Perplexity ni la
// cuenta y que pierde todo lo que llega sin referrer desde las apps móviles.
const CLAVE_AVISADO = "origen-visita-avisado";

export default function OrigenVisita() {
  useEffect(() => {
    const origen = origenDeLaVisita();
    if (!origen || origen.canal !== "ia") return;

    try {
      if (sessionStorage.getItem(CLAVE_AVISADO) === "1") return;
      sessionStorage.setItem(CLAVE_AVISADO, "1");
    } catch {
      // Sin almacenamiento se puede mandar más de una vez por sesión. Es
      // preferible a no medir nada.
    }

    // gtag puede no estar listo en el primer render; se reintenta una vez.
    const mandar = () => {
      if (typeof window === "undefined" || !window.gtag) return false;
      window.gtag("event", "visita_desde_ia", {
        fuente: origen.fuente,
        referrer: origen.referrer,
        pagina_de_entrada: window.location.pathname,
      });
      return true;
    };

    if (mandar()) return;
    const id = setTimeout(mandar, 2000);
    return () => clearTimeout(id);
  }, []);

  return null;
}
