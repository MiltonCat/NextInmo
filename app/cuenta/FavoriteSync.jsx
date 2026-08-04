"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncLocalFavorites } from "./actions";

const FAVORITES_KEY = "propiaFavorites";
const SYNC_KEY = "cp-account-favorites-sync";

export default function FavoriteSync() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY) || "[]";
        const parsed = JSON.parse(raw);
        const ids = Array.isArray(parsed) ? parsed.map(Number).filter(Number.isSafeInteger) : [];
        const fingerprint = JSON.stringify([...new Set(ids)].sort((a, b) => a - b));

        if (!ids.length || localStorage.getItem(SYNC_KEY) === fingerprint) return;

        const result = await syncLocalFavorites(ids);
        if (!cancelled && result?.ok) {
          localStorage.setItem(SYNC_KEY, fingerprint);
          router.refresh();
        }
      } catch {
        // La cuenta sigue funcionando aunque localStorage esté bloqueado o roto.
      }
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
