"use client";
import { useMemo, useSyncExternalStore, useEffect } from "react";

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

// El sync con la cuenta corre UNA vez por carga de página, no una vez por
// componente: `useFavorites` se usa en PropertyCard, Navbar y FavoritosClient
// a la vez, y sin este candado cada tarjeta del listado dispararía su propio
// POST al montarse.
let yaSincronizado = false;

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

// Guarda una lista completa y avisa a todos los componentes montados.
function escribirLista(lista) {
  const serializada = JSON.stringify(lista);
  if (serializada === memoria) return; // Nada cambió: no repintamos de gusto.

  memoria = serializada;
  try {
    localStorage.setItem(STORAGE_KEY, memoria);
  } catch {
    // Sin persistencia entre sesiones, pero la actual sigue usable.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, () => "[]");
  const favorites = useMemo(() => parseFavorites(snapshot), [snapshot]);

  // Al cargar la página, ofrecemos los favoritos locales al servidor. Si hay
  // sesión, los guarda en la cuenta y nos devuelve la lista completa —así los
  // corazones marcados en el celular aparecen en la computadora. Si no hay
  // sesión, responde que no y todo sigue funcionando con localStorage.
  useEffect(() => {
    if (yaSincronizado) return;
    yaSincronizado = true;

    const locales = parseFavorites(getFavoritesSnapshot());

    fetch("/api/favorites/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ localFavorites: locales }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.authenticated || !Array.isArray(data.favorites)) return;
        escribirLista(data.favorites);
      })
      .catch(() => {
        // Sin conexión o error del servidor: los favoritos locales alcanzan.
        // Se reintenta en la próxima carga de página.
      });
  }, []);

  const toggle = (id) => {
    const current = parseFavorites(getFavoritesSnapshot());
    const activando = !current.includes(id);
    const updated = activando ? [...current, id] : current.filter((f) => f !== id);

    escribirLista(updated);

    // Se avisa al servidor siempre, sin chequear antes si hay sesión: la
    // cookie de sesión es httpOnly y el navegador no puede leerla. Si no hay
    // cuenta, la route responde `authenticated: false` y no escribe nada.
    fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: Number(id), isFavorite: activando }),
    }).catch(() => {
      // El corazón ya se pintó y quedó en localStorage. El próximo sync al
      // cargar la página lo sube a la cuenta.
    });
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
