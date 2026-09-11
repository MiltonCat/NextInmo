import Link from "next/link";
import TasacionProfesionalClient from "@/components/TasacionProfesionalClient";
import { canonicalUrl } from "@/config";
import { getBarrios } from "@/lib/tasador";

export const revalidate = 3600;

export const metadata = {
  title: "Tasación profesional con datos de mercado | Catalán Propiedades",
  description:
    "Herramienta profesional de tasación para inmobiliarias: valor estimado, rango, comparables y señales de confianza del mercado de San Martín de los Andes.",
  alternates: { canonical: canonicalUrl("/tasacion-profesional") },
};

const ENTREGABLES = [
  ["Valor de mercado", "Una estimación central y el valor por m² para ordenar la conversación con el propietario."],
  ["Rango defendible", "Una banda calibrada que muestra la incertidumbre real en vez de prometer una cifra exacta."],
  ["Comparación local", "La posición del inmueble frente a la mediana del barrio y del tipo de propiedad."],
  ["Explicación", "Modelo, error promedio, cantidad de observaciones y advertencias visibles para decidir mejor."],
];

export default async function TasacionProfesionalPage() {
  const barrios = await getBarrios();

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-gray-900">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <Link href="/tasacion" className="text-sm font-semibold text-gray-500 underline underline-offset-4 hover:text-gray-900">
                Tasador público
              </Link>
              <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-gray-500">MODO PROFESIONAL</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-6xl">
                Una tasación que se puede explicar.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
                El mismo modelo predictivo de San Martín de los Andes, presentado para trabajar una captación: datos, rango, comparables y señales de confianza en una sola lectura.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
                <span>Casas y departamentos</span>
                <span>Mercado local</span>
                <span>Resultado trazable</span>
              </div>
            </div>
            <div id="tasador-profesional" className="scroll-mt-24 rounded-[28px] border border-gray-300 bg-white p-2 shadow-[0_12px_40px_rgba(25,25,25,0.08)]">
              <TasacionProfesionalClient barriosIniciales={barrios} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">QUÉ ENTREGA</p>
            <h2 className="mt-4 max-w-sm text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">La decisión detrás del número.</h2>
            <p className="mt-5 max-w-sm leading-7 text-gray-600">
              El valor no viene solo. Cada resultado muestra qué tan cerca está de los datos disponibles y qué conviene revisar antes de fijar el precio de publicación.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-300 bg-gray-300 sm:grid-cols-2">
            {ENTREGABLES.map(([title, body]) => (
              <article key={title} className="bg-white p-6 sm:p-7">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-gray-400">USO PROFESIONAL</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em]">Primero una referencia sólida. Después, el criterio del corredor.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-gray-300">
                Este resultado orienta la captación y la estrategia de precio. No reemplaza la visita, la revisión de documentación ni una tasación formal.
              </p>
            </div>
            <a href="#tasador-profesional" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200">
              Hacer otra tasación
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
