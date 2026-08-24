"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import DevelopmentCard from "@/components/DevelopmentCard";
import { ESTADOS, ESTADOS_ORDEN } from "@/data/developments";

// El listado de desarrollos NO copia el de propiedades y no debería.
//
// Alguien que busca una casa filtra por lo que la casa ES (tipo, ambientes,
// precio). Alguien que mira desarrollos filtra por CUÁNDO y CÓMO: en qué punto
// está la obra, cuándo se entrega, cuánto hay que poner al principio. Por eso
// los filtros de esta pantalla son estado de obra y plazo de entrega, no tipo
// de propiedad, y el orden por defecto es por avance de obra descendente: lo
// más cerca de estar terminado primero, que es lo que más gente puede comprar.

const ORDENES = {
  avance:      { label: "Más avanzados",   fn: (a, b) => (b.avance ?? 0) - (a.avance ?? 0) },
  precioAsc:   { label: "Menor precio",    fn: (a, b) => (a.precioDesde ?? 0) - (b.precioDesde ?? 0) },
  precioDesc:  { label: "Mayor precio",    fn: (a, b) => (b.precioDesde ?? 0) - (a.precioDesde ?? 0) },
  entrega:     { label: "Entrega más cerca", fn: (a, b) => String(a.entregaISO ?? "9999").localeCompare(String(b.entregaISO ?? "9999")) },
};

export default function DevelopmentsClient({ developments = [] }) {
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [orden, setOrden] = useState("avance");

  // Los estados que no tienen ni un desarrollo no se muestran como pestaña.
  // Una pestaña que siempre da cero resultados es ruido, no una opción.
  const estadosConDatos = useMemo(
    () => ESTADOS_ORDEN.filter((key) => developments.some((d) => d.estado === key)),
    [developments]
  );

  const filtrados = useMemo(() => {
    const base =
      estadoFiltro === "todos"
        ? developments
        : developments.filter((d) => d.estado === estadoFiltro);

    // Los agotados van siempre al final, ordenados entre sí por el mismo
    // criterio. Se muestran igual: una obra vendida entera es la mejor prueba
    // de que el desarrollador entrega.
    //
    // Comparación estricta contra 0: `?? 0` mandaba al fondo, tratándolos como
    // agotados, a todos los desarrollos cuyo stock todavía no conocemos.
    const agotado = (d) => (d.unidadesDisponibles === 0 ? 1 : 0);
    return [...base].sort(
      (a, b) => agotado(a) - agotado(b) || ORDENES[orden].fn(a, b)
    );
  }, [developments, estadoFiltro, orden]);

  // Solo se suman los desarrollos con stock informado. Si de ninguno sabemos
  // cuántas unidades quedan, la cifra no se muestra: un "0 unidades
  // disponibles" arriba de una grilla llena de proyectos es un error de lectura.
  const conStock = developments.filter((d) => typeof d.unidadesDisponibles === "number");
  const totalUnidades = conStock.reduce((acc, d) => acc + d.unidadesDisponibles, 0);

  const precios = developments.map((d) => d.precioDesde).filter((p) => p > 0);
  const precioMinimo = precios.length > 0 ? Math.min(...precios) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado ---------------------------------------------------------*/}
      <section className="relative overflow-hidden bg-white pt-8 pb-10 md:pt-24 md:pb-12">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10 lg:pt-4">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary-500">
                  Desarrollos
                </span>
              </div>
              <h1 className="font-jakarta text-3xl font-black leading-tight text-gray-900 md:text-5xl md:leading-[1.1]">
                Comprá antes
                <br />
                de que esté construido
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-gray-500">
                Emprendimientos en San Martín de los Andes, desde el pozo hasta la
                entrega. Precio por m² más bajo, plan de pago en cuotas y avance de
                obra a la vista.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5 lg:w-[320px]">
              <p className="mb-1 text-xs font-semibold text-gray-500">
                ¿Tenés un terreno o un proyecto?
              </p>
              <p className="text-sm font-semibold leading-snug text-gray-900">
                Analizamos si conviene desarrollarlo y te armamos los números
              </p>
              <Link
                href="/contacto"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600"
              >
                Hablar del proyecto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Tres cifras, sin recuadros de colores: una línea de datos que dice
              de qué tamaño es la oferta antes de scrollear. */}
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-gray-200 pt-6">
            <div>
              <dt className="text-xs text-gray-500">Desarrollos activos</dt>
              <dd className="text-2xl font-black text-gray-900">{developments.length}</dd>
            </div>
            {conStock.length > 0 && (
              <div>
                <dt className="text-xs text-gray-500">Disponibles</dt>
                <dd className="text-2xl font-black text-gray-900">{totalUnidades}</dd>
              </div>
            )}
            {precioMinimo !== null && (
              <div>
                <dt className="text-xs text-gray-500">Desde</dt>
                <dd className="text-2xl font-black text-gray-900">
                  USD {precioMinimo.toLocaleString("es-AR")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filtros ----------------------------------------------------------*/}
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="-mb-px flex gap-1 overflow-x-auto">
            <FiltroTab
              activo={estadoFiltro === "todos"}
              onClick={() => setEstadoFiltro("todos")}
              label="Todos"
              cantidad={developments.length}
            />
            {estadosConDatos.map((key) => (
              <FiltroTab
                key={key}
                activo={estadoFiltro === key}
                onClick={() => setEstadoFiltro(key)}
                label={ESTADOS[key].label}
                cantidad={developments.filter((d) => d.estado === key).length}
              />
            ))}
          </div>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="min-h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-rose-500 md:min-h-0 md:rounded-lg md:py-2"
          >
            {Object.entries(ORDENES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Explicación del estado elegido. Aparece solo cuando hay un filtro
            puesto: en "Todos" no hay nada que aclarar. */}
        {estadoFiltro !== "todos" && (
          <p className="mb-6 text-sm text-gray-500">
            {ESTADOS[estadoFiltro].descripcion}
          </p>
        )}

        {/* Grilla -----------------------------------------------------------*/}
        {filtrados.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((development) => (
              <DevelopmentCard key={development.id} development={development} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mb-4 text-lg text-gray-500">
              No hay desarrollos en esta etapa por ahora.
            </p>
            <button
              onClick={() => setEstadoFiltro("todos")}
              className="font-medium text-rose-500 hover:text-rose-600"
            >
              Ver todos los desarrollos
            </button>
          </div>
        )}

        {/* Cómo funciona comprar en pozo. Es la duda que frena a casi todo el
            que mira desarrollos por primera vez, así que va en la misma página
            y no escondida en el centro de ayuda. */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="font-jakarta text-2xl font-black text-gray-900 md:text-3xl">
            Cómo funciona comprar en pozo
          </h2>
          <p className="mt-2 max-w-2xl text-gray-500">
            Comprar antes de que la obra esté terminada baja el precio por m² entre
            un 20% y un 30% frente a una unidad a estrenar. A cambio, hay un plazo
            de espera y un plan de pagos. Estos son los cuatro pasos.
          </p>
          <ol className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                n: "01",
                t: "Elegís la unidad",
                d: "Ves los planos, la orientación y el piso. Cuanto más temprano entrás, más para elegir y mejor precio.",
              },
              {
                n: "02",
                t: "Reserva y boleto",
                d: "Una reserva chica congela la unidad. El boleto de compraventa fija precio, plazo y forma de pago.",
              },
              {
                n: "03",
                t: "Pagás mientras se construye",
                d: "Un anticipo y cuotas durante la obra. El ajuste (CAC, dólar o sin ajuste) está escrito en el boleto.",
              },
              {
                n: "04",
                t: "Posesión y escritura",
                d: "Recibís la unidad terminada y se escritura a tu nombre. El saldo contra entrega, si lo hay, se paga acá.",
              },
            ].map((paso) => (
              <li key={paso.n}>
                <p className="text-xs font-black tracking-widest text-rose-600">{paso.n}</p>
                <h3 className="mt-2 text-base font-bold text-gray-900">{paso.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{paso.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Puente al resto del sitio: quien no se decide por un desarrollo casi
            siempre termina mirando el catálogo o el precio del m². */}
        <div className="mt-14 flex flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-gray-50 px-8 py-7 sm:flex-row">
          <div className="flex-1">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-rose-600">
              Precio del m²
            </p>
            <h3 className="text-base font-black text-gray-900">
              ¿Cómo saber si el precio de un desarrollo está bien?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Compará el valor por m² del proyecto contra lo que se paga hoy en cada
              barrio de San Martín de los Andes.
            </p>
          </div>
          <Link
            href="/precio-m2"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Ver precio del m²
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FiltroTab({ activo, onClick, label, cantidad }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
        activo
          ? "border-rose-500 text-rose-500"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}
      <span className={`ml-1.5 text-xs ${activo ? "text-rose-400" : "text-gray-400"}`}>
        {cantidad}
      </span>
    </button>
  );
}
