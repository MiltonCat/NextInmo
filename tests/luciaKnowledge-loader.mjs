import { readFile } from "node:fs/promises";
import { resolve as resolveNext } from "../scripts/resolve-next-hooks.mjs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") return { url: "data:text/javascript,export {};", shortCircuit: true };
  return resolveNext(specifier, context, nextResolve);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) return { format: "module", source: `export default ${await readFile(new URL(url), "utf8")}`, shortCircuit: true };
  return nextLoad(url, context);
}
