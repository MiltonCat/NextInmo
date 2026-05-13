"use client";
import { useRef } from "react";
import { WA_URL, PHONE_DISPLAY, CONTACT_EMAIL } from "@/config";

function buildWAMessage(property, priceDisplay) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const operationLabel = { venta: "Venta", alquiler: "Alquiler permanente", ambas: "Venta y Alquiler" };

  let msg = `*${property.title}*\n`;
  msg += `_${operationLabel[property.operation] ?? ""} · ${property.type}_\n\n`;
  msg += `📍 ${property.location}\n`;
  msg += `💰 ${priceDisplay}\n`;
  if (property.area > 0) msg += `📐 ${property.area} m²\n`;
  if (property.bedrooms > 0) msg += `🛏 ${property.bedrooms} dormitorios\n`;
  if (property.bathrooms > 0) msg += `🚿 ${property.bathrooms} baños\n`;
  if (property.roi) msg += `📈 ROI estimado ~${property.roi}%\n`;
  msg += `\n🔗 ${url}\n`;
  msg += `\n_Catalán Propiedades · San Martín de los Andes_`;

  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export default function PropertySheet({ property, onClose }) {
  const sheetRef = useRef(null);

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y Alquiler",
  };

  const priceDisplay = property.modalidad === "alquiler_permanente"
    ? `$ ${property.precioAlquilerARS?.toLocaleString("es-AR")} /mes`
    : `USD ${property.price?.toLocaleString()}`;

  const handlePrint = () => {
    const url = window.location.href;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ficha — ${property.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; background: #fff; }

          .sheet { max-width: 800px; margin: 0 auto; padding: 40px; }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #111; margin-bottom: 28px; }
          .header-brand { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #111; }
          .header-sub { font-size: 11px; color: #888; margin-top: 3px; }
          .header-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: #111; color: #fff; padding: 4px 10px; border-radius: 4px; }

          /* Title block */
          .title-block { margin-bottom: 24px; }
          .operation-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
          .property-title { font-size: 22px; font-weight: 800; line-height: 1.25; color: #111; margin-bottom: 6px; }
          .property-location { font-size: 13px; color: #666; }

          /* Image */
          .main-image { width: 100%; height: 280px; object-fit: cover; border-radius: 8px; margin-bottom: 28px; }

          /* Key data */
          .key-data { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 28px; }
          .key-data-item { background: #fff; padding: 16px; text-align: center; }
          .key-data-value { font-size: 18px; font-weight: 800; color: #111; }
          .key-data-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #999; margin-top: 3px; }

          /* Price highlight */
          .price-block { background: #f9fafb; border-radius: 8px; padding: 20px 24px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
          .price-value { font-size: 28px; font-weight: 900; color: #111; }
          .price-label { font-size: 11px; color: #888; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 3px; }
          .roi-badge { background: #dcfce7; color: #166534; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 6px; }

          /* Sections */
          .section { margin-bottom: 24px; }
          .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #999; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
          .description { font-size: 13px; line-height: 1.7; color: #444; }

          /* Features */
          .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .feature-item { display: flex; align-items: center; gap-8px; font-size: 13px; color: #444; }
          .feature-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #111; margin-right: 8px; flex-shrink: 0; }

          /* Contact */
          .contact-block { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #111; color: #fff; border-radius: 8px; padding: 20px 24px; margin-top: 32px; }
          .contact-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
          .contact-value { font-size: 13px; font-weight: 600; }

          /* Footer */
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
          .footer-id { font-size: 11px; color: #bbb; }
          .footer-url { font-size: 11px; color: #bbb; word-break: break-all; }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .sheet { padding: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">

          <div class="header">
            <div>
              <div class="header-brand">Catalán Propiedades</div>
              <div class="header-sub">San Martín de los Andes · Patagonia Argentina</div>
            </div>
            <div class="header-badge">${operationLabel[property.operation] ?? "Propiedad"}</div>
          </div>

          <div class="title-block">
            <div class="operation-tag">${property.type}</div>
            <h1 class="property-title">${property.title}</h1>
            <p class="property-location">${property.location}</p>
          </div>

          <img class="main-image" src="${window.location.origin}${property.image}" alt="${property.title}" />

          <div class="price-block">
            <div>
              <div class="price-value">${priceDisplay}</div>
              <div class="price-label">Precio de ${property.modalidad === "alquiler_permanente" ? "alquiler" : "venta"}</div>
            </div>
            ${property.roi ? `<div class="roi-badge">ROI ~${property.roi}% anual</div>` : ""}
          </div>

          ${(property.area > 0 || property.bedrooms > 0 || property.bathrooms > 0) ? `
          <div class="key-data">
            ${property.area > 0 ? `<div class="key-data-item"><div class="key-data-value">${property.area}</div><div class="key-data-label">m² totales</div></div>` : ""}
            ${property.bedrooms > 0 ? `<div class="key-data-item"><div class="key-data-value">${property.bedrooms}</div><div class="key-data-label">Dormitorios</div></div>` : ""}
            ${property.bathrooms > 0 ? `<div class="key-data-item"><div class="key-data-value">${property.bathrooms}</div><div class="key-data-label">Baños</div></div>` : ""}
            <div class="key-data-item"><div class="key-data-value">#${property.id}</div><div class="key-data-label">ID Propiedad</div></div>
          </div>` : ""}

          ${property.description ? `
          <div class="section">
            <div class="section-title">Descripción</div>
            <p class="description">${property.description}</p>
          </div>` : ""}

          ${property.features?.length > 0 ? `
          <div class="section">
            <div class="section-title">Características</div>
            <div class="features">
              ${property.features.map(f => `<div class="feature-item"><span class="feature-dot"></span>${f}</div>`).join("")}
            </div>
          </div>` : ""}

          <div class="contact-block">
            <div>
              <div class="contact-label">Asesor</div>
              <div class="contact-value">Milton Catalán</div>
            </div>
            <div>
              <div class="contact-label">WhatsApp</div>
              <div class="contact-value">${PHONE_DISPLAY}</div>
            </div>
            <div>
              <div class="contact-label">Email</div>
              <div class="contact-value">${CONTACT_EMAIL}</div>
            </div>
          </div>

          <div class="footer">
            <span class="footer-id">ID #${property.id}</span>
            <span class="footer-url">${url}</span>
          </div>

        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-300 tracking-widest uppercase">Exportar ficha</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-3">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Ficha de propiedad</h2>
          <p className="text-sm text-gray-400 mb-6">Exportá o compartí esta propiedad en formato profesional.</p>

          <button
            onClick={handlePrint}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 hover:border-gray-400 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Imprimir / Guardar como PDF</p>
              <p className="text-xs text-gray-400 mt-0.5">Ficha completa lista para imprimir o exportar</p>
            </div>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 hover:border-gray-400 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Compartir ficha</p>
              <p className="text-xs text-gray-400 mt-0.5">Copiá el link o compartí directo desde tu celular</p>
            </div>
          </button>

          <a
            href={buildWAMessage(property, priceDisplay)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-200 hover:border-gray-400 transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-50 group-hover:bg-green-100 transition flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.855L.057 23.885l6.194-1.624A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Enviar por WhatsApp</p>
              <p className="text-xs text-gray-400 mt-0.5">Enviá la ficha completa con todos los datos</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
