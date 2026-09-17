// Configuración de demostración para mostrar el producto sin usar la marca,
// contactos ni datos de Catalán. Cuando haya clientes reales, cada fila pasará
// a una tabla propia y el slug seguirá siendo la llave del widget.
export const INMOBILIARIAS_DEMO = {
  piloto: {
    slug: "piloto",
    nombre: "Inmobiliaria Piloto",
    ciudad: "Tu ciudad",
    color: "#1d4ed8",
    colorSuave: "#eff6ff",
    iniciales: "IP",
  },
};

export function inmobiliariaDemo(slug) {
  return INMOBILIARIAS_DEMO[slug] ?? null;
}
