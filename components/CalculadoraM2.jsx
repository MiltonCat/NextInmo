"use client";

// Calculadora del hero de /precio-m2.
//
// QUÉ CALCULA Y QUÉ NO — esto es lo importante de este archivo:
//
// Calcula: metros × el m² del tipo elegido (casa o departamento), y devuelve el
// rango intercuartil, no un número al peso. p25 × m² a p75 × m².
//
// NO calcula: "una casa de 120 m² en el Centro". Ese cruce barrio × tipo no
// existe en el modelo. El JSON trae la mediana POR BARRIO (mezclando casas y
// departamentos) y el valor POR TIPO (mezclando todos los barrios), pero nunca
// los dos juntos. Hasta el 2026-08-09 el sitio publicaba 13 filas de ese cruce
// escritas a mano, desincronizadas hasta un 20% del modelo. No se vuelve.
//
// Por eso el selector de barrio está SEPARADO del cálculo: muestra la mediana
// de ese barrio como contexto, al lado, y dice de cuántas propiedades sale.
// Multiplicar los metros por la mediana del barrio sería una tercera cifra que
// el modelo no respalda.
//
// El destino de todo esto es /tasacion, que sí cruza barrio, tipo, superficie y
// extras porque tiene el modelo entrenado atrás. Acá el número es un piso para
// que la persona entienda de qué orden estamos hablando.

import Link from "next/link";
import { useMemo, useState } from "react";

const PLURAL_SINGULAR = { Casa: "una casa", Departamento: "un departamento" };

const usd = (n) => `USD ${Math.round(n).toLocaleString("es-AR")}`;

// Un solo formateador para los dos extremos del rango. Por encima del millón,
// "USD 1.200.000" a "USD 1.900.000" ocupa toda la línea en un teléfono, así que
// se abrevia. Debajo, el número entero se lee mejor.
function rangoLegible(min, max) {
  if (max >= 1_000_000) {
    const corto = (n) =>
      `${(n / 1_000_000).toLocaleString("es-AR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} M`;
    return `USD ${corto(min)} – ${corto(max)}`;
  }
  return `${usd(min)} – ${usd(max)}`;
}

export default function CalculadoraM2({ tipos, barrios }) {
  const [metros, setMetros] = useState("");
  const [tipo, setTipo] = useState(tipos[0]?.tipo ?? "Casa");
  const [barrioSlugOrNombre, setBarrio] = useState("");

  const elegido = tipos.find((t) => t.tipo === tipo) ?? tipos[0];
  const barrio = barrios.find((b) => b.nombre === barrioSlugOrNombre) ?? null;

  // El input es texto libre: la persona puede escribir "120 m2" o dejarlo a
  // medias mientras tipea. Solo se calcula con un número que tenga sentido.
  const m2 = useMemo(() => {
    const n = Number.parseFloat(String(metros).replace(",", "."));
    return Number.isFinite(n) && n > 0 && n <= 5000 ? n : null;
  }, [metros]);

  const resultado = m2 && elegido ? { min: elegido.p25 * m2, max: elegido.p75 * m2 } : null;

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 p-5 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Hacé la cuenta con tu propiedad
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div>
          <label
            htmlFor="calc-metros"
            className="block text-xs font-medium text-gray-500"
          >
            Metros cubiertos
          </label>
          <input
            id="calc-metros"
            type="number"
            inputMode="numeric"
            min="1"
            max="5000"
            placeholder="120"
            value={metros}
            onChange={(e) => setMetros(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-900 tabular-nums outline-none transition-colors placeholder:text-gray-300 focus:border-gray-900"
          />
        </div>

        <div>
          <label htmlFor="calc-tipo" className="block text-xs font-medium text-gray-500">
            Tipo
          </label>
          <select
            id="calc-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-gray-900"
          >
            {tipos.map((t) => (
              <option key={t.tipo} value={t.tipo}>
                {t.tipo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* El resultado ocupa el mismo alto esté o no calculado: si apareciera de
          la nada, empujaría todo lo de abajo justo cuando la persona termina de
          escribir los metros. */}
      <div className="mt-5 border-t border-gray-100 pt-5" aria-live="polite">
        {resultado ? (
          <>
            <p className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-gray-900 tabular-nums md:text-[32px]">
              {rangoLegible(resultado.min, resultado.max)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Es donde cae el 50 % central de {PLURAL_SINGULAR[elegido.tipo] ?? "las propiedades"} de{" "}
              {m2.toLocaleString("es-AR")} m² en San Martín. Sale del m² de{" "}
              {elegido.tipo === "Casa" ? "las casas" : "los departamentos"} ({usd(elegido.p25)} a{" "}
              {usd(elegido.p75)}), sobre {elegido.n} propiedades relevadas.
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-gray-400">
            Escribí los metros cubiertos y te muestro en qué rango cae la mitad del mercado. Es la
            misma cuenta que harías vos: metros × el precio del m².
          </p>
        )}
      </div>

      {/* El barrio va aparte, y a propósito no entra en la cuenta de arriba.
          Ver el comentario de cabecera: el cruce barrio × tipo no existe. */}
      {barrios.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <label htmlFor="calc-barrio" className="block text-xs font-medium text-gray-500">
            ¿En qué barrio? <span className="text-gray-400">(no cambia el rango de arriba)</span>
          </label>
          <select
            id="calc-barrio"
            value={barrioSlugOrNombre}
            onChange={(e) => setBarrio(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors focus:border-gray-900"
          >
            <option value="">Elegir un barrio</option>
            {barrios.map((b) => (
              <option key={b.nombre} value={b.nombre}>
                {b.nombre}
              </option>
            ))}
          </select>

          {barrio && (
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              En{" "}
              <strong className="font-medium text-gray-900">{barrio.nombre}</strong> la mediana es{" "}
              <strong className="font-medium text-gray-900 tabular-nums">
                USD {barrio.medianaM2.toLocaleString("es-AR")}/m²
              </strong>{" "}
              sobre {barrio.n} propiedades relevadas, contando casas y departamentos juntos. No la
              multiplicamos por tus metros: no tenemos el dato de las casas de{" "}
              {barrio.nombre} por separado, y estimarlo sería inventarlo.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/tasacion"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Tasar mi propiedad
          <span aria-hidden="true">→</span>
        </Link>
        {/* El link a la metodología va pegado al número, no en el pie: admitir
            el margen donde se ve sostiene la cifra en vez de debilitarla. */}
        <a
          href="#fuentes"
          className="text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-gray-900"
        >
          Cómo calculamos estos valores
        </a>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-400">
        Esta cuenta no mira la vista, el estado ni la orientación, que es de donde sale buena parte
        de la diferencia entre dos propiedades del mismo tamaño. El tasador sí las mira.
      </p>
    </div>
  );
}
