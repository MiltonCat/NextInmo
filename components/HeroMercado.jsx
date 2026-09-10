"use client";

import { useEffect, useState } from "react";

// El multiplicador llega ya formateado desde el servidor y ese es el texto que
// sale en el HTML: Google y quien tenga el JS bloqueado ven el dato correcto.
// Acá solo se lo anima.
//
// La cuenta arranca únicamente si la hidratación llegó temprano. El texto ya está
// pintado: si empezáramos a contar tarde, el visitante vería el número final y
// recién después el salto hacia atrás, que es peor que no animar nada. El corte
// está donde termina el fundido de entrada del bloque (hero-delay-4), así que
// cuando la cuenta corre, corre tapada por ese fundido.
const CORTE_HIDRATACION_MS = 1000;
const DURACION_MS = 1200;

const suavizar = (t) => 1 - Math.pow(1 - t, 3);

// Arranca en 1 y no en 0 a propósito: 1 es "los dos barrios valen lo mismo", que
// es justo la intuición que el dato viene a corregir.
const PISO = 1;

const formatear = (valor) =>
  valor.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function HeroMercado({ factor, factorTexto, extremos, puntos, pie }) {
  // `null` hasta que la animación arranca: mantiene el primer render del cliente
  // idéntico al del servidor y evita el aviso de hidratación.
  const [animado, setAnimado] = useState(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (performance.now() > CORTE_HIDRATACION_MS) return;

    let frame = 0;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / DURACION_MS);
      setAnimado(PISO + (factor - PISO) * suavizar(t));
      if (t < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [factor]);

  return (
    <div className="hero-fade-in hero-delay-4 mt-10 max-w-2xl border-t border-white/20 pt-5 sm:mt-12 sm:pt-6">
      <p className="text-sm leading-snug text-white/75 sm:text-base">
        Entre el barrio más barato y el más caro, el m² se multiplica por{" "}
        <strong className="font-black text-white">{animado == null ? factorTexto : formatear(animado)}</strong>
      </p>

      {/* Cada barrio medido, ubicado por su mediana sobre la misma escala. Es
          decorativo: lo que hay que leer son los dos extremos, que van abajo
          como texto. */}
      <div className="relative mt-6 h-px bg-white/20" aria-hidden="true">
        {puntos.map((punto, indice) => (
          <span
            key={punto.id}
            className="hero-punto absolute top-1/2 h-1.5 w-1.5 rounded-full bg-white/70"
            style={{ left: `${punto.posicion}%`, animationDelay: `${0.55 + indice * 0.06}s` }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-start justify-between gap-4 text-[10px] leading-tight sm:text-xs">
        <div className="min-w-0">
          <span className="block font-bold text-white">{extremos.barato.nombre}</span>
          <span className="text-white/55">{extremos.barato.precio}/m²</span>
        </div>
        <div className="min-w-0 text-right">
          <span className="block font-bold text-white">{extremos.caro.nombre}</span>
          <span className="text-white/55">{extremos.caro.precio}/m²</span>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-white/45">{pie}</p>
    </div>
  );
}
