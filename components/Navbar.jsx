"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const TABS = [
  { href: "/propiedades", label: "Comprar",  icon: <TabBuyIcon /> },
  { href: "/alquileres",  label: "Alquilar", icon: <TabKeyIcon /> },
  { href: "/inversiones", label: "Invertir", icon: <TabChartIcon /> },
];

const SECONDARY_LINKS = [
  { href: "/nosotros",           label: "Nosotros" },
  { href: "/contacto",           label: "Contacto" },
  { href: "/precio-m2",          label: "Precio del m²" },
  { href: "/blog",               label: "Blog" },
  { href: "/experiencia-barrio", label: "Compartí tu barrio" },
];

const PROP_TYPES = [
  {
    type: "Casa",
    label: "Casa",
    emoji: "🏡",
    bg: "from-rose-100 to-pink-200",
    activeBg: "from-rose-200 to-pink-300",
    text: "text-rose-800",
    ring: "ring-rose-400",
  },
  {
    type: "Departamento",
    label: "Depto / Mono",
    emoji: "🏢",
    bg: "from-violet-100 to-purple-200",
    activeBg: "from-violet-200 to-purple-300",
    text: "text-violet-800",
    ring: "ring-violet-400",
  },
  {
    type: "Lote",
    label: "Lote",
    emoji: "🏔️",
    bg: "from-emerald-100 to-green-200",
    activeBg: "from-emerald-200 to-green-300",
    text: "text-emerald-800",
    ring: "ring-emerald-400",
  },
  {
    type: "Cabaña",
    label: "Cabaña",
    emoji: "🏕️",
    bg: "from-amber-100 to-orange-200",
    activeBg: "from-amber-200 to-orange-300",
    text: "text-amber-800",
    ring: "ring-amber-400",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [confetti, setConfetti]         = useState([]);

  const router   = useRouter();
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const menuRef    = useRef(null);
  const searchRef  = useRef(null);
  const heartNavRef = useRef(null);

  const CONFETTI_COLORS = ["#E8325A", "#FFD700", "#4ECDC4", "#FF6B6B", "#96CEB4", "#A8D8EA"];

  useEffect(() => {
    const handler = () => {
      const rect = heartNavRef.current?.getBoundingClientRect();
      const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const oy = rect ? rect.top + rect.height / 2 : 32;
      const pieces = Array.from({ length: 18 }, (_, i) => ({
        id: Date.now() + i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        ox,
        oy,
        dx: `${(Math.random() - 0.5) * 180}px`,
        dy: `${(Math.random() - 0.6) * 160}px`,
        rot: `${(Math.random() - 0.5) * 720}deg`,
        size: `${Math.random() * 7 + 5}px`,
        isCircle: i % 2 === 0,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 950);
    };
    window.addEventListener("favorite-added", handler);
    return () => window.removeEventListener("favorite-added", handler);
  }, []);

  const activeTab = TABS.find(t => pathname.startsWith(t.href)) ?? TABS[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))   setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const selectType = (type) => {
    setSelectedType(type);
    setSearchOpen(false);
    router.push(`/propiedades?type=${encodeURIComponent(type)}`);
  };

  const clearType = (e) => {
    e?.stopPropagation();
    setSelectedType("");
    router.push("/propiedades");
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-lg" : "border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" ref={searchRef}>

        {/* ── Fila 1 ── */}
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/marca1.png" alt="Catalán Propiedades" className="h-9 w-auto" />
          </Link>

          {/* Tabs — desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {TABS.map(({ href, label, icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`group flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-all duration-200 hover:-translate-y-0.5 ${
                    active
                      ? "font-bold text-rose-700 bg-gradient-to-br from-rose-50 to-pink-50 shadow-sm shadow-rose-100 border border-rose-100"
                      : "font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-rose-500" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {icon}
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Chip — Compartí tu barrio */}
          <Link
            href="/experiencia-barrio"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors flex-shrink-0 whitespace-nowrap"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            <PinIcon />
            Compartí tu barrio
          </Link>

          {/* Lupa compacta — solo visible al scrollear */}
          {scrolled && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar por tipo"
              className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-all flex-shrink-0 ${
                searchOpen
                  ? "bg-rose-500 text-white"
                  : "bg-rose-600 text-white hover:bg-rose-500"
              }`}
            >
              <MagnifyIcon className="h-4 w-4" />
            </button>
          )}

          {/* Acciones derecha */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto" ref={menuRef}>

            {/* Favoritos */}
            <Link href="/favoritos" ref={heartNavRef} aria-label="Mis favoritos"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                favorites.length > 0
                  ? "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <HeartIcon filled={favorites.length > 0} className="h-4 w-4" />
              {favorites.length > 0 && <span>{favorites.length}</span>}
            </Link>

            {/* CTA */}
            <Link href="/tasacion"
              className="hidden sm:inline-flex items-center bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors shadow-sm whitespace-nowrap"
            >
              Tasar mi propiedad
            </Link>

            {/* Hamburguesa */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                {menuOpen ? <XIcon className="h-4 w-4 text-gray-600" /> : <BurgerIcon className="h-4 w-4 text-gray-600" />}
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[60]">
                  <div className="md:hidden border-b border-gray-100">
                    {TABS.map(({ href, label }) => (
                      <Link key={href} href={href}
                        className={`flex items-center px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50 ${pathname.startsWith(href) ? "text-rose-600" : "text-gray-700"}`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                  {SECONDARY_LINKS.map(({ href, label }) => (
                    <Link key={href} href={href}
                      className={`flex items-center px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${pathname === href ? "text-rose-600 font-medium" : "text-gray-600"}`}
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="sm:hidden border-t border-gray-100">
                    <Link href="/favoritos" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <HeartIcon filled={false} className="h-4 w-4" />
                      Mis favoritos{favorites.length > 0 ? ` (${favorites.length})` : ""}
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 p-3">
                    <Link href="/tasacion"
                      className="flex items-center justify-center w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Tasar mi propiedad
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Fila 2 — selector de tipo estilo Airbnb, colapsa al scrollear ── */}
        <div style={{
          maxHeight: scrolled ? "0px" : "60px",
          opacity: scrolled ? 0 : 1,
          overflow: "visible",
          transition: "max-height 350ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
          pointerEvents: scrolled ? "none" : "auto",
        }}>
          <div className="pb-3 max-w-xl mx-auto">

            {/* Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <span className={`flex-1 text-sm ${selectedType ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {selectedType ? selectedType : "¿Qué tipo de propiedad buscás?"}
              </span>
              {selectedType ? (
                <span
                  role="button"
                  onClick={clearType}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="flex-shrink-0 bg-rose-600 text-white p-2 rounded-full">
                  <MagnifyIcon className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Panel de categorías — accesible desde lupa scrolled o trigger fila 2 */}
        {searchOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(calc(100% - 2rem), 36rem)",
              marginTop: 8,
              zIndex: 60,
            }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">¿Qué tipo de propiedad buscás?</p>
              <div className="grid grid-cols-4 gap-2">
                {PROP_TYPES.map(({ type, label, emoji, ring }) => {
                  const active = selectedType === type;
                  return (
                    <button
                      key={type}
                      onMouseDown={() => selectType(type)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl h-28 bg-white border-2 transition-all duration-200 hover:scale-[1.05] hover:shadow-md ${
                        active
                          ? `ring-2 ${ring} border-transparent scale-[1.04] shadow-md`
                          : "border-gray-100 hover:border-gray-200 shadow-sm"
                      }`}
                    >
                      <span className="text-4xl leading-none select-none">{emoji}</span>
                      <span className={`text-xs font-bold leading-tight text-center px-1 ${active ? "text-gray-900" : "text-gray-600"}`}>{label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedType && (
                <button
                  onMouseDown={clearType}
                  className="mt-3 w-full text-center text-xs text-gray-500 hover:text-rose-600 font-medium py-2 border-t border-gray-100 transition-colors"
                >
                  Ver todas las propiedades
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>

    {confetti.map((p) => (
      <span
        key={p.id}
        style={{
          position: "fixed",
          top: p.oy,
          left: p.ox,
          width: p.size,
          height: p.size,
          borderRadius: p.isCircle ? "50%" : "2px",
          background: p.color,
          "--dx": p.dx,
          "--dy": p.dy,
          "--rot": p.rot,
          animation: "confetti-fly 0.9s ease-out forwards",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
        }}
      />
    ))}
    </>
  );
}

/* ── Íconos SVG ── */

function MagnifyIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}
function ChevronDownIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
function HeartIcon({ filled, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function BurgerIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* Íconos de tipo de propiedad */
function HouseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
function LandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function CabinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 10h3v10h14V10h3L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-6h6v6" />
    </svg>
  );
}
function StudioIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
    </svg>
  );
}
function TabBuyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function TabKeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}
function TabChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function PHIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  );
}
