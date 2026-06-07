"use client";

import { useState } from "react";
import { setEstado, saveNotas, removeInquiry } from "./actions";

const TIPO_LABEL = {
  tasacion: "Tasación",
  propiedad: "Consulta de propiedad",
  visita: "Agendar visita",
  contacto: "Contacto general",
};

const TIPO_COLOR = {
  tasacion: "bg-amber-100 text-amber-800",
  propiedad: "bg-blue-100 text-blue-800",
  visita: "bg-violet-100 text-violet-800",
  contacto: "bg-emerald-100 text-emerald-800",
};

const ESTADOS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
];

// Etiquetas legibles para las claves de `detalle`.
const DETALLE_LABEL = {
  tipoPropiedad: "Tipo", zona: "Zona", superficie: "Superficie (m²)",
  dormitorios: "Dormitorios", estado: "Estado", anio: "Año",
  operacion: "Operación", ubicacion: "Ubicación", precio: "Precio", link: "Link",
  dia: "Día", horario: "Horario",
  monto: "Monto", objetivo: "Objetivo", plazo: "Plazo",
};

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Limpia el teléfono para el link de WhatsApp (solo dígitos).
function waLink(telefono) {
  const num = String(telefono || "").replace(/\D/g, "");
  return num ? `https://wa.me/${num}` : null;
}

export default function InquiryCard({ inquiry }) {
  const [notas, setNotas] = useState(inquiry.notas || "");
  const wa = waLink(inquiry.telefono);
  const detalle = inquiry.detalle && typeof inquiry.detalle === "object" ? inquiry.detalle : {};
  const entradasDetalle = Object.entries(detalle).filter(([, v]) => v != null && v !== "");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLOR[inquiry.tipo] || "bg-gray-100 text-gray-700"}`}>
            {TIPO_LABEL[inquiry.tipo] || inquiry.tipo}
          </span>
          <p className="text-base font-semibold text-gray-900 mt-2">{inquiry.nombre || "Sin nombre"}</p>
          {inquiry.property_title && (
            <p className="text-xs text-gray-500">Sobre: {inquiry.property_title}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{formatFecha(inquiry.created_at)}</span>
      </div>

      {/* Contacto */}
      <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
        {inquiry.telefono && (
          <span className="text-gray-700">📞 {inquiry.telefono}</span>
        )}
        {inquiry.email && (
          <a href={`mailto:${inquiry.email}`} className="text-gray-700 hover:underline">✉️ {inquiry.email}</a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-500"
          >
            Responder por WhatsApp
          </a>
        )}
      </div>

      {inquiry.mensaje && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 whitespace-pre-wrap">{inquiry.mensaje}</p>
      )}

      {entradasDetalle.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs mb-4">
          {entradasDetalle.map(([k, v]) => (
            <div key={k}>
              <dt className="text-gray-400">{DETALLE_LABEL[k] || k}</dt>
              <dd className="text-gray-700 break-words">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Estado + notas + borrar */}
      <div className="flex flex-wrap items-end gap-4 border-t border-gray-100 pt-4">
        <form action={setEstado} className="flex items-center gap-2">
          <input type="hidden" name="id" value={inquiry.id} />
          <label className="text-xs text-gray-500">Estado</label>
          <select
            name="estado"
            defaultValue={inquiry.estado}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-800"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          <button type="submit" className="text-xs text-gray-700 hover:text-gray-900 underline">
            Guardar
          </button>
        </form>

        <form action={removeInquiry} className="ml-auto">
          <input type="hidden" name="id" value={inquiry.id} />
          <button type="submit" className="text-xs text-red-600 hover:text-red-800 hover:underline">
            Borrar
          </button>
        </form>
      </div>

      <form action={saveNotas} className="mt-3">
        <input type="hidden" name="id" value={inquiry.id} />
        <label className="block text-xs text-gray-500 mb-1">Notas internas</label>
        <textarea
          name="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Anotá el seguimiento de este contacto…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
        />
        <button type="submit" className="mt-1 text-xs text-gray-700 hover:text-gray-900 underline">
          Guardar nota
        </button>
      </form>
    </div>
  );
}
