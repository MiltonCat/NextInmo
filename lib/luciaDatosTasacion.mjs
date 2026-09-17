import { LIMITES, TIPOS_TASADOR } from "./tasadorOpciones.js";

export const CAMPOS_TASACION = {
  superficie: { label: "Superficie cubierta (m²)", ...LIMITES.superficie },
  superficieTerreno: { label: "Superficie del terreno (m²)", ...LIMITES.terreno },
  dormitorios: { label: "Dormitorios", ...LIMITES.dormitorios },
  banos: { label: "Baños", ...LIMITES.banos },
  ambientes: { label: "Ambientes", ...LIMITES.ambientes },
  cocheras: { label: "Cocheras", ...LIMITES.cocheras },
};

export function validarDatosTasacion(entrada, barrios) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada)) return {};
  const datos = {};
  if (TIPOS_TASADOR.some((t) => t.valor === entrada.tipo)) datos.tipo = entrada.tipo;
  if (barrios.includes(entrada.barrio)) datos.barrio = entrada.barrio;
  for (const [campo, { min, max }] of Object.entries(CAMPOS_TASACION)) {
    const n = entrada[campo];
    if (typeof n === "number" && Number.isFinite(n) && n >= min && n <= max
      && (campo.startsWith("superficie") || Number.isInteger(n))) datos[campo] = n;
  }
  if (datos.tipo === "Departamento") delete datos.superficieTerreno;
  return datos;
}

export function pasoYaConfirmado(id, datos) {
  if (id === "superficie") return datos.superficie != null
    && (datos.tipo === "Departamento" || datos.superficieTerreno != null);
  if (id === "tipo" || id === "barrio") return datos[id] != null && datos[id] !== "";
  if (id === "ambientes") return ["dormitorios", "banos", "ambientes", "cocheras"].every((k) => datos[k] != null);
  return false;
}
