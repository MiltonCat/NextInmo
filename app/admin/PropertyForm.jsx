"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BARRIOS } from "@/lib/barrios";

const IMAGE_FIELDS = [
  { name: "image", label: "Foto principal" },
  { name: "image1", label: "Foto 2" },
  { name: "image2", label: "Foto 3" },
  { name: "image3", label: "Foto 4" },
  { name: "image4", label: "Foto 5" },
];

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none";
const label = "block text-sm font-medium text-gray-700 mb-1";

// Formulario reutilizable para cargar (property = null) o editar una propiedad.
export default function PropertyForm({ action, property = null }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const p = property || {};

  return (
    <form action={formAction} className="space-y-8">
      {property && <input type="hidden" name="id" value={p.id} />}

      {/* --- Datos principales --- */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos principales</h2>

        <div>
          <label className={label} htmlFor="title">Título *</label>
          <input id="title" name="title" required defaultValue={p.title || ""} className={field} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="type">Tipo</label>
            <input
              id="type"
              name="type"
              list="tipos"
              placeholder="Casa, Departamento, Terreno…"
              defaultValue={p.type || ""}
              className={field}
            />
            <datalist id="tipos">
              <option value="Casa" />
              <option value="Departamento" />
              <option value="Monoambiente" />
              <option value="Cabañas" />
              <option value="Terreno" />
              <option value="Local" />
              <option value="Oficina" />
            </datalist>
          </div>
          <div>
            <label className={label} htmlFor="operation">Operación</label>
            <select id="operation" name="operation" defaultValue={p.operation || "venta"} className={field}>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="location">Ubicación</label>
            <input id="location" name="location" defaultValue={p.location || ""} className={field} />
          </div>
          {/* El barrio se elige de la lista, no se escribe. De esto depende que
              la propiedad aparezca en /barrios/<barrio> y en el bloque de
              /precio-m2: la dirección sola ("Rivadavia 155") no alcanza para
              deducirlo. Si queda sin elegir se sigue intentando deducir del
              texto de Ubicación, como antes. */}
          <div>
            <label className={label} htmlFor="barrio">Barrio</label>
            <select id="barrio" name="barrio" defaultValue={p.barrio || ""} className={field}>
              <option value="">Deducir de la ubicación</option>
              {BARRIOS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Sin barrio, la propiedad no se lista en la página de su zona.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={label} htmlFor="price">Precio (USD)</label>
            <input id="price" name="price" type="number" step="any" defaultValue={p.price ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="bedrooms">Dormitorios</label>
            <input id="bedrooms" name="bedrooms" type="number" defaultValue={p.bedrooms ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="bathrooms">Baños</label>
            <input id="bathrooms" name="bathrooms" type="number" defaultValue={p.bathrooms ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="area">Superficie (m²)</label>
            <input id="area" name="area" type="number" step="any" defaultValue={p.area ?? ""} className={field} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label} htmlFor="roi">ROI (%)</label>
            <input id="roi" name="roi" type="number" step="any" defaultValue={p.roi ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="lat">Latitud (mapa)</label>
            <input id="lat" name="lat" type="number" step="any" defaultValue={p.lat ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="lng">Longitud (mapa)</label>
            <input id="lng" name="lng" type="number" step="any" defaultValue={p.lng ?? ""} className={field} />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="description">Descripción</label>
          <textarea id="description" name="description" rows={5} defaultValue={p.description || ""} className={field} />
        </div>

        <div>
          <label className={label} htmlFor="features">Características (una por línea)</label>
          <textarea
            id="features"
            name="features"
            rows={4}
            placeholder={"Piscina\nJardín\nGaraje"}
            defaultValue={Array.isArray(p.features) ? p.features.join("\n") : ""}
            className={field}
          />
        </div>

        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-red-700">
            <input type="checkbox" name="vendida" defaultChecked={!!p.vendida} /> Vendida
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="reservada" defaultChecked={!!p.reservada} /> Reservada
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="alquilada" defaultChecked={!!p.alquilada} /> Alquilada
          </label>
        </div>
      </section>

      {/* --- Fotos --- */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Fotos</h2>
        <p className="text-sm text-gray-500">
          Subí hasta 5 fotos. Si dejás un casillero vacío al editar, se conserva la foto actual.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IMAGE_FIELDS.map(({ name, label: lbl }) => (
            <div key={name} className="border border-gray-200 rounded-lg p-3">
              <span className={label}>{lbl}</span>
              {p[name] && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p[name]} alt="" className="w-full h-32 object-cover rounded-md mb-2 bg-gray-100" />
                  <input type="hidden" name={`${name}_current`} value={p[name]} />
                </>
              )}
              <input type="file" name={name} accept="image/*" className="text-sm" />
            </div>
          ))}
        </div>
      </section>

      {/* --- Datos de alquiler --- */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos de alquiler (solo si es alquiler)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label} htmlFor="precioAlquilerARS">Precio alquiler (ARS)</label>
            <input id="precioAlquilerARS" name="precioAlquilerARS" type="number" step="any" defaultValue={p.precioAlquilerARS ?? ""} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="disponibleDesde">Disponible desde</label>
            <input id="disponibleDesde" name="disponibleDesde" defaultValue={p.disponibleDesde || ""} placeholder="Ej: Marzo 2026" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="mesesMinimos">Meses mínimos</label>
            <input id="mesesMinimos" name="mesesMinimos" type="number" defaultValue={p.mesesMinimos ?? ""} className={field} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="condiciones">Condiciones</label>
          <textarea id="condiciones" name="condiciones" rows={3} defaultValue={p.condiciones || ""} className={field} />
        </div>
      </section>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gray-900 text-white px-6 py-2.5 font-medium hover:bg-gray-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : property ? "Guardar cambios" : "Cargar propiedad"}
        </button>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
