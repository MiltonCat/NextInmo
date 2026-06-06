"use client";
// Cliente de Supabase para el navegador. Usa la clave publicable (segura:
// solo permite lectura pública gracias a las políticas RLS de la tabla).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _client = null;
export function supabaseBrowser() {
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
