"use client";
import { useMemo, useSyncExternalStore } from "react";

const EVENT = "propiaFavoritesChanged";
const STORAGE_KEY = "propiaFavorites";

function getFavoritesSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function subscribeToFavorites(onStoreChange) {
  const onStorage = (event) => {
    if (!event.key || event.key === STORAGE_KEY) onStoreChange();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT));
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
