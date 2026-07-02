"use client";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { WA_NUMBER } from "@/config";

// Presets de TNA según el rango de tasas UVA vigentes en el sistema bancario.
// Referencia: lista comparativa del BCRA (se actualiza mensualmente).
const TNA_PRESETS = [
  { label: "Optimista", tna: 4.5, hint: "Nación c/haberes" },
  { label: "Promedio", tna: 8, hint: "Ciudad, BBVA" },
  { label: "Conservador", tna: 11, hint: "Bancos privados" },
];

const TC_FALLBACK = 1500; // Editable por el usuario si la API no responde.
const GASTOS_ESCRITURACION_PCT = 9; // Estimado escribano + impuestos + comisión en Neuquén.
const SEGUROS_FACTOR = 1.08; // Seguros de vida e incendio: suman ~8% a la cuota pura.
const TNA_MIN = 4.5; // Extremos del mercado para el rango "según banco".
const TNA_MAX = 11;

const fmtARS = (n) => `$ ${Math.round(n).toLocaleString("es-AR")}`;
const fmtUSD = (n) => `USD ${Math.round(n).toLocaleString("es-AR")}`;

export default function SimuladorCuota({ propertyPrice = 0, propertyTitle = "", compact = false }) {
  const { trackEvent, trackWhatsAppClick } = useAnalytics();

  const [precio, setPrecio] = useState(propertyPrice || 150000);
  const [anticipoPct, setAnticipoPct] = useState(25);
  const [plazo, setPlazo] = useState(20);
  const [tna, setTna] = useState(8);
  const [tipoCambio, setTipoCambio] = useState(TC_FALLBACK);
  const [tcAuto, setTcAuto] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("https://dolarapi.com/v1/dolares/bolsa")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.venta) {
          setTipoCambio(Math.round(data.venta));
          setTcAuto(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Los inputs numéricos guardan string para permitir borrar el campo sin que
  // quede un 0 pegado; acá se normalizan para el cálculo.
  const precioNum = Number(precio) || 0;
  const tnaNum = Number(tna) || 0;
  const tcNum = Number(tipoCambio) || 0;

  // Sistema francés. El capital está en UVAs, por eso la cuota inicial es la
  // representativa hoy: se ajusta por CER (inflación) durante la vida del crédito.
  const montoFinanciarUSD = precioNum * (1 - anticipoPct / 100);
  const n = plazo * 12;

  const cuotaPuraUSD = (tnaAnual) => {
    const im = tnaAnual / 100 / 12;
    return im > 0 ? (montoFinanciarUSD * im) / (1 - Math.pow(1 + im, -n)) : montoFinanciarUSD / n;
  };

  // Cuota con seguros de vida e incendio incluidos (como la informa el banco).
  const cuotaUSD = cuotaPuraUSD(tnaNum) * SEGUROS_FACTOR;
  const cuotaARS = cuotaUSD * tcNum;
  const cuotaMinARS = cuotaPuraUSD(TNA_MIN) * SEGUROS_FACTOR * tcNum;
  const cuotaMaxARS = cuotaPuraUSD(TNA_MAX) * SEGUROS_FACTOR * tcNum;
  const ingresoMinimo = cuotaARS * 4; // Relación cuota/ingreso máx. 25% (criterio general de los bancos).
  const anticipoUSD = precioNum * (anticipoPct / 100);
  const gastosUSD = precioNum * (GASTOS_ESCRITURACION_PCT / 100);

  const handleWhatsApp = () => {
    const msg = propertyTitle
      ? `Hola! Simulé un crédito para "${propertyTitle}" (${fmtUSD(precio)}): anticipo ${anticipoPct}%, ${plazo} años, cuota inicial aprox. ${fmtARS(cuotaARS)}/mes. ¿Sigue disponible? Me interesa comprar con crédito.`
      : `Hola! Simulé un crédito hipotecario UVA en su web: propiedad de ${fmtUSD(precio)}, anticipo ${anticipoPct}%, ${plazo} años, cuota inicial aprox. ${fmtARS(cuotaARS)}/mes. Estoy buscando propiedad para comprar con crédito, ¿qué opciones tienen?`;
    trackEvent("simulador_cuota_whatsapp", { price: precio, anticipo: anticipoPct, plazo, tna });
    trackWhatsAppClick(null, "simulador_cuota");
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className={`border border-gray-200 rounded-2xl ${compact ? "p-5" : "p-6 sm:p-8"} bg-white`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-rose-600 text-[11px] font-bold tracking-widest uppercase">Crédito hipotecario UVA</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">¿Cuánto pagarías por mes?</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Precio */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Precio de la propiedad (USD)
          </label>
          <input
            type="number"
            min={10000}
            step={5000}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500"
          />
        </div>

        {/* Anticipo */}
        <div>
          <label className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <span>Anticipo</span>
            <span className="text-gray-800">{anticipoPct}% · {fmtUSD(anticipoUSD)}</span>
          </label>
          <input
            type="range"
            min={20}
            max={80}
            step={5}
            value={anticipoPct}
            onChange={(e) => setAnticipoPct(Number(e.target.value))}
            className="w-full accent-rose-600"
          />
          <p className="text-[11px] text-gray-400 mt-1">Los bancos financian hasta el 75–80% del valor.</p>
        </div>

        {/* Plazo */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Plazo</label>
          <div className="flex gap-1.5">
            {[10, 15, 20, 30].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlazo(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${
                  plazo === p
                    ? "bg-rose-600 border-rose-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-rose-400"
                }`}
              >
                {p} años
              </button>
            ))}
          </div>
        </div>

        {/* TNA */}
        <div className="sm:col-span-2">
          <label className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <span>Tasa (TNA + UVA)</span>
            <span className="text-gray-800">{tnaNum}%</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TNA_PRESETS.map((p) => (
              <button
                key={p.tna}
                type="button"
                onClick={() => setTna(p.tna)}
                className={`flex-1 min-w-[100px] py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                  tnaNum === p.tna
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {p.label} {p.tna}%
                <span className={`block text-[10px] font-normal ${tnaNum === p.tna ? "text-gray-300" : "text-gray-400"}`}>{p.hint}</span>
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={tna}
              onChange={(e) => setTna(e.target.value)}
              aria-label="Tasa personalizada"
              className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Tipo de cambio */}
        <div className="sm:col-span-2 flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">
            Dólar MEP
          </label>
          <input
            type="number"
            min={1}
            value={tipoCambio}
            onChange={(e) => { setTipoCambio(e.target.value); setTcAuto(false); }}
            className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-rose-500"
          />
          <span className="text-[11px] text-gray-400">{tcAuto ? "Cotización actualizada automáticamente" : "Editalo si no es el actual"}</span>
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Cuota inicial c/seguros</p>
            <p className="text-xl font-black text-gray-900 leading-tight">{fmtARS(cuotaARS)}</p>
            <p className="text-[11px] text-gray-500">≈ {fmtUSD(cuotaUSD)} /mes</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Ingreso mínimo</p>
            <p className="text-base font-bold text-gray-800 leading-tight mt-1">{fmtARS(ingresoMinimo)}</p>
            <p className="text-[11px] text-gray-500">cuota ≤ 25% del ingreso</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Financiás</p>
            <p className="text-base font-bold text-gray-800 leading-tight mt-1">{fmtUSD(montoFinanciarUSD)}</p>
            <p className="text-[11px] text-gray-500">{100 - anticipoPct}% del valor</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Necesitás hoy</p>
            <p className="text-base font-bold text-gray-800 leading-tight mt-1">{fmtUSD(anticipoUSD + gastosUSD)}</p>
            <p className="text-[11px] text-gray-500">anticipo + ~{GASTOS_ESCRITURACION_PCT}% gastos</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 text-center mt-4 pt-3 border-t border-gray-200">
          Según el banco que elijas (TNA {TNA_MIN}% a {TNA_MAX}%), la cuota inicial va de{" "}
          <strong className="text-gray-700">{fmtARS(cuotaMinARS)}</strong> a{" "}
          <strong className="text-gray-700">{fmtARS(cuotaMaxARS)}</strong> por mes.
        </p>
      </div>

      <button
        onClick={handleWhatsApp}
        className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
      >
        ¿Te cierran los números? Contanos qué buscás
      </button>

      <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
        Te mostramos propiedades compatibles con crédito hipotecario en tu presupuesto.
      </p>

      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
        Cálculo estimativo con sistema francés, incluye ~8% de seguros de vida e incendio.
        En los créditos UVA el capital se ajusta por inflación (CER), por eso la cuota inicial
        es orientativa y varía según banco y perfil. Consultá la{" "}
        <a
          href="https://www.argentina.gob.ar/lista-comparativa-de-los-prestamos-hipotecarios-uva"
         