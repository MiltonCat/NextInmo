"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Toast from "./Toast";
import ScrollToTop from "./ScrollToTop";
import WhatsAppFloat from "./WhatsAppFloat";

const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export default function ClientShell() {
  const [showToast, setShowToast] = useState(true);

  return (
    <>
      {showToast && (
        <Toast
          message="¿Buscando propiedades en la Patagonia? Tenemos las mejores opciones para vos."
          linkText="Ver propiedades"
          link="/propiedades"
          onClose={() => setShowToast(false)}
        />
      )}
      <ChatBot />
      <ScrollToTop />
      <WhatsAppFloat />
    </>
  );
}
