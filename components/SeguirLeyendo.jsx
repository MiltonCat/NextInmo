// Cierre de cada post: la herramienta del sitio que continúa el tema y 4 notas
// relacionadas. Se arma solo desde lib/blogPosts.js (ver lib/blogRelacionados.js):
// un post nuevo queda enlazado desde todos los de su tema sin editar nada.
//
// Server component: son links estáticos, no manda JavaScript al navegador.
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/blogPosts";
import { elegirRelacionados, herramientaDelPost } from "@/lib/blogRelacionados";

export default function SeguirLeyendo({ slug, destacados = [] }) {
  const relacionados = elegirRelacionados(blogPosts, slug, destacados);
  const herramienta = herramientaDelPost(blogPosts, slug);
  if (!relacionados.length && !herramienta) return null;

  return (
    // <nav> y no <section>: el indexador de Lucía (lib/indexadorSitio.mjs,
    // textoDeHtml) descarta nav/header/footer. Como <section>, estos títulos de
    // OTRAS notas entraban al último fragmento de cada post y Lucía podía
    // atribuirle a una nota lo que dice otra.
    <nav aria-label="Seguí leyendo" className="not-prose mt-14 border-t border-gray-100 pt-10">
      {herramienta && (
        <Link
          href={herramienta.href}
          className="group mb-10 flex items-center justify-between gap-4 rounded-2xl bg-gray-900 p-6 transition-colors hover:bg-gray-800 sm:p-8"
        >
          <div>
            <p className="text-lg font-black leading-snug text-white sm:text-xl">{herramienta.titulo}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-300">{herramienta.texto}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-rose-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      )}

      {relacionados.length > 0 && (
        <>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Seguí leyendo</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {relacionados.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <Image src={post.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-rose-600">{post.category}</p>
                  <p className="line-clamp-3 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-rose-600">
                    {post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/blog" className="mt-6 inline-block text-sm font-semibold text-rose-700 hover:underline">
            Ver todas las notas del blog
          </Link>
        </>
      )}
    </nav>
  );
}
