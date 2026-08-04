"use client";

import { useState } from "react";
import EncuestaBarrioDrawer from "./EncuestaBarrioDrawer";

// Bloque de "sumá tu opinión" al pie de cada ficha de barrio.
//
// Va acá y no arriba a propósito: según el diseño de la Guía de Barrios, el
// vecino responde cuando ya leyó algo y tiene una opinión formada. Preselecciona
// el barrio de la ficha para que arranque un paso más adelante.
export default function BarrioEncuestaCTA({ slug, nombre }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <EncuestaBarrioDrawer
        open={abierto}
        onClose={() => setAbierto(false)}
        barrioInicial={slug}
      />

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-jakarta mb-2">
          ¿Vivís o viviste en {nombre}?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-5 max-w-xl">
          Contanos cómo es en la práctica. Son 2 minutos y tu respuesta se suma a
          los datos que ve el próximo que esté decidiendo si mudarse acá.
        </p>
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          Contar mi experiencia en {nombre}
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Anónimo. Revisamos cada respuesta antes de publicarla.
        </p>
      </div>
    </>
  );
}
