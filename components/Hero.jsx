import Image from "next/image";
import Link from "next/link";

const proofPoints = [
  { value: "+10 años", label: "en el mercado local" },
  { value: "+18% ROI", label: "gestionado" },
  { value: "SMA", label: "asesoría en el lugar" },
];

export default function Hero() {
  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-slate-950 sm:min-h-[680px] lg:min-h-[760px]">
      <Image
        src="/portada.webp"
        alt="Paisaje de San Martín de los Andes"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,12,18,0.88)_0%,rgba(5,12,18,0.68)_42%,rgba(5,12,18,0.18)_72%,rgba(5,12,18,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,12,18,0.72)_0%,transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-10 pt-28 sm:min-h-[680px] sm:px-6 sm:pb-14 lg:min-h-[760px] lg:items-center lg:px-8 lg:pb-20 lg:pt-32">
        <div className="w-full max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
            <span className="h-px w-9 bg-rose-500" aria-hidden="true" />
            Inmobiliaria en San Martín de los Andes
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Invertí con datos, no con intuición
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
            Te ayudamos a comprar, vender e invertir con conocimiento del lugar y datos reales del mercado.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <dl className="mt-10 grid max-w-2xl grid-cols-3 border-t border-white/20 pt-5 sm:mt-12 sm:pt-6">
            {proofPoints.map((item, index) => (
              <div
                key={item.label}
                className={`min-w-0 ${index > 0 ? "border-l border-white/20 pl-4 sm:pl-7" : "pr-4 sm:pr-7"}`}
              >
                <dt className="text-base font-black text-white sm:text-xl">{item.value}</dt>
                <dd className="mt-1 text-[10px] leading-tight text-white/60 sm:text-xs">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
