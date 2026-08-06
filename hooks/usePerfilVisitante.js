"use client";

import { useEffect, useState } from "react";

/**
 * Trae la foto y el nombre del visitante logueado para la barra superior.
 *
 * La respuesta se guarda en memoria del módulo, no en localStorage: es un dato
 * personal y no tiene por qué sobrevivir al cierre de la pestaña ni quedar
 * escrito en el disco de una computadora compartida. Con eso alcanza para que
 * navegar entre páginas no dispare una petición nueva cada vez.
 *
 * `pedido` guarda la promesa en curso para que dos componentes montados a la
 * vez compartan una sola llamada.
 */

let cache = null;
let pedido = null;

async function traerPerfil() {
  if (cache) return cache;
  if (pedido) return pedido;

  pedido = fetch("/api/cuenta/perfil", { credentials: "same-origin" })
    .then((respuesta) => (respuesta.ok ? respuesta.json() : {}))
    // Si la red falla no hay nada que mostrar: la barra queda con el ícono
    // genérico, que es exactamente lo que se veía antes de esta función.
    .catch(() => ({}))
    .then((datos) => {
      cache = datos || {};
      pedido = null;
      return cache;
    });

  return pedido;
}

/** Borra lo guardado. Se llama al cerrar sesión para que no quede la foto. */
export function olvidarPerfilVisitante() {
  cache = null;
  pedido = null;
}

export function usePerfilVisitante() {
  const [perfil, setPerfil] = useState(cache || {});

  useEffect(() => {
    let vivo = true;
    traerPerfil().then((datos) => {
      if (vivo) setPerfil(datos);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return perfil;
}
