"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./LuciaDot.module.css";

// La cara de Lucía: orbe rosa con luz suave, ojos y boca. Un SVG por instancia.
//
// estado:
//   "reposo"     → ojos que parpadean cada tanto y siguen el cursor, sonrisa suave.
//   "escuchando" → mira hacia abajo, al campo de texto, sonríe.
//   "pensando"   → se pone lentes para leer: sin boca, las pupilas barren de
//                  costado a costado detrás de los cristales.
//   "sorpresa"   → ojos más grandes y boca en "o".
//   "apenada"    → ojos entrecerrados, mirada baja y boca triste.
//   "guino"      → guiña el ojo izquierdo y sonríe (saludo).
// hablando → la boca se abre y cierra mientras suena la voz de Lucía.
// saludando → da un salto con una vuelta completa (botón flotante cerrado).
//
// Sin `label` es decorativo (aria-hidden); con `label` se anuncia como imagen.
const ESTADOS = new Set(["reposo", "escuchando", "pensando", "sorpresa", "apenada", "guino"]);

export default function LuciaDot({ size = 36, estado = "reposo", hablando = false, saludando = false, label, className = "" }) {
  // Los degradados de SVG se referencian por id: cada instancia necesita el suyo.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const cuerpoGrad = `lucia-cuerpo-${uid}`;
  const resplandorGrad = `lucia-resplandor-${uid}`;
  const actual = ESTADOS.has(estado) ? estado : "reposo";
  const svgRef = useRef(null);

  // Los ojos siguen el cursor: se escriben dos variables CSS (--mx, --my) en el
  // SVG y el CSS mueve el ojo entero. Solo con mouse y sin "reducir movimiento".
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    let frame = 0;
    let ultimo = null;
    const aplicar = () => {
      frame = 0;
      if (!ultimo) return;
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      let x = (ultimo.x - (r.left + r.width / 2)) / 120;
      let y = (ultimo.y - (r.top + r.height * 0.45)) / 120;
      const d = Math.hypot(x, y) || 1;
      const k = Math.min(1, d) / d;
      svg.style.setProperty("--mx", `${(x * k * 3).toFixed(2)}px`);
      svg.style.setProperty("--my", `${(y * k * 3).toFixed(2)}px`);
    };
    const mover = (e) => {
      ultimo = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(aplicar);
    };
    const soltar = () => {
      ultimo = null;
      svg.style.setProperty("--mx", "0px");
      svg.style.setProperty("--my", "0px");
    };
    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", soltar);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  const clases = [
    styles.dot,
    styles[actual],
    hablando ? styles.hablando : "",
    saludando ? styles.saludando : "",
    size <= 32 ? styles.compacto : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <svg
      ref={svgRef}
      className={clases}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <radialGradient id={cuerpoGrad} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd6de" />
          <stop offset="0.35" stopColor="#f7637a" />
          <stop offset="0.75" stopColor="#e5445f" />
          <stop offset="1" stopColor="#c92a4b" />
        </radialGradient>
        <radialGradient id={resplandorGrad} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f7637a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f7637a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle className={styles.resplandor} cx="50" cy="52" r="46" fill={`url(#${resplandorGrad})`} />

      <g className={styles.cuerpo}>
        <circle cx="50" cy="50" r="36" fill={`url(#${cuerpoGrad})`} />
        <ellipse className={styles.reflejo} cx="38" cy="30" rx="10" ry="6" fill="#ffffff" transform="rotate(-25 38 30)" />

        <g className={styles.ojos}>
          {/* Ojos negros en forma de píldora con dos brillos. `mira` sigue el
              cursor; `pupila` lleva los gestos de cada estado (mirar abajo, barrer). */}
          <g className={`${styles.ojo} ${styles.ojoIzq}`}>
            <g className={styles.mira}>
              <g className={styles.pupila}>
                <rect x="33.5" y="37" width="11" height="16" rx="5.5" fill="#2a1d22" />
                <g className={styles.brillo}>
                  <circle cx="41.4" cy="41.3" r="1.9" fill="#ffffff" />
                  <circle cx="36.4" cy="48.6" r="0.9" fill="#ffffff" fillOpacity="0.7" />
                </g>
              </g>
            </g>
          </g>
          <g className={styles.ojo}>
            <g className={styles.mira}>
              <g className={styles.pupila}>
                <rect x="55.5" y="37" width="11" height="16" rx="5.5" fill="#2a1d22" />
                <g className={styles.brillo}>
                  <circle cx="63.4" cy="41.3" r="1.9" fill="#ffffff" />
                  <circle cx="58.4" cy="48.6" r="0.9" fill="#ffffff" fillOpacity="0.7" />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* Lentes para leer: bajan y se acomodan cuando piensa, y se van al responder. */}
        <g className={styles.lentes} fill="none" stroke="#2a1d22" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="39" cy="45" r="9.5" fill="#ffffff" fillOpacity="0.14" />
          <circle cx="61" cy="45" r="9.5" fill="#ffffff" fillOpacity="0.14" />
          <path d="M48.5 44 Q50 42 51.5 44" />
          <path d="M29.5 43 L22 40" />
          <path d="M70.5 43 L78 40" />
        </g>

        {/* Ojo izquierdo cerrado: solo se ve al guiñar. */}
        <g className={styles.ojosCerrados}>
          <path d="M34 46 Q39 41 44 46" fill="none" stroke="#2a1d22" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* Bocas: una por expresión. El CSS muestra la que corresponde. */}
        <path className={`${styles.boca} ${styles.bocaSonrisa}`} d="M43 60 Q50 67 57 60" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <ellipse className={`${styles.boca} ${styles.bocaO}`} cx="50" cy="62" rx="3.4" ry="4.2" fill="#2a1d22" />
        <path className={`${styles.boca} ${styles.bocaTriste}`} d="M43 65 Q50 58 57 65" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <ellipse className={`${styles.boca} ${styles.bocaHabla}`} cx="50" cy="62" rx="5.5" ry="4" fill="#2a1d22" />
      </g>
    </svg>
  );
}
