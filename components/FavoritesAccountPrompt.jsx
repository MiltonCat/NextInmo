"use client";

// Aviso de conversión a cuenta. Aparece cuando el visitante marca su tercer
// favorito, no antes: la regla del proyecto es pedir la cuenta tarde, en el
// momento en que ya tiene algo que perder. Pedirla al entrar espanta.
//
// Nunca bloquea nada. Si lo cierra, no vuelve a aparecer.
//
// Deliberadamente NO usa useFavorites(): ese hook arranca en "[]" durante la
// hidratación y recién después toma el valor real de localStorage. Visto desde
// un efecto, ese salto de 0 al valor guardado es indistinguible de un favorito
// recién marcado, y el aviso saltaría apenas cargás la página teniendo
// favoritos viejos. Acá se lee localStorage directo y se escucha el evento,
// así el punto de partida es el número real desde el primer instante.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FAVORITES_KEY = "propiaFavorites";
const FAVORITES_EVENT = "propiaFavoritesChanged";
const DISMISSED_KEY = "cp-account-prompt-dismissed";
const THRESHOLD = 3;

function contarFavoritos() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function fueDescartado() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return true; // Sin localStorage no hay favoritos que valga la pena rescatar.
  }
}

// Pista de UI, no un control de seguridad: si hay cookie de sesión de Supabase
// asumimos que ya tiene cuenta y no le ofrecemos crearla. En el peor caso un
// usuario logueado ve el aviso una vez y lo cierra.
function tieneSesion() {
  try {
    return /(^|;\s*)sb-[^=]*auth-token[^=]*=/.test(document.cookie);
  } catch {
    return false;
  }
}

export default function FavoritesAccountPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [cantidad, setCantidad] = useState(0);

  // El pathname vive en un ref para que el listener se registre una sola vez
  // y aun así vea siempre la ruta actual.
  const rutaActual = useRef(pathname);
  useEffect(() => {
    rutaActual.current = pathname;
  }, [pathname]);

  // ¿Corresponde ofrecer la cuenta ahora mismo? En desarrollo explica por qué
  // NO se muestra: son cuatro condiciones silenciosas y, sin este log, la
  // única forma de saber cuál cortó es ir descartándolas a mano.
  function puedeOfrecerse(total) {
    const motivo =
      total < THRESHOLD
        ? `hay ${total} favoritos y hacen falta ${THRESHOLD}`
        : rutaActual.current?.startsWith("/cuenta")
          ? "la ruta actual es /cuenta"
          : fueDescartado()
            ? `ya se cerró antes (borrá "${DISMISSED_KEY}" de localStorage para volver a verlo)`
            : tieneSesion()
              ? "hay sesión iniciada: a quien ya tiene cuenta no se le ofrece crearla"
              : null;

    if (motivo && process.env.NODE_ENV !== "production") {
      console.info(`[aviso de cuenta] no se muestra porque ${motivo}.`);
    }

    return !motivo;
  }

  // Segundo momento de conversión: entrar a /favoritos teniendo el umbral
  // cumplido. Es la pantalla donde el visitante está mirando justamente lo que
  // podría perder, así que el ofrecimiento cae natural. Sin esto, quien ya
  // tenía cinco favoritos guardados no vería nunca el aviso salvo que marcara
  // uno más — perdíamos al usuario más interesado de todos.
  useEffect(() => {
    if (pathname !== "/favoritos" && pathname !== "/favoritos/") return;

    // Un respiro para que primero vea su lista y no lo reciba un cartel.
    const t = setTimeout(() => {
      const total = contarFavoritos();
      if (!puedeOfrecerse(total)) return;
      setCantidad(total);
      setVisible(true);
    }, 1200);

    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    let anterior = contarFavoritos(); // Punto de partida real, no el hidratado.

    function alCambiar() {
      const ahora = contarFavoritos();
      const crecio = ahora > anterior;
      anterior = ahora;

      if (!crecio || !puedeOfrecerse(ahora)) return;

      setCantidad(ahora);
      setVisible(true);
    }

    window.addEventListener(FAVORITES_EVENT, alCambiar);
    window.addEventListener("storage", alCambiar); // Otra pestaña del mismo sitio.
    return () => {
      window.removeEventListener(FAVORITES_EVENT, alCambiar);
      window.removeEventListener("storage", alCambiar);
    };
  }, []);

  function descartar() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Si no se puede recordar, se vuelve a ofrecer más adelante. No es grave.
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="account-prompt-title"
      className="fixed bottom-24 left-4 right-4 z-50 md:bottom-6 md:left-6 md:right-auto md:w-96"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          {/*
            El título habla de lo que se pierde, no de cuántos hay. La versión
            anterior ("Tenés 3 propiedades guardadas") se leía como un tope de
            tres: si el dueño del sitio la entendió así, un visitante también.
          */}
          <h2 id="account-prompt-title" className="text-base font-bold text-gray-900">
            No pierdas tus {cantidad} favoritos
          </h2>
          <button
            type="button"
            onClick={descartar}
            aria-label="Cerrar aviso"
            className="-mr-1 -mt-1 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-current">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Están guardados solo en este navegador. Si entrás desde el celular o
          borrás el historial, no van a estar.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/cuenta/registro/"
            onClick={descartar}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Guardar en mi cuenta
          </Link>
          <button
            type="button"
            onClick={descartar}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
