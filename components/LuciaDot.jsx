"use client";

import { useId } from "react";
import styles from "./LuciaDot.module.css";

// La cara de Lucía: un círculo con las formas del isotipo de Catalán puestas de
// frente (dos lunares iguales como ojos y el medio círculo como sonrisa), con
// lentes redondos, en SVG para que sea nítido a cualquier tamaño y para animar
// cada parte por separado.
//
// estado:
//   "reposo"     → los ojos respiran y parpadean; la boca está tranquila y cada
//                  tanto sonríe.
//   "escuchando" → mira hacia abajo, al campo de texto, mientras la persona escribe.
//   "pensando"   → mira hacia arriba al costado, entrecierra los ojos, boca "mmm…".
//   "sorpresa"   → ojos grandes y boca en "o" (encontró propiedades).
//   "apenada"    → mirada baja y boca triste (no hubo resultados).
//   "guino"      → guiña el ojo izquierdo y sonríe (saludo).
// hablando → la boca se abre y se cierra mientras suena la voz de Lucía.
//
// A 32 px o menos usa una versión simplificada (trazos más gruesos, sin brillos)
// para que no se empaste.
//
// Sin `label` es decorativo (aria-hidden); con `label` se anuncia como imagen.
const ESTADOS = new Set(["reposo", "escuchando", "pensando", "sorpresa", "apenada", "guino"]);

export default function LuciaDot({ size = 36, estado = "reposo", hablando = false, label, className = "" }) {
  // Los degradados de SVG se referencian por id: cada instancia necesita el suyo.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const globo = `lucia-globo-${uid}`;
  const brillo = `lucia-brillo-${uid}`;
  const forma = `lucia-forma-${uid}`;
  const actual = ESTADOS.has(estado) ? estado : "reposo";
  const clases = [
    styles.dot,
    styles[actual],
    hablando ? styles.hablando : "",
    size <= 32 ? styles.compacto : "",
    className,
  ].filter(Boolean).join(" ");

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
      <circle className={styles.brilloCara} cx="600" cy="600" r="357" fill={`url(#${brillo})`} />

      {/* Bocas: una por expresión. El CSS muestra la que corresponde. */}
      <path
        className={`${styles.boca} ${styles.bocaTranquila}`}
        d="M530 688Q600 728 670 688"
        fill="none"
        stroke="#ffffff"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <path className={`${styles.boca} ${styles.sonrisa}`} d="M445 640A155 155 0 0 0 755 640Z" fill={`url(#${forma})`} />
      <rect className={`${styles.boca} ${styles.bocaPensando}`} x="560" y="690" width="150" height="38" rx="19" fill={`url(#${forma})`} />
      <circle className={`${styles.boca} ${styles.bocaO}`} cx="600" cy="712" r="56" fill={`url(#${forma})`} />
      <path
        className={`${styles.boca} ${styles.bocaTriste}`}
        d="M540 718Q600 680 660 718"
        fill="none"
        stroke="#ffffff"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <ellipse className={`${styles.boca} ${styles.bocaHabla}`} cx="600" cy="700" rx="72" ry="46" fill={`url(#${forma})`} />

      {/* Ojos: tres capas para que cada animación tenga su propio transform —
          .ojo respira y cambia con la expresión, .parpado parpadea (o guiña) y
          .pupila mira hacia donde corresponde. */}
      {[459, 741].map((cx, i) => (
        <g key={cx} className={i === 0 ? `${styles.ojo} ${styles.ojoIzq}` : styles.ojo}>
          <g className={styles.parpado}>
            <circle cx={cx} cy="481" r="89" fill={`url(#${forma})`} />
            <g className={styles.pupila}>
              <circle cx={cx + 6} cy="490" r="44" fill="#1d1418" />
              <circle className={styles.brilloPupila} cx={cx - 8} cy="474" r="13" fill="#ffffff" />
            </g>
          </g>
        </g>
      ))}

      {/* Ojo izquierdo cerrado: una curvita que solo se ve al guiñar. */}
      <path
        className={styles.ojoCerrado}
        d="M398 486Q459 528 520 486"
        fill="none"
        stroke="#1d1418"
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* Lentes redondos: marcos, puente y patillas. Quedan quietos aunque los
          ojos parpadeen o cambien de expresión. */}
      <g className={styles.lentes} fill="none" stroke="#1d1418" strokeWidth="22" strokeLinecap="round">
        <circle className={styles.cristal} cx="459" cy="481" r="114" fill="#ffffff" fillOpacity="0.1" />
        <circle className={styles.cristal} cx="741" cy="481" r="114" fill="#ffffff" fillOpacity="0.1" />
        <path d="M573 468Q600 448 627 468" />
        <path d="M345 470L276 452" />
        <path d="M855 470L924 452" />
      </g>
    </svg>
  );
}
