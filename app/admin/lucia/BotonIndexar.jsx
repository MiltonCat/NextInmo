"use client";

import { useState } from "react";

// El boton que pone al dia lo que Lucia ve del sitio, sin esperar al cron de
// las 9. Muestra el resultado en palabras y no en numeros sueltos: lo que
// importa saber despues de apretarlo es si lo que acabas de publicar entro.
export default function BotonIndexar() {
  const [estado, setEstado] = useState({ fase: "listo" });

  async function actualizar() {
    setEstado({ fase: "trabajando" });
    try {
      const res = await fetch("/api/admin/indexar-sitio", { method: "POST" });
      const datos = await res.json();
      if (!res.ok || !datos.ok) throw new Error(datos.error || "No se pudo actualizar.");
      setEstado({ fase: "hecho", datos });
    } catch (error) {
      setEstado({ fase: "error", mensaje: error.message });
    }
  }

  const trabajando = estado.fase === "trabajando";

  return (
    <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Lo que Lucía ve del sitio</h2>
          <p className="text-xs text-gray-500">
            Se actualiza sola todas las mañanas. Si acabás de publicar una nota, una ficha de barrio
            o un desarrollo, apretá acá para que lo vea ahora.
          </p>
        </div>
        <button
          type="button"
          onClick={actualizar}
          disabled={trabajando}
          className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {trabajando ? "Leyendo el sitio…" : "Actualizar ahora"}
        </button>
      </div>

      {estado.fase === "hecho" && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {estado.datos.indexadas === 0 ? (
            <>Ya estaba al día: nada cambió desde la última vez ({estado.datos.segundos}s).</>
          ) : (
            <>
              <span className="font-medium">
                {estado.datos.indexadas}{" "}
                {estado.datos.indexadas === 1 ? "página nueva o modificada" : "páginas nuevas o modificadas"}
              </span>{" "}
              ({estado.datos.fragmentos} fragmentos, {estado.datos.segundos}s).
              {estado.datos.paginas?.length > 0 && (
                <ul className="mt-1 space-y-0.5 opacity-90">
                  {estado.datos.paginas.map((url) => (
                    <li key={url}>{url.replace(/^https?:\/\/[^/]+/, "")}</li>
                  ))}
                </ul>
              )}
              {estado.datos.pendientes > 0 && (
                <p className="mt-1">
                  Quedaron {estado.datos.pendientes} para la próxima; apretá de nuevo si querés que
                  entren ya.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {estado.fase === "error" && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {estado.mensaje}
        </p>
      )}
    </div>
  );
}
