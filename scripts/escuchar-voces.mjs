// ARMA UNA PÁGINA PARA COMPARAR LAS VOCES DE UNA SOLA VEZ.
//
// Escuchar veinte MP3 a doble clic no sirve para elegir: cuando llegás al
// quinto ya no te acordás cómo sonaba el segundo. Esto lee lo que haya en
// audio-prueba/ y arma un index.html con todos los audios agrupados POR FRASE,
// no por voz — así escuchás la misma oración en las seis voces seguidas, que
// es la única comparación que decide algo.
//
// USO:
//
//   node scripts/escuchar-voces.mjs
//
// Después abrí audio-prueba/index.html con doble clic. No necesita servidor ni
// internet: el navegador lee los MP3 de la misma carpeta.

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SALIDA = "audio-prueba";

// Los nombres de las voces que fuimos probando, por el prefijo que el otro
// script le pone a cada archivo. Si aparece un prefijo que no está acá, se
// muestra el prefijo pelado: sirve igual, solo que sin nombre lindo.
const VOCES = {
  "35199d54": "Narrador v2 (masculina, prueba)",
  c964e326: "Locutora argentina · Santiago Samudio",
  "600b7bf7": "Locutora · Luciana Giselle Arce",
  // id completo: adde5b3c2b5e47f5b5601fe35856d3ba  ← LA ELEGIDA (04/09/2026)
  adde5b3c: "Locutora · Camila vm",
  fc67d827: "locutora · Michel Romero",
  b347db03: "Selene · oficial de Fish",
  e3cd3841: "Laura · oficial de Fish",
  "9a9cf477": "Hannah · oficial de Fish",
  "93356312": "Sarah · oficial de Fish",
  "26ff45fa": "Idea Vilariño · Camila Torres",
};

const FRASES = {
  saludo: {
    titulo: "El saludo corto",
    texto: "¿Con qué otra cosa te ayudo?",
    nota: "Es el que más se repite en el chat. Si molesta a la tercera vez, la voz no sirve.",
  },
  abogada: {
    titulo: "La respuesta difícil",
    texto:
      "Carolina Godoy, socia y abogada matriculada del equipo. Ella redacta y revisa el boleto de reserva y el contrato de compraventa, y controla la documentación. Podés llamarla al 2944-630649.",
    nota: "Nombre propio y teléfono: acá es donde estas voces se caen.",
  },
  alquiler: {
    titulo: "La frase declarativa",
    texto:
      "Lo que publicamos es alquiler permanente, para vivir todo el año. Si buscás algo por temporada, no es lo nuestro y prefiero decírtelo ahora.",
    nota: "Tiene que sonar a alguien poniendo un límite con amabilidad, no a un contestador.",
  },
};

const VARIANTES = {
  free: "modelo gratuito",
  "free-exp": "gratuito + expresiva",
  pro: "modelo pago",
  "pro-exp": "pago + expresiva",
};

// Nombre de archivo: <prefijo>-<frase>-<variante>.mp3
// La variante puede tener guion adentro ("pro-exp"), así que se parte por los
// dos primeros guiones y el resto es la variante.
function analizar(nombre) {
  const m = nombre.match(/^([0-9a-f]{8})-([a-z]+)-(.+)\.mp3$/i);
  if (!m) {
    // Archivos de la primera corrida, antes de que existieran las variantes.
    const viejo = nombre.match(/^([0-9a-f]{8})-([a-z]+)\.mp3$/i);
    if (!viejo) return null;
    return { prefijo: viejo[1], frase: viejo[2], variante: "free" };
  }
  return { prefijo: m[1], frase: m[2], variante: m[3] };
}

function escapar(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  let archivos;
  try {
    archivos = (await readdir(SALIDA)).filter((f) => f.endsWith(".mp3"));
  } catch {
    console.error(
      `\nNo encuentro la carpeta ${SALIDA}/. Corré primero probar-voz-lucia.mjs.\n`,
    );
    process.exit(1);
  }

  if (!archivos.length) {
    console.error(`\nNo hay MP3 en ${SALIDA}/.\n`);
    process.exit(1);
  }

  const pistas = archivos.map((f) => ({ archivo: f, ...analizar(f) })).filter((p) => p.frase);

  const secciones = Object.entries(FRASES)
    .map(([clave, frase]) => {
      const suyas = pistas
        .filter((p) => p.frase === clave)
        .sort((a, b) => a.prefijo.localeCompare(b.prefijo) || a.variante.localeCompare(b.variante));

      if (!suyas.length) return "";

      const filas = suyas
        .map(
          (p) => `
        <div class="pista">
          <div class="meta">
            <span class="voz">${escapar(VOCES[p.prefijo] || p.prefijo)}</span>
            <span class="variante">${escapar(VARIANTES[p.variante] || p.variante)}</span>
          </div>
          <audio controls preload="none" src="${escapar(p.archivo)}"></audio>
        </div>`,
        )
        .join("");

      return `
      <section>
        <h2>${escapar(frase.titulo)}</h2>
        <blockquote>${escapar(frase.texto)}</blockquote>
        <p class="nota">${escapar(frase.nota)}</p>
        ${filas}
      </section>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comparar voces para Lucía</title>
<style>
  body { font: 16px/1.6 system-ui, -apple-system, Segoe UI, sans-serif; max-width: 760px; margin: 0 auto; padding: 32px 20px 80px; color: #1a1a1a; background: #fafafa; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  .intro { color: #666; margin-bottom: 36px; }
  section { background: #fff; border: 1px solid #e5e5e5; border-radius: 14px; padding: 22px; margin-bottom: 26px; }
  h2 { font-size: 18px; margin: 0 0 12px; }
  blockquote { margin: 0 0 8px; padding: 12px 16px; background: #f5f5f5; border-left: 3px solid #d4d4d4; border-radius: 0 8px 8px 0; font-size: 15px; color: #333; }
  .nota { color: #777; font-size: 14px; margin: 0 0 18px; }
  .pista { padding: 12px 0; border-top: 1px solid #f0f0f0; }
  .meta { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
  .voz { font-weight: 600; font-size: 15px; }
  .variante { font-size: 13px; color: #888; }
  audio { width: 100%; height: 34px; }
</style>
</head>
<body>
  <h1>Comparar voces para Lucía</h1>
  <p class="intro">La misma frase en todas las voces, una abajo de la otra. Escuchá de arriba hacia abajo dentro de cada bloque.</p>
  ${secciones}
</body>
</html>`;

  const destino = path.join(SALIDA, "index.html");
  await writeFile(destino, html, "utf8");

  console.log(`\nListo: ${destino}`);
  console.log(`${pistas.length} audios de ${new Set(pistas.map((p) => p.prefijo)).size} voces.`);
  console.log("Abrilo con:  start audio-prueba\\index.html\n");
}

main().catch((e) => {
  console.error(`\nSe cortó: ${e.message}\n`);
  process.exit(1);
});
