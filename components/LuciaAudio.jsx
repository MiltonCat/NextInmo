"use client";
import { useEffect, useRef, useState } from "react";

// Botón de altavoz debajo de una respuesta de Lucía. Pide el MP3 a
// /api/lucia-voz/ recién cuando lo tocan: generar el audio de cada respuesta
// "por las dudas" sería pagar por lo que nadie escucha.
//
// El audio queda guardado en el componente, así que volver a tocar play no
// vuelve a pedirlo. La caché de verdad —compartida entre visitantes— es la
// etapa 3, y solo se hace si el evento "lucia_audio_play" dice que lo usan.

const AIRBNB = "#FF5A5F";

// Debajo de esto no hay nada que escuchar: "Listo", "¿Con qué otra cosa te
// ayudo?". Un altavoz en cada línea corta convierte el chat en un tablero de
// botones.
const MINIMO_PARA_ESCUCHAR = 60;

export default function LuciaAudio({ texto, origen = "arbol", onPlay }) {
  const [estado, setEstado] = useState("listo"); // listo | cargando | sonando | error
  const [mensajeError, setMensajeError] = useState("");
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  // El objectURL vive mientras vive el mensaje. Sin esto, cada respuesta
  // escuchada deja un blob colgado en memoria hasta que se recarga la página.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  if (!texto || texto.trim().length < MINIMO_PARA_ESCUCHAR) return null;

  async function reproducir() {
    if (estado === "cargando") return;

    if (audioRef.current) {
      if (estado === "sonando") {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setEstado("listo");
        return;
      }
      try {
        await audioRef.current.play();
        setMensajeError("");
        setEstado("sonando");
      } catch {
        setMensajeError("No se pudo reproducir el audio. Probá otra vez.");
        setEstado("error");
      }
      return;
    }

    setEstado("cargando");
    setMensajeError("");
    try {
      // Con barra final: el sitio tiene trailingSlash y sin ella se come un
      // redirect 308 en cada pedido.
      const respuesta = await fetch("/api/lucia-voz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      if (!respuesta.ok) {
        const detalle = await respuesta.json().catch(() => ({}));
        throw new Error(detalle.error === "not_configured"
          ? "La voz de Lucía todavía no está configurada."
          : "No se pudo preparar el audio. Probá otra vez.");
      }

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audio.addEventListener("ended", () => setEstado("listo"));
      audio.addEventListener("error", () => {
        audioRef.current = null;
        URL.revokeObjectURL(url);
        urlRef.current = null;
        setMensajeError("No se pudo reproducir el audio. Probá otra vez.");
        setEstado("error");
      });
      audioRef.current = audio;

      await audio.play();
      setEstado("sonando");
      onPlay?.({ origen, largo: texto.length });
    } catch (error) {
      console.error("[LuciaAudio]", error?.message || error);
      setMensajeError(error?.message?.startsWith("La voz") || error?.message?.startsWith("No se pudo preparar")
        ? error.message : "No se pudo reproducir el audio. Probá otra vez.");
      setEstado("error");
    }
  }

  const etiqueta = {
    listo: "Escuchar",
    cargando: "Preparando…",
    sonando: "Detener",
    error: "Reintentar",
  }[estado];

  return (
    <>
    <button
      type="button"
      onClick={reproducir}
      disabled={estado === "cargando"}
      aria-label={`${etiqueta} la respuesta de Lucía`}
      className="mt-1.5 ml-1 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 shadow-sm border border-gray-100 transition hover:text-gray-800 disabled:opacity-60"
      style={estado === "sonando" ? { color: AIRBNB } : {}}
    >
      <span aria-hidden="true">{estado === "sonando" ? "◼" : "🔊"}</span>
      {etiqueta}
    </button>
    {mensajeError && <p role="status" className="mt-1 ml-1 text-xs text-gray-500">{mensajeError}</p>}
    </>
  );
}
