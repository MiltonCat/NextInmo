const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const salePrice = (property) => {
  const value = number(property.price);
  return value && value > 0 ? value : null;
};

const rentPrice = (property) => {
  const value = number(property.precioAlquilerARS);
  return value && value > 0 ? value : null;
};

const isSale = (property) => property.modalidad !== "alquiler_permanente";

const hasPublicPage = (property) =>
  !property.vendida &&
  !property.noDisponible &&
  property.status !== "no_disponible";

const propertyText = (property) =>
  normalize([
    property.title,
    property.type,
    property.location,
    property.barrio,
    property.description,
    ...(Array.isArray(property.features) ? property.features : []),
  ].join(" "));

const PRIORITIES = {
  exterior: {
    words: ["jardin", "patio", "parque", "terraza", "balcon", "deck"],
    reason: "Tiene espacio exterior entre sus características publicadas.",
  },
  garage: {
    words: ["garage", "garaje", "cochera", "estacionamiento"],
    reason: "Incluye cochera o estacionamiento en la publicación.",
  },
  center: {
    words: ["centro", "centrico"],
    reason: "Está publicada en una ubicación céntrica.",
  },
};

const noPreference = (text) => /me da igual|no (se|sé)|no importa|sin preferencia|no.*defin|todavia no|todavía no/.test(text);

function amountFrom(raw) {
  if (!raw) return null;
  const compact = raw.replace(/\s/g, "").toLowerCase();
  const multiplier = compact.endsWith("k") || compact.endsWith("mil") ? 1000 : 1;
  const digits = compact.replace(/mil|k/g, "").replace(/\./g, "").replace(",", ".");
  const value = Number(digits);
  return Number.isFinite(value) ? Math.round(value * multiplier) : null;
}

// La gente no escribe como un manual: abrevia, come acentos y teclea rapido. Si
// el router mira el texto crudo, "q onda los precios" y "kiero saber si conviene"
// no parecen preguntas y terminan en el arbol guiado, que no sabe responderlas.
// Esto se aplica SOLO al texto que escribe la persona, nunca a las publicaciones.
const ABREVIATURAS = [
  [/\bq\b/g, "que"],
  [/\bke\b/g, "que"],
  [/\bqe\b/g, "que"],
  [/\bxq\b/g, "por que"],
  [/\bpq\b/g, "por que"],
  [/\bporq\b/g, "por que"],
  [/\bkiero\b/g, "quiero"],
  [/\bkeria\b/g, "queria"],
  [/\bdpto\b/g, "departamento"],
  [/\bdep\b/g, "departamento"],
  [/\bx\b/g, "por"],
  [/\btb\b/g, "tambien"],
  [/\bxfa\b/g, "por favor"],
  [/\bd\b/g, "de"],
  [/\bpa\b/g, "para"],
];

export function normalizarConsulta(input) {
  let texto = normalize(input).replace(/\s+/g, " ").trim();
  for (const [patron, reemplazo] of ABREVIATURAS) texto = texto.replace(patron, reemplazo);
  return texto;
}

// Marcadores de consulta. Se buscan en TODA la frase, no solo al comienzo: "mira,
// queria saber si conviene comprar" tiene la pregunta en el medio. Van con \b
// porque sin el "queremos" y "queria" entraban por "que" y mandaban a la IA
// busquedas que el arbol resolvia mejor.
const RE_INTERROGATIVO = /\b(que|cual|cuales|cuando|cuanto|cuanta|cuantos|cuantas|como|donde|adonde|quien|quienes|por que|para que)\b/;
const RE_CONSULTA = /\b(conviene|convendria|vale la pena|se puede|puedo|podes|podria|podrias|sabes|sabras|sabe|contame|explicame|decime|dime|recomendas|recomiendas|recomendarias|sirve|es caro|es barato|son caros|estan caros|esta bueno|estan buenos|necesito saber|quisiera saber|queria saber|quiero saber|me gustaria saber|averiguar|duda|dudas|consulta|pregunta|diferencia|tramite|tramites|impuesto|impuestos|escritura|comision|hipoteca|credito)\b/;
// Alguien que dice explicitamente que busca algo va al arbol, aunque escriba con
// signos: "busco casa hasta 200 mil??" no es una consulta, es una busqueda.
// El mismo interrogativo pero SOLO cuando abre la frase o una oracion nueva. Es
// lo que separa "busco casa que tenga jardin" —donde "que" es un relativo y la
// frase sigue siendo una busqueda— de "me interesa invertir, que rentabilidad
// tiene", que es una pregunta con todas las letras. Sin esta distincion, volver
// a habilitar el interrogativo mandaria a la IA media docena de busquedas que el
// arbol resuelve mejor.
const RE_INTERROGATIVO_INICIAL = /(?:^|[,;.]\s*)(?:que|cual|cuales|cuando|cuanto|cuanta|cuantos|cuantas|como|donde|adonde|quien|quienes|por que|para que)\b/;
const RE_BUSQUEDA_EXPLICITA = /\b(busco|buscamos|buscando|ando buscando|estoy buscando|me interesa|me interesan)\b|\b(quiero|queremos|queria|querian|quisiera|necesito|necesitamos|estoy por)\s+(comprar|alquilar|vender|invertir|una casa|un departamento|un depto|un ph|un lote|un terreno|una cabana|un monoambiente)\b/;
// Una búsqueda puede traer también una decisión humana que el embudo no sabe
// resolver: familia, trabajo remoto, barrio recomendado, vida cotidiana. En ese
// caso Lucía necesita responder con catálogo + perfiles de barrio, no convertir
// todo el mensaje en una sucesión de preguntas ya contestadas.
const RE_BUSQUEDA_CONVERSACIONAL = /\b(recomend|convien|familia|pareja|hij|chic|coleg|escuel|trabaj.*(?:casa|remoto)|internet|mud|segur|tranquil)\w*/;

// Mucha gente no pregunta: cuenta. "Somos una familia con dos chicos, buscamos
// algo tranquilo cerca de un colegio" no lleva signo de pregunta y sin embargo
// no es una búsqueda por filtros —es una decisión de vida—, y el embudo la
// contestaba con "¿cuántos dormitorios necesitás?". Se pide relato además de
// señal: "un departamento chico" trae "chic" pero no cuenta nada, y ahí el
// árbol guiado resuelve mejor que la IA.
const PALABRAS_DE_RELATO = 8;

export function pareceRelatoPersonal(input) {
  const texto = normalizarConsulta(input);
  if (!RE_BUSQUEDA_CONVERSACIONAL.test(texto)) return false;
  return texto.split(/\s+/).filter(Boolean).length >= PALABRAS_DE_RELATO;
}

export function pareceConsulta(input) {
  const crudo = String(input || "");
  const texto = normalizarConsulta(crudo);
  // El signo NO cuenta acá: "busco casa hasta 200 mil??" sigue siendo una
  // busqueda, y esa fue siempre la razon de ser del veto. Lo que lo levanta es
  // que la frase pregunte de verdad — un marcador de consulta, o un
  // interrogativo abriendo una oracion.
  const pregunta = RE_CONSULTA.test(texto) || RE_INTERROGATIVO_INICIAL.test(texto);
  // "Quiero" ya no cancela una pregunta. Antes, decir que buscabas algo vetaba
  // todo lo demas: "me interesa invertir, que rentabilidad tiene" —una pregunta
  // sin signos— terminaba en el arbol de botones, que no la sabe contestar. El
  // veto sigue en pie para la busqueda pelada ("busco casa hasta 200 mil??"),
  // que el embudo resuelve mejor aunque venga con signos.
  if (RE_BUSQUEDA_EXPLICITA.test(texto) && !RE_BUSQUEDA_CONVERSACIONAL.test(texto) && !pregunta) {
    return false;
  }
  if (/[?\u00bf]/.test(crudo)) return true;
  return RE_INTERROGATIVO.test(texto) || RE_CONSULTA.test(texto);
}

// Devuelve "ia" o "guiado". Es la unica autoridad sobre a donde va el texto que
// escribe una persona; ChatBot.jsx no vuelve a decidir por su cuenta.
const CLAVE_DEL_PASO = {
  ask_goal: "goal",
  ask_type: "type",
  ask_alq_type: "type",
  ask_budget: "budget",
  ask_bedrooms: "bedrooms",
  ask_alq_bedrooms: "bedrooms",
  ask_priority: "priority",
  ask_priority_lote: "priority",
  ask_alq_priority: "priority",
};

// IA primero (22/09/2026, decisión de Milton): la gente está acostumbrada a
// escribirle a una IA y recibir una respuesta, no un cuestionario. Lo escrito
// va siempre a la IA, que busca en el catálogo con buscar_propiedades y
// muestra las fichas como tarjetas. El árbol queda para cuando hace falta: los
// botones, y la respuesta pelada a una pregunta que el mismo árbol acaba de
// hacer ("2", "una casa", "me da igual").
export function rutaDelTexto(input, activeStep = "welcome", parsed = null) {
  if (!activeStep.startsWith("ask_")) return "ia";
  const datos = parsed || parseLuciaText(input, activeStep);
  const clave = CLAVE_DEL_PASO[activeStep];
  const respondioElPaso = clave ? Boolean(datos.answered[clave]) : false;
  // Si además de responder pregunta algo, gana la pregunta: "3, ¿y cuánto
  // sale el m2 ahí?" necesita una respuesta, no el paso siguiente.
  return respondioElPaso && !pareceConsulta(input) ? "guiado" : "ia";
}

// Regla anterior (hasta el 22/09): mandaba al árbol toda búsqueda por filtros.
// Se conserva para comparar en el modo sombra y por si hay que volver atrás.
export function rutaDelTextoAnterior(input, activeStep = "welcome", parsed = null) {
  const datos = parsed || parseLuciaText(input, activeStep);
  const consulta = pareceConsulta(input);

  // Dentro del flujo guiado, lo escrito se lee como respuesta al paso. La unica
  // salida es una consulta que ademas NO responda la pregunta que Lucia acaba de
  // hacer: sin esto, quien escribe "cuanto sale el m2?" mientras le preguntan los
  // dormitorios queda atrapado en el embudo. Se mira solo la clave del paso, no
  // cualquier dato suelto: "cuanto sale el m2 en el centro?" deja caer un
  // priority=center de rebote, y eso no es responder cuantos dormitorios quiere.
  if (activeStep.startsWith("ask_")) {
    const clave = CLAVE_DEL_PASO[activeStep];
    const respondioElPaso = clave ? Boolean(datos.answered[clave]) : false;
    return consulta && !respondioElPaso ? "ia" : "guiado";
  }

  if (consulta) return "ia";
  // Solo a la entrada: adentro del embudo lo escrito ya se leyó como respuesta al paso.
  if (pareceRelatoPersonal(input)) return "ia";
  return datos.searchIntent ? "guiado" : "ia";
}

// La operación que ya quedó dicha en la charla. "Quiero que me muestres
// alquileres" → Lucía responde → "de 2 habitaciones": la segunda frase va al
// árbol, que arrancaba de cero y preguntaba "¿para qué lo buscás?" como si
// nunca se hubiera hablado de alquiler. Se lee de la más nueva a la más vieja
// (el último mensaje es el actual) y la primera que nombra una operación
// decide; si nombra compra o venta, no se arrastra nada.
export function operacionDeLaCharla(mensajesDelUsuario = []) {
  for (const mensaje of [...mensajesDelUsuario].reverse().slice(0, 4)) {
    const texto = normalizarConsulta(mensaje);
    if (/alquil/.test(texto)) return "alquiler";
    if (/\b(?:compr|vend|venta)/.test(texto)) return null;
  }
  return null;
}

export function parseLuciaText(input, activeStep = "welcome") {
  const text = normalizarConsulta(input);
  const filters = {};
  const answered = {};
  const renting = /alquil|alquiler/.test(text);
  const buying = /compr|busc|propiedad|casa|departamento|depto|ph\b|cabana|lote|terreno|monoambiente/.test(text);

  if (renting) filters.operacion = "alquiler";

  if (/invert|renta|rentabilidad/.test(text)) filters.objective = "invertir";
  else if (/constru/.test(text)) filters.objective = "construir";
  else if (/para vivir|mud|vivienda propia|mi casa/.test(text)) filters.objective = "vivir";
  else if (/explor|averigu|no.*claro/.test(text)) filters.objective = "explorar";
  if (filters.objective || (activeStep === "ask_goal" && noPreference(text))) answered.goal = true;

  const types = [];
  if (/\bcasa\b/.test(text)) types.push("Casa");
  if (/departamento|depto|\bph\b/.test(text)) types.push("Departamento", "PH");
  if (/monoambiente/.test(text)) types.push("Monoambiente");
  if (/cabana/.test(text)) types.push("Cabaña", "Cabañas");
  if (/lote|terreno/.test(text)) types.push("Lote");
  if (types.length) filters.types = [...new Set(types)];
  if (types.length || ((activeStep === "ask_type" || activeStep === "ask_alq_type") && noPreference(text))) answered.type = true;

  const amounts = [...text.matchAll(/(?:usd|u\$s|us\$|dolares?\s*)?([0-9]+(?:[.,][0-9]+)?(?:\s*(?:mil|k))?)/g)]
    .map((match) => amountFrom(match[1]))
    .filter((value) => value && value >= 10000);
  if (amounts.length >= 2 && /entre|desde/.test(text)) {
    filters.minPrice = Math.min(...amounts);
    filters.maxPrice = Math.max(...amounts);
    answered.budget = true;
  } else if (amounts.length) {
    if (/mas de|más de|desde/.test(text)) filters.minPrice = amounts[0];
    else filters.maxPrice = amounts[0];
    answered.budget = true;
  } else if (activeStep === "ask_budget" && noPreference(text)) {
    answered.budget = true;
  }

  const dormitoriosEnPalabras = {
    un: 1,
    uno: 1,
    una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
    seis: 6,
  };
  const bedrooms = text.match(/(\d+|un|uno|una|dos|tres|cuatro|cinco|seis)\s*(?:dorm|habit|cuarto)/);
  if (bedrooms) {
    const cantidad = /^\d+$/.test(bedrooms[1])
      ? Number(bedrooms[1])
      : dormitoriosEnPalabras[bedrooms[1]];
    filters.minBedrooms = cantidad;
    filters.maxBedrooms = cantidad;
    answered.bedrooms = true;
  } else if (activeStep === "ask_bedrooms" || activeStep === "ask_alq_bedrooms") {
    const plainNumber = text.match(/^\s*(\d+)\s*$/);
    if (plainNumber) {
      filters.minBedrooms = Number(plainNumber[1]);
      filters.maxBedrooms = Number(plainNumber[1]);
      answered.bedrooms = true;
    } else if (noPreference(text)) {
      answered.bedrooms = true;
    }
  }
  if (/monoambiente/.test(text)) {
    filters.minBedrooms = 0;
    filters.maxBedrooms = 0;
    answered.bedrooms = true;
  }

  if (/jardin|patio|parque|terraza|balcon|espacio exterior/.test(text)) filters.priority = "exterior";
  else if (/cochera|garage|garaje|estacionamiento/.test(text)) filters.priority = "garage";
  else if (/centr|centro/.test(text)) filters.priority = "center";
  else if (/superficie|amplio|espacio/.test(text)) filters.priority = "space";
  if (filters.priority || ((activeStep === "ask_priority" || activeStep === "ask_priority_lote" || activeStep === "ask_alq_priority") && noPreference(text))) answered.priority = true;

  // `objective` dice PARA QUE busca, no QUE busca: invertir, construir o
  // explorar no recortan el catalogo como si lo hacen un tipo, un presupuesto o
  // los dormitorios. Contarlo como busqueda mandaba "quiero invertir" al embudo,
  // que respondia con un cuestionario mientras el contenido de /inversiones
  // —el FAQ y la serie del m²— se quedaba sin cargar del otro lado de la puerta.
  const recortanElCatalogo = Object.keys(filters).filter((clave) => clave !== "objective");

  return {
    filters,
    answered,
    searchIntent: renting || buying || recortanElCatalogo.length > 0 || activeStep.startsWith("ask_"),
  };
}

export function nextLuciaStep(filters = {}, answered = {}) {
  if (filters.operacion === "alquiler") {
    if (!answered.type) return "ask_alq_type";
    if (!answered.bedrooms) return "ask_alq_bedrooms";
    if (!answered.priority) return "ask_alq_priority";
    return "results_alquiler";
  }

  if (!answered.goal) return "ask_goal";
  if (!answered.type && filters.objective !== "construir") return "ask_type";
  if (!answered.budget) return "ask_budget";
  const lot = filters.objective === "construir" || filters.types?.some((type) => normalize(type) === "lote");
  if (!lot && !answered.bedrooms) return "ask_bedrooms";
  if (!answered.priority) return lot ? "ask_priority_lote" : "ask_priority";
  return "results";
}

function matchesTypes(property, filters) {
  if (!filters.types?.length) return true;
  const type = normalize(property.type);
  return filters.types.some((candidate) => type.includes(normalize(candidate)));
}

// Cuando el campo dormitorios está vacío, se lee del título o la descripción
// ("Departamento de 1 habitación…", "monoambiente", "3 ambientes"). Sin esto,
// una ficha con el dato solo en el texto quedaba afuera de toda búsqueda por
// dormitorios. El campo cargado manda siempre sobre el texto.
const NUMEROS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5 };
export function dormitoriosDe(property = {}) {
  // Ojo: number(null) da 0, y un 0 inventado es un monoambiente que no existe.
  const vacio = property.bedrooms === null || property.bedrooms === undefined || property.bedrooms === "";
  const cargado = vacio ? null : number(property.bedrooms);
  if (cargado !== null) return cargado;
  const texto = normalize(`${property.title || ""} ${property.description || ""}`);
  if (/monoambiente/.test(texto)) return 0;
  const dorm = texto.match(/\b(\d|un|una|uno|dos|tres|cuatro|cinco)\s+(?:dormitorio|habitacion|cuarto)/);
  if (dorm) return /^\d$/.test(dorm[1]) ? Number(dorm[1]) : NUMEROS[dorm[1]];
  const amb = texto.match(/\b(\d|dos|tres|cuatro|cinco)\s+ambientes\b/);
  if (amb) return Math.max(0, (/^\d$/.test(amb[1]) ? Number(amb[1]) : NUMEROS[amb[1]]) - 1);
  return null;
}

function matchesBedrooms(property, filters) {
  if (filters.minBedrooms === undefined && filters.maxBedrooms === undefined) return true;
  const bedrooms = dormitoriosDe(property);
  if (bedrooms === null) return false;
  if (filters.minBedrooms !== undefined && bedrooms < filters.minBedrooms) return false;
  if (filters.maxBedrooms !== undefined && bedrooms > filters.maxBedrooms) return false;
  return true;
}

export function eligibleProperties(filters = {}, properties = []) {
  const renting = filters.operacion === "alquiler";

  return properties.filter((property) => {
    if (!hasPublicPage(property) || !matchesTypes(property, filters) || !matchesBedrooms(property, filters)) {
      return false;
    }

    if (renting) {
      return !isSale(property) && !property.alquilada && !property.reservada && rentPrice(property) !== null;
    }

    if (!isSale(property)) return false;
    const price = salePrice(property);
    if (price === null) return false;
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;
    return true;
  });
}

function priorityMatch(property, priority) {
  const config = PRIORITIES[priority];
  if (!config) return false;
  const text = propertyText(property);
  return config.words.some((word) => text.includes(word));
}

function scoreProperty(property, filters) {
  let score = 0;
  const price = filters.operacion === "alquiler" ? rentPrice(property) : salePrice(property);
  const bedrooms = number(property.bedrooms);
  const area = number(property.area);
  const roi = number(property.roi);

  if (filters.types?.length) score += 30;
  if (filters.minPrice || filters.maxPrice) {
    score += 20;
    if (filters.maxPrice && price) score += Math.max(0, 10 - Math.abs(filters.maxPrice - price) / filters.maxPrice * 10);
  }
  if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) score += 20;
  if (filters.priority === "space" && area) score += Math.min(20, area / 20);
  if (priorityMatch(property, filters.priority)) score += 20;
  if (filters.objective === "invertir" && roi) score += Math.min(20, roi * 2);

  return score;
}

function reasonsFor(property, filters) {
  const reasons = [];
  const price = filters.operacion === "alquiler" ? rentPrice(property) : salePrice(property);
  const bedrooms = number(property.bedrooms);
  const area = number(property.area);
  const roi = number(property.roi);

  if ((filters.minPrice || filters.maxPrice) && price) reasons.push("Está dentro del presupuesto que definiste.");
  if ((filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) && bedrooms !== null) {
    reasons.push(bedrooms === 1 ? "Coincide con 1 dormitorio." : `Coincide con ${bedrooms} dormitorios.`);
  }
  if (priorityMatch(property, filters.priority)) reasons.push(PRIORITIES[filters.priority].reason);
  if (filters.priority === "space" && area) reasons.push(`Ofrece ${area.toLocaleString("es-AR")} m² publicados.`);
  if (filters.objective === "invertir" && roi) reasons.push(`Informa un ROI estimado de ${roi.toLocaleString("es-AR")}% en la ficha.`);
  if (filters.types?.length && reasons.length < 2 && property.type) reasons.push(`Coincide con el tipo ${property.type}.`);
  if (area && reasons.length < 2) reasons.push(`Tiene ${area.toLocaleString("es-AR")} m² publicados.`);
  if (property.location && reasons.length < 2) reasons.push(`Está ubicada en ${property.location}.`);

  return reasons.slice(0, 3);
}

export function recommendProperties(filters = {}, properties = [], limit = 3) {
  return eligibleProperties(filters, properties)
    .map((property, index) => ({ property, index, score: scoreProperty(property, filters) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ property }) => ({ ...property, luciaReasons: reasonsFor(property, filters) }));
}

export function decorateRecommendations(properties = [], filters = {}, limit = 3) {
  return properties
    .map((property, index) => ({ property, index, score: scoreProperty(property, filters) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ property }) => ({ ...property, luciaReasons: reasonsFor(property, filters) }));
}

export function comparisonRows(properties = []) {
  return properties.slice(0, 3).map((property) => ({
    id: property.id,
    title: property.title,
    price: isSale(property) ? salePrice(property) : rentPrice(property),
    currency: isSale(property) ? "USD" : "ARS",
    area: number(property.area),
    bedrooms: number(property.bedrooms),
    bathrooms: number(property.bathrooms),
    roi: number(property.roi),
  }));
}
