"use client";

// Ancla con tracking de GA4 para usar desde Server Components,
// donde no se puede pasar un onClick. El evento se dispara al clic
// y la navegación sigue su curso normal.
export default function TrackedLink({ event, eventParams = {}, children, ...props }) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, eventParams);
    }
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
