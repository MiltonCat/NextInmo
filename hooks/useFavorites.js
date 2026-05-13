"use client";
import { useState, useEffect } from "react";

const EVENT = "propiaFavoritesChanged";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("propiaFavorites") || "[]"));
    } catch {
      setFavorites([]);
    }
    const onUpdate = () => {
      try {
        setFavorites(JSON.parse(localStorage.getItem("propiaFavorites") || "[]"));
      } catch {
        setFavorites([]);
      }
    };
    window.addEventListener(EVENT, onUpdate);
    return () => window.removeEventListener(EVENT, onUpdate);
  }, []);

  const toggle = (id) => {
    const current = JSON.parse(localStorage.getItem("propiaFavorites") || "[]");
    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    localStorage.setItem("propiaFavorites", JSON.stringify(updated));
    setFavorites(updated);
    window.dispatchEvent(new Event(EVENT));
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggle, isFavorite };
}
