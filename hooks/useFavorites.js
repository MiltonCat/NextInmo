"use client";
import { useMemo, useSyncExternalStore } from "react";

const EVENT = "propiaFavoritesChanged";
const STORAGE_KEY = "propiaFavorites";

// La fuente de verdad es la memoria; localStorage es solo la copia persistente.
//
// Antes se escribía localStorage directo, sin protección. El problema es que
// `setItem` puede lanzar —almacenamiento bloqueado por el navegador, modo
// restringido, cuota llena— y esa excepción reventaba el handler del corazón
// a mitad de camino: no guardaba, no repintaba, y ni siquiera llegaba a
// disparar el confeti. Desde afuera parecía un botón muerto.
//
// Nótese que la LECTURA ya estaba envuelta en try/catch: el riesgo era
// conocido, pero la escritura quedó sin cubrir.
//
// Ahora el estado vive en memoria y la persistencia es best-effort: si falla,
// los favoritos siguen funcionando durante la sesión en vez de que el botón
// deje de responder por completo.
let memoria = null;

function leerDeStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function getFavoritesSnapshot() {
  if (memoria === null) memoria = leerDeStorage();
  return memoria;
}

function subscribeToFavorites(onStoreChange) {
  const onStorage = (event) => {
    if (!event.key || event.key === STORAGE_KEY) {
      memoria = leerDeStorage(); // Otra pestaña del mismo sitio cambió algo.
      onStoreChange();
    }
  };

  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function parseFavorites(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const favorites = useMemo(() => parseFavorites(snapshot), [snapshot]);

  const toggle = (id) => {
    const current = parseFavorites(getFavoritesSnapshot());
    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];

    // Primero la memoria: garantiza que la UI reaccione pase lo que pase.
    memoria = JSON.stringify(updated);

    try {
      localStorage.setItem(STORAGE_KEY, memoria);
    } catch {
      // Sin persistencia entre sesiones, pero la actual sigue usable.
    }

    window.dispatchEvent(new Event(EVENT));
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
