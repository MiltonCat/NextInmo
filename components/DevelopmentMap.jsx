"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";

// Mapa de un desarrollo: un solo punto, el acceso al proyecto.
//
// Va con CircleMarker y no con el Marker clásico de Leaflet a propósito. El
// marcador por defecto necesita tres imágenes servidas desde unpkg.com, y una
// ficha que ya carga miniatura de YouTube no necesita otro dominio de terceros
// para dibujar una gota. El círculo lo dibuja el propio Leaflet.
//
// `scrollWheelZoom` apagado: si queda encendido, la rueda del mouse deja de
// scrollear la página y empieza a hacer zoom apenas el puntero pasa por arriba
// del mapa. En una ficha larga, eso es dejar al visitante trabado.
export default function DevelopmentMap({ lat, lng, nombre, zoom = 13 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // La instancia vive exactamente lo mismo que este efecto. Esto evita que
    // una capa de react-leaflet intente agregarse a un pane ya desmontado
    // durante la doble comprobación de efectos de React en desarrollo.
    const map = L.map(container, {
      center: [lat, lng],
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    L.circleMarker([lat, lng], {
      radius: 14,
      color: "#e11d48",
      weight: 3,
      fillColor: "#e11d48",
      fillOpacity: 0.25,
    })
      .addTo(map)
      .bindTooltip(nombre, { direction: "top", offset: [0, -12], permanent: true });

    return () => map.remove();
  }, [lat, lng, nombre, zoom]);

  return <div ref={containerRef} className="h-full w-full" />;
}
