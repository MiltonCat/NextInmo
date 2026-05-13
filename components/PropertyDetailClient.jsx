"use client";
import { useState } from "react";
import Link from "next/link";
import { properties } from "@/data/properties";
import Lightbox from "@/components/Lightbox";
import VisitScheduler from "@/components/VisitScheduler";
import PropertyInquiry from "@/components/PropertyInquiry";
import PropertySheet from "@/components/PropertySheet";
import { useFavorites } from "@/hooks/useFavorites";
import { WA_NUMBER } from "@/config";

function waLink(propertyTitle, message = "") {
  const text = message || `Hola! Me interesa la propiedad: "${propertyTitle}". Podemos hablar?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function PropertyDetailClient({ id }) {
  const property = properties.find((p) => p.id === parseInt(id));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [inquiry, setInquiry] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const { isFavorite, toggle } = useFavorites();

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
          <Link href="/propiedades" className="text-rose-600 hover:text-rose-500 underline transition-colors">
            Volver a propiedades
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [property.image, property.image1, property.image2, property.image3, property.image4].filter(Boolean);
  const fav = isFavorite(property.id);
  const isAlquiler = property.modalidad === "alquiler_permanente";

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y Alquiler",
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInquiry = () => {
    const msg = inquiry.trim()
      ? `Hola! Me interesa la propiedad: "${property.title}".\n\n${inquiry}`
      : `Hola! Me interesa la propiedad: "${property.title}". Podemos hablar?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const openGallery = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scheduleVisitUrl = waLink(
    property.title,
    `Hola! Quiero agendar una visita para la propiedad: "${property.title}". Que horarios tienen disponibles?`
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-white pt-24 pb-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/propiedades" className="hover:text-gray-900 transition-colors">Propiedades</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{property.title}</span>
          </nav>

          <Link href="/propiedades" className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-500 mb-5 text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a propiedades
          </Link>

          <div className="flex gap-2 mb-3">
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">{property.type}</span>
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">{operationLabel[property.operation]}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{property.location}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button
                onClick={() => toggle(property.id)}
                className="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm transition"
                style={{ borderColor: fav ? "#6366f1" : "#d1d5db", color: fav ? "#818cf8" : "#6b7280" }}
                aria-label={fav ? "Quitar de favoritos" : "Guardar"}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={fav ? "#818cf8" : "none"} stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span className="hidden sm:inline">{fav ? "Guardada" : "Guardar"}</span>
              </button>
              <button
                onClick={() => setShowSheet(true)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
                aria-label="Exportar ficha"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                </svg>
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

          {/* Gallery - desktop */}
          <div className="relative mb-8 hidden lg:grid grid-cols-4 grid-rows-2 gap-1 h-64 lg:h-80 overflow-hidden rounded-xl">
            <div className="col-span-2 row-span-2">
              <img src={property.image} alt={property.title} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition" onClick={() => openGallery(0)} />
            </div>
            {[property.image1, property.image2, property.image3, property.image4].map((image, index) => (
              <div key={index} className="col-span-1 row-span-1">
                <img
                  src={image || property.image}
                  alt={`${property.title} - ${index + 2}`}
                  loading="lazy"
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  onClick={() => openGallery(index + 1)}
                />
              </div>
            ))}
            <button
              onClick={() => openGallery(0)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg transition hover:bg-white"
            >
              Ver {allImages.length} fotos
            </button>
          </div>

          {/* Gallery - mobile */}
          <div className="lg:hidden mb-6">
            <div className="overflow-x-auto flex gap-1 pb-2 snap-x snap-mandatory">
              {allImages.map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-full snap-center">
                  <img src={img} alt={`${property.title} - ${idx + 1}`} loading={idx > 0 ? "lazy" : undefined} className="w-full h-64 object-cover rounded-xl cursor-pointer" onClick={() => openGallery(idx)} />
                </div>
              ))}
            </div>
            <button onClick={() => openGallery(0)} className="w-full mt-2 border border-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl text-sm">
              Ver {allImages.length} fotos
            </button>
          </div>

          {/* Main layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">

            {/* Sticky sidebar */}
            <div className="lg:col-span-1 lg:order-last mb-8 lg:mb-0">
              <div className="sticky top-24">
                <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                  {isAlquiler ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">$ {property.precioAlquilerARS?.toLocaleString("es-AR")}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">por mes</p>
                      </div>
                      <div className="flex flex-col divide-y divide-gray-100 text-sm">
                        <div className="flex justify-between py-2.5">
                          <span className="text-gray-500">Disponible desde</span>
                          <span className="font-semibold text-green-600">{property.disponibleDesde}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                          <span className="text-gray-500">Mínimo</span>
                          <span className="text-gray-700">{property.mesesMinimos} meses</span>
                        </div>
                        {property.condiciones && (
                          <div className="flex justify-between py-2.5 gap-4">
                            <span className="text-gray-500 shrink-0">Condiciones</span>
                            <span className="text-gray-700 text-xs text-right">{property.condiciones}</span>
                          </div>
                        )}
                      </div>
                      {(property.bedrooms > 0 || property.bathrooms > 0 || property.area > 0) && (
                        <div className="grid grid-cols-3 gap-2">
                          {property.bedrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                              <p className="text-xs text-gray-500">Dorm.</p>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
                              <p className="text-xs text-gray-500">Baños</p>
                            </div>
                          )}
                          {property.area > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.area}</p>
                              <p className="text-xs text-gray-500">m²</p>
                            </div>
                          )}
                        </div>
                      )}
                      <a
                        href={waLink(property.title, `Hola! Me interesa alquilar la propiedad: "${property.title}". Podemos hablar?`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl text-center transition"
                      >
                        Consultar disponibilidad
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">USD {property.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Precio de venta</p>
                      </div>
                      {property.roi && (
                        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                          <span className="text-green-700 text-sm font-medium">ROI estimado</span>
                          <span className="text-green-700 font-bold text-lg">~{property.roi}%</span>
                        </div>
                      )}
                      {(property.bedrooms > 0 || property.bathrooms > 0 || property.area > 0) && (
                        <div className="grid grid-cols-3 gap-2">
                          {property.bedrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bedrooms}</p>
                              <p className="text-xs text-gray-500">Dorm.</p>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.bathrooms}</p>
                              <p className="text-xs text-gray-500">Baños</p>
                            </div>
                          )}
                          {property.area > 0 && (
                            <div className="text-center bg-gray-50 rounded-xl p-3">
                              <p className="text-xl font-bold text-gray-800">{property.area}</p>
                              <p className="text-xs text-gray-500">m²</p>
                            </div>
                          )}
                        </div>
                      )}
                      <hr className="border-gray-100" />
                      <button
                        onClick={() => setShowInquiry(true)}
                        className="block w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl text-center transition"
                      >
                        Me interesa esta propiedad
                      </button>
                      <button
                        onClick={() => setShowScheduler(true)}
                        className="block w-full border border-gray-200 hover:border-rose-400 hover:text-rose-600 text-gray-700 font-semibold py-3 rounded-xl text-center transition"
                      >
                        Agendar visita
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              <section className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </section>

              <section className="mb-8 pb-8 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Características</h2>
                <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {property.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                  <img src="/Milton.jpeg" alt="Asesor" loading="lazy" className="w-20 h-20 rounded-full object-cover shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Milton</h3>
                    <p className="text-gray-500 text-sm">Asesor inmobiliario</p>
                    <p className="text-gray-600 text-sm mt-1">Te acompaña en la visita, documentación y cierre de la operación.</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-1">Consulta rápida</h3>
                  <p className="text-gray-500 text-sm mb-3">Enviá tu consulta por WhatsApp directamente sobre esta propiedad.</p>
                  <textarea
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder={`Me interesa "${property.title.slice(0, 40)}...". ¿Está disponible?`}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none mb-3"
                  />
                  <button
                    onClick={handleInquiry}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    Enviar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Lightbox images={allImages} title={property.title} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} startIndex={lightboxIndex} />
        </div>
      </div>

      {showScheduler && (
        <VisitScheduler property={property} onClose={() => setShowScheduler(false)} />
      )}
      {showInquiry && (
        <PropertyInquiry property={property} onClose={() => setShowInquiry(false)} />
      )}
      {showSheet && (
        <PropertySheet property={property} onClose={() => setShowSheet(false)} />
      )}
    </div>
  );
}
