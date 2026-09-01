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

export function parseLuciaText(input, activeStep = "welcome") {
  const text = normalize(input);
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

  const bedrooms = text.match(/(\d+)\s*(?:dorm|habit|cuarto)/);
  if (bedrooms) {
    filters.minBedrooms = Number(bedrooms[1]);
    filters.maxBedrooms = Number(bedrooms[1]);
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

  return {
    filters,
    answered,
    searchIntent: renting || buying || Object.keys(filters).length > 0 || activeStep.startsWith("ask_"),
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

function matchesBedrooms(property, filters) {
  if (filters.minBedrooms === undefined && filters.maxBedrooms === undefined) return true;
  const bedrooms = number(property.bedrooms);
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
