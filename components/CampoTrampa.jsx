"use client";

// Campo trampa para bots (honeypot), en un solo lugar.
//
// Antes cada formulario armaba el suyo con `name="website"`, y eso resultó ser
// exactamente el nombre que los gestores de contraseñas buscan para completar.
// LastPass lo rellenaba solo y el servidor tomaba a la persona por bot: en el
// tasador eso era un error visible y en contacto era peor todavía, porque el
// formulario no hacía nada y no avisaba nada. Una inmobiliaria perdiendo
// consultas sin enterarse.
//
// Dos cambios evitan que vuelva a pasar:
//
// 1. El nombre ya no se parece a ningún campo real. Un gestor completa "website",
//    "url" o "empresa" porque los reconoce; `cp_verif` no le dice nada.
// 2. Los atributos `data-*` son los que cada gestor mira para saltear un campo.
//    `autoComplete="off"` solo no alcanza: Chrome y la mayoría de los gestores
//    lo ignoran hace años.
//
// Y del lado del servidor, la regla es que la trampa nunca le cuesta nada a una
// persona: como mucho evita un alta en la lista de correo. Un honeypot que
// bloquea a un humano hace más daño que el spam que evita.

export const NOMBRE_TRAMPA = "cp_verif";

export default function CampoTrampa({ valor, onChange }) {
  return (
    <input
      type="text"
      name={NOMBRE_TRAMPA}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      // Cada gestor respeta el suyo. Van todos porque no sabemos cuál tiene
      // instalado quien entra, y de más no molestan.
      data-lpignore="true"
      data-1p-ignore=""
      data-bwignore="true"
      data-protonpass-ignore="true"
      data-form-type="other"
      className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
    />
  );
}
