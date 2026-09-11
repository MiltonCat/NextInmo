"use client";

import { useEffect, useState } from "react";
import TasadorWizard from "@/components/TasadorWizard";

const CIUDADES = [
  ["sma", "San Martín de los Andes"],
  ["neuquen", "Neuquén"],
  ["villa-la-angostura", "Villa La Angostura"],
  ["bariloche", "Bariloche"],
];

export default function TasacionProfesionalClient({ barriosIniciales = [] }) {
  const [ciudad, setCiudad] = useState("sma");
  const [barrios, setBarrios] = useState(barriosIniciales);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (ciudad === "sma") return;
    let vigente = true;
    setCargando(true);
    fetch(`/api/tasar/barrios?ciudad=${encodeURIComponent(ciudad)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (vigente) setBarrios(Array.isArray(data.barrios) ? data.barrios : []); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [ciudad]);

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-700">Elegí la ciudad del inmueble</p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {CIUDADES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCiudad(value)}
            aria-pressed={ciudad === value}
            className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${ciudad === value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {cargando ? <p className="mb-4 text-sm text-gray-500">Cargando barrios de la ciudad...</p> : null}
      <TasadorWizard barrios={barrios} ciudad={ciudad} />
    </div>
  );
}
