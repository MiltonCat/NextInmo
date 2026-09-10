import Image from "next/image";
import Link from "next/link";
import HeroMercado from "./HeroMercado";
import { MERCADO_GENERADO } from "@/lib/mercado";
import { barriosConMediana } from "@/lib/precioZonas";

// La portada promete "Invertí con datos, no con intuición" y lo que mostraba
// abajo eran tres frases sueltas (+10 años, +18% ROI, SMA). Ahora muestra por qué
// la intuición no alcanza: en San Martín el m² del barrio más barato al más caro
// se multiplica por 2,3, y eso no lo adivina nadie.
//
// Queda afuera la serie de evolución del m², que está marcada `referencia_curada`
// en el JSON del modelo —se carga a mano, no sale del relevamiento— y publicarla
// como dato propio es el error que ya se corrigió en /precio-m2 y en /inversiones.

// barriosConMediana() ya descarta los que el modelo no puede medir y los cajones
// que no son un lugar ("General" es donde caen las publicaciones sin barrio
// declarado), y devuelve el nombre canónico del sitio: "Las Pendientes" y no
// "Las Pendientes Ski Village".
//
// El mínimo de 8 es más exigente que el del resto del sitio (referenciaBarrio()
// publica desde 4). Un titular de portada no puede apoyarse en un barrio con
// cuatro propiedades relevadas: con 4 el extremo barato sería Chacra 28 y la
// brecha daría 183% en vez de 126%, que es justo la clase de número que después
// no se puede defender.
const MINIMO_RELEVADAS = 8;

const BARRIOS = barriosConMediana()
  .filter((barrio) => barrio.n >= MINIMO_RELEVADAS)
  .sort((a, b) => a.medianaM2 - b.medianaM2);

const MAS_BARATO = BARRIOS[0] ?? null;
const MAS_CARO = BARRIOS[BARRIOS.length - 1] ?? null;

// Si un re-scrape dejara menos de dos barrios medidos, el bloque no se dibuja y
// la portada sigue funcionando con el titular y los botones.
const HAY_BRECHA = Boolean(MAS_BARATO && MAS_CARO && MAS_CARO.medianaM2 > MAS_BARATO.medianaM2);

const FACTOR = HAY_BRECHA ? MAS_CARO.medianaM2 / MAS_BARATO.medianaM2 : null;

const PUNTOS = HAY_BRECHA
  ? BARRIOS.map((barrio) => ({
      id: barrio.slug ?? barrio.nombre,
      posicion:
        ((barrio.medianaM2 - MAS_BARATO.medianaM2) /
          (MAS_CARO.medianaM2 - MAS_BARATO.medianaM2)) *
        100,
    }))
  : [];

const precio = (barrio) => `USD ${barrio.medianaM2.toLocaleString("es-AR")}`;

const EXTREMOS = HAY_BRECHA
  ? {
      barato: { nombre: MAS_BARATO.nombre, precio: precio(MAS_BARATO) },
      caro: { nombre: MAS_CARO.nombre, precio: precio(MAS_CARO) },
    }
  : null;

const FECHA_DATOS = new Date(`${MERCADO_GENERADO}T12:00:00Z`).toLocaleDateString("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const PIE = `${BARRIOS.length} barrios con precio medido · relevamiento propio, al ${FECHA_DATOS}.`;

const FACTOR_TEXTO = HAY_BRECHA
  ? FACTOR.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  : "";

export default function Hero() {
  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-slate-950 sm:min-h-[680px] lg:min-h-[760px]">
      <Image
        src="/portada.webp"
        alt="Paisaje de San Martín de los Andes"
        fill
        priority
        sizes="100vw"
        className="hero-kenburns object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,18,0.88)_0%,rgba(5,12,18,0.68)_42%,rgba(5,12,18,0.18)_72%,rgba(5,12,18,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,12,18,0.72)_0%,transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-10 pt-28 sm:min-h-[680px] sm:px-6 sm:pb-14 lg:min-h-[760px] lg:items-center lg:px-8 lg:pb-20 lg:pt-32">
        <div className="w-full max-w-3xl">
          <p className="hero-fade-in mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
            <span className="h-px w-9 bg-rose-500" aria-hidden="true" />
            Inmobiliaria en San Martín de los Andes
          </p>

          <h1 className="hero-fade-in hero-delay-1 max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Invertí con datos, no con intuición
          </h1>

          <p className="hero-fade-in hero-delay-2 mt-6 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            Te ayudamos a comprar, vender e invertir con conocimiento del lugar y datos reales del mercado.
          </p>

          <div className="hero-fade-in hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/propiedades"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-rose-600 px-6 text-sm font-bold text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explorar propiedades
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/vender"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Quiero vender o tasar
            </Link>
          </div>

          {HAY_BRECHA && (
            <HeroMercado
              factor={FACTOR}
              factorTexto={FACTOR_TEXTO}
              extremos={EXTREMOS}
              puntos={PUNTOS}
              pie={PIE}
            />
          )}
        </div>
      </div>
    </section>
  );
}
