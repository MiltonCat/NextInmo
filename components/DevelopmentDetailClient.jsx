"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Lightbox from "@/components/Lightbox";
import { SinFoto } from "@/components/DevelopmentCard";
import { estadoDe, unidadLabel } from "@/data/developments";
import { WA_NUMBER } from "@/config";
import { registrarConsulta } from "@/lib/registrarConsulta";
import { useAnalytics } from "@/hooks/useAnalytics";

// Ficha de un desarrollo.
//
// La diferencia con la ficha de una propiedad es qué pregunta responde. En una
// casa la pregunta es "¿me gusta y me alcanza?". En un desarrollo son tres, y
// en este orden: "¿esto se va a construir?", "¿qué unidad me sirve?" y "¿cómo
// lo pago?". El orden de las secciones sigue ese orden, y por eso el avance de
// obra va arriba de las tipologías y no en una solapa perdida al final.

// Leaflet toca `window` al importarse, así que el mapa entra sin renderizado en
// servidor. Además así no viaja en el bundle inicial: es una sección que la
// mayoría de las visitas no llega a ver.
const DevelopmentMap = dynamic(() => import("@/components/DevelopmentMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
      Cargando mapa…
    </div>
  ),
});

const ESTADO_STYLES = {
  amber:   { dot: "bg-amber-500",   barra: "bg-amber-500",   suave: "bg-amber-50 text-amber-800 border-amber-200" },
  blue:    { dot: "bg-blue-500",    barra: "bg-blue-500",    suave: "bg-blue-50 text-blue-800 border-blue-200" },
  emerald: { dot: "bg-emerald-500", barra: "bg-emerald-500", suave: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  gray:    { dot: "bg-gray-400",    barra: "bg-gray-400",    suave: "bg-gray-50 text-gray-700 border-gray-200" },
};

export default function DevelopmentDetailClient({ development, otros = [] }) {
  const [lightbox, setLightbox] = useState({ abierto: false, indice: 0 });
  const [formAbierto, setFormAbierto] = useState(false);
  const [tipologiaElegida, setTipologiaElegida] = useState(null);

  // El estado se lee según lo que vende el proyecto: un loteo dice "En
  // desarrollo" donde un edificio dice "En construcción".
  const estado = estadoDe(development);
  const styles = ESTADO_STYLES[estado.color] ?? ESTADO_STYLES.gray;

  const imagenes = useMemo(
    () => [development.image, ...(development.gallery ?? [])].filter(Boolean),
    [development]
  );

  // null = el desarrollador todavía no nos pasó cuántas unidades quedan.
  // 0 = agotado. Mezclarlos le pone el cartel de "Agotado" a un proyecto que
  // recién se publica y nadie vuelve a entrar.
  const disponibles = development.unidadesDisponibles;
  const seSabeStock = typeof disponibles === "number";
  const agotado = disponibles === 0;
  const vendidas = seSabeStock ? (development.unidadesTotales ?? 0) - disponibles : null;

  // La sección de obra necesita al menos una de las dos cosas para existir.
  const hayAvance = typeof development.avance === "number";
  const hayEtapas = (development.etapas ?? []).length > 0;

  // El video hace de portada solo mientras no haya fotos propias. Cuando
  // lleguen, la portada vuelve a ser el mosaico y el video baja a su sección.
  const videoEsPortada = imagenes.length === 0 && Boolean(development.video?.youtubeId);

  // Categorías con precio propio. Cuando existen, el panel muestra la tabla en
  // vez de un único "desde". Se listan cuatro como mucho: el panel es una
  // columna de 320px pegada al scroll, no la ficha entera.
  const categorias = (development.tipologias ?? []).filter((t) => t.precioDesde > 0);
  const hayCategorias = categorias.length > 1;
  const categoriasPanel = categorias.slice(0, 4);
  const categoriasOcultas = categorias.length - categoriasPanel.length;

  // Qué categoría está elegida. Vive acá arriba y no adentro de la tabla de
  // pagos porque ahora la comparten dos secciones: al elegir un lote en "Elegí
  // tu lote", el plan de pago de más abajo se filtra a esa categoría sola. Es
  // el único estado de la ficha que dos partes distintas leen a la vez.
  const [categoriaElegida, setCategoriaElegida] = useState(0);

  // Las filas de la ficha técnica que hablan de distancia, para repetirlas
  // debajo del mapa. Se filtran por el texto de la etiqueta y no por una lista
  // fija, así un desarrollo que mañana agregue "Distancia al aeropuerto" la
  // muestra sin tocar el código.
  const distancias = (development.fichaTecnica ?? []).filter((f) =>
    /distancia|minutos|km/i.test(f.label)
  );

  // Las cifras que van al lado del video. A diferencia de la fila de abajo,
  // acá NO entran los "Consultar" ni los "A confirmar": esto es la portada, y
  // un dato que dice que no sabemos el dato ocupa el lugar de uno que sí
  // vende. Se muestran las cuatro primeras que existan de verdad.
  const cifrasClave = useMemo(() => {
    const out = [];
    if (development.unidadesTotales > 0) {
      out.push({
        label: capitalizar(unidadLabel(development)),
        valor: development.unidadesTotales,
      });
    }
    if (seSabeStock && disponibles > 0) {
      out.push({
        label: "Disponibles",
        valor: disponibles,
        destacado: disponibles <= 3,
      });
    }
    if (development.precioDesde > 0) {
      out.push({
        label: "Desde",
        valor: `USD ${development.precioDesde.toLocaleString("es-AR")}`,
      });
    }
    if (development.entrega) out.push({ label: "Entrega", valor: development.entrega });
    if (hayAvance) out.push({ label: "Avance de obra", valor: `${development.avance}%` });
    return out.slice(0, 4);
  }, [development, seSabeStock, disponibles, hayAvance]);

  // Centinela para la barra pegajosa: un div de altura cero justo debajo de la
  // cabecera. Mientras se ve, la barra está oculta; cuando sale de pantalla
  // hacia arriba, aparece. Se hace con IntersectionObserver y no escuchando el
  // scroll porque el listener de scroll dispara decenas de veces por segundo y
  // acá alcanza con enterarse una vez, cuando cruza el borde.
  const centinela = useRef(null);
  const [barraVisible, setBarraVisible] = useState(false);

  useEffect(() => {
    const nodo = centinela.current;
    if (!nodo || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entrada]) => setBarraVisible(!entrada.isIntersecting),
      // El margen de arriba descuenta la barra de navegación del sitio, que es
      // fija: sin esto la barra aparecería tapada por ella.
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(nodo);
    return () => obs.disconnect();
  }, []);

  const abrirConsulta = (tipologia = null) => {
    setTipologiaElegida(tipologia);
    setFormAbierto(true);
  };

  // El índice de la barra lista solo las secciones que de verdad se dibujaron.
  // Un ancla que apunta a una sección que no existe deja al visitante quieto
  // en el mismo lugar y parece que el sitio está roto.
  const seccionesIndice = [
    categorias.length > 0 && { id: "precios", label: capitalizar(unidadLabel(development)) },
    { id: "proyecto", label: "El proyecto" },
    development.amenities?.length > 0 && { id: "incluye", label: "Qué incluye" },
    development.financiacion && { id: "plan-de-pago", label: "Plan de pago" },
    development.lat && development.lng && { id: "ubicacion", label: "Ubicación" },
    development.desarrolladorInfo && { id: "desarrollador", label: "Desarrollador" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <BarraPegajosa
        visible={barraVisible}
        secciones={seccionesIndice}
        development={development}
        onConsultar={() => abrirConsulta(null)}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 md:pt-24">
        {/* Migas de pan -----------------------------------------------------*/}
        <nav aria-label="Migas de pan" className="mb-5 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Inicio</Link>
          <span className="mx-1.5 text-gray-300">/</span>
          <Link href="/desarrollos" className="hover:text-gray-900">Desarrollos</Link>
          <span className="mx-1.5 text-gray-300">/</span>
          <span className="text-gray-900">{development.name}</span>
        </nav>

        {/* Cabecera ---------------------------------------------------------
            Dos cabeceras distintas, según haya fotos propias o no.

            Con video y sin fotos, el título y el video dejan de ser dos bloques
            sueltos —uno arriba y otro abajo, cada uno peleando por su espacio—
            y pasan a ser una sola pieza: una banda a todo el ancho de la
            columna, con el nombre del proyecto encima de la imagen. Ocupa todo
            el ancho disponible pero en formato panorámico (21:9), así que mide
            unos 1216 × 521 en vez de los 684 de alto que medía en 16:9. Y el
            video ya no se reproduce ahí adentro: se abre a pantalla completa,
            que es donde un video de tres minutos se mira de verdad. */}
        {videoEsPortada ? (
          <>
            <PortadaHero
              development={development}
              estado={estado}
              styles={styles}
              agotado={agotado}
            />
            {cifrasClave.length > 0 && (
              <dl className="mt-7 grid grid-cols-2 gap-y-6 border-y border-gray-200 py-6 sm:grid-cols-4">
                {cifrasClave.map((c) => (
                  <Cifra key={c.label} label={c.label} valor={c.valor} destacado={c.destacado} />
                ))}
              </dl>
            )}
          </>
        ) : (
          <>
            <header className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles.suave}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                  {estado.label}
                </span>
                {development.fideicomiso && (
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Fideicomiso al costo
                  </span>
                )}
                {agotado && (
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                    Agotado
                  </span>
                )}
              </div>

              <h1 className="font-jakarta text-3xl font-black leading-tight text-gray-900 md:text-5xl md:leading-[1.1]">
                {development.name}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-gray-500 md:text-lg">
                {development.tagline}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {development.location} · {development.city}
                {development.desarrollador && <> · Desarrolla {development.desarrollador}</>}
              </p>
            </header>

            <Galeria
              imagenes={imagenes}
              nombre={development.name}
              onAbrir={(i) => setLightbox({ abierto: true, indice: i })}
            />
          </>
        )}

        {/* Hasta acá llega la cabecera: cuando este punto sale de pantalla,
            aparece la barra pegajosa con el índice y el botón de consulta. */}
        <div ref={centinela} aria-hidden="true" className="h-0" />

        {/* Cuando ya hay fotos propias, la portada vuelve a ser el mosaico y el
            video pasa acá abajo: la foto es la que vende el lote, el video es
            el que explica el barrio. */}
        {development.video?.youtubeId && imagenes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-jakarta text-2xl font-black text-gray-900">
              El barrio en video
            </h2>
            <VideoDelProyecto video={development.video} nombre={development.name} />
          </section>
        )}

        {/* Cuerpo: contenido + panel pegajoso -------------------------------*/}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="min-w-0">
            {/* Cifras de cabecera. Van sin recuadros de colores: cuatro datos
                separados por líneas, que es como se leen de un vistazo.
                Ocultas en celular: ahí el panel de contacto sube arriba de esta
                fila (order-first) y ya muestra entrega, precio y disponibilidad.
                Dejarlas visibles repetía los mismos cuatro números uno debajo
                del otro. */}
            <dl className={`grid-cols-2 gap-y-6 border-y border-gray-200 py-6 sm:grid-cols-4 ${
              // Con el video de portada estas mismas cuatro cifras ya están
              // arriba, al costado del video. Repetirlas cinco centímetros más
              // abajo no agrega nada.
              videoEsPortada ? "hidden" : "hidden lg:grid"
            }`}>
              <Cifra label={capitalizar(unidadLabel(development))} valor={development.unidadesTotales} />
              <Cifra
                label="Disponibles"
                valor={seSabeStock ? disponibles : "Consultar"}
                destacado={seSabeStock && disponibles > 0 && disponibles <= 3}
              />
              <Cifra label="Entrega" valor={development.entrega ?? "A confirmar"} />
              <Cifra
                label="Desde"
                valor={
                  development.precioDesde > 0
                    ? `USD ${development.precioDesde.toLocaleString("es-AR")}`
                    : "Consultar"
                }
              />
            </dl>

            {/* ¿Esto se va a construir? ----------------------------------
                Sin porcentaje ni etapas la sección no se dibuja. Una barra en
                cero sobre una obra en marcha dice algo falso, y un título
                "Avance de obra" seguido de nada resta más de lo que suma. */}
            {(hayAvance || hayEtapas) && (
            <section className="mt-10">
              <h2 className="font-jakarta text-2xl font-black text-gray-900">
                Avance de obra
              </h2>
              <p className="mt-1 text-sm text-gray-500">{estado.descripcion}</p>

              {hayAvance && (
                <div className="mt-5 flex items-center gap-4">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${styles.barra} transition-[width] duration-700`}
                      style={{ width: `${Math.min(100, Math.max(0, development.avance))}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-lg font-black text-gray-900">
                    {development.avance}%
                  </span>
                </div>
              )}

              {hayEtapas && (
                <ol className="mt-8 space-y-0">
                  {development.etapas.map((etapa, i) => {
                    const ultima = i === development.etapas.length - 1;
                    return (
                      <li key={etapa.nombre} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* La línea vertical se corta en la última etapa para
                            que el hilo no quede colgando en el vacío. */}
                        {!ultima && (
                          <span
                            aria-hidden="true"
                            className={`absolute left-[7px] top-4 h-full w-px ${etapa.completada ? "bg-gray-900" : "bg-gray-200"}`}
                          />
                        )}
                        <span
                          className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                            etapa.completada
                              ? "border-gray-900 bg-gray-900"
                              : etapa.enCurso
                                ? `border-gray-900 bg-white`
                                : "border-gray-200 bg-white"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <p className={`text-sm font-semibold ${etapa.completada || etapa.enCurso ? "text-gray-900" : "text-gray-400"}`}>
                              {etapa.nombre}
                            </p>
                            <p className="text-sm text-gray-400">{etapa.fecha}</p>
                          </div>
                          {etapa.enCurso && (
                            <p className="mt-0.5 text-xs font-semibold text-rose-600">En curso</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
            )}

            {/* Elegí tu lote ---------------------------------------------
                Antes esto era una tabla de tres filas, que es como se listan
                las tipologías de un edificio: "2 ambientes, 3 ambientes". Pero
                acá las categorías no se distinguen por tamaño ni por ambientes
                —el desarrollador es explícito: el precio lo fijan la ubicación
                y las vistas—, así que una tabla no ayuda a elegir. Tres
                tarjetas con el color con el que ese lote figura en el
                masterplan sí: el comprador ya vio esos colores en el plano.

                Y elegir acá filtra el plan de pago de más abajo. Si no, hay
                que elegir la misma categoría dos veces en la misma página. */}
            {categorias.length > 0 && (
              <section id="precios" className="mt-12 scroll-mt-32">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">
                  {categorias.length > 1
                    ? `Elegí tu ${unidadLabel(development, 1)}`
                    : `Precios por ${unidadLabel(development, 1)}`}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Precios de lista del desarrollador
                  {development.unidadesDisponiblesRelevado && (
                    <> · disponibilidad relevada el {development.unidadesDisponiblesRelevado}</>
                  )}
                  . El precio queda congelado con la reserva.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categorias.map((t, i) => (
                    <TarjetaDeCategoria
                      key={t.nombre}
                      categoria={t}
                      elegida={categorias.length > 1 && i === categoriaElegida}
                      seleccionable={categorias.length > 1}
                      onElegir={() => setCategoriaElegida(i)}
                      onConsultar={() => abrirConsulta(t.nombre)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* El proyecto ------------------------------------------------ */}
            <section id="proyecto" className="mt-12 scroll-mt-32">
              <h2 className="font-jakarta text-2xl font-black text-gray-900">El proyecto</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-gray-700">
                {String(development.descripcion ?? "")
                  .split("\n\n")
                  .filter(Boolean)
                  .map((parrafo, i) => (
                    <p key={i}>{parrafo}</p>
                  ))}
              </div>
            </section>

            {/* Qué incluye ------------------------------------------------
                Lo que TODAVÍA no existe no se esconde ni se mezcla: se muestra
                en gris y con la etiqueta "Proyectado". Es el mismo criterio con
                el que Airbnb tacha las prestaciones que un alojamiento no
                tiene, en vez de simplemente no listarlas. Un sector deportivo
                dibujado en el masterplan y listado junto al arroyo y la laguna
                se lee como que está construido. */}
            {development.amenities?.length > 0 && (
              <section id="incluye" className="mt-12 scroll-mt-32">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">
                  Qué incluye el barrio
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                  {development.amenities.map((a) => {
                    const { texto, proyectado } = leerAmenity(a);
                    return (
                      <li
                        key={a}
                        className={`flex items-start gap-3 text-[15px] ${proyectado ? "text-gray-400" : "text-gray-700"}`}
                      >
                        <IconoAmenity texto={texto} apagado={proyectado} />
                        <span>
                          {texto}
                          {proyectado && (
                            <span className="ml-2 rounded-full border border-gray-200 px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                              Proyectado
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {development.amenities.some((a) => leerAmenity(a).proyectado) && (
                  <p className="mt-5 text-xs leading-relaxed text-gray-400">
                    Lo marcado como proyectado figura en el masterplan del
                    desarrollador pero todavía no está construido.
                  </p>
                )}
              </section>
            )}

            {/* ¿Cómo lo pago? -------------------------------------------- */}
            {development.financiacion && (
              <section id="plan-de-pago" className="mt-12 scroll-mt-32">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">Plan de pago</h2>
                {/* Cada cifra aparece solo si existe. "Anticipo: null%" o
                    "Contra entrega: —" en una ficha de venta se lee como que el
                    dato es cero, no como que falta. */}
                <dl className="mt-5 grid grid-cols-2 gap-y-6 border-y border-gray-200 py-6 sm:grid-cols-4">
                  {development.financiacion.anticipo > 0 && (
                    <Cifra label="Anticipo" valor={`${development.financiacion.anticipo}%`} />
                  )}
                  {development.financiacion.cuotas > 0 && (
                    <Cifra label="Cuotas" valor={development.financiacion.cuotas} />
                  )}
                  {development.financiacion.ajuste && (
                    <Cifra label="Ajuste" valor={development.financiacion.ajuste} />
                  )}
                  {development.financiacion.contraEntrega > 0 && (
                    <Cifra label="Contra entrega" valor={`${development.financiacion.contraEntrega}%`} />
                  )}
                </dl>
                {development.financiacion.nota && (
                  <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
                    {development.financiacion.nota}
                  </p>
                )}

                <PlanesDePago
                  categorias={categorias}
                  elegida={categoriaElegida}
                  onElegir={setCategoriaElegida}
                />

                <p className="mt-3 text-xs leading-relaxed text-gray-400">
                  Los valores son de referencia y no constituyen una oferta. El precio
                  final, el índice de ajuste y los plazos quedan fijados en el boleto de
                  compraventa.
                </p>
              </section>
            )}

            {/* Renta estimada: solo tiene sentido en proyectos pensados para
                alquilar. En un edificio para vivienda permanente sería un
                número inventado, así que la sección no se dibuja. */}
            {development.rentaEstimada && (
              <section className="mt-12">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">Renta estimada</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Calculada sobre la ocupación real del complejo en la última temporada.
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-y-6 border-y border-gray-200 py-6 sm:grid-cols-4">
                  <Cifra label="Ocupación" valor={`${development.rentaEstimada.ocupacion}%`} />
                  <Cifra label="Bruto anual" valor={`USD ${development.rentaEstimada.brutoAnualUSD?.toLocaleString("es-AR")}`} />
                  <Cifra label="Neto anual" valor={`USD ${development.rentaEstimada.netoAnualUSD?.toLocaleString("es-AR")}`} />
                  <Cifra label="ROI" valor={`${development.rentaEstimada.roi}%`} />
                </dl>
              </section>
            )}

            {/* Dónde queda -----------------------------------------------
                Sin coordenadas la sección no existe. Un mapa centrado "más o
                menos" en San Martín de los Andes, sobre un loteo de 76
                hectáreas, manda gente a la ladera equivocada; es peor que no
                poner mapa. Estas coordenadas salen del pin que mandó el
                desarrollador. */}
            {development.lat && development.lng && (
              <section id="ubicacion" className="mt-12 scroll-mt-32">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">Dónde queda</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {development.location} · {development.city}
                  {development.provincia && <>, {development.provincia}</>}
                </p>

                <div className="mt-5 h-[320px] w-full overflow-hidden rounded-2xl border border-gray-200 md:h-[420px]">
                  <DevelopmentMap
                    lat={development.lat}
                    lng={development.lng}
                    nombre={development.name}
                  />
                </div>

                {/* Las distancias salen de la ficha técnica, no se calculan
                    sobre el mapa: la línea recta entre dos puntos no es lo que
                    maneja una persona. */}
                {distancias.length > 0 && (
                  <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                    {distancias.map((d) => (
                      <div key={d.label} className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2">
                        <dt className="text-sm text-gray-500">{d.label}</dt>
                        <dd className="text-sm font-semibold text-gray-900">{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${development.lat},${development.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-rose-600"
                >
                  Cómo llegar
                </a>
              </section>
            )}

            {/* Quién desarrolla ------------------------------------------
                En un emprendimiento de terceros, esta sección cumple el papel
                que en Airbnb cumple el perfil del anfitrión: quien pone la
                plata no le compra a la inmobiliaria, le compra al
                desarrollador, y la primera pregunta honesta es quiénes son.
                Va antes de la letra chica de las fuentes a propósito: primero
                el nombre y la cara, después el descargo.

                LO QUE ACÁ NO VA, Y POR QUÉ. Catalán Propiedades vende estos
                lotes y cobra comisión del desarrollador: el cliente tiene que
                llegar acá y derivarse desde acá. Por eso esta sección dice
                QUIÉN es el desarrollador y no CÓMO llegar a él. Se sacaron a
                propósito el enlace a su sitio, sus oficinas y la lista de sus
                otros emprendimientos: eran un camino directo a comprar sin
                nosotros, y ninguno agregaba confianza que no agregue ya el
                nombre más la trayectoria.

                Los tres datos siguen cargados en data/developments.js para
                trazabilidad interna. No se borraron: se dejaron de publicar.
                Si alguien los vuelve a renderizar "porque dan confianza",
                está regalando la comisión. */}
            {development.desarrolladorInfo && (
              <section id="desarrollador" className="mt-12 scroll-mt-32">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">
                  Quién desarrolla
                </h2>
                <div className="mt-5 rounded-2xl border border-gray-200 p-6">
                  <p className="text-lg font-black text-gray-900">
                    {development.desarrolladorInfo.nombre}
                  </p>
                  {development.desarrolladorInfo.rubro && (
                    <p className="text-sm text-gray-500">
                      {development.desarrolladorInfo.rubro}
                    </p>
                  )}
                  {development.desarrolladorInfo.trayectoria && (
                    <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
                      {development.desarrolladorInfo.trayectoria}.
                    </p>
                  )}

                  {/* Quién vende. Va acá y no en la letra chica porque es la
                      respuesta a la pregunta que sigue naturalmente a "quién
                      lo construye": con quién hablo yo. */}
                  <p className="mt-5 border-t border-gray-100 pt-5 text-sm text-gray-500">
                    La venta de este emprendimiento la gestiona Catalán
                    Propiedades. Toda la información de precios, disponibilidad
                    y planes de pago la coordinamos nosotros.
                  </p>
                </div>
              </section>
            )}

            {/* De dónde salió cada dato. En un emprendimiento de terceros los
                números los pone el desarrollador, no la inmobiliaria: decirlo
                protege a quien compra y nos protege a nosotros el día que el
                desarrollador cambie un precio.

                Antes acá había un enlace a la ficha del proyecto en el sitio
                del desarrollador, con estos mismos precios. Cumplía la función
                de citar la fuente y, de paso, mandaba al comprador a la única
                página donde puede saltearnos. El descargo funciona igual sin
                el enlace: lo que protege es decir que los números no son
                nuestros, no que se puedan clickear. La URL sigue guardada en
                data/developments.js por si hay que verificarla. */}
            {development.fuente && (
              <p className="mt-10 text-xs leading-relaxed text-gray-400">
                Precios y disponibilidad informados por {development.desarrollador}
                {development.fuente.relevado && <> · relevados el {formatearFecha(development.fuente.relevado)}</>}.
                Sujetos a modificación sin previo aviso; confirmá precios y
                disponibilidad antes de reservar.
              </p>
            )}

            {/* Ficha técnica ---------------------------------------------- */}
            {development.fichaTecnica?.length > 0 && (
              <section className="mt-12">
                <h2 className="font-jakarta text-2xl font-black text-gray-900">Ficha técnica</h2>
                <dl className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                  {development.fichaTecnica.map((f) => (
                    <div key={f.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
                      <dt className="text-sm text-gray-500">{f.label}</dt>
                      <dd className="text-sm font-semibold text-gray-900">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          {/* Panel de contacto ----------------------------------------------*/}
          {/* order-first en celular: si el panel queda al final del flujo, el
              precio y el botón de consulta aparecen recién después de la ficha
              técnica, a diez scrolls de la galería. Arriba se ven de entrada.
              En escritorio vuelve a su columna y se queda pegado al scroll. */}
          <aside className="order-first lg:relative lg:order-none">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-gray-200 p-6">
                {/* Con varias categorías de precio, un solo "desde" miente por
                    omisión. Acá los 44 lotes libres se reparten 11 / 21 / 12
                    entre 67.000, 78.000 y 85.000: poner 67.000 grande arriba
                    describe al 25% del stock y le arma otra expectativa al 75%
                    restante. Así que el número grande es cuánto queda —que sí
                    vale para todos— y abajo va la tabla con los tres precios.
                    El que busca el más barato lo sigue viendo, en la primera
                    fila y sin que le escondamos el resto. */}
                {hayCategorias ? (
                  <>
                    <p className="text-sm text-gray-500">
                      {capitalizar(unidadLabel(development))} disponibles
                    </p>
                    <p className="mt-0.5 text-3xl font-black text-gray-900">
                      {seSabeStock ? disponibles : "Consultar"}
                    </p>

                    <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-5 text-sm">
                      {categoriasPanel.map((t) => (
                        <div key={t.nombre} className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 truncate text-gray-500">
                            {t.nombre}
                            {typeof t.disponibles === "number" && t.disponibles > 0 && (
                              <span className="text-gray-400">
                                {" "}· {t.disponibles} libre{t.disponibles === 1 ? "" : "s"}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-semibold text-gray-900">
                            {t.precioDesde > 0
                              ? `USD ${t.precioDesde.toLocaleString("es-AR")}`
                              : "Consultar"}
                          </span>
                        </div>
                      ))}
                      {categoriasOcultas > 0 && (
                        <p className="text-xs text-gray-400">
                          y {categoriasOcultas} más en la tabla de precios
                        </p>
                      )}
                    </div>

                    {development.financiacion?.cuotas > 0 && (
                      <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                        Financiación propia, hasta {development.financiacion.cuotas} cuotas
                        {development.financiacion.ajuste
                          ? ` ${development.financiacion.ajuste.toLowerCase()}`
                          : ""}
                        .
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">
                      {capitalizar(unidadLabel(development))} desde
                    </p>
                    <p className="mt-0.5 text-3xl font-black text-gray-900">
                      {development.precioDesde > 0
                        ? `USD ${development.precioDesde.toLocaleString("es-AR")}`
                        : "Consultar"}
                    </p>
                    {development.precioM2Desde > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        USD {development.precioM2Desde.toLocaleString("es-AR")} por m²
                      </p>
                    )}

                    {/* Las filas que no sabemos no se dibujan. "Entrega: A
                        confirmar" ocupa el mismo lugar que un dato y lo único
                        que informa es que no tenemos el dato. */}
                    <div className="mt-5 space-y-2 border-t border-gray-100 pt-5 text-sm">
                      <Fila label="Estado" valor={estado.label} />
                      {development.entrega && (
                        <Fila label="Entrega" valor={development.entrega} />
                      )}
                      <Fila
                        label="Disponibilidad"
                        valor={
                          agotado
                            ? "Agotado"
                            : seSabeStock
                              ? `${disponibles} ${unidadLabel(development, disponibles)}`
                              : "Consultar"
                        }
                      />
                    </div>
                  </>
                )}

                {/* La resta "totales − disponibles = vendidos" solo se publica
                    cuando las dos cifras vienen del desarrollador. Si la
                    disponibilidad la contamos nosotros de un plano, lo que se
                    muestra es la fecha de ese relevamiento y nada más: los que
                    faltan pueden estar vendidos o pueden ser una etapa sin
                    lanzar, y afirmar lo primero es inventar una velocidad de
                    venta que nadie nos dijo. */}
                {development.unidadesDisponiblesRelevado ? (
                  <p className="mt-4 text-xs text-gray-500">
                    Disponibilidad informada por {development.desarrollador} al{" "}
                    {development.unidadesDisponiblesRelevado}. Puede haber cambiado.
                  </p>
                ) : (
                  vendidas > 0 && !agotado && (
                    <p className="mt-4 text-xs text-gray-500">
                      Ya se vendieron {vendidas} de {development.unidadesTotales}{" "}
                      {unidadLabel(development)}.
                    </p>
                  )
                )}

                <button
                  type="button"
                  onClick={() => abrirConsulta(null)}
                  className="mt-5 w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                >
                  {agotado ? "Avisarme del próximo proyecto" : "Pedir información"}
                </button>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                    `Hola, quiero información del desarrollo ${development.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900"
                >
                  Escribir por WhatsApp
                </a>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Te respondemos con el plano de la unidad y el plan de pago completo.
                </p>
              </div>

              <Link
                href="/simulador-credito"
                className="mt-4 block rounded-2xl border border-gray-200 p-5 transition-colors hover:border-gray-400"
              >
                <p className="mb-1 text-xs font-semibold text-gray-500">¿Necesitás crédito?</p>
                <p className="text-sm font-semibold leading-snug text-gray-900">
                  Simulá la cuota antes de reservar
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  Ir al simulador
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Otros desarrollos ------------------------------------------------*/}
        {otros.length > 0 && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="font-jakarta text-2xl font-black text-gray-900">
              Otros desarrollos
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {otros.map((d) => (
                <OtroDesarrollo key={d.id} development={d} />
              ))}
            </div>
          </section>
        )}

        <div className="h-16" />
      </div>

      {/* Acá vivía una barra de CTA pegada al pie en celular. Se sacó porque el
          sitio ya tiene su propia barra de navegación fija abajo (z-50): las dos
          ocupaban exactamente los mismos 71px de pantalla y la de navegación
          tapaba la otra por completo, así que el botón no se veía nunca. El CTA
          en celular es el panel de arriba (order-first) más el botón
          "Consultar" de cada tipología. */}

      <Lightbox
        images={imagenes}
        title={development.name}
        isOpen={lightbox.abierto}
        startIndex={lightbox.indice}
        onClose={() => setLightbox({ abierto: false, indice: 0 })}
      />

      {formAbierto && (
        <DevelopmentInquiry
          development={development}
          tipologia={tipologiaElegida}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </div>
  );
}

/* --- Piezas chicas -------------------------------------------------------- */

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Las fechas se guardan en ISO para poder ordenarlas, pero "2026-08-22" en
// medio de una oración se lee como un número de serie. Si no viene en ISO se
// devuelve tal cual: hay fechas cargadas a mano como "Marzo de 2027".
function formatearFecha(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

function Cifra({ label, valor, destacado = false }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`mt-0.5 text-lg font-black ${destacado ? "text-rose-600" : "text-gray-900"}`}>
        {valor}
      </dd>
    </div>
  );
}

function Fila({ label, valor }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-semibold text-gray-900">{valor}</span>
    </div>
  );
}

// Una categoría de unidad como tarjeta elegible.
//
// La franja de color de arriba es el color con el que ese lote está pintado en
// el masterplan del desarrollador. Es el único puente entre el plano que el
// comprador mira con el vendedor y la ficha que mira solo, de noche, en el
// teléfono.
function TarjetaDeCategoria({ categoria: t, elegida, seleccionable, onElegir, onConsultar }) {
  const seSabe = typeof t.disponibles === "number";
  const sinStock = t.disponibles === 0;
  const ultimas = seSabe && t.disponibles > 0 && t.disponibles <= 2;

  // La cuota más baja de la categoría. Va con su anticipo al lado y no suelta:
  // "desde USD 700 por mes" a secas esconde que ese plan es justo el que pide
  // el anticipo más alto, y sería el mismo truco del "precio desde".
  const planBarato = (t.planes ?? []).reduce(
    (mejor, p) => (!mejor || p.cuota < mejor.cuota ? p : mejor),
    null
  );

  const specs = [
    t.dormitorios > 0 ? `${t.dormitorios} dorm` : null,
    t.banos > 0 ? `${t.banos} baños` : null,
    t.m2 > 0 ? `${t.m2} m²` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div
      onClick={seleccionable && !sinStock ? onElegir : undefined}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-colors ${
        sinStock
          ? "border-gray-200 opacity-60"
          : elegida
            ? "border-gray-900 ring-1 ring-gray-900"
            : "border-gray-200 hover:border-gray-400"
      } ${seleccionable && !sinStock ? "cursor-pointer" : ""}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{ backgroundColor: t.color ?? "#111827" }}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-bold text-gray-900">{t.nombre}</p>
          {elegida && (
            <span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">
              Elegido
            </span>
          )}
        </div>
        {specs && <p className="mt-0.5 text-sm text-gray-500">{specs}</p>}

        <p className="mt-3 text-2xl font-black text-gray-900">
          USD {t.precioDesde?.toLocaleString("es-AR")}
        </p>
        {t.precioContado > 0 && t.precioContado < t.precioDesde && (
          <p className="text-sm text-gray-500">
            USD {t.precioContado.toLocaleString("es-AR")} de contado
          </p>
        )}

        {planBarato && (
          <p className="mt-3 text-sm text-gray-700">
            {planBarato.meses} cuotas de{" "}
            <span className="font-semibold">
              USD {planBarato.cuota.toLocaleString("es-AR")}
            </span>
            <span className="block text-xs text-gray-400">
              con USD {planBarato.anticipo.toLocaleString("es-AR")} de anticipo
            </span>
          </p>
        )}

        <p
          className={`mt-3 text-sm ${
            sinStock ? "text-gray-400" : ultimas ? "font-semibold text-rose-600" : "text-gray-500"
          }`}
        >
          {!seSabe
            ? "Consultar disponibilidad"
            : sinStock
              ? "Sin stock"
              : t.total > 0
                ? `${t.disponibles} de ${t.total} disponibles`
                : `${t.disponibles} disponibles`}
        </p>

        <button
          type="button"
          disabled={sinStock}
          onClick={(e) => {
            e.stopPropagation();
            onConsultar();
          }}
          className="mt-5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
        >
          Consultar
        </button>
      </div>
    </div>
  );
}

// Barra que aparece cuando la cabecera sale de pantalla: índice de secciones a
// la izquierda, precio y botón de consulta a la derecha.
//
// El motivo real es el celular. En escritorio el panel de contacto queda
// pegado al scroll, pero en pantalla chica ese panel está arriba de todo y,
// una vez que pasás la primera pantalla, no vuelve nunca: alguien que leyó los
// tres precios, el plan de pago y quién desarrolla termina de leer y no tiene
// dónde tocar.
function BarraPegajosa({ visible, secciones, development, onConsultar }) {
  return (
    <div
      // z-40 la deja por debajo de la barra de navegación del sitio (z-50), y
      // top-14/16 la apoya justo abajo en vez de encimarla.
      className={`fixed inset-x-0 top-14 z-40 border-b border-gray-200 bg-white/95 backdrop-blur transition-all duration-200 md:top-16 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <nav className="-mb-px flex min-w-0 flex-1 gap-5 overflow-x-auto">
          {secciones.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap py-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {development.precioDesde > 0 && (
            <span className="hidden text-sm text-gray-500 lg:inline">
              Desde{" "}
              <span className="font-semibold text-gray-900">
                USD {development.precioDesde.toLocaleString("es-AR")}
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={onConsultar}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            Pedir información
          </button>
        </div>
      </div>
    </div>
  );
}

// Los amenities se cargan como texto plano y los que todavía no están
// construidos vienen marcados entre paréntesis al final: "Sector deportivo
// (proyectado)". Acá se separa la marca del texto para poder mostrarla como
// etiqueta en vez de dejarla dentro de la frase.
function leerAmenity(texto) {
  const m = String(texto).match(/^(.*?)\s*\((proyectad[oa]s?)\)\s*$/i);
  return m ? { texto: m[1], proyectado: true } : { texto: String(texto), proyectado: false };
}

// Un ícono por familia de amenity, elegido por palabra clave. No es un ícono
// por cada uno: con trece amenities y cinco familias alcanza para que la lista
// se lea de un vistazo, y no obliga a mantener un diccionario que se desactualiza
// en cuanto alguien carga un desarrollo nuevo. Lo que no cae en ninguna familia
// usa el tilde de siempre.
const FAMILIAS_AMENITY = [
  { re: /sendero|trekking|montañ|bosque|mirador/i, path: "M3 20h18L14 4l-4 8-2-3-5 11z" },
  { re: /arroyo|laguna|agua|río|rio/i, path: "M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" },
  { re: /huerta|orgánic|organic|frut|hortaliza|plaza|parque/i, path: "M12 21V9m0 0c0-3 2-5 5-5 0 3-2 5-5 5zm0 0C12 6 10 4 7 4c0 3 2 5 5 5z" },
  { re: /comercial|proveedur|tienda|casa de té|casa de te/i, path: "M4 8h16l-1 12H5L4 8zm3 0V6a5 5 0 0110 0v2" },
  { re: /deport|cancha|gimnasio/i, path: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 0v18M3 12h18" },
  { re: /minibús|minibus|transporte|colectivo|auto/i, path: "M4 16V7a2 2 0 012-2h12a2 2 0 012 2v9M4 16h16M4 16v2h3v-2m10 0v2h3v-2M7 9h10" },
  { re: /expensa|orientaci|sol|norte/i, path: "M12 4v2m0 12v2m8-8h-2M6 12H4m12.7-5.7l-1.4 1.4M8.7 15.3l-1.4 1.4m9.4 0l-1.4-1.4M8.7 8.7L7.3 7.3M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { re: /colegio|escuela|servicio|centro urbano|conexi/i, path: "M3 10l9-6 9 6-9 6-9-6zm2 5v5l7 3 7-3v-5" },
];

function IconoAmenity({ texto, apagado }) {
  const familia = FAMILIAS_AMENITY.find((f) => f.re.test(texto));
  const clase = `mt-0.5 h-5 w-5 shrink-0 ${apagado ? "text-gray-300" : "text-gray-900"}`;

  if (!familia) {
    return (
      <svg className={clase} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
      </svg>
    );
  }

  return (
    <svg className={clase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={familia.path} />
    </svg>
  );
}

// Cuánto termina costando cada plan de pago.
//
// El desarrollador publica anticipo y cuota, nunca el total. Y en este proyecto
// la diferencia no es un detalle: el mismo lote tiene un precio de lista de
// 67.000, baja a 60.000 de contado y llega a 88.500 financiado a seis años.
// Esa cuenta la hace igual cualquiera que se siente con
// una calculadora, así que esconderla no evita la conversación, solo la corre
// al día en que ya firmó. Mostrarla es lo que hace que la ficha sea una
// herramienta y no un folleto.
//
// La suma es aritmética sobre los números del desarrollador —anticipo más
// cuotas— y está declarada como cálculo nuestro, no como dato de ellos.
function PlanesDePago({ categorias = [], elegida = 0, onElegir }) {
  // La categoría elegida ya no vive acá: la maneja la ficha, porque la eligió
  // el visitante arriba, en las tarjetas. Los chips que quedan abajo sirven
  // para cambiarla sin tener que volver a scrollear.
  const conPlanes = categorias.filter((t) => (t.planes ?? []).length > 0);
  if (conPlanes.length === 0) return null;

  const indice = Math.min(elegida, conPlanes.length - 1);
  const setElegida = (i) => onElegir?.(i);
  const t = conPlanes[indice];
  const usd = (n) => `USD ${Number(n).toLocaleString("es-AR")}`;

  return (
    <div className="mt-8">
      <h3 className="text-base font-bold text-gray-900">Cuánto termina costando cada plan</h3>

      {conPlanes.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {conPlanes.map((c, i) => (
            <button
              key={c.nombre}
              type="button"
              onClick={() => setElegida(i)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                i === indice
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="py-2 pr-4 font-medium">Plan</th>
              <th className="py-2 pr-4 font-medium">Anticipo</th>
              <th className="py-2 pr-4 font-medium">Cuota</th>
              <th className="py-2 pr-4 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {t.precioDesde > 0 && (
              <tr className="bg-gray-50/70">
                <td className="py-3 pr-4 font-semibold text-gray-900">
                  Base de financiación
                </td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 pr-4 text-gray-500">—</td>
                <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                  {usd(t.precioDesde)}
                </td>
              </tr>
            )}
            {t.planes.map((p, i) => {
              const total = p.anticipo + p.cuota * p.meses;
              // La financiación parte del precio de lista. El precio de contado
              // es un descuento independiente y no debe usarse como base del
              // recargo de los planes.
              const base = t.precioDesde;
              const extra = Math.round((total / base - 1) * 100);
              const pctAnticipo = t.precioDesde > 0
                ? Math.round((p.anticipo / t.precioDesde) * 100)
                : null;
              return (
                <tr key={`${p.meses}-${p.anticipo}-${i}`}>
                  <td className="py-3 pr-4 font-semibold text-gray-900">{p.meses} meses</td>
                  <td className="py-3 pr-4 text-gray-700">
                    {usd(p.anticipo)}
                    {pctAnticipo !== null && (
                      <span className="text-gray-400"> ({pctAnticipo}%)</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{usd(p.cuota)} por mes</td>
                  <td className="py-3 pr-4 text-right">
                    <span className="font-semibold text-gray-900">{usd(total)}</span>
                    {extra > 0 && (
                      <span className="block text-xs text-gray-500">
                        +{extra}% sobre el precio de lista
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-gray-400">
        Los planes financiados parten del precio de lista, no del precio de
        contado. El total es la suma del anticipo más todas las cuotas, calculada
        por nosotros sobre la lista de precios del desarrollador. No incluye
        gastos de escritura, impuestos ni gastos administrativos.
      </p>
    </div>
  );
}

// Miniatura del video, con red de contención: maxresdefault no existe para
// todos los videos y, cuando falta, YouTube devuelve una imagen gris de 120px
// que estirada a 1216 de ancho queda espantosa. Si falla, se cae a hqdefault,
// que existe siempre.
function useMiniatura(youtubeId) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`);
  const alFallar = () => setSrc(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`);
  return [src, alFallar];
}

// Cabecera de la ficha cuando el video hace de portada.
//
// El título va ENCIMA de la imagen y no arriba de ella. No es decoración: son
// dos bloques que hablan del mismo proyecto, y separados obligan a leer dos
// veces —el nombre acá, la imagen allá— con un escalón de aire en el medio que
// no significa nada. Juntos, la primera pantalla dice de una sola vez qué es y
// cómo se ve.
//
// En celular el texto NO va encima: la banda es mucho más chica y un título de
// dos líneas sobre la foto tapa justamente lo que se quiere mostrar. Ahí la
// imagen va arriba y el texto debajo, en negro sobre blanco.
function PortadaHero({ development, estado, styles, agotado }) {
  const [abierto, setAbierto] = useState(false);
  const video = development.video;
  const [miniatura, alFallarMiniatura] = useMiniatura(video.youtubeId);

  return (
    <>
      <section className="overflow-hidden rounded-2xl sm:relative">
        <div className="relative aspect-[16/10] w-full bg-gray-900 sm:aspect-[16/9] lg:aspect-[21/9]">
          <img
            src={miniatura}
            onError={alFallarMiniatura}
            alt={video.titulo ?? development.name}
            // Es la imagen más grande de la página y la que mide el LCP:
            // conviene que el navegador la pida antes que al resto.
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          {/* El degradado existe para que el texto blanco se lea sobre
              cualquier fotograma. Sin él, un título claro sobre el cielo
              nevado del video desaparece. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-gradient-to-t from-black/90 via-black/40 to-black/10 sm:block"
          />
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label={`Reproducir el video de ${development.name}`}
            className="group absolute inset-0 flex items-center justify-center sm:pb-[14%]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-6 w-6 text-gray-900 md:h-8 md:w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </span>
          </button>
        </div>

        <div className="pt-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-8 sm:pt-0 lg:p-10 lg:pt-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles.suave} sm:border-white/25 sm:bg-white/15 sm:text-white sm:backdrop-blur`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${styles.dot} sm:bg-white`} />
              {estado.label}
            </span>
            {development.fideicomiso && (
              <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 sm:border-white/25 sm:text-white">
                Fideicomiso al costo
              </span>
            )}
            {agotado && (
              <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                Agotado
              </span>
            )}
          </div>

          <h1 className="font-jakarta text-3xl font-black leading-tight text-gray-900 sm:text-white md:text-5xl md:leading-[1.1] sm:[text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
            {development.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-500 sm:text-white/85 md:text-lg">
            {development.tagline}
          </p>
          <p className="mt-1 text-sm text-gray-500 sm:text-white/70">
            {development.location} · {development.city}
            {development.desarrollador && <> · Desarrolla {development.desarrollador}</>}
          </p>
        </div>
      </section>

      {abierto && (
        <VideoModal
          video={video}
          nombre={development.name}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  );
}

// El video, a pantalla completa.
//
// Se abre en overlay en vez de reproducirse dentro de la banda por dos motivos.
// Uno: la banda es panorámica y el video es 16:9, así que reproducirlo ahí
// adentro lo dejaría con franjas negras arriba y abajo. Dos: al arrancar el
// video, el título que está encima habría que esconderlo, y un H1 que
// desaparece cuando tocás play es un salto raro. Así la cabecera queda quieta
// y el video se ve al doble de tamaño.
function VideoModal({ video, nombre, onClose }) {
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", alTeclear);
    // Sin esto, el fondo sigue scrolleando detrás del video.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video de ${nombre}`}
      onClick={onClose}
      // Por encima de la barra de navegación, que vive en z-50.
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar el video"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.titulo ?? nombre}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        {video.canal && (
          <p className="mt-3 text-center text-xs text-white/60">
            Video de presentación publicado por {video.canal} en YouTube.
          </p>
        )}
      </div>
    </div>
  );
}

// El video de presentación del desarrollador.
//
// Se dibuja primero la miniatura y recién al hacer clic se monta el iframe.
// Es el mismo patrón que usa "Compartí tu barrio", y no es capricho: un embed
// de YouTube cargado de entrada trae más de un mega de scripts de terceros y se
// convierte en el elemento más pesado de la página. Acá arriba, donde vive el
// LCP, eso se paga caro.
//
// youtube-nocookie.com en vez de youtube.com: no deja cookies de seguimiento
// hasta que la persona decide mirar el video.
function VideoDelProyecto({ video, nombre }) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [miniatura, alFallarMiniatura] = useMiniatura(video.youtubeId);

  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        {reproduciendo ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.titulo ?? nombre}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setReproduciendo(true)}
            aria-label={`Reproducir el video de ${nombre}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={miniatura}
              alt={video.titulo ?? nombre}
              onError={alFallarMiniatura}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-6 w-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {video.canal && (
        <figcaption className="mt-2 text-xs text-gray-400">
          Video de presentación publicado por {video.canal} en YouTube.
        </figcaption>
      )}
    </figure>
  );
}

function Galeria({ imagenes, nombre, onAbrir }) {
  // Sin fotos cargadas va el mismo fondo neutro que en la tarjeta. Devolver
  // null dejaba el título pegado a las cifras y la ficha parecía cortada.
  // Que el video ocupe ese lugar cuando existe se decide arriba, en la ficha:
  // acá adentro solo se sabe de fotos.
  if (imagenes.length === 0) {
    return (
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl md:aspect-[21/9]">
        <SinFoto nombre={nombre} />
      </div>
    );
  }
  const [portada, ...resto] = imagenes;

  return (
    <>
      {/* Celular: una sola foto, a pantalla completa de ancho. El mosaico de
          cinco fotos en 375px deja miniaturas del tamaño de una estampilla. */}
      <button
        type="button"
        onClick={() => onAbrir(0)}
        className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100 md:hidden"
      >
        <Image
          src={portada}
          alt={nombre}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm">
          Ver {imagenes.length} fotos
        </span>
      </button>

      {/* Escritorio: portada grande + cuatro chicas, como el catálogo. */}
      <div className="hidden gap-2 md:grid md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => onAbrir(0)}
          className="group relative col-span-2 row-span-2 aspect-[4/3] overflow-hidden rounded-l-xl bg-gray-100"
        >
          <Image
            src={portada}
            alt={nombre}
            fill
            priority
            sizes="50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
        {resto.slice(0, 4).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onAbrir(i + 1)}
            className={`group relative overflow-hidden bg-gray-100 ${i === 1 ? "rounded-tr-xl" : ""} ${i === 3 ? "rounded-br-xl" : ""}`}
          >
            <Image
              src={src}
              alt={`${nombre} — foto ${i + 2}`}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {i === 3 && imagenes.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                +{imagenes.length - 5} fotos
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function OtroDesarrollo({ development }) {
  const estado = ESTADOS[development.estado] ?? ESTADOS.pozo;
  return (
    <Link href={`/desarrollos/${development.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100">
        {development.image ? (
          <Image
            src={development.image}
            alt={development.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <SinFoto nombre={development.name} />
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-gray-900">{development.name}</h3>
      <p className="text-sm text-gray-500">{development.location}</p>
      <p className="text-sm text-gray-500">
        {estado.label}
        {development.precioDesde > 0 &&
          ` · desde USD ${development.precioDesde.toLocaleString("es-AR")}`}
      </p>
    </Link>
  );
}

/* --- Formulario de consulta ----------------------------------------------- */

function DevelopmentInquiry({ development, tipologia, onClose }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", mensaje: "" });
  const [error, setError] = useState("");
  const { trackWhatsAppClick, trackFormSubmit } = useAnalytics();

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setError("");
  };

  const enviar = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }

    const url = typeof window !== "undefined" ? window.location.href : "";

    // El id del desarrollo va en `detalle` y NO en property_id: esa columna
    // apunta a la tabla de propiedades, y meter ahí un id de desarrollo haría
    // que el panel mostrara la consulta colgada de una propiedad que no existe.
    registrarConsulta({
      tipo: "desarrollo",
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      mensaje: form.mensaje,
      property_title: development.name,
      detalle: {
        development_id: development.id,
        desarrollo: development.name,
        tipologia: tipologia ?? "Sin especificar",
        estado: development.estado,
        entrega: development.entrega,
        precio_desde: development.precioDesde > 0
          ? `USD ${development.precioDesde.toLocaleString("es-AR")}`
          : "Sin precio publicado",
        ubicacion: development.location,
        link: url,
      },
    });

    // Cada línea solo se agrega si el dato existe. Antes se concatenaban
    // siempre, así que en un desarrollo sin fecha de entrega el cliente recibía
    // por WhatsApp un mensaje que decía "Entrega: null".
    let msg = `Hola, me interesa este desarrollo.\n\n`;
    msg += `Desarrollo: ${development.name}\n`;
    if (tipologia) msg += `Tipología: ${tipologia}\n`;
    if (development.location) msg += `Ubicación: ${development.location}\n`;
    if (development.entrega) msg += `Entrega: ${development.entrega}\n`;
    if (development.precioDesde > 0) {
      msg += `Desde: USD ${development.precioDesde.toLocaleString("es-AR")}\n`;
    }
    msg += `Link: ${url}\n`;
    msg += `\nNombre: ${form.nombre}\n`;
    msg += `Teléfono: ${form.telefono}\n`;
    if (form.email.trim()) msg += `Email: ${form.email}\n`;
    if (form.mensaje.trim()) msg += `\nMensaje:\n${form.mensaje}`;

    trackFormSubmit("desarrollo_consulta", true);
    trackWhatsAppClick(null, "development_inquiry_form");
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative flex w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">
            Consulta de desarrollo
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-base font-bold text-gray-900">{development.name}</p>
          {/* Sin fecha de entrega confirmada esta línea desaparece entera.
              Antes decía "Entrega " y nada más — que es justo el caso del
              único desarrollo cargado, porque la fecha que publicó el
              desarrollador quedó vieja y se guarda en null a propósito. */}
          {(tipologia || development.entrega) && (
            <p className="mt-0.5 text-sm text-gray-500">
              {[tipologia, development.entrega ? `Entrega ${development.entrega}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <div className="mt-5 space-y-3">
            <Campo label="Nombre *" value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" />
            <Campo label="Teléfono *" value={form.telefono} onChange={set("telefono")} placeholder="Con característica" type="tel" />
            <Campo label="Email" value={form.email} onChange={set("email")} placeholder="tucorreo@ejemplo.com" type="email" />
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Mensaje</label>
              <textarea
                value={form.mensaje}
                onChange={set("mensaje")}
                rows={3}
                placeholder="Qué te gustaría saber del proyecto"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={enviar}
            className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            Enviar consulta
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            Se abre WhatsApp con el mensaje listo para enviar.
          </p>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
      />
    </div>
  );
}
