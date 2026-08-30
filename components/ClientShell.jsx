"use client";
import dynamic from "next/dynamic";
import ScrollToTop from "./ScrollToTop";
import FavoritesAccountPrompt from "./FavoritesAccountPrompt";

const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export default function ClientShell() {
  return (
    <>
      {/* Único botón flotante del sitio: Lucía atiende y también deriva a
          WhatsApp desde adentro del chat. El WhatsAppFloat quedó desmontado a
          propósito (el componente sigue en components/ si hay que volver).

          El Toast de "¿Buscando propiedades en la Patagonia?" se bajó el
          30/08/2026: decía lo mismo para todo el sitio y llevaba a un listado,
          mientras que la burbuja de invitación de Lucía usa la frase de la
          página donde está el visitante y abre una conversación. Dos avisos
          compitiendo en la misma esquina se anulaban entre sí.
          El componente sigue en components/Toast.jsx. */}
      <ChatBot />
      <ScrollToTop />
      <FavoritesAccountPrompt />
    </>
  );
}
