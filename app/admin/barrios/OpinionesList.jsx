"use client";

import { useState } from "react";
import { nombreDeBarrio } from "@/lib/barrios";
import {
  DIMENSIONES,
  RELACION_LABEL,
  ANTIGUEDAD_LABEL,
  REC_LABEL,
} from "@/lib/barrioEncuesta";
import { moderarOpinion, alternarCita, eliminarOpinion } from "./actions";

const ESTADO_BADGE = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  aprobada: "bg-green-50 text-green-700 border-green-200",
  rechazada: "bg-gray-100 text-gray-500 border-gray-200",
};

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Barra compacta de un puntaje 1..5.
function Punt({ label, valor }) {
  if (valor == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-32 flex-shrink-0 truncate">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`w-4 h-1.5 rounded-sm ${n <= valor ? "bg-gray-800" : "bg-gray-200"}`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-gray-700">{valor}</span>
    </div>
  );
}

function Fila({ o }) {
  const [abierto, setAbierto] = useState(false);
  const barrio = o.barrio === "otro" ? o.barrio_otro || "Otro" : nombreDeBarrio(o.barrio);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-start justify-between gap-4">
        <button
          onClick={() => setAbierto((v) => !v)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900 text-sm">{barrio}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ESTADO_BADGE[o.estado]}`}>
              {o.estado}
            </span>
            {o.cita_publicable && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                cita publicada
              </span>
            )}
            {o.barrio === "otro" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-medium">
                barrio no listado
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {RELACION_LABEL[o.relacion] ?? o.relacion} · {ANTIGUEDAD_LABEL[o.antiguedad] ?? o.antiguedad} ·{" "}
            {formatFecha(o.created_at)}
          </p>
          {o.cita && !abierto && (
            <p className="text-xs text-gray-600 italic mt-1.5 line-clamp-1">“{o.cita}”</p>
          )}
        </button>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {o.estado !== "aprobada" && (
            <form action={moderarOpinion}>
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="estado" value="aprobada" />
              <button className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800">
                Aprobar
              </button>
            </form>
          )}
          {o.estado !== "rechazada" && (
            <form action={moderarOpinion}>
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="estado" value="rechazada" />
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
                Rechazar
              </button>
            </form>
          )}
        </div>
      </div>

      {abierto && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pt-3">
            {DIMENSIONES.map((d) => (
              <Punt key={d.key} label={d.label} valor={o[d.key]} />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
            {o.rec_vivir && <span>Vivir: <strong>{REC_LABEL[o.rec_vivir]}</strong></span>}
            {o.rec_invertir && <span>Invertir: <strong>{REC_LABEL[o.rec_invertir]}</strong></span>}
            {o.volveria_elegir != null && (
              <span>Volvería a elegirlo: <strong>{o.volveria_elegir ? "Sí" : "No"}</strong></span>
            )}
            {o.sin_auto != null && (
              <span>Sin auto: <strong>{o.sin_auto ? "Sí" : "No"}</strong></span>
            )}
          </div>

          {o.perfiles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {o.perfiles.map((p) => (
                <span key={p} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {p}
                </span>
              ))}
            </div>
          )}

          {o.cita && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 italic leading-relaxed">“{o.cita}”</p>
              <form action={alternarCita} className="mt-2">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="publicable" value={String(!o.cita_publicable)} />
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 underline">
                  {o.cita_publicable ? "Dejar de publicar esta frase" : "Publicar esta frase"}
                </button>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-gray-400">
              {o.email ? `Contacto: ${o.email}` : "Sin email"}
              {o.quiere_informe && " · quiere el resumen del barrio"}
              {o.nombre && ` · ${o.nombre}`}
            </p>
            <form action={eliminarOpinion}>
              <input type="hidden" name="id" value={o.id} />
              <button className="text-[11px] text-gray-400 hover:text-red-600 underline">
                Eliminar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpinionesList({ opiniones, conteos, resumenPorBarrio }) {
  const [filtro, setFiltro] = useState("pendiente");

  const visibles = filtro === "todas" ? opiniones : opiniones.filter((o) => o.estado === filtro);

  const tabs = [
    { key: "pendiente", label: `Pendientes (${conteos.pendiente})` },
    { key: "aprobada", label: `Aprobadas (${conteos.aprobada})` },
    { key: "rechazada", label: `Rechazadas (${conteos.rechazada})` },
    { key: "todas", label: "Todas" },
  ];

  return (
    <div className="space-y-5">
      {/* Progreso por barrio: cuántas opiniones aprobadas tiene cada uno y qué
          se puede mostrar públicamente con esa cantidad. */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Avance por barrio</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sobre opiniones aprobadas. Con menos de 5 no se muestra ningún promedio; de 5 a 14
          van números absolutos; recién con 15 o más se pueden mostrar porcentajes.
        </p>
        {resumenPorBarrio.length === 0 ? (
          <p className="text-xs text-gray-400">Todavía no hay opiniones aprobadas.</p>
        ) : (
          <div className="space-y-2">
            {resumenPorBarrio.map((b) => (
              <div key={b.slug} className="flex items-center gap-3">
                <span className="text-xs text-gray-700 w-36 flex-shrink-0 truncate">{b.nombre}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.nivel === "porcentajes"
                        ? "bg-green-500"
                        : b.nivel === "absolutos"
                        ? "bg-amber-400"
                        : "bg-gray-300"
                    }`}
                    style={{ width: `${Math.min(100, (b.n / 15) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{b.n}</span>
                <span className="text-[10px] text-gray-400 w-24">
                  {b.nivel === "porcentajes"
                    ? "publicable"
                    : b.nivel === "absolutos"
                    ? "solo absolutos"
                    : `faltan ${5 - b.n}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFiltro(t.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              filtro === t.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No hay opiniones en este estado.
        </div>
      ) : (
        <div className="space-y-2">
          {visibles.map((o) => (
            <Fila key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}
