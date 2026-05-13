"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

const leafletFix = `
  .leaflet-pane, .leaflet-top, .leaflet-bottom {
    z-index: 1 !important;
  }
  .leaflet-control {
    z-index: 2 !important;
  }
`;

const ZONES = [
  {
    name: "Centro / Lago Lacar",
    coords: [-40.1579, -70.9698],
    rentabilidad: "USD 2.100/m2",
    tipo: "Residencial - Turistico",
    score: 92,
    verdict: "Renta inmediata",
    descripcion: "La zona con el m2 mas caro del pais. Alta demanda de alquiler turistico con retorno de USD 60-90/dia en temporada alta.",
  },
  {
    name: "Altos del Chapelco",
    coords: [-40.2050, -70.9300],
    rentabilidad: "USD 310.000 prom.",
    tipo: "Premium - Country",
    score: 88,
    verdict: "Plusvalia",
    descripcion: "Barrio privado en expansion. Valor promedio de venta USD 310.000. Alta plusvalia y demanda sostenida de compradores premium.",
  },
  {
    name: "Faldeos del Chapelco",
    coords: [-40.2200, -70.9150],
    rentabilidad: "Lotes en valorizacion",
    tipo: "Desarrollo - Terrenos",
    score: 95,
    verdict: "Reserva de valor",
    descripcion: "Zona de desarrollo activo con proyectos como Ollagua II. Terrenos con alta proyeccion de valorizacion.",
  },
  {
    name: "Chapelco Golf & Resort",
    coords: [-40.1900, -70.9000],
    rentabilidad: "Rentabilidad turistica alta",
    tipo: "Turistico - Resort",
    score: 90,
    verdict: "Alto ticket",
    descripcion: "Destino 4 estaciones: ski en invierno, golf y trekking en verano. Una de las 3 zonas mas buscadas segun Argenprop.",
  },
  {
    name: "Meliquina",
    coords: [-40.3200, -71.0500],
    rentabilidad: "Acceso a precios bajos",
    tipo: "Natural - En desarrollo",
    score: 84,
    verdict: "Entrada baja",
    descripcion: "Una de las 3 zonas mas populares segun Argenprop. Precios accesibles con fuerte potencial de crecimiento y turismo de naturaleza.",
  },
];

export default function InvestmentMap() {
  const [isClient, setIsClient] = useState(false);
  const [activeZone, setActiveZone] = useState(null);

  const rankedZones = [...ZONES].sort((a, b) => b.score - a.score);
  const featuredZone = activeZone ?? rankedZones[0];
  const rentaZone = ZONES.find((z) => z.verdict === "Renta inmediata");
  const plusvaliaZone = ZONES.find((z) => z.verdict === "Plusvalia");

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="bg-white py-10" style={{ isolation: "isolate" }}>
      <style>{leafletFix}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-5">
          <p className="text-[#FF5A5F] text-sm font-semibold tracking-widest uppercase mb-2">Oportunidades</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Zonas de inversion en la Patagonia</h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Vista rapida: Faldeos del Chapelco lidera como reserva de valor, Centro / Lago Lacar destaca en renta inmediata y Altos del Chapelco queda como apuesta premium de plusvalia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
          <div className="lg:col-span-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Mejor reserva", zone: rankedZones[0] },
                { label: "Mejor renta", zone: rentaZone },
                { label: "Mejor plusvalia", zone: plusvaliaZone },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveZone(item.zone)}
                  className="rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-[#FF5A5F] transition-colors"
                >
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{item.zone?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Score {item.zone?.score}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "360px", position: "relative", zIndex: 0 }}>
              {isClient ? (
                <MapContainer center={[-40.1900, -71.0100]} zoom={11} style={{ height: "100%", width: "100%" }} zoomControl={true} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
                  {ZONES.map((zone) => (
                    <CircleMarker
                      key={zone.name}
                      center={zone.coords}
                      radius={featuredZone.name === zone.name ? 16 : 11}
                      pathOptions={{
                        color: "#FF5A5F",
                        fillColor: "#FF5A5F",
                        fillOpacity: featuredZone.name === zone.name ? 0.9 : 0.6,
                        weight: 2,
                      }}
                      eventHandlers={{ click: () => setActiveZone(zone) }}
                    >
                      <Popup>
                        <div className="text-sm font-semibold">{zone.name}</div>
                        <div className="text-xs text-gray-600">{zone.tipo}</div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              ) : (
                <div className="w-full h-full bg-gray-100 animate-pulse" />
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2.5">
            <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">Ranking</p>
                <span className="text-[10px] font-semibold text-gray-400">Top 5</span>
              </div>
              <div className="space-y-1.5">
                {rankedZones.map((zone, index) => (
                  <button
                    key={zone.name}
                    onClick={() => setActiveZone(zone)}
                    className={`w-full text-left rounded-xl p-2.5 border transition-all duration-200 ${
                      activeZone?.name === zone.name ? "bg-[#FF5A5F]/10 border-[#FF5A5F] shadow-sm" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                          <p className="text-gray-900 text-sm font-semibold">{zone.name}</p>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{zone.tipo}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[#FF5A5F] text-sm font-bold">{zone.score}</div>
                        <div className="text-[10px] text-gray-400">{zone.verdict}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-3">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1">Seleccionada</p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-gray-900 font-bold text-sm">{featuredZone.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{featuredZone.tipo} · {featuredZone.rentabilidad}</p>
                  </div>
                  <span className="text-[#FF5A5F] text-sm font-bold">{featuredZone.score}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{featuredZone.descripcion}</p>
              </div>
            </div>

            <a href="/inversiones" className="block text-center bg-[#FF5A5F] hover:bg-[#FF385C] text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg text-sm">
              Ver oportunidades →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
