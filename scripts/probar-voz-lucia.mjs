// ESCUCHAR A LUCÍA ANTES DE PROGRAMARLA.
//
// ─────────────────────────────────────────────────────────────────────────────
// PARA QUÉ SIRVE
//
// Antes de meter un botón de audio en el chat hay una pregunta que no se
// contesta leyendo documentación: ¿esta voz suena a alguien que le vendería una
// casa a un tipo de 60 años, o suena a GPS?
//
// Este script manda a Fish Audio TRES TEXTOS REALES del chat —no un "hola
// mundo", que suena bien en cualquier voz— y te deja los MP3 en una carpeta
// para que los escuches. No toca el sitio, no toca la base, no instala nada.
//
// Si ninguna voz te convence, se borra este archivo y no gastaste nada.
//
// ─────────────────────────────────────────────────────────────────────────────
// CÓMO SE USA (PowerShell)
//
//   1. Sacá una API key en fish.audio → Developer → API Keys.
//
//   2. Elegí voces en fish.audio buscando "Spanish". Cuando abrís una, la URL
//      termina en /m/algo: ese "algo" es el id que va acá.
//
//   3. En la terminal, parado en la carpeta del proyecto. Los valores de abajo
//      son de ejemplo: van tu key real y tus ids reales, sin < > ni comillas
//      alrededor de los ids (PowerShell trata < como operador y falla).
//
//        $env:FISH_AUDIO_KEY="a1b2c3d4e5f6..."
//        node scripts/probar-voz-lucia.mjs 802e3bc2b27e49e2 5f1a9c0d3b8e2417
//
//      Podés pasar todas las voces que quieras; las prueba a todas con los
//      mismos textos, que es la única forma honesta de compararlas.
//
//   4. Los MP3 quedan en audio-prueba/. Escuchalos con auriculares y con el
//      parlante del celular: la mayoría de tus visitantes está en un celular.
//
// ─────────────────────────────────────────────────────────────────────────────
// LO QUE CUESTA
//
// Por defecto usa el modelo gratuito de Fish (s2.1-pro-free), así que esta
// prueba no consume crédito pago. Si querés escuchar la calidad del modelo
// pago —que es el que iría en producción— agregá --pro:
//
//        node scripts/probar-voz-lucia.mjs <id-voz> --pro
//
// Con --pro, las tres frases juntas cuestan menos de un centavo de dólar.
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Textos REALES, copiados del árbol de botones de components/ChatBot.jsx.
//
// Están elegidos a propósito para tensionar cosas distintas: uno tiene una
// pregunta corta, otro un número de teléfono y un nombre propio (donde los
// modelos de voz se caen), y el tercero es una frase declarativa larga.
// Si una voz zafa con los tres, zafa con todo lo que dice Lucía.
const TEXTOS = [
  {
    id: "saludo",
    texto: "¿Con qué otra cosa te ayudo?",
  },
  {
    id: "abogada",
    texto:
      "Carolina Godoy, socia y abogada matriculada del equipo. Ella redacta y revisa el boleto de reserva y el contrato de compraventa, y controla la documentación. Podés llamarla al 2944-630649.",
  },
  {
    id: "alquiler",
    texto:
      "Lo que publicamos es alquiler permanente, para vivir todo el año. Si buscás algo por temporada, no es lo nuestro y prefiero decírtelo ahora.",
  },
];

const SALIDA = "audio-prueba";
const ENDPOINT = "https://api.fish.audio/v1/tts";

// El free tier de Fish. Se cambia con --pro para escuchar el modelo bueno.
const MODELO_GRATIS = "s2.1-pro-free";
const MODELO_PAGO = "s2.1-pro";

function parsearArgumentos(argv) {
  const args = argv.slice(2);
  const pro = args.includes("--pro");
  const simular = args.includes("--simular");
  const expresiva = args.includes("--expresiva");
  const voces = args.filter((a) => !a.startsWith("--"));
  return { voces, pro, simular, expresiva };
}

// Cuánto se le permite variar al modelo. Con 0.7 (el valor por omisión de
// Fish) la lectura sale prolija y plana: siempre la misma entonación, que es
// justo lo que se escucha como "mecánico". Subirlo mete variación de ritmo y
// altura, más parecida a alguien hablando.
//
// El precio de subirlo es la estabilidad: arriba de 0.9 empieza a inventar
// pausas raras y a cambiar de tono en mitad de una frase. 0.9 es el techo
// razonable para algo que va a atender público.
const TEMP_NORMAL = 0.7;
const TEMP_EXPRESIVA = 0.9;

// Un id de voz de Fish son 32 caracteres hexadecimales. Cualquier otra cosa
// —"id1", "<id-voz>", el link entero pegado— es casi seguro un marcador de
// ejemplo que se copió literal.
//
// Sin este control, el error recién aparece del otro lado ("Reference not
// found") y una vez por cada texto: nueve líneas rojas para un problema que se
// veía antes de tocar la red.
const FORMATO_ID = /^[0-9a-f]{32}$/i;

// Si pegaron el link completo en vez del id, el id está adentro: lo sacamos en
// vez de hacerlos volver a la página. Sirve para fish.audio/m/<id>/ y para
// /es/m/<id>/ con o sin barra final.
function extraerId(entrada) {
  const limpio = entrada.trim().replace(/^["']|["']$/g, "");
  if (FORMATO_ID.test(limpio)) return { id: limpio };

  const enLink = limpio.match(/\/m\/([0-9a-f]{32})/i);
  if (enLink) return { id: enLink[1], eraLink: true };

  return { error: true, entrada: limpio };
}

// Devuelve los bytes UTF-8, que es la unidad real de facturación de Fish.
// En castellano no coincide con la cantidad de letras: cada tilde y cada ñ
// pesan dos. Sobre un texto normal la diferencia ronda el 2%, pero si vamos a
// mostrar un costo, que sea el que se cobra y no una aproximación optimista.
function bytesDe(texto) {
  return Buffer.byteLength(texto, "utf8");
}

function dolares(bytes) {
  // US$15 por millón de bytes UTF-8 (tarifa de la API al 04/09/2026).
  return (bytes / 1_000_000) * 15;
}

async function sintetizar({ texto, vozId, modelo, apiKey, temperatura }) {
  let respuesta;
  try {
    respuesta = await pedir({ texto, vozId, modelo, apiKey, temperatura });
  } catch (error) {
    // fetch tira "fetch failed" tanto si no hay internet como si el DNS falla
    // o hay un proxy en el medio. El mensaje pelado no dice nada y manda a
    // revisar la key, que es donde no está el problema.
    throw new Error(
      `no se pudo llegar a api.fish.audio (${error?.cause?.code || error.message}). ` +
        "Revisá la conexión o si hay una VPN/proxy en el medio.",
    );
  }

  if (!respuesta.ok) {
    // El cuerpo del error trae el motivo real (key vencida, voz inexistente,
    // sin crédito). Sin esto solo se ve un número y se pierde media hora.
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(
      `HTTP ${respuesta.status} ${respuesta.statusText}${detalle ? ` — ${detalle.slice(0, 300)}` : ""}`,
    );
  }

  return Buffer.from(await respuesta.arrayBuffer());
}

function pedir({ texto, vozId, modelo, apiKey, temperatura }) {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // El modelo viaja como header, no en el cuerpo. Es raro, pero es así:
      // si el valor no se reconoce, Fish cae silenciosamente al modelo PAGO.
      // Por eso los nombres están en constantes y no escritos a mano acá.
      model: modelo,
    },
    body: JSON.stringify({
      text: texto,
      reference_id: vozId,
      temperature: temperatura,
      format: "mp3",
      // 64 kbps alcanza de sobra para una voz hablada y pesa la mitad que
      // 128. En un celular con datos, la mitad de peso es la mitad de espera.
      mp3_bitrate: 64,
      // "normal" es la mejor calidad. En la prueba queremos escuchar el techo
      // de la voz; la latencia se ajusta después, cuando esté en el chat.
      latency: "normal",
      prosody: { speed: 1, normalize_loudness: true },
    }),
  });
}

async function main() {
  const { voces, pro, simular, expresiva } = parsearArgumentos(process.argv);
  const apiKey = process.env.FISH_AUDIO_KEY;
  const modelo = pro ? MODELO_PAGO : MODELO_GRATIS;
  const temperatura = expresiva ? TEMP_EXPRESIVA : TEMP_NORMAL;

  if (!voces.length) {
    console.error(
      [
        "",
        "Falta decirme qué voz probar.",
        "",
        // Sin < > a propósito: PowerShell los toma como operador y corta el
        // comando antes de ejecutarlo. Un ejemplo que se pueda copiar y pegar
        // vale más que uno correcto en abstracto.
        "  node scripts/probar-voz-lucia.mjs 35199d5438854f5d9157c500479ab684",
        "",
        "El id sale de la URL de la voz en fish.audio, la parte que va después",
        "de /m/ — pegalo tal cual, sin comillas ni signos alrededor. También",
        "podés pegar el link entero de la voz, que le saco el id yo.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  // Se resuelven TODOS los ids antes de mandar nada. Si uno está mal, no tiene
  // sentido gastar la primera llamada ni dejar medio trabajo hecho.
  const resueltos = voces.map(extraerId);
  const invalidos = resueltos.filter((r) => r.error);

  if (invalidos.length) {
    console.error(
      [
        "",
        `Esto no parece un id de voz: ${invalidos.map((r) => r.entrada).join(", ")}`,
        "",
        "Un id son 32 caracteres, números y letras de la a a la f. Por ejemplo:",
        "",
        "  35199d5438854f5d9157c500479ab684",
        "",
        "Si copiaste algo tipo id1, id2 o un texto entre signos, eso era un",
        "ejemplo: va reemplazado por el id real de la voz que elegiste en",
        "fish.audio. Abrí la voz y miralo en la barra de direcciones.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  const ids = resueltos.map((r) => r.id);
  if (resueltos.some((r) => r.eraLink)) {
    console.log("\n(Pegaste el link de la voz; le saqué el id y sigo.)");
  }

  if (!apiKey && !simular) {
    console.error(
      [
        "",
        "Falta la API key. En PowerShell:",
        "",
        '  $env:FISH_AUDIO_KEY="tu-key"',
        "",
        "Se saca en fish.audio → Developer → API Keys.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  const bytesTotales = TEXTOS.reduce((suma, t) => suma + bytesDe(t.texto), 0);

  console.log("");
  console.log(`Voces a probar : ${voces.length}`);
  console.log(`Modelo         : ${modelo}${pro ? " (pago)" : " (gratuito)"}`);
  console.log(
    `Expresividad   : ${temperatura}${expresiva ? " (--expresiva)" : " (por omisión)"}`,
  );
  console.log(
    `Texto por voz  : ${bytesTotales} bytes` +
      (pro
        ? ` — US$${dolares(bytesTotales * voces.length).toFixed(4)} en total`
        : " — sin costo"),
  );
  console.log("");

  await mkdir(SALIDA, { recursive: true });

  let fallaron = 0;

  for (const vozId of ids) {
    // Prefijo corto para que los archivos de una misma voz queden juntos al
    // ordenar por nombre, sin que el id largo tape el nombre del texto.
    const prefijo = vozId.slice(0, 8);

    for (const { id, texto } of TEXTOS) {
      // El sufijo evita que una corrida pise a la anterior: así se puede
      // escuchar la misma voz en gratis/pago o normal/expresiva una al lado de
      // la otra, que es la única forma de saber si el cambio hizo algo.
      const variante = `${pro ? "pro" : "free"}${expresiva ? "-exp" : ""}`;
      const archivo = path.join(SALIDA, `${prefijo}-${id}-${variante}.mp3`);
      const arranque = Date.now();

      try {
        const audio = simular
          ? Buffer.from("mp3-simulado")
          : await sintetizar({ texto, vozId, modelo, apiKey, temperatura });

        await writeFile(archivo, audio);

        const segundos = ((Date.now() - arranque) / 1000).toFixed(1);
        const kb = (audio.length / 1024).toFixed(0);
        console.log(`  ok  ${archivo}  (${kb} KB, ${segundos}s)`);
      } catch (error) {
        fallaron++;
        console.log(`  ERROR  ${vozId} / ${id}: ${error.message}`);
      }
    }
  }

  console.log("");
  if (fallaron) {
    console.log(
      `Terminó con ${fallaron} error(es). Si dice 401, la key está mal; si dice 404, el id de la voz.`,
    );
    process.exit(1);
  }

  console.log(`Listo. Los MP3 están en ${SALIDA}/`);
  console.log("Escuchalos con auriculares y también por el parlante del celular.");
  console.log("");
}

main().catch((error) => {
  console.error(`\nSe cortó: ${error.message}\n`);
  process.exit(1);
});
