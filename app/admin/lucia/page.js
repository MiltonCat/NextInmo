import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPanelDeLucia, FILTROS, VENTANA } from "@/lib/luciaPanel";
import { contarPorTema, temaDePregunta, etiquetaDeTema } from "@/lib/luciaTemas.mjs";
import { signOut } from "../actions";

// El panel siempre muestra datos frescos (no cacheado).
export const dynamic = "force-dynamic";

// Los mismos rótulos que ve la persona en el chat, para que un motivo signifique
// lo mismo de los dos lados.
const MOTIVOS = {
  incorrect: "Dato incorrecto",
  outdated: "Desactualizada",
  not_understood: "No entendió",
  incomplete: "Le faltó información",
};

function fecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function chip(activo) {
  return `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    activo
      ? "bg-gray-900 text-white"
      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
  }`;
}

function url({ filtro, tema }) {
  const params = new URLSearchParams();
  if (filtro) params.set("filtro", filtro);
  if (tema) params.set("tema", tema);
  const qs = params.toString();
  return qs ? `/admin/lucia?${qs}` : "/admin/lucia";
}

export default async function LuciaPage({ searchParams }) {
  const user = await requireUser();
  const { filtro = "", tema = "" } = (await searchParams) ?? {};

  const { preguntas, resumen } = await getPanelDeLucia({ filtro });
  const temas = contarPorTema(preguntas);
  const visibles = tema ? preguntas.filter((p) => temaDePregunta(p.pregunta) === tema) : preguntas;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Qué le preguntan a Lucía</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              Propiedades
            </Link>
            <Link href="/admin/consultas" className="text-sm text-gray-600 hover:text-gray-900">
              Consultas
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4">
          Las últimas {VENTANA} preguntas escritas a mano. Todo lo de abajo se cuenta sobre esas:{" "}
          <strong className="font-medium text-gray-700">{resumen.pulgarAbajo}</strong> con pulgar
          abajo, <strong className="font-medium text-gray-700">{resumen.sinResponder}</strong> que no
          se pudieron responder y{" "}
          <strong className="font-medium text-gray-700">{resumen.guiadas}</strong> que el router
          mandó al árbol de botones sin pasar por la IA.
        </p>

        {/* Por dónde vino la pregunta */}
        <div className="flex flex-wrap gap-2 mb-3">
          {FILTROS.map((f) => (
            <Link key={f.value} href={url({ filtro: f.value })} className={chip(filtro === f.value)}>
              {f.label}
            </Link>
          ))}
        </div>

        {/* De qué se trata. Es la cola de contenido: el tema más alto es el que
            más gente pregunta y menos respondido está el sitio. */}
        {temas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {temas.map((t) => (
              <Link
                key={t.id}
                href={url({ filtro, tema: tema === t.id ? "" : t.id })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tema === t.id
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100"
                }`}
              >
                {t.label} <span className="opacity-70">{t.cantidad}</span>
              </Link>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-3">
          {visibles.length} {visibles.length === 1 ? "pregunta" : "preguntas"}
          {tema ? ` de ${etiquetaDeTema(tema).toLowerCase()}` : ""}
        </p>

        {visibles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
            No hay preguntas con este recorte todavía.
          </div>
        ) : (
          <div className="space-y-3">
            {visibles.map((p) => (
              <article key={p.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[15px] text-gray-900 leading-snug">{p.pregunta}</p>
                  <time className="shrink-0 text-xs text-gray-400 pt-0.5">{fecha(p.created_at)}</time>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                    {etiquetaDeTema(temaDePregunta(p.pregunta))}
                  </span>
                  {p.ruta === "guiado" ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
                      Fue al árbol de botones
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {p.fuentes} {p.fuentes === 1 ? "fuente" : "fuentes"}
                      {p.model ? ` · ${p.model}` : ""}
                    </span>
                  )}
                  {p.page_path && <span className="text-gray-400">desde {p.page_path}</span>}
                </div>

                {p.respondida === false && (
                  <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                    No se pudo responder{p.error ? `: ${p.error}` : "."}
                  </p>
                )}

                {p.feedback && (
                  <div
                    className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                      p.feedback.rating === -1
                        ? "bg-rose-50 text-rose-800"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    <span className="font-medium">
                      {p.feedback.rating === -1 ? "Pulgar abajo" : "Pulgar arriba"}
                    </span>
                    {p.feedback.reason && ` · ${MOTIVOS[p.feedback.reason] ?? p.feedback.reason}`}
                    {p.feedback.comment && (
                      <p className="mt-1 italic opacity-90">“{p.feedback.comment}”</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
