// Los barrios que todavía no tienen ficha. Hasta que alguno tenga
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
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
    transporte: null, // { nivel: 1-5, detalle: "El colectivo urbano pasa por el barrio" }
    cloacas: null,    // { nivel: 1-5, estado: "Completa" }
    calles: null,     // { nivel: 1-5, estado: "Asfalto completo" }
    seguridad: null,  // { nivel: 1-5, detalle: "…" }
    petFriendly: null,
    hospital: null,   // { nivel: 1-5, items: [{ tipo, nombre, distancia }] }
  },

  // ── Agregados el 2026-10-15: el modelo ya les calcula el m² ─────────────
  // Ordenados por cantidad de propiedades relevadas: los primeros son los que
  // más rinden apenas tengan descripción.
  {
    slug: "altos-del-sol",
    // Cargado el 16/10/2026 con lo que coinciden las publicaciones del barrio
    // (Zonaprop, Grupo Patagonia, Solar Urbano). Lo que no surge de ahí queda en null.
    nombre: "Altos del Sol",
    emoji: "☀️",
    descripcion: "Barrio residencial en la ladera soleada, a menos de 1 km del centro —unos diez minutos a pie—, sobre Perito Moreno y calles como Los Helechos, Las Lengas y Los Alerces. Casas en entorno arbolado, con vistas al cordón del Chapelco y, desde algunas, al lago Lácar.",
    perfil: ["Residencia permanente", "Familias", "Quienes quieren ir caminando al centro"],
    ventajas: [
      "A menos de 1 km del centro",
      "Ladera soleada con vistas al Chapelco",
      "Gas natural y fibra óptica en buena parte del barrio",
      "El m² está bastante por debajo del Centro, a pocas cuadras",
    ],
    desventajas: [
      "Calles en pendiente: es una ladera",
      "Servicios no parejos: hay casas con pozo en lugar de cloaca",
    ],
    tags: ["Cerca del centro", "Vistas", "Residencial"],
    autoObligatorio: false,
    tranquilidad: null,
    servicios: null,
    acceso: null,
    inversion: null,
    internet: { nivel: 4, detalle: "Hay casas con fibra óptica" },
    transporte: null,
    cloacas: { nivel: 3, estado: "Red cloacal en buena parte del barrio; hay casas con pozo" },
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "altos-del-chapelco",
    nombre: "Altos del Chapelco",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "camino-lolog",
    nombre: "Camino Lolog",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "alihuen",
    nombre: "Alihuen",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "meliquina",
    nombre: "Meliquina",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "el-arenal",
    nombre: "El Arenal",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "valle-de-chapelco",
    nombre: "Valle de Chapelco",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "chacra-28",
    nombre: "Chacra 28",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "la-balconada",
    nombre: "La Balconada",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "los-coirones",
    nombre: "Los Coirones",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "faldeos-de-chapelco",
    nombre: "Los Faldeos de Chapelco",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "los-robles",
    nombre: "Los Robles",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "tierra-de-sol",
    nombre: "Tierra de Sol",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "tiro-federal",
    nombre: "Tiro Federal",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "callejon-de-gingins",
    nombre: "Callejón de Gin Gins",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "el-desafio",
    nombre: "El Desafío",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "el-oasis",
    nombre: "El Oasis",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "lago-lolog",
    nombre: "Lago Lolog",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
  {
    slug: "rio-hermoso",
    nombre: "Río Hermoso",
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
    internet: null,
    transporte: null,
    cloacas: null,
    calles: null,
    seguridad: null,
    petFriendly: null,
    hospital: null,
  },
];

// Solo los que ya tienen algo que decir. Un barrio sin descripción no entra a
// ningún lado: no hay media ficha publicada.
export const BARRIOS_NUEVOS_LISTOS = BARRIOS_NUEVOS.filter((b) => Boolean(b.descripcion));

export default BARRIOS_NUEVOS;
