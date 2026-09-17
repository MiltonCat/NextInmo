"use client";

import { useEffect, useState } from "react";
import TasadorWizard from "./TasadorWizard";
import styles from "./LuciaTasador.module.css";
import { OBJETIVOS_TASACION, PLAZOS_TASACION } from "@/lib/luciaTasacion.mjs";
import { CAMPOS_TASACION, validarDatosTasacion } from "@/lib/luciaDatosTasacion.mjs";
import { objetivoTasacionDeclarado } from "@/lib/luciaContexto.mjs";

export default function LuciaTasador({ onResultado, mensajes = null }) {
  const [barrios, setBarrios] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [objetivo, setObjetivo] = useState(() => objetivoTasacionDeclarado(mensajes || []));
  const [plazo, setPlazo] = useState("");
  const [propuesta, setPropuesta] = useState({});
  const [confirmados, setConfirmados] = useState(null);
  const [lecturaFallida, setLecturaFallida] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const interpretar = mensajes?.length > 0;
    fetch(interpretar ? "/api/tasar/interpretar/" : "/api/tasar/barrios", {
      signal: controller.signal,
      ...(interpretar ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensajes }) } : {}),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("barrios");
        const data = await res.json();
        if (!Array.isArray(data.barrios) || !data.barrios.length) throw new Error("barrios");
        setBarrios(data.barrios);
        setPropuesta(validarDatosTasacion(data.datos, data.barrios));
        setLecturaFallida(interpretar && !data.disponible);
      })
      .catch(async (err) => {
        if (err.name === "AbortError") return;
        if (!interpretar) { setError(true); return; }
        try {
          const res = await fetch("/api/tasar/barrios", { signal: controller.signal });
          const data = await res.json();
          if (!res.ok || !data.barrios?.length) throw new Error("barrios");
          setBarrios(data.barrios);
          setLecturaFallida(true);
        } catch (fallback) { if (fallback.name !== "AbortError") setError(true); }
      });
    return () => controller.abort();
  }, [intento, mensajes]);

  if (error) return <div role="alert" className="text-sm p-3">No pude cargar los barrios. <button type="button" className="underline" onClick={() => { setError(false); setIntento((n) => n + 1); }}>Reintentar</button></div>;
  if (!barrios) return <p role="status" className="text-sm p-3">{mensajes?.length ? "Estoy leyendo los datos que me contaste…" : "Estoy preparando el tasador…"}</p>;
  if (Object.keys(propuesta).length && confirmados === null) return <form className="space-y-3 p-3" onSubmit={(e) => {
    e.preventDefault();
    setConfirmados(validarDatosTasacion(propuesta, barrios));
  }}>
    <p className="text-sm font-medium">Tomé estos datos de lo que me contaste. ¿Están bien?</p>
    {propuesta.tipo && <label className="block text-sm">Tipo de propiedad
      <select className="lucia-tool-input mt-1" value={propuesta.tipo} onChange={(e) => setPropuesta((p) => ({ ...p, tipo: e.target.value }))}>
        <option>Casa</option><option>Departamento</option>
      </select>
    </label>}
    {propuesta.barrio && <label className="block text-sm">Barrio
      <select className="lucia-tool-input mt-1" value={propuesta.barrio} onChange={(e) => setPropuesta((p) => ({ ...p, barrio: e.target.value }))}>
        {barrios.map((b) => <option key={b}>{b}</option>)}
      </select>
    </label>}
    {Object.entries(CAMPOS_TASACION).filter(([campo]) => campo in propuesta && !(campo === "superficieTerreno" && propuesta.tipo === "Departamento")).map(([campo, limites]) => <label className="block text-sm" key={campo}>{limites.label}
      <input className="lucia-tool-input mt-1" type="number" min={limites.min} max={limites.max} step={campo.startsWith("superficie") ? "any" : "1"} value={propuesta[campo] ?? ""}
        onChange={(e) => setPropuesta((p) => ({ ...p, [campo]: e.target.value === "" ? null : Number(e.target.value) }))} />
    </label>)}
    <button type="submit" className="lucia-quick-reply px-3 py-2 text-sm">Confirmar y continuar</button>
    <button type="button" className="block text-sm underline" onClick={() => { setPropuesta({}); setConfirmados({}); }}>Completar desde cero</button>
  </form>;
  return <div className={styles.compacto}>
    {lecturaFallida && <p role="status" className="p-3 text-sm">No pude recuperar los datos de la charla. Podés completar la tasación acá.</p>}
    {Object.keys(confirmados || {}).length > 0 && <button type="button" className="px-3 pt-3 text-sm underline" onClick={() => setConfirmados(null)}>Revisar datos confirmados</button>}
    <div className="space-y-3 px-3 pt-3">
      <label className="block text-sm">{objetivoTasacionDeclarado(mensajes || []) ? "Tu objetivo" : "¿Qué estás evaluando?"} <span className="text-xs text-gray-500">Opcional</span>
        <select className="lucia-tool-input mt-1" value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
          <option value="">Elegir</option>
          {OBJETIVOS_TASACION.map((opcion) => <option key={opcion}>{opcion}</option>)}
        </select>
      </label>
      {objetivo && objetivo !== OBJETIVOS_TASACION[0] && <label className="block text-sm">¿Para cuándo lo pensás? <span className="text-xs text-gray-500">Opcional</span>
        <select className="lucia-tool-input mt-1" value={plazo} onChange={(e) => setPlazo(e.target.value)}>
          <option value="">Elegir</option>
          {PLAZOS_TASACION.map((opcion) => <option key={opcion}>{opcion}</option>)}
        </select>
      </label>}
    </div>
    <TasadorWizard barrios={barrios} datosIniciales={confirmados} compacto onResultado={(tasacion) => onResultado?.({
      ...tasacion, datos: { ...tasacion.datos, objetivo, plazo: objetivo && objetivo !== OBJETIVOS_TASACION[0] ? plazo : "" },
    })} />
  </div>;
}
