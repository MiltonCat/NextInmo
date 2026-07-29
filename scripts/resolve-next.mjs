// Hook de resolución para correr módulos del proyecto con Node puro.
// Next resuelve dos cosas que Node no: el alias "@/..." y los imports sin
// extensión ("./seoRadar"). Este hook replica ambas reglas.
//
// Uso:  node --import ./scripts/resolve-next.mjs scripts/mi-script.mjs

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./resolve-next-hooks.mjs", pathToFileURL(import.meta.filename));
