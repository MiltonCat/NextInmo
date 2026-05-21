"use client";
import { useState } from "react";
import { WA_NUMBER } from "@/config";

const TIPOS = ["Casa", "Departamento", "Terreno", "Local comercial", "Cabaña"];
const ZONAS = ["Centro", "Chapelco Golf", "Costanera", "Las Marías", "Las Pendientes", "Otro"];
const ESTADOS = ["A estrenar", "Buen estado", "Necesita refacción"];
const DORMITORIOS = ["1", "2", "3", "4", "5 o más", "No aplica"];

export default function TasacionForm() {
  const [form, setForm] = useState({
    tipo: "", zona: "", superficie: "", dormitorios: "",
    estado: "", anio: "", nombre: "", whatsapp: "", comentarios: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipo || !form.zona || !form.superficie || !form.nombre || !form.whatsapp) {
      setError("Completá los campos obligatorios para continuar.");
      return;
    }
    setError("");
    const msg = encodeURIComponent(
      `Hola Milton, soy ${form.nombre.trim()} y quiero una tasación orientativa de mi propiedad.\n\n` +
      `🏠 Datos de la propiedad:\n` +
      `• Tipo: ${form.tipo}\n` +
      `• Zona: ${form.zona}\n` +
      `• Superficie: ${form.superficie} m²\n` +
      `${form.dormitorios ? `• Dormitorios: ${form.dormitorios}\n` : ""}` +
      `${form.estado ? `• Estado: ${form.estado}\n` : ""}` +
      `${form.anio ? `• Año aprox.: ${form.anio}\n` : ""}` +
      `${form.comentarios.trim() ? `• Comentarios: ${form.comentarios.trim()}\n` : ""}` +
      `\nMi WhatsApp: ${form.whatsapp.trim()}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-black text-gray-900">¡Listo! Te redirigimos a WhatsApp</p>
        <p className="text-gray-500 text-sm max-w-xs">Milton va a revisar los datos y te responde con una estimación orientativa en menos de 48 hs.</p>
        <button
          onClick={() => { setEnviado(false); setForm({ tipo: "", zona: "", superficie: "", dormitorios: "", estado: "", anio: "", nombre: "", whatsapp: "", comentarios: "" }); }}
          className="mt-4 text-rose-600 hover:text-rose-500 text-sm font-semibold underline transition-colors"
        >
          Tasar otra propiedad
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Datos de la propiedad */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Datos de la propiedad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de propiedad <span className="text-rose-500">*</span></label>
            <select value={form.tipo} onChange={set("tipo")} required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition">
              <option value="">Seleccioná un tipo</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Zona / Barrio <span className="text-rose-500">*</span></label>
            <select value={form.zona} onChange={set("zona")} required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition">
              <option value="">Seleccioná una zona</option>
              {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Superficie total (m²) <span className="text-rose-500">*</span></label>
            <input type="number" min="1" value={form.superficie} onChange={set("superficie")} placeholder="Ej: 120" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dormitorios</label>
            <select value={form.dormitorios} onChange={set("dormitorios")} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition">
              <option value="">Seleccioná</option>
              {DORMITORIOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado de la propiedad</label>
            <select value={form.estado} onChange={set("estado")} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition">
              <option value="">Seleccioná</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Año de construcción aprox.</label>
            <input type="number" min="1950" max="2026" value={form.anio} onChange={set("anio")} placeholder="Ej: 2015" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition" />
          </div>

        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Comentarios adicionales</label>
          <textarea value={form.comentarios} onChange={set("comentarios")} placeholder="Ej: tiene piscina, vista al lago, cochera doble..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition resize-none" />
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Tus datos de contacto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu nombre <span className="text-rose-500">*</span></label>
            <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="Ej: Carlos García" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tu WhatsApp <span className="text-rose-500">*</span></label>
            <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="Ej: +54 9 11 1234-5678" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.186-1.622A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.658-.518-5.168-1.418l-.371-.22-3.673.963.981-3.585-.242-.38A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Solicitar tasación por WhatsApp
      </button>
      <p className="text-gray-400 text-xs mt-1">La tasación es orientativa y gratuita · Respondemos en menos de 48 hs</p>
    </form>
  );
}
