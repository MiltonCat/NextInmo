// Versión escuchada de un post del blog: "no lo leas, escuchalo".
//
// Se coloca una sola vez en cada post y NO renderiza nada hasta que ese post
// tenga `audio` registrado en lib/blogPosts.js. Así se puede dejar puesto en
// todos los posts de una vez y encender cada episodio solo registrándolo, sin
// volver a editar la página.
//
// La ruta del MP3 se deriva del id del post (/podcast/<id>.mp3): no hay ruta
// escrita a mano que se pueda desincronizar del archivo real.
//
// Es un server component a propósito: el <audio> nativo ya trae los controles,
// así que no hace falta mandar JavaScript al navegador para esto.
import { blogPosts } from "@/lib/blogPosts";

export function tieneAudio(slug) {
  return Boolean(blogPosts.find((p) => p.id === slug)?.audio);
}

export default function PodcastPlayer({ slug, transcripcion }) {
  const post = blogPosts.find((p) => p.id === slug);
  if (!post?.audio) return null;

  const { duracion } = post.audio;
  const src = post.audio.src || `/podcast/${post.id}.mp3`;
  const type = post.audio.type || "audio/mpeg";

  return (
    <section
      aria-label="Versión en audio del artículo"
      className="mb-8 sm:mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex w-11 h-11 rounded-xl bg-rose-50 text-rose-600 items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 leading-snug">
            ¿Preferís escucharlo?
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Escuchá el artículo completo{duracion ? ` · ${duracion}` : ""} — tocá play, no hace falta descargar nada.
          </p>

          {/* preload="none": no consume datos hasta que la persona da play.
              controlsList: el reproductor no ofrece bajar el archivo. */}
          <audio
            controls
            preload="none"
            controlsList="nodownload"
            className="mt-4 w-full"
          >
            <source src={src} type={type} />
            Tu navegador no puede reproducir audio.{" "}
            <a href={src} className="underline">Abrir el audio</a>.
          </audio>
        </div>
      </div>

      {transcripcion && (
        <details className="mt-4 group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors list-none flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Leer la transcripción
          </summary>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-200 pt-3">
            {transcripcion}
          </div>
        </details>
      )}
    </section>
  );
}
