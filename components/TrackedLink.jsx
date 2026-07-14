"use client";

import { WA_URL } from "@/config";
import { contextualPageMessage, whatsappUrl } from "@/lib/whatsapp";

// Ancla con tracking de GA4 para usar desde Server Components,
// donde no se puede pasar un onClick. El evento se dispara al clic
// y la navegación sigue su curso normal.
export default function TrackedLink({ event, eventParams = {}, children, onClick, ...props }) {
  const handleClick = (clickEvent) => {
    onClick?.(clickEvent);
    if (clickEvent.defaultPrevented) return;

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, eventParams);
    }

    const href = String(props.href || "");
    const isGenericWhatsApp = event === "whatsapp_click" && href === WA_URL;
    if (isGenericWhatsApp) {
      clickEvent.preventDefault();
      const contextualUrl = whatsappUrl(
        contextualPageMessage(window.location.pathname, document.title),
      );
      window.open(contextualUrl, props.target || "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
