/**
 * Identificador de la charla con Lucía. Solo cliente: no lo importe nada del
 * servidor.
 *
 * Por qué existe: `lucia_preguntas` guardaba cada mensaje suelto, sin nada que
 * dijera a qué charla pertenecía. Para la investigación de consultas (qué pide
 * la gente, cómo termina) la unidad es la conversación completa, no la frase.
 *
 * Reglas:
 * - El id nace con la PRIMERA frase que la persona le escribe a Lucía, no al
 *   abrir la página. Así, que exista un id significa que hubo charla.
 * - Vive en sessionStorage: sobrevive a navegar entre páginas de la misma
 *   visita (el chat acompaña al visitante) y muere al cerrar la pestaña.
 * - "Reiniciar charla" lo termina: lo que se escriba después es otra consulta.
 * - Es un UUID al azar. No identifica a nadie ni se cruza con IP o cuenta: solo
 *   agrupa frases. El único cruce es con la consulta del CRM, y solo cuando la
 *   persona decide dejar sus datos (ver lib/registrarConsulta.js).
 */

const CLAVE = "lucia-conversacion";

// Respaldo en memoria para navegadores con el almacenamiento bloqueado: la
// charla se agrupa igual mientras la pestaña siga abierta en esa página.
let enMemoria = null;

function leer() {
  try {
    return sessionStorage.getItem(CLAVE) || enMemoria;
  } catch {
    return enMemoria;
  }
}

function guardar(id) {
  enMemoria = id;
  try {
    if (id) sessionStorage.setItem(CLAVE, id);
    else sessionStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento: queda solo en memoria
  }
}

// Para mandar con cada frase: devuelve el id de la charla en curso o arranca
// una nueva.
export function idConversacionLucia() {
  if (typeof window === "undefined") return null;
  const actual = leer();
  if (actual) return actual;
  let nuevo = null;
  try {
    nuevo = crypto.randomUUID();
  } catch {
    return null; // sin crypto no hay id: la frase se guarda igual, suelta
  }
  guardar(nuevo);
  return nuevo;
}

// Para vincular un lead: el id solo si la persona ya habló con Lucía en esta
// visita. Nunca crea uno.
export function conversacionLuciaActual() {
  if (typeof window === "undefined") return null;
  return leer();
}

// "Reiniciar charla": lo que venga después es otra consulta.
export function terminarConversacionLucia() {
  if (typeof window === "undefined") return;
  guardar(null);
}
