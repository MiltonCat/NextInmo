import TasacionForm from "@/components/TasacionForm";

export const metadata = {
  title: "Tasación de propiedades en San Martín de los Andes | Catalán Propiedades",
  description: "Solicitá una tasación orientativa gratuita de tu propiedad en San Martín de los Andes. Respuesta en menos de 48 hs con datos reales del mercado local.",
};

export default function TasacionPage() {
  return (
    <div className="min-h-screen bg-white">

      <section className="bg-gray-50 border-b border-gray-100 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-rose-600 text-xs font-bold tracking-widest uppercase mb-3">Gratuito · Sin compromiso</p>
          <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
            ¿Cuánto vale tu propiedad en San Martín de los Andes?
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            Completá el formulario y Milton te envía una estimación orientativa basada en datos reales del mercado local. Sin turnos, sin costo, sin compromiso.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "⏱", titulo: "Respuesta en 48 hs", desc: "Sin esperas largas ni burocracia" },
            { icon: "📊", titulo: "Basado en datos reales", desc: "600+ propiedades relevadas en SMA" },
            { icon: "🤝", titulo: "Sin compromiso", desc: "La tasación es orientativa y gratuita" },
          ].map((b) => (
            <div key={b.titulo} className="flex gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <span className="text-xl mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{b.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <TasacionForm />
        </div>

        <p className="text-gray-400 text-xs text-center mt-6">
          La tasación orientativa no reemplaza una tasación profesional formal. Los valores son referenciales y pueden variar según condiciones del mercado.
        </p>
      </div>
    </div>
  );
}
