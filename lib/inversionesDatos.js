// Datos compartidos por la p?gina de inversiones y Luc?a.
// Son supuestos del simulador, no retornos garantizados ni costos de una operaci?n concreta.
import mercadoJson, { EVOLUCION_SERIE } from "@/lib/mercado";

export const EVOLUCION_HISTORICA = EVOLUCION_SERIE.map((p) => ({
  anio: p.anio,
  precio: p.usd_m2,
  variacion: p.variacion_pct,
  contexto: p.descripcion,
  fuente: "Relevamiento propio",
}));

// Rendimientos por segmento. Los porcentajes salen del modelo; el precio de
// referencia y el alquiler estimado se mantienen acá porque el export todavía
// no los trae. Los segmentos coinciden uno a uno con la tabla del JSON.
export const PRECIOS_SEGMENTO = {
  "Depto 1 dorm": { precioVenta: 95000, alquiler: 650 },
  "Depto 2 dorm": { precioVenta: 185000, alquiler: 950 },
  "Casa 2 dorm": { precioVenta: 210000, alquiler: 1400 },
  "Casa 3 dorm": { precioVenta: 330000, alquiler: 1800 },
  "Casa 4 dorm": { precioVenta: 490000, alquiler: 2500 },
};

export const RENTALS = (mercadoJson.rentabilidad_alquiler?.tabla ?? [])
  .filter((r) => PRECIOS_SEGMENTO[r.segmento])
  .map((r) => ({
    tipo: `${r.segmento} (${r.superficie_m2}m²)`,
    rentabilidad: r.rentabilidad_anual_pct,
    ...PRECIOS_SEGMENTO[r.segmento],
  }));

// --- Supuestos del simulador (se muestran también al usuario, al pie de la calculadora) ---
//
// Vivían más abajo, pegados al motor del simulador. Subieron acá porque desde
// el 11-ago la matriz de riesgo/retorno también los usa: son los supuestos de
// la página, no los de un componente.
export const COSTOS_ENTRADA = 0.06;       // escritura, honorarios, comisión e impuestos de adquisición
export const COSTOS_SALIDA = 0.04;        // comisión, impuestos y gastos al vender
export const GASTOS_ALQUILER = 0.30;      // vacancia, mantenimiento, impuestos y administración
export const GASTOS_TURISTICO = 0.45;     // suma equipamiento, plataformas, limpieza y mayor vacancia
export const EQUIPAMIENTO_TURISTICO = 0.05;
export const RENTA_BRUTA_TURISTICO = 10;  // referencia conservadora; antes era 12 % fijo
export const REFORMA_REVENTA = 0.08;      // capital reservado para poner en valor
export const MARGEN_REVENTA = 0.15;       // mejora sobre el precio, una sola vez al vender

// Valorización anual del m²: crecimiento compuesto de los últimos dos puntos de
// la serie (2.450 → 2.650 = 4,0%). El simulador la calculaba adentro de su
// useMemo; ahora se calcula una sola vez y la usan los dos, que era la
// condición para que la matriz no pueda volver a decir otra cosa.
export const VALORIZACION_ANUAL =
  (Math.pow(
    EVOLUCION_HISTORICA[EVOLUCION_HISTORICA.length - 1].precio /
      EVOLUCION_HISTORICA[EVOLUCION_HISTORICA.length - 3].precio,
    1 / 2
  ) - 1) * 100;

// La evolución reciente fue cercana al 4 %, pero proyectarla completa hacia
// adelante convertía un dato histórico en promesa. El simulador usa 2 % como
// escenario base; el 4 % queda publicado solo como antecedente de mercado.
export const VALORIZACION_PROYECTADA = 2;

export const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// Tarifa de referencia para una unidad céntrica cercana a USD 135.000. Se
// escala suavemente con el valor de la propiedad; duplicar el precio no duplica
// la tarifa porque ubicación, capacidad y calidad no crecen en línea recta.
export const ADR_TURISTICO_BASE = [70, 70, 55, 50, 45, 55, 75, 75, 65, 55, 55, 65];
export const PROPIEDAD_TURISTICA_REFERENCIA = 135440;

export const OCUPACION_TURISTICA = {
  invierno_debil: [0.65, 0.65, 0.35, 0.25, 0.20, 0.25, 0.48, 0.38, 0.25, 0.25, 0.35, 0.55],
  conservador:    [0.70, 0.70, 0.40, 0.30, 0.25, 0.30, 0.50, 0.45, 0.30, 0.30, 0.40, 0.60],
  base:           [0.80, 0.80, 0.50, 0.40, 0.35, 0.40, 0.60, 0.55, 0.45, 0.40, 0.50, 0.70],
  optimista:      [0.85, 0.85, 0.60, 0.50, 0.45, 0.50, 0.75, 0.70, 0.60, 0.55, 0.65, 0.80],
};

// Escenarios explícitos del DCF. No son pronósticos: son juegos coherentes de
// supuestos para medir cuánto depende el resultado de cada variable.
export const ESCENARIOS = {
  invierno_debil: {
    label: "Invierno débil 2025–26",
    valorizacion: 0,
    crecimientoRenta: 0,
    vacancia: { alquiler: 0.12, turistico: 0.60 },
    gastosIngreso: { alquiler: 0.18, turistico: 0.30 },
    reservaCapex: { alquiler: 0.06, turistico: 0.08 },
    margenReventa: 0.08,
    tasaExigida: 0.11,
    factorTarifa: 0.90,
    impactoCostoViaje: -0.15,
  },
  conservador: {
    label: "Conservador",
    valorizacion: 0,
    crecimientoRenta: 0,
    vacancia: { alquiler: 0.12, turistico: 0.45 },
    gastosIngreso: { alquiler: 0.18, turistico: 0.30 },
    reservaCapex: { alquiler: 0.06, turistico: 0.08 },
    margenReventa: 0.08,
    tasaExigida: 0.10,
    factorTarifa: 0.95,
    impactoCostoViaje: -0.10,
  },
  base: {
    label: "Base",
    valorizacion: VALORIZACION_PROYECTADA,
    crecimientoRenta: 0.01,
    vacancia: { alquiler: 0.08, turistico: 0.35 },
    gastosIngreso: { alquiler: 0.15, turistico: 0.25 },
    reservaCapex: { alquiler: 0.05, turistico: 0.07 },
    margenReventa: MARGEN_REVENTA,
    tasaExigida: 0.08,
    factorTarifa: 1,
    impactoCostoViaje: 0,
  },
  optimista: {
    label: "Optimista",
    valorizacion: VALORIZACION_ANUAL,
    crecimientoRenta: 0.02,
    vacancia: { alquiler: 0.05, turistico: 0.25 },
    gastosIngreso: { alquiler: 0.12, turistico: 0.20 },
    reservaCapex: { alquiler: 0.04, turistico: 0.05 },
    margenReventa: 0.22,
    tasaExigida: 0.07,
    factorTarifa: 1.08,
    impactoCostoViaje: 0.05,
  },
};
