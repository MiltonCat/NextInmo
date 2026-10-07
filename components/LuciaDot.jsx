"use client";

import { useId } from "react";
import styles from "./LuciaDot.module.css";

// La cara de Lucía: el isotipo de Catalán (globo de diálogo con medio círculo,
// cuarto de círculo y lunar), dibujado en SVG para que sea nítido a cualquier
// tamaño y para poder animar cada forma por separado.
//
// estado="reposo"   → el lunar respira despacio.
// estado="pensando" → el lunar rebota, el cuarto de círculo gira y el medio
//                     círculo late, mientras Lucía prepara la respuesta.
//
// Sin `label` es decorativo (aria-hidden); con `label` se anuncia como imagen.
export default function LuciaDot({ size = 36, estado = "reposo", label, className = "" }) {
  // Los degradados de SVG se referencian por id: cada instancia necesita el suyo.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const globo = `lucia-globo-${uid}`;
  const brillo = `lucia-brillo-${uid}`;
  const forma = `lucia-forma-${uid}`;
  const clases = [styles.dot, estado === "pensando" ? styles.pensando : "", className].filter(Boolean).join(" ");

  return (
    <svg
      className={clases}
      width={size}
      height={size}
      viewBox="243 243 714 714"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={globo} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7637a" />
          <stop offset="0.55" stopColor="#e5445f" />
          <stop offset="1" stopColor="#c92a4b" />
        </linearGradient>
        <radialGradient id={brillo} cx="0.3" cy="0.12" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={forma} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffe8ee" />
        </linearGradient>
      </defs>

      <path
        d="M243 957V470A227 227 0 0 1 470 243H730A227 227 0 0 1 957 470V730A227 227 0 0 1 730 957Z"
        fill={`url(#${globo})`}
      />
      <path
        d="M243 957V470A227 227 0 0 1 470 243H730A227 227 0 0 1 957 470V730A227 227 0 0 1 730 957Z"
        fill={`url(#${brillo})`}
      />
      {/* Las formas van giradas 90° respecto del isotipo original para que se lea
          como una cara de frente: cuarto y lunar arriba (ojos), medio círculo abajo. */}
      <path className={styles.medio} d="M369 624A231 231 0 0 0 831 624Z" fill={`url(#${forma})`} />
      <path className={styles.cuarto} d="M369 391A160 160 0 0 0 528 551V391Z" fill={`url(#${forma})`} />
      <circle className={styles.lunar} cx="741" cy="481" r="89" fill={`url(#${forma})`} />
    </svg>
  );
}
