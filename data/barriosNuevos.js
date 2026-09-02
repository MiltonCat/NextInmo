// Los doce barrios que todavía no tienen ficha. Hasta que alguno tenga
// `descripcion`, su página sigue siendo un 404 y Lucía no lo nombra: un barrio
// sin nada que decir no es una página.
//
// CÓMO SE COMPLETA
// Alcanza con `descripcion` para que el barrio EXISTA: se publica la página, entra
// al listado, a Lucía y al servidor MCP. Todo lo demás es opcional y cada bloque
// aparece solo cuando lo cargás. No hace falta terminar un barrio para publicarlo.
//
// El orden en que conviene completar, por lo que más pregunta la gente:
//   1. descripcion  — dos o tres frases. Cómo es, para quién, qué lo distingue.
//   2. perfil       — a quién le sirve. ["Familias", "Inversores"]
//   3. ventajas / desventajas — lo segundo se lee más que lo primero. Sin
//                     desventajas la ficha parece un aviso y se cree menos.
//   4. autoObligatorio — true o false. Es la pregunta del que se muda.
//   5. tags, emoji  — para la tarjeta del listado.
//
// Los puntajes (tranquilidad, servicios, acceso, inversion) van de 1 a 5 y los
// bloques con `detalle` son texto libre. Todo lo que quede en null no se dibuja
// ni le llega a Lucía — ver nunca-inventar-datos. NO completar por intuición: si
// no sabés si tiene cloacas, dejalo en null, no pongas "probablemente".
//
// Las distancias de estos barrios van en data/distanciasBarrios.js, aparte.

export const BARRIOS_NUEVOS = [
  {
    slug: "costanera",
    nombre: "Costanera",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "las-marias",
    nombre: "Las Marías",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "las-pendientes",
    nombre: "Las Pendientes",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "via-blanca",
    nombre: "Vía Blanca",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "arrayan",
    nombre: "Arrayán",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "lacar",
    nombre: "Lácar",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "patagonia-norte",
    nombre: "Patagonia Norte",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "vega-san-martin",
    nombre: "Vega San Martín",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "orillas-del-quilquihue",
    nombre: "Orillas del Quilquihue",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "san-fernando",
    nombre: "San Fernando",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "las-nalcas",
    nombre: "Las Nalcas",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
  {
    slug: "ruca-hue",
    nombre: "Ruca Hue",
    emoji: null,
    descripcion: null, // ← con esto solo, el barrio ya tiene página
    perfil: [],
    ventajas: [],
    desventajas: [],
    tags: [],
    autoObligatorio: null,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: null,   // { nivel: 1-5, detalle: "Fibra óptica COTESMA…" }
    transporte: null, // { nivel: 1-5, detalle: "2 líneas urbanas" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },
];

// Solo los que ya tienen algo que decir. Un barrio sin descripción no entra a
// ningún lado: no hay media ficha publicada.
export const BARRIOS_NUEVOS_LISTOS = BARRIOS_NUEVOS.filter((b) => Boolean(b.descripcion));

export default BARRIOS_NUEVOS;
