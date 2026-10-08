"use client";

import { borrarCierre } from "./actions";

export default function BorrarCierre({ id }) {
  return (
    <form
      action={borrarCierre}
      onSubmit={(e) => {
        if (!confirm("¿Borrar este cierre? No se puede deshacer.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-600 hover:text-red-800 hover:underline">
        Borrar
      </button>
    </form>
  );
}
