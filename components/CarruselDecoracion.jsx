"use client";
// Carrusel de referencias de decoración.
//
// Va sobre scroll nativo con scroll-snap y no sobre una librería de carrusel:
// el arrastre en el celular ya lo hace el navegador, mejor y con menos código
// del que traería cualquier dependencia. Las flechas son un agregado para
// mouse, no el mecanismo principal — por eso se ocultan en pantallas chicas.
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CarruselDecoracion({ items = [] }) {
  const pista = useRef(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(false);

  // Las flechas se apagan en los extremos en vez de desaparecer: un botón que
  // se va de la pantalla mueve todo lo que tiene al lado.
  const revisarBordes = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    const margen = 8; // tolerancia para el redondeo subpíxel del scroll
    setAlInicio(el.scrollLeft <= margen);
    setAlFinal(el.scrollLeft + el.clientWidth >= el.scrollWidth - margen);
  }, []);

  useEffect(() => {
    revisarBordes();
    const el = pista.current;
    if (!el) return undefined;
    el.addEventListener("scroll", revisarBordes, { passive: true });
    window.addEventListener("resize", revisarBordes);
    return () => {
      el.removeEventListener("scroll", revisarBordes);
      window.removeEventListener("resize", revisarBordes);
    };
  }, [revisarBordes]);

  const mover = (direccion) => {
    const el = pista.current;
    if (!el) return;
    // Se corre poco menos de un ancho visible: siempre queda una tarjeta a la
    // vista, que es la señal de que hay más para el costado.
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!items.length) return null;

  const flecha =
    "hidden h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white " +
    "text-gray-900 transition hover:border-gray-900 disabled:cursor-not-allowed " +
    "disabled:border-gray-200 disabled:text-gray-300 md:inline-flex";

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        <button type="button" onClick={() => mover(-1)} disabled={alInicio} className={flecha} aria-label="Ver las anteriores">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" onClick={() => mover(1)} disabled={alFinal} className={flecha} aria-label="Ver las siguientes">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* tabIndex + role hacen que la pista sea alcanzable y desplazable con el
          teclado; sin eso, quien no usa mouse no puede llegar a las últimas. */}
      <ul
        ref={pista}
        tabIndex={0}
        role="region"
        aria-label="Referencias de decoración"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li
            key={item.src}
            className="w-[78vw] max-w-[320px] flex-shrink-0 snap-start sm:w-[300px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 300px, 78vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-[15px] font-medium text-gray-900">{item.titulo}</p>
            {item.detalle ? (
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.detalle}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
