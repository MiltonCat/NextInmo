#!/usr/bin/env node
/**
 * verificar-diagramas.mjs
 *
 * Avisa si algun diagrama de docs/ quedo viejo respecto del codigo que describe.
 *
 * Para cada diagrama compara la fecha del ultimo commit de su .json contra la fecha
 * del ultimo commit de cada archivo del que depende. Si alguna dependencia es mas
 * nueva, el diagrama quedo atras. Tambien avisa si hay dependencias con cambios sin
 * commitear, porque en ese caso la comparacion todavia no vale.
 *
 *   node scripts/verificar-diagramas.mjs
 *   node scripts/verificar-diagramas.mjs --detalle    muestra cada dependencia
 *
 * Sale con codigo 1 si hay al menos un diagrama viejo, 0 si estan todos al dia.
 * Solo lee: usa --no-optional-locks para no dejar locks de git.
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const detalle = process.argv.includes('--detalle');

/**
 * Que mira cada diagrama. Si agregas un diagrama nuevo a docs/, sumalo aca:
 * sin entrada en esta lista, nadie se entera de que envejecio.
 */
const DIAGRAMAS = [
  {
    fuente: 'docs/tasador-flujo.json',
    salida: 'docs/tasador-flujo.html',
    descripcion: 'Como funciona el tasador',
    depende: [
      'app/api/tasar/route.js',
      'app/tasacion/page.js',
      'components/TasacionForm.jsx',
      'components/TasacionProfesionalClient.jsx',
      'components/TasadorResultado.jsx',
      'components/TasadorWizard.jsx',
      'lib/tasador.js',
      'lib/tasadorAuth.js',
      'lib/tasadorOpciones.js',
    ],
  },
  {
    fuente: 'docs/web-arquitectura.json',
    salida: 'docs/web-arquitectura.html',
    descripcion: 'Como esta armada la web',
    depende: [
      'app/api',
      'app/admin',
      'lib',
      'package.json',
    ],
  },
];

// ------------------------------------------------------------------ git

/**
 * Devuelve la salida cruda, sacando solo el salto de linea final. No se hace trim
 * completo: `git status --porcelain` usa las dos primeras columnas para el estado y
 * la primera puede ser un espacio, asi que recortar el arranque desplaza la ruta.
 */
function git(args) {
  try {
    return execFileSync('git', ['--no-optional-locks', ...args], {
      cwd: raiz,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).replace(/\r?\n$/, '');
  } catch {
    return '';
  }
}

function hayGit() {
  return git(['rev-parse', '--is-inside-work-tree']).trim() === 'true';
}

/** Fecha ISO del ultimo commit que toco esa ruta, o null si nunca se commiteo. */
function ultimoCommit(ruta) {
  const salida = git(['log', '-1', '--format=%cI', '--', ruta]).trim();
  return salida || null;
}

/** Rutas con cambios sin commitear (modificadas, nuevas, borradas o renombradas). */
function sinCommitear() {
  const salida = git(['status', '--porcelain', '--untracked-files=all']);
  if (!salida) return new Set();

  const rutas = new Set();
  for (const linea of salida.split(/\r?\n/)) {
    if (linea.length < 4) continue;
    // Formato: XY <ruta>  |  XY <vieja> -> <nueva> cuando hubo renombre
    let ruta = linea.slice(3);
    const flecha = ruta.indexOf(' -> ');
    if (flecha !== -1) ruta = ruta.slice(flecha + 4);
    ruta = ruta.trim().replace(/^"|"$/g, '');
    if (ruta) rutas.add(ruta);
  }
  return rutas;
}

function tocada(pendientes, ruta) {
  for (const p of pendientes) {
    if (p === ruta || p.startsWith(`${ruta}/`)) return true;
  }
  return false;
}

function fecha(iso) {
  return iso ? iso.slice(0, 10) : 'sin commit';
}

// ------------------------------------------------------------------ main

if (!hayGit()) {
  console.error('No parece un repo git. Corré el script desde el proyecto.');
  process.exit(2);
}

const pendientes = sinCommitear();
let viejos = 0;
let avisos = 0;

console.log('\nDiagramas de docs/ — ¿siguen al día?\n');

for (const d of DIAGRAMAS) {
  const existeFuente = existsSync(resolve(raiz, d.fuente));
  console.log(`  ${d.descripcion}`);
  console.log(`  ${d.fuente}`);

  if (!existeFuente) {
    console.log('    ! no existe; sacalo de la lista o restauralo\n');
    avisos++;
    continue;
  }

  const fechaFuente = ultimoCommit(d.fuente);

  if (!fechaFuente) {
    console.log('    ! todavía no está commiteado, no hay contra qué comparar\n');
    avisos++;
    continue;
  }

  const atrasadas = [];
  const enVuelo = [];

  for (const dep of d.depende) {
    if (!existsSync(resolve(raiz, dep))) {
      console.log(`    ! la dependencia ${dep} ya no existe`);
      avisos++;
      continue;
    }
    if (tocada(pendientes, dep)) enVuelo.push(dep);

    const fechaDep = ultimoCommit(dep);
    if (fechaDep && fechaDep > fechaFuente) atrasadas.push({ dep, fechaDep });

    if (detalle) {
      console.log(`      ${fecha(fechaDep).padEnd(12)} ${dep}`);
    }
  }

  // El HTML deberia ser al menos tan nuevo como su JSON.
  const fechaSalida = ultimoCommit(d.salida);
  if (fechaSalida && fechaSalida < fechaFuente) {
    console.log(`    ! el HTML es más viejo que el JSON; falta recompilar`);
    avisos++;
  }

  if (atrasadas.length === 0) {
    console.log(`    OK  al día (diagrama del ${fecha(fechaFuente)})`);
  } else {
    viejos++;
    console.log(`    VIEJO  el diagrama es del ${fecha(fechaFuente)} y cambió después:`);
    atrasadas
      .sort((a, b) => (a.fechaDep < b.fechaDep ? 1 : -1))
      .forEach(({ dep, fechaDep }) => {
        console.log(`           ${fecha(fechaDep)}  ${dep}`);
      });
  }

  if (enVuelo.length > 0) {
    console.log(`    ...  con cambios sin commitear: ${enVuelo.join(', ')}`);
  }

  console.log('');
}

if (viejos > 0) {
  console.log(`${viejos} diagrama(s) quedaron atrás. Regeneralos antes de mostrarlos.\n`);
  process.exit(1);
}

if (avisos > 0) {
  console.log('Sin diagramas viejos, pero hay avisos arriba.\n');
  process.exit(0);
}

console.log('Todos al día.\n');
process.exit(0);
