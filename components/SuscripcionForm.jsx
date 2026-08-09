"use client";

import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import CampoTrampa from "./CampoTrampa";

const INTERESES = [
  { value: "", label: "¿Qué buscás? (opcional)" },
  { value: "comprar", label: "Comprar" },
  { value: "alquilar", label: "Alquilar" },
  { value: "invertir", label: "Invertir" },
  { value: "mirar", label: "Solo mirando" },
];

export default function SuscripcionForm({ placement = "home" }) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [interes, setInteres] = useState("");
  const [trampa, setTrampa] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | ok | error
  const containerRef = useRef(null);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const {
    trackNewsletterSignup,
    trackRadarView,
    trackRadarSignupStart,
    trackRadarSignupComplete,
  } = useAnalytics();

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackRadarView(placement);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [placement, trackRadarView]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackRadarSignupStart(placement);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (estado === "enviando") return;
    setEstado("enviando");
    try {
      const res = await fetch("/api/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre, interes, trampa }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data.ok;
      if (ok) {
        trackNewsletterSignup(interes || "no_indicado");
        trackRadarSignupComplete(placement, interes || "no_indicado");
      }
      setEstado(ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div ref={containerRef} className="text-center space-y-2 py-2">
        <div className="text-4xl">✅</div>
        <p className="text-lg font-bold text-white">¡Listo, {nombre || "te anotamos"}!</p>
        <p className="text-sm text-white/80">
          Vas a ser de los primeros en enterarte cuando entre una propiedad nueva en San Martín de los Andes.
        </p>
      </div>
    );
  }

  return (
    <form ref={containerRef} onSubmit={onSubmit} onFocus={markStarted} className="space-y-3">
      <CampoTrampa valor={trampa} onChange={setTrampa} />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          autoComplete="email"
          className="flex-1 rounded-xl border-0 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {estado === "enviando" ? "Anotándote…" : "Avisame primero"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre (opcional)"
          autoComplete="name"
          className="flex-1 rounded-xl border-0 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
        />
        <select
          value={interes}
          onChange={(e) => setInteres(e.target.value)}
          className="flex-1 rounded-xl border-0 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
        >
          {INTERESES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {estado === "error" && (
        <p className="text-sm text-white bg-black/20 rounded-lg px-3 py-2">
          No pudimos anotarte. Revisá el email e intentá de nuevo.
        </p>
      )}

      <p className="text-xs text-white/70">
        Solo te escribimos cuando hay algo que te puede interesar. Cero spam.
      </p>
    </form>
  );
}
