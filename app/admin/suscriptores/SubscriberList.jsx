"use client";

import { useState } from "react";
import { removeSubscriber } from "./actions";

const INTERES_LABEL = {
  comprar: "Comprar",
  alquilar: "Alquilar",
  invertir: "Invertir",
  mirar: "Solo mirando",
};

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function SubscriberList({ subscribers }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarEmails() {
    const emails = subscribers.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback: seleccionar manualmente no es ideal, avisamos.
      alert("No se pudo copiar automáticamente. Emails:\n\n" + emails);
    }
  }

  if (subscribers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
        Todavía no hay suscriptores.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {subscribers.length} {subscribers.length === 1 ? "suscriptor" : "suscriptores"}
        </p>
        <button
          onClick={copiarEmails}
          className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {copiado ? "✓ Emails copiados" : "Copiar todos los emails"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Tip: copiá los emails y pegalos en el campo <strong>CCO</strong> (copia oculta) de tu
        correo para avisar a todos sin que vean los emails de los demás.
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Interés</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`mailto:${s.email}`} className="text-gray-900 hover:underline">{s.email}</a>
                </td>
                <td className="px-4 py-3 text-gray-700">{s.nombre || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{INTERES_LABEL[s.interes] || "—"}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatFecha(s.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <form action={removeSubscriber}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs text-red-600 hover:text-red-800 hover:underline">
                      Borrar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
