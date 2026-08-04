// Precio del m² por zona y tipo de propiedad.
//
// Vivía como const ZONAS dentro de app/precio-m2/page.js. Se movió acá porque
// las fichas /barrios/[slug] necesitan el mismo dato: si quedaban dos copias,
// se desincronizaban igual que pasó con el sitemap y con las tres listas de
// barrios de antes.
//
// `slug` referencia a lib/barrios.js. Ojo: no todas las zonas con precio tienen
// perfil editorial y no todos los barrios con perfil tienen precio por tipo —
// son dos coberturas distintas y por eso se cruzan por slug.

export const ZONAS = [
  { slug: "centro", nombre: "Centro", tipo: "Departamento", precioM2: 2735, variacion: 4.5 },
  { slug: "centro", nombre: "Centro", tipo: "Casa", precioM2: 2180, variacion: 4.2 },
  { slug: "centro", nombre: "Centro", tipo: "Terreno", precioM2: 560, variacion: 2.1 },
  { slug: "centro", nombre: "Centro", tipo: "Local comercial", precioM2: 2400, variacion: 3.5 },
  { slug: "chapelco-golf", nombre: "Chapelco Golf", tipo: "Departamento", precioM2: 3400, variacion: 6.5 },
  { slug: "chapelco-golf", nombre: "Chapelco Golf", tipo: "Casa", precioM2: 2950, variacion: 5.8 },
  { slug: "chapelco-golf", nombre: "Chapelco Golf", tipo: "Terreno", precioM2: 380, variacion: 8.2 },
  { slug: "costanera", nombre: "Costanera", tipo: "Departamento", precioM2: 2950, variacion: 5.5 },
  { slug: "costanera", nombre: "Costanera", tipo: "Casa", precioM2: 2400, variacion: 4.8 },
  { slug: "las-marias", nombre: "Las Marías", tipo: "Casa", precioM2: 1750, variacion: 3.5 },
  { slug: "las-marias", nombre: "Las Marías", tipo: "Terreno", precioM2: 110, variacion: 2.8 },
  { slug: "las-pendientes", nombre: "Las Pendientes", tipo: "Casa", precioM2: 2950, variacion: 5.5 },
  { slug: "las-pendientes", nombre: "Las Pendientes", tipo: "Terreno", precioM2: 72, variacion: 3.5 },
];

// Filas de precio de un barrio. Array vacío si esa zona no está relevada por
// tipo — la ficha muestra igual el rango general del perfil.
export function preciosDeBarrio(slug) {
  return ZONAS.filter((z) => z.slug === slug);
}

export default ZONAS;
