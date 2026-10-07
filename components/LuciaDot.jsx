"use client";

import { useId } from "react";
import styles from "./LuciaDot.module.css";

// La cara de Lucía: un círculo con las formas del isotipo de Catalán puestas de
// frente (dos lunares iguales como ojos y el medio círculo como sonrisa), en SVG
// para que sea nítido a cualquier tamaño y para animar cada forma por separado.
//
// estado="reposo"   → los ojos respiran despacio.
// estado="pensando" → los ojos rebotan uno detrás del otro y la sonrisa late,
//                     mientras Lucía prepara la respuesta.
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

      <circle cx="600" cy="600" r="357" fill={`url(#${globo})`} />
      <circle cx="600" cy="600" r="357" fill={`url(#${brillo})`} />
      {/* Ojos arriba, sonrisa abajo. */}
      <path className={styles.medio} d="M369 624A231 231 0 0 0 831 624Z" fill={`url(#${forma})`} />
      <circle className={styles.ojo} cx="459" cy="481" r="89" fill={`url(#${forma})`} />
      <circle className={`${styles.ojo} ${styles.ojoDerecho}`} cx="741" cy="481" r="89" fill={`url(#${forma})`} />
    </svg>
  );
}
