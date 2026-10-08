import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { BARRIOS, nombreDeBarrio } from "@/lib/barrios";
import {
  MINIMO_POR_BARRIO,
  TIPOS_CIERRE,
  diferenciaPct,
  getCierres,
  resumenDeCierres,
} from "@/lib/cierres";
import { signOut } from "../actions";
import { crearCierre } from "./actions";
import BorrarCierre from "./BorrarCierre";

// Carga de cierres reales (etapa 3a de docs/plan-red-catalan.md).
export const dynamic = "force-dynamic";

const field =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none";
const label = "block text-xs font-medium text-gray-600 mb-1";

const usd = (n) => (n == null ? "—" : "USD " + Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 }));
const pct = (n) => (n == null ? "—" : `${n.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`);
const nombreTipo = (v) => TIPOS_CIERRE.find((t) => t.valor === v)?.nombre || v;

export default async function CierresPage({ searchParams }) {
  const user = await requireUser();
  const sp = (await searchParams) || {};

  let cierres = [];
  let errorTabla = null;
  try {
    cierres = (await getCierres()) || [];
  } catch (e) {
    errorTabla = e.message;
  }
  const resumen = resumenDeCierres(cierres);
  const barriosOrdenados = [...BARRIOS].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Cierres</h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Propiedades</Link>
            <Link href="/admin/consultas" className="text-sm text-gray-600 hover:text-gray-900">Consultas</Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Cerrar sesión</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {errorTabla ? (
          <div className="bg-white rounded-xl border border-amber-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Falta crear la tabla de cierres</h2>
            <p className="text-sm text-gray-600 mb-3">
              Corré una sola vez <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">docs/sql/cierres.sql</code> en
              el SQL Editor de Supabase.
            </p>
            <p className="text-xs text-gray-400 font-mono break-all">{errorTabla}</p>
          </div>
        ) : (
          <>
            {sp.error && (
              <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{sp.error}</p>
            )}
            {sp.ok && (
              <p className="rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Cierre guardado.</p>
            )}

            {/* Resumen */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Resumen (solo cierres validados)</h2>
              <p className="text-xs text-gray-500 mb-4">
                Un barrio se puede publicar con {MINIMO_POR_BARRIO} cierres o más. La diferencia es cuánto por
                debajo del publicado se cerró (mediana).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="py-2 pr-4">Barrio</th>
                      <th className="py-2 pr-4">Cierres</th>
                      <th className="py-2 pr-4">Diferencia</th>
                      <th className="py-2 pr-4">Días publicada</th>
                      <th className="py-2">Publicable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.porBarrio.map((b) => (
                      <tr key={b.barrio} className="border-b last:border-0">
                        <td className="py-2 pr-4">{nombreDeBarrio(b.barrio)}</td>
                        <td className="py-2 pr-4">{b.n}</td>
                        <td className="py-2 pr-4">{pct(b.diferenciaMediana)}</td>
                        <td className="py-2 pr-4">{b.diasMediana == null ? "—" : `${Math.round(b.diasMediana)} (de ${b.conDias})`}</td>
                        <td className="py-2">{b.publicable ? <span className="text-green-700">Sí</span> : <span className="text-gray-400">Faltan {MINIMO_POR_BARRIO - b.n}</span>}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-2 pr-4">San Martín de los Andes</td>
                      <td className="py-2 pr-4">{resumen.total.n}</td>
                      <td className="py-2 pr-4">{pct(resumen.total.diferenciaMediana)}</td>
                      <td className="py-2 pr-4">{resumen.total.diasMediana == null ? "—" : `${Math.round(resumen.total.diasMediana)} (de ${resumen.total.conDias})`}</td>
                      <td className="py-2">{resumen.total.publicable ? <span className="text-green-700">Sí</span> : <span className="text-gray-400">Faltan {MINIMO_POR_BARRIO - resumen.total.n}</span>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {resumen.pendientes > 0 && (
                <p className="text-xs text-amber-700 mt-3">{resumen.pendientes} cierre(s) de terceros sin validar no se cuentan.</p>
              )}
            </section>

            {/* Formulario */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Cargar un cierre</h2>
              <p className="text-xs text-gray-500 mb-4">
                Precio de cierre = monto real acordado por la propiedad, no el escriturado. Montos en USD, sin puntos ni comas.
                Lo que no sepas, dejalo vacío.
              </p>
              <form action={crearCierre} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={label} htmlFor="barrio">Barrio *</label>
                  <select id="barrio" name="barrio" required defaultValue="" className={field}>
                    <option value="" disabled>Elegí…</option>
                    {barriosOrdenados.map((b) => (
                      <option key={b.slug} value={b.slug}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="tipo">Tipo *</label>
                  <select id="tipo" name="tipo" required defaultValue="" className={field}>
                    <option value="" disabled>Elegí…</option>
                    {TIPOS_CIERRE.map((t) => (
                      <option key={t.valor} value={t.valor}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="fecha_cierre">Fecha de cierre *</label>
                  <input id="fecha_cierre" name="fecha_cierre" type="date" required className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="precio_publicado">Precio publicado (USD) *</label>
                  <input id="precio_publicado" name="precio_publicado" inputMode="numeric" required className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="precio_cierre">Precio de cierre real (USD) *</label>
                  <input id="precio_cierre" name="precio_cierre" inputMode="numeric" required className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="dias_publicada">Días publicada</label>
                  <input id="dias_publicada" name="dias_publicada" inputMode="numeric" className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="m2_cubiertos">m² cubiertos</label>
                  <input id="m2_cubiertos" name="m2_cubiertos" inputMode="decimal" className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="m2_terreno">m² de terreno</label>
                  <input id="m2_terreno" name="m2_terreno" inputMode="decimal" className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="dormitorios">Dormitorios</label>
                  <input id="dormitorios" name="dormitorios" inputMode="numeric" className={field} />
                </div>
                <div className="sm:col-span-1">
                  <label className={label} htmlFor="referencia">Referencia interna (no se publica)</label>
                  <input id="referencia" name="referencia" placeholder="Ej.: Villegas 1280" className={field} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="notas">Notas</label>
                  <input id="notas" name="notas" className={field} />
                </div>
                <input type="hidden" name="fuente" value="propia" />
                <div className="sm:col-span-3">
                  <button type="submit" className="rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800">
                    Guardar cierre
                  </button>
                </div>
              </form>
            </section>

            {/* Listado */}
            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Cierres cargados ({cierres.length})</h2>
              {cierres.length === 0 ? (
                <p className="text-sm text-gray-500">Todavía no hay cierres.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="py-2 pr-3">Fecha</th>
                        <th className="py-2 pr-3">Barrio</th>
                        <th className="py-2 pr-3">Tipo</th>
                        <th className="py-2 pr-3">Publicado</th>
                        <th className="py-2 pr-3">Cierre</th>
                        <th className="py-2 pr-3">Dif.</th>
                        <th className="py-2 pr-3">Días</th>
                        <th className="py-2 pr-3">Referencia</th>
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {cierres.map((c) => (
                        <tr key={c.id} className="border-b last:border-0">
                          <td className="py-2 pr-3 whitespace-nowrap">{c.fecha_cierre}</td>
                          <td className="py-2 pr-3">{nombreDeBarrio(c.barrio)}</td>
                          <td className="py-2 pr-3">{nombreTipo(c.tipo)}</td>
                          <td className="py-2 pr-3 whitespace-nowrap">{usd(c.precio_publicado)}</td>
                          <td className="py-2 pr-3 whitespace-nowrap">{usd(c.precio_cierre)}</td>
                          <td className="py-2 pr-3">{pct(diferenciaPct(c))}</td>
                          <td className="py-2 pr-3">{c.dias_publicada ?? "—"}</td>
                          <td className="py-2 pr-3 text-gray-500">{c.referencia || "—"}</td>
                          <td className="py-2"><BorrarCierre id={c.id} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
