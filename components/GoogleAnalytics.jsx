"use client";
// Carga Google Analytics 4 (gtag.js) y decide, en cada navegación, si ESTE
// dispositivo debe medirse o no. Para silenciar usa el flag nativo de gtag.js
// `window['ga-disable-<ID>']`: cuando es true, gtag.js no envía NINGÚN hit,
// incluidas las páginas vistas automáticas del Enhanced Measurement (que se
// disparan solas en cada cambio de URL del SPA — ver docs de Next sobre GA4).
//
// Se silencia en dos casos:
//   1. Cualquier ruta /admin → el panel privado no es tráfico real del sitio.
//   2. Opt-out manual del dueño ("no contarme"), guardado en localStorage por
//      NoTrackToggle. Sirve para no inflar las visitas cuando él mismo navega
//      la web pública desde su celular o PC.
//
// La carga inicial la cubre un guard síncrono en el <head> (ver app/layout.js);
// este componente mantiene el flag al día en las navegaciones cliente.
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// El ID de medición es público (aparece en el HTML), así que se deja un
// respaldo hardcodeado: si falta la variable de entorno en Vercel, GA sigue
// funcionando igual en vez de apagarse en silencio (pasó el 12/07/2026).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-BPWSKDWRBN";

// Mantener esta lógica en sincronía con el guard del <head> en layout.js.
function shouldDisable(pathname) {
  if (typeof window === "undefined") return false;
  if (pathname && pathname.startsWith("/admin")) return true;
  try {
    return localStorage.getItem("cp-no-track") === "1";
  } catch {
    return false;
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // En cada cambio de ruta, recalcular el flag para la página a la que se entra.
  useEffect(() => {
    if (!GA_ID) return;
    window[`ga-disable-${GA_ID}`] = shouldDisable(pathname);
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
    </>
  );
}
