"use client";

import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import CampoTrampa from "./CampoTrampa";

const INTERESES = [
  { value: "", label: "¿Qué querés hacer?" },
  { value: "comprar", label: "Comprar" },
  { value: "alquilar", label: "Alquilar" },
  { value: "invertir", label: "Invertir" },
  { value: "mirar", label: "Solo mirando" },
];

const TIPOS = [
  { value: "", label: "Cualquier tipo" },
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "lote", label: "Lote" },
  { value: "comercial", label: "Local o propiedad comercial" },
];

export default function SuscripcionForm({ placement = "home" }) {
  const [email, setEmail] = useState("");
  const [interes, setInteres] = useState("");
  const [tipo, setTipo] = useState("");
  const [zona, setZona] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
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
        body: JSON.stringify({ email, interes, tipo, zona, presupuesto, trampa }),
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
      <div ref={containerRef} className="space-y-3 py-4 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">✓</span>
        <p className="text-lg font-bold text-gray-900">Tu alerta quedó creada</p>
        <p className="text-sm text-gray-600">
          Te vamos a avisar cuando entre una propiedad que coincida con lo que buscás.
        </p>
      </div>
    );
  }

  return (
    <form ref={containerRef} onSubmit={onSubmit} onFocus={markStarted} className="space-y-4">
      <CampoTrampa valor={trampa} onChange={setTrampa} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-gray-700">
          Estoy buscando
          <select required value={interes} onChange={(e) => setInteres(e.target.value)} className="min-h-12 rounded-xl border border-gray-200 bg-white px-3.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10">
            {INTERESES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-gray-700">
          Tipo de propiedad
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="min-h-12 rounded-xl border border-gray-200 bg-white px-3.5 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10">
            {TIPOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-gray-700">
          Zona o barrio <span className="font-normal text-gray-400">(opcional)</span>
          <input type="text" value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej. Centro o Vega Maipú" className="min-h-12 rounded-xl border border-gray-200 bg-white px-3.5 font-normal text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-gray-700">
          Presupuesto <span className="font-normal text-gray-400">(opcional)</span>
          <input type="text" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} placeholder="Ej. hasta USD 200.000" className="min-h-12 rounded-xl border border-gray-200 bg-white px-3.5 font-normal text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-gray-700">
        ¿Dónde te avisamos?
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email" autoComplete="email" className="min-h-12 rounded-xl border border-gray-200 bg-white px-3.5 font-normal text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
      </label>

      <button type="submit" disabled={estado === "enviando"} className="w-full rounded-xl bg-gray-900 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-60">
        {estado === "enviando" ? "Creando tu alerta…" : "Crear mi alerta"}
      </button>

      {estado === "error" && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          No pudimos anotarte. Revisá el email e intentá de nuevo.
        </p>
      )}

      <p className="text-xs leading-relaxed text-gray-500">
        Usamos estos datos únicamente para enviarte oportunidades relacionadas con tu búsqueda. Cero spam.
      </p>
    </form>
  );
}
