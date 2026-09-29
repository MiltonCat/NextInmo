// Nota retirada el 29/09/2026. Proyectaba rentas del 15-18% anual y una
// valorización del 42% "que no es especulación", sin fuente, y contradecía
// "Cuánto rinde un alquiler temporario" (6-9% neto, con datos del mercado).
// En Search Console tuvo 0 clics en 6 meses. El texto sigue en el historial de git.
//
// Se redirige de forma permanente (308) a la versión seria del mismo tema, así
// no se rompen los links que existan afuera y Google traslada la URL.
// force-dynamic: para que la redirección sea una respuesta HTTP real y no un
// HTML prerenderizado.
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BitcoinLadrillosRetirado() {
  permanentRedirect("/blog/score-de-inversion-san-martin-de-los-andes/");
}
