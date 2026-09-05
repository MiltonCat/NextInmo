"use client";

import { useEffect, useState } from "react";
import TasadorWizard from "./TasadorWizard";
import styles from "./LuciaTasador.module.css";

export default function LuciaTasador({ onResultado }) {
  const [barrios, setBarrios] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/tasar/barrios", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("barrios");
        const data = await res.json();
        if (!Array.isArray(data.barrios) || !data.barrios.length) throw new Error("barrios");
        setBarrios(data.barrios);
      })
      .catch((err) => { if (err.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [intento]);

  if (error) return <div role="alert" className="text-sm p-3">No pude cargar los barrios. <button type="button" className="underline" onClick={() => { setError(false); setIntento((n) => n + 1); }}>Reintentar</button></div>;
  if (!barrios) return <p role="status" className="text-sm p-3">Estoy preparando el tasador…</p>;
  return <div className={styles.compacto}><TasadorWizard barrios={barrios} compacto onResultado={onResultado} /></div>;
}
