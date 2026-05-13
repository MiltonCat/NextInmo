"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCenter = [-40.1579, -70.9698];
const defaultZoom = 12;

export default function PropertyMap({ properties, selectedId }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="w-full h-full rounded-lg"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => {
        const lat = property.lat || defaultCenter[0] + (Math.random() - 0.5) * 0.02;
        const lng = property.lng || defaultCenter[1] + (Math.random() - 0.5) * 0.02;

        return (
          <Marker key={property.id} position={[lat, lng]}>
            <Popup>
              <div className="w-48">
                <img src={property.image} alt={property.title} className="w-full h-24 object-cover rounded mb-2" />
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{property.title}</h3>
                <p className="text-rose-500 font-bold">USD {property.price?.toLocaleString()}</p>
                <Link href={`/propiedades/${property.id}`} className="text-xs text-rose-500 hover:underline mt-1 block">
                  Ver detalles →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
