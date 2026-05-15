"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { properties } from "@/data/properties";
import { useFavorites } from "@/hooks/useFavorites";

const CONFETTI = [
  { color: "#E8325A", dx:  2,  dy: -40, rotate:  180, w: 5, h: 4 },
  { color: "#f97316", dx:  24, dy: -32, rotate: -120, w: 4, h: 6 },
  { color: "#facc15", dx:  36, dy: -10, rotate:  240, w: 6, h: 3 },
  { color: "#22c55e", dx:  34, dy:  14, rotate: -200, w: 4, h: 5 },
  { color: "#3b82f6", dx:  20, dy:  30, rotate:  160, w: 5, h: 4 },
  { color: "#a855f7", dx: -4,  dy:  38, rotate:  -90, w: 6, h: 3 },
  { color: "#E8325A", dx: -24, dy:  28, rotate:  210, w: 4, h: 5 },
  { color: "#f97316", dx: -36, dy:  12, rotate: -150, w: 5, h: 4 },
  { color: "#facc15", dx: -32, dy: -12, rotate:  270, w: 6, h: 3 },
  { color: "#22c55e", dx: -20, dy: -34, rotate: -200, w: 4, h: 5 },
  { color: "#E8325A", dx:  14, dy: -38, rotate:  130, w: 5, h: 4 },
  { color: "#3b82f6", dx: -14, dy: -36, rotate: -170, w: 6, h: 3 },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const hideFavorites = ["/inversiones", "/contacto", "/nosotros"].includes(pathname);
  const prevFavCount = useRef(favorites.length);
  const [heartConfetti, setHeartConfetti] = useState(false);

  useEffect(() => {
    if (favorites.length > prevFavCount.current) {
      setHeartConfetti(true);
      setTimeout(() => setHeartConfetti(false), 900);
    }
    prevFavCount.current = favorites.length;
  }, [favorites.length]);

  const normalizeText = (value) =>
    value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setAnimate(true); }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      const query = normalizeText(searchQuery);
      const results = properties
        .filter(p =>
          normalizeText(p.title).includes(query) ||
          normalizeText(p.location).includes(query) ||
          normalizeText(p.type).includes(query) ||
          normalizeText(p.description || "").includes(query) ||
          (p.features || []).some((feature) => normalizeText(feature).includes(query))
        )
        .slice(0, 5);
      setSearchResults(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/propiedades?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur border-b border-primary-100 ${
        scrolled ? "shadow-[0_4px_24px_rgba(15,23,42,0.08)]" : ""
      }`}
      style={{
        padding: scrolled ? "8px 0" : "20px 0",
        transition: "padding 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex justify-between items-center"
          style={{ minHeight: "40px", transition: "min-height 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/marca1.png" alt="Catalan Propiedades" className="h-10 w-auto" />
          </Link>

          {/* Links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            {[
              {
                href: "/propiedades", label: "Propiedades", delay: "0.05s",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
              },
              {
                href: "/inversiones", label: "Inversiones", delay: "0.15s",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" />
                  </svg>
                ),
              },
              {
                href: "/contacto", label: "Contacto", delay: "0.3s",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
                  </svg>
                ),
              },
            ].map(({ href, label, delay, icon }) => (
              <Link key={href} href={href} className={`text-[15px] font-semibold tracking-tight transition flex flex-col items-center gap-1 group ${pathname === href ? "text-primary-600" : "text-gray-700 hover:text-primary-600"}`}>
                <span
                  style={{
                    transform: animate ? "rotateY(0deg)" : "rotateY(-360deg)",
                    transition: `transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 200ms`,
                    transitionDelay: delay,
                    display: "inline-block",
                  }}
                >
                  {icon}
                </span>
                <span>{label}</span>
                <div className={`h-0.5 bg-primary-500 transition-all duration-300 ${pathname === href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>

          {/* Buscador — desktop */}
          <div className="hidden md:flex items-center gap-2 relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 120)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
                placeholder="Buscar..."
                className="w-52 lg:w-64 bg-white rounded-full px-4 py-2.5 pl-11 pr-10 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 inline-flex pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 nav-icon-search" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </form>

            {showResults && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[60]">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No se encontraron resultados.</div>
                ) : (
                  <>
                    {searchResults.map((property) => (
                      <div
                        key={property.id}
                        onMouseDown={() => { router.push(`/propiedades/${property.id}`); setShowResults(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <img src={property.image} alt={property.title} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{property.title}</p>
                          <p className="text-xs text-gray-500 truncate">{property.location}</p>
                          <p className="text-xs font-semibold text-primary-500">USD {property.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    <div onMouseDown={handleSearch} className="p-3 text-center text-sm text-primary-600 hover:bg-gray-50 cursor-pointer border-t border-gray-200">
                      Ver todos los resultados
                    </div>
                  </>
                )}
              </div>
            )}

            {!hideFavorites && (
              <Link
                href="/favoritos"
                title="Mis favoritos"
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 transition shadow-sm shadow-primary-200"
              >
                {heartConfetti && CONFETTI.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: p.w,
                      height: p.h,
                      marginTop: -p.h / 2,
                      marginLeft: -p.w / 2,
                      background: p.color,
                      borderRadius: 1,
                      pointerEvents: "none",
                      zIndex: 60,
                      "--dx": `${p.dx}px`,
                      "--dy": `${p.dy}px`,
                      "--rot": `${p.rotate}deg`,
                      animation: `confetti-fly 0.85s cubic-bezier(0.22,1,0.36,1) forwards`,
                      animationDelay: `${i * 0.02}s`,
                    }}
                  />
                ))}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="white" stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: heartConfetti ? "heart-pop 0.6s cubic-bezier(0.36,0.07,0.19,0.97) forwards" : "none" }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-primary-600 text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                    {favorites.length > 9 ? "9+" : favorites.length}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* CTA Compartí tu barrio */}
          <Link
            href="/experiencia-barrio"
            aria-hidden={scrolled}
            tabIndex={scrolled ? -1 : 0}
            className="group hidden md:flex items-center rounded-full relative"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1a0a1e 100%)",
              boxShadow: "0 4px 22px rgba(232,50,90,0.30), 0 1px 4px rgba(0,0,0,0.28)",
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? "scale(0.85)" : "scale(1)",
              pointerEvents: scrolled ? "none" : "auto",
              maxWidth: scrolled ? "0px" : "260px",
              padding: scrolled ? "10px 0px" : "10px 20px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 250ms ease, transform 250ms cubic-bezier(0.4, 0, 0.2, 1), max-width 300ms cubic-bezier(0.4, 0, 0.2, 1), padding 250ms ease",
            }}
          >
            {/* Shimmer sweep */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "38%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                animation: "btn-barrio-shine 3.4s cubic-bezier(0.4,0,0.6,1) infinite",
                animationDelay: "1.2s",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            {/* Contenido */}
            <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 10 }}>
              {/* Dot con ping */}
              <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, flexShrink: 0 }}>
                <span style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "#E8325A",
                  animation: "btn-dot-ping 1.8s ease-out infinite",
                }} />
                <span style={{
                  display: "block", width: 8, height: 8,
                  borderRadius: "50%", background: "#E8325A",
                  position: "relative",
                }} />
              </span>
              {/* Ícono pin */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon-pin" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span style={{ color: "white", fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>Compartí tu barrio</span>
            </span>
          </Link>

          {/* Hamburguesa — mobile */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {[
              { href: "/", label: "Inicio" },
              { href: "/propiedades", label: "Propiedades" },
              { href: "/inversiones", label: "Inversiones" },
              { href: "/experiencia-barrio", label: "Compartí tu barrio" },
              { href: "/contacto", label: "Contacto" },
              { href: "/favoritos", label: "Favoritos" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg transition text-sm font-medium ${pathname === href ? "text-primary-600 bg-primary-50" : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
