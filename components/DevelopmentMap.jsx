"use client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

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
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{
          color: "#e11d48",
          weight: 3,
          fillColor: "#e11d48",
          fillOpacity: 0.25,
        }}
      >
        <Tooltip direction="top" offset={[0, -12]} permanent>
          {nombre}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
