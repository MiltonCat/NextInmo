"use client";
// Interruptor "no contarme en este dispositivo". Marca el navegador actual con
// una bandera en localStorage ('cp-no-track') que GoogleAnalytics lee para
// silenciar gtag.js. Es por-dispositivo: el dueño lo activa una vez en su
// celular y otra en su PC. Solo afecta la web pública (el panel /admin ya nunca
// se mide). Se muestra dentro del panel de analítica.
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function NoTrackToggle() {
  // null mientras no se leyó localStorage, para no parpadear en la hidratación.
  const [excluido, setExcluido] = useState(null);

  useEffect(() => {
    try {
      setExcluido(localStorage.getItem("cp-no-track") === "1");
    } catch {
      setExcluido(false);
    }
  }, []);

  function toggle() {
    const nuevo = !excluido;
    try {
      if (nuevo) localStorage.setItem("cp-no-track", "1");
      else localStorage.removeItem("cp-no-track");
    } catch {}
    // Efecto inmediato en este dispositivo, sin esperar a recargar.
    if (GA_ID) window[`ga-disable-${GA_ID}`] = nuevo;
    setExcluido(nuevo);
  }

  if (excluido === null) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">Este dispositivo</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {excluido
            ? "No te estás contando: tus visitas a la web pública no se registran en Analytics."
            : "Tus visitas a la web pública se están contando. Activá esto para que no te midan."}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          excluido
            ? "bg-gray-900 text-white hover:bg-gray-700"
            : "bg-rose-600 text-white hover:bg-rose-500"
        }`}
      >
        {excluido ? "Volver a contarme" : "No contarme"}
      </button>
    </div>
  );
}
