"use client";
import { useState, useEffect } from "react";

export default function Hero() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCollapsed(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{
        height: collapsed ? "110px" : "55vh",
        minHeight: collapsed ? "110px" : "380px",
        transition: "height 900ms cubic-bezier(0.4, 0, 0.2, 1), min-height 900ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <img
        src="/portada.jpg"
        alt="San Martín de los Andes — Catalán Propiedades"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover hero-kenburns"
        style={{
          transition: "opacity 900ms ease",
          opacity: collapsed ? 0.35 : 1,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: collapsed ? "110px" : "112px",
          background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)",
          transition: "height 900ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-4"
        style={{
          top: 0,
          bottom: "110px",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 600ms ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <h1 className="text-gray-900 text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
          Encontrá tu lugar en la Patagonia
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-xl">
          Venta, alquiler e inversiones en San Martín de los Andes · +10 años de experiencia
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/propiedades"
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg"
          >
            Ver propiedades
          </a>
          <a
            href="/inversiones"
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-gray-200"
          >
            Ver inversiones
          </a>
        </div>
      </div>


      <div className="absolute inset-x-0 bottom-0 px-6 flex items-center justify-center"
        style={{ height: "110px" }}
      >
        <div className="flex items-center gap-6 md:gap-12">
          <div className="text-center">
            <p className="text-gray-900 text-base md:text-xl font-bold leading-none">+18% ROI</p>
            <p className="text-gray-500 text-xs mt-0.5 tracking-wide">Gestionados</p>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="text-center">
            <p className="text-gray-900 text-base md:text-xl font-bold leading-none">10+</p>
            <p className="text-gray-500 text-xs mt-0.5 tracking-wide">Años de experiencia</p>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="text-center">
            <p className="text-gray-900 text-base md:text-xl font-bold leading-none">San Martín</p>
            <p className="text-gray-500 text-xs mt-0.5 tracking-wide">de los Andes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
