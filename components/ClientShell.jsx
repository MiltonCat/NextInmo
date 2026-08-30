"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Toast from "./Toast";
import ScrollToTop from "./ScrollToTop";
import FavoritesAccountPrompt from "./FavoritesAccountPrompt";

const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export default function ClientShell() {
  const [showToast, setShowToast] = useState(true);
  const pathname = usePathname();

  // En /cuenta el toast se superpone al botón de crear cuenta y compite con la
  // única acción de la página. Ahí no se muestra.
  const enCuenta = pathname?.startsWith("/cuenta");

  return (
    <>
      {showToast && !enCuenta && (
        <div className="hidden md:block">
          <Toast
            message="¿Buscando propiedades en la Patagonia? Tenemos las mejores opciones para vos."
            linkText="Ver propiedades"
            link="/propiedades"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
      {/* Único botón flotante del sitio: Lucía atiende y también deriva a
          WhatsApp desde adentro del chat. El WhatsAppFloat quedó desmontado a
          propósito (el componente sigue en components/ si hay que volver). */}
      <ChatBot />
      <ScrollToTop />
      <FavoritesAccountPrompt />
    </>
  );
}
