"use client";
import { useState } from "react";
import { WA_NUMBER } from "@/config";
import { registrarConsulta } from "@/lib/registrarConsulta";
import { useAnalytics } from "@/hooks/useAnalytics";
import { VALOR_M2, RANGO_M2 } from "@/lib/mercado";

// Solo Casa y Departamento: son los únicos tipos con datos suficientes para mostrar
// una referencia de mercado honesta (435 y 472 propiedades). Cabaña (46) y Terreno
// (34) quedaron afuera por decisión de negocio — quien tenga uno usa "otro tipo",
// que va directo a WhatsApp sin prometer un número que no tenemos.
const TIPOS = [
  { valor: "Casa", label: "Casa", icono: "M3 12l9-9 9 9M5 10v10h14V10" },
  { valor: "Departamento", label: "Departamento", icono: "M4 21V5a1 1 0 011-1h6a1 1 0 011 1v16M12 21V9a1 1 0 011-1h6a1 1 0 011 1v12M8 8h.01M8 12h.01M16 12h.01M16 16h.01" },
];

const ZONAS = ["Centro", "Chapelco Golf", "Costanera", "Las Marías", "Las Pendientes", "Otro"];
const ESTADOS = ["A estrenar", "Buen estado", "Necesita refacción"];
const DORMITORIOS = ["1", "2", "3", "4", "5+"];

const campo =
  "w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white " +
  "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 " +
  "focus:border-slate-900 transition";
const etiqueta = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2";

export default function TasacionForm() {
  const [form, setForm] = useState({
    tipo: "", zona: "", superficie: "", dormitorios: "",
    estado: "", anio: "", nombre: "", whatsapp: "", comentarios: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const { trackTasacionSubmit, trackWhatsAppClick } = useAnalytics();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setValor = (field, valor) => setForm((prev) => ({ ...prev, [field]: valor }));

  const referencia = form.tipo ? VALOR_M2?.[form.tipo] : null;
  const rango = form.tipo ? RANGO_M2?.[form.tipo] : null;

  // Estimación grosera para orientar mientras completa: mediana del tipo × m².
  // No es la tasación — es contexto de mercado, y el copy lo dice así.
  const superficieNum = parseFloat(form.superficie);
  const estimado =
    referencia && superficieNum > 0 ? Math.round((referencia * superficieNum) / 1000) * 1000 : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.tipo || !form.zona || !form.superficie || !form.nombre || !form.whatsapp) {
      setError("Faltan algunos datos para poder tasar. Revisá los campos marcados.");
      return;
    }
    setError("");

    registrarConsulta({
      tipo: "tasacion",
      nombre: form.nombre,
      telefono: form.whatsapp,
      mensaje: form.comentarios,
      detalle: {
        tipoPropiedad: form.tipo,
        zona: form.zona,
        superficie: form.superficie,
        dormitorios: form.dormitorios,
        estado: form.estado,
        anio: form.anio,
      },
    });

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
    trackTasacionSubmit({ propertyType: form.tipo, zone: form.zona });
    trackWhatsAppClick(null, "tasacion_form");
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900">Te abrimos WhatsApp con los datos cargados</p>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
          Milton revisa cada solicitud personalmente y te responde con una estimación en menos de 48 horas.
        </p>
        <button
          onClick={() => { setEnviado(false); setForm({ tipo: "", zona: "", superficie: "", dormitorios: "", estado: "", anio: "", nombre: "", whatsapp: "", comentarios: "" }); }}
          className="mt-3 text-slate-900 hover:text-slate-700 text-sm font-semibold underline underline-offset-4 transition-colors"
        >
          Tasar otra propiedad
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      <div>
        <label className={etiqueta}>Tipo de propiedad</label>
        <div className="grid grid-cols-2 gap-2.5">
          {TIPOS.map((t) => {
            const activo = form.tipo === t.valor;
            return (
              <button
                key={t.valor}
                type="button"
                onClick={() => setValor("tipo", t.valor)}
                aria-pressed={activo}
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-lg border transition ${
                  activo
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icono} />
                </svg>
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-gray-400 text-xs mt-2.5">
          ¿Terreno, cabaña o local?{" "}
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola Milton, quiero tasar una propiedad que no figura en el formulario.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 font-medium underline underline-offset-2"
          >
            Escribinos directo
          </a>{" "}
          — esos los tasa Milton a mano.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={etiqueta}>Zona o barrio</label>
          <select value={form.zona} onChange={set("zona")} required className={campo}>
            <option value="">Elegí una zona</option>
            {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label className={etiqueta}>Superficie cubierta</label>
          <div className="relative">
            <input
              type="number" min="1" inputMode="numeric"
              value={form.superficie} onChange={set("superficie")}
              placeholder="120" required
              className={`${campo} pr-11 tabular-nums`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">m²</span>
          </div>
        </div>
      </div>

      <div>
        <label className={etiqueta}>Dormitorios</label>
        <div className="grid grid-cols-5 gap-2">
          {DORMITORIOS.map((d) => {
            const activo = form.dormitorios === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setValor("dormitorios", activo ? "" : d)}
                aria-pressed={activo}
                className={`py-2.5 rounded-lg border text-sm font-medium transition ${
                  activo
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {referencia && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Referencia del mercado · {form.tipo === "Casa" ? "casas" : "departamentos"} en San Martín
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">
              USD {referencia.toLocaleString("es-AR")}
            </span>
            <span className="text-gray-500 text-sm">por m²</span>
          </div>

          {rango && (
            <>
              <div className="relative h-1.5 bg-gray-200 rounded-full mt-4 mb-2">
                <div className="absolute inset-y-0 left-[15%] right-[15%] bg-slate-900 rounded-full" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 tabular-nums">USD {rango.p25.toLocaleString("es-AR")}</span>
                <span className="text-gray-500">la mitad del mercado está acá</span>
                <span className="text-gray-400 tabular-nums">USD {rango.p75.toLocaleString("es-AR")}</span>
              </div>
            </>
          )}

          {estimado && (
            <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200 leading-relaxed">
              Tu propiedad de <span className="font-semibold text-gray-900 tabular-nums">{superficieNum} m²</span> estaría
              cerca de <span className="font-semibold text-gray-900 tabular-nums">USD {estimado.toLocaleString("es-AR")}</span> a
              precio de mercado. Es una cuenta rápida: no considera estado, orientación ni la calle exacta.
            </p>
          )}

          {rango && (
            <p className="text-gray-400 text-xs mt-3">
              Calculado sobre {rango.n} propiedades relevadas.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={etiqueta}>Estado</label>
          <select value={form.estado} onChange={set("estado")} className={campo}>
            <option value="">Elegí una opción</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className={etiqueta}>Año de construcción</label>
          <input type="number" min="1950" max="2026" inputMode="numeric" value={form.anio} onChange={set("anio")} placeholder="2015" className={`${campo} tabular-nums`} />
        </div>
      </div>

      <div>
        <label className={etiqueta}>Algo más que debamos saber</label>
        <textarea value={form.comentarios} onChange={set("comentarios")} placeholder="Vista al lago, cochera doble, reformada el año pasado…" rows={3} className={`${campo} resize-none`} />
      </div>

      <div className="border-t border-gray-100 pt-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={etiqueta}>Tu nombre</label>
            <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="Carlos García" required className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Tu WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+54 9 2972 123456" required className={campo} />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-rose-600 text-sm" role="alert">{error}</p>
      )}

      <div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L.057 23.882l6.186-1.622A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.658-.518-5.168-1.418l-.371-.22-3.673.963.981-3.585-.242-.38A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          Pedir tasación por WhatsApp
        </button>
        <p className="text-gray-400 text-xs mt-3 text-center">
          Milton la revisa personalmente. Gratis y sin compromiso.
        </p>
      </div>
    </form>
  );
}
