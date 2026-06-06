"use client";

import { removeProperty } from "./property-actions";

// Botón de borrar que pide confirmación antes de enviar.
export default function DeleteButton({ id, title }) {
  return (
    <form
      action={removeProperty}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar "${title}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-800 hover:underline"
      >
        Borrar
      </button>
    </form>
  );
}
