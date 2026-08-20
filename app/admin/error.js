"use client";

/**
 * Pantalla de error del panel /admin.
 *
 * Hasta ahora la app no tenía ningún error boundary: cualquier fallo del panel
 * caía en la pantalla genérica de Next, sin decir qué pasó ni cómo volver. Con
 * esto al menos se ve el motivo y hay un botón para reintentar sin recargar.
 *
 * Ojo con el alcance: esto cubre los errores que ocurren *dentro* de la app.
 * Si Vercel rechaza el request antes de invocar la función —por ejemplo un 413
 * porque el formulario pesa más de 4,5 MB— la pantalla que se ve es la de la
 * plataforma y este archivo no llega a renderizarse. Ese caso se resuelve no
 * mandando archivos pesados en el request (ver subirFoto en PropertyForm.jsx).
 */
export default function AdminError({ error, reset }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Algo falló en el panel
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            La operación no se completó. No se perdió nada de lo que ya estaba
            guardado; lo que estabas cargando en pantalla sí hay que volver a
            escribirlo.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-xs leading-relaxed text-gray-100">
            {error?.message || "Error desconocido."}
            {error?.digest ? `\n\nReferencia para el log de Vercel: ${error.digest}` : ""}
          </pre>

          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Reintentar
            </button>
            <a href="/admin/" className="text-sm text-gray-600 hover:text-gray-900">
              Volver al panel
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
