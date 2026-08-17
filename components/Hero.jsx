"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCollapsed(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobile(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const heroHeight = collapsed ? (isMobile ? "84px" : "110px") : (isMobile ? "265px" : "55vh");
  const heroMinHeight = collapsed ? (isMobile ? "84px" : "110px") : (isMobile ? "265px" : "380px");
  const metricsHeight = isMobile ? "92px" : "110px";

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{
        height: heroHeight,
        minHeight: heroMinHeight,
        transition: "height 900ms cubic-bezier(0.4, 0, 0.2, 1), min-height 900ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Image
        src="/portada.webp"
        alt="San Martín de los Andes — Catalán Propiedades"
        fill
        priority
        sizes="100vw"
        className="object-cover hero-kenburns"
        style={{
          transition: "opacity 900ms ease",
          opacity: collapsed ? 0.3 : isMobile ? 0.42 : 1,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: collapsed ? metricsHeight : "112px",
          background: isMobile
            ? "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 58%, transparent 100%)"
            : "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)",
          transition: "height 900ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center text-center px-4"
        style={{
          top: 0,
          bottom: isMobile ? "0px" : metricsHeight,
          opacity: collapsed ? 0 : 1,
          transition: "opacity 600ms ease",
          pointerEvents: collapsed ? "none" : "auto",
        }}
      >
        <h1 className="text-gray-900 text-[1.7rem] sm:text-4xl font-bold mb-2 drop-shadow-lg leading-tight max-w-[19rem] sm:max-w-none">
          Compra donde otros ya compraron: +18% ROI gestionados
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-5 max-w-[18rem] sm:max-w-xl leading-snug">
          Propiedades nuevas cada semana. Asesoramiento local verificado.
        </p>
        <div className="flex w-full max-w-[17rem] flex-col sm:w-auto sm:max-w-none sm:flex-row gap-2.5 sm:gap-3">
          <Link
            href="/propiedades"
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg text-center"
          >
            Ver propiedades
          </Link>
          <Link
            href="/inversiones"
            className="hidden sm:inline-block bg-white/90 hover:bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl transition-colors text-sm border border-gray-200 shadow-sm text-center"
          >
            Analizar inversión
          </Link>
        </div>
      </div>


      <div className="absolute inset-x-0 bottom-0 px-6 hidden md:flex items-center justify-center"
        style={{ height: metricsHeight }}
      >
        <div className="flex items-center gap-4 md:gap-12">
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
