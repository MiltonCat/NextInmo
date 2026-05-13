"use client";
import { useState } from "react";
import { WA_NUMBER } from "@/config";

export default function PropertyInquiry({ property, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(""); };

  const operationLabel = {
    venta: "Venta",
    alquiler: "Alquiler permanente",
    ambas: "Venta y Alquiler",
  };

  const priceDisplay = property.modalidad === "alquiler_permanente"
    ? `$ ${property.precioAlquilerARS?.toLocaleString("es-AR")} /mes`
    : `USD ${property.price?.toLocaleString()}`;

  const handleSend = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }

    const url = typeof window !== "undefined" ? window.location.href : "";

    let msg = `Hola, me interesa esta propiedad.\n\n`;
    msg += `Propiedad: ${property.title}\n`;
    msg += `Operación: ${operationLabel[property.operation] ?? "—"}\n`;
    msg += `Ubicación: ${property.location}\n`;
    msg += `Precio: ${priceDisplay}\n`;
    if (property.area > 0) msg += `Superficie: ${property.area} m²\n`;
    if (property.bedrooms > 0) msg += `Dormitorios: ${property.bedrooms}\n`;
    msg += `ID: #${property.id}\n`;
    msg += `Link: ${url}\n`;
    msg += `\nNombre: ${form.name}\n`;
    msg += `Teléfono: ${form.phone}\n`;
    if (form.email.trim()) msg += `Email: ${form.email}\n`;
    if (form.message.trim()) msg += `\nMensaje:\n${form.message}`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-300 tracking-widest uppercase">Consulta de interés</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Tus datos</h2>
          <p className="text-sm text-gray-400 mb-8">Te contactamos por WhatsApp para darte más información.</p>

          <div className="space-y-6">
            {[
              { label: "Nombre", field: "name", type: "text", placeholder: "Juan García", required: true },
              { label: "Teléfono", field: "phone", type: "tel", placeholder: "+54 9 2944 000000", required: true },
              { label: "Email", field: "email", type: "email", placeholder: "tucorreo@email.com", required: false },
            ].map(({ label, field, type, placeholder, required }) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {label}{!required && <span className="ml-1 font-normal normal-case text-gray-300">· opcional</span>}
                </label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={set(field)}
                  placeholder={placeholder}
                  className="w-full border-b border-gray-200 pb-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-gray-900 transition bg-transparent"
                />
              </div>
            ))}

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Mensaje <span className="ml-1 font-normal normal-case text-gray-300">· opcional</span>
              </label>
              <textarea
                value={form.message}
                onChange={set("message")}
                placeholder="¿Alguna consulta adicional sobre esta propiedad?"
                rows={2}
                className="w-full border-b border-gray-200 pb-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none focus:border-gray-900 transition bg-transparent resize-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 mt-4">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-50">
          <button
            onClick={handleSend}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2.5 text-sm tracking-wide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.855L.057 23.885l6.194-1.624A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.866 9.866 0 01-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z" />
            </svg>
            Enviar consulta por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
