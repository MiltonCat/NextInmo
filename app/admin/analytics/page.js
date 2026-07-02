import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  isAnalyticsConfigured,
  getAnalyticsOverview,
  normalizeRange,
  summarizeCauses,
  canalES,
  dispositivoES,
  eventoES,
} from "@/lib/analytics";
import {
  isSearchConsoleConfigured,
  getSearchConsoleOverview,
} from "@/lib/searchConsole";
import TrendChart from "./TrendChart";
import NoTrackToggle from "@/components/NoTrackToggle";

// La API de GA4 usa gRPC: necesita runtime Node, y los datos siempre frescos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGOS = [
  { dias: 7, label: "7 días" },
  { dias: 28, label: "28 días" },
  { dias: 90, label: "90 días" },
];

const nf = new Intl.NumberFormat("es-AR");
const formatNum = (n) => nf.format(Math.round(n || 0));
const formatPct = (n) => `${(n || 0).toFixed(1)}%`;
function formatDuration(seg) {
  const s = Math.round(seg || 0);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// Pastilla con la variación vs. el periodo anterior. lowerIsBetter invierte los
// colores para métricas donde bajar es bueno (ej. % de rebote).
function Delta({ pct, lowerIsBetter = false }) {
  const up = pct > 0;
  const flat = pct === 0;
  const bueno = flat ? null : lowerIsBetter ? !up : up;
  const color = flat
    ? "text-gray-400 bg-gray-100"
    : bueno
      ? "text-green-700 bg-green-50"
      : "text-rose-700 bg-rose-50";
  const flecha = flat ? "→" : up ? "▲" : "▼";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {flecha} {pct > 0 ? "+" : ""}{pct}%
    </span>
  );
}

function KpiCard({ label, value, pct, lowerIsBetter = false, prev }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <Delta pct={pct} lowerIsBetter={lowerIsBetter} />
      </div>
      <p className="mt-1 text-xs text-gray-400">Antes: {prev}</p>
    </div>
  );
}

// CTR llega como fracción (0..1) y la posición como número (1 = primero).
const formatCtr = (n) => `${((n || 0) * 100).toFixed(1)}%`;
const formatPos = (n) => (n ? n.toFixed(1) : "—");

// Tarjeta de KPI compacta para Search Console (acepta valores ya formateados).
function GscKpiCard({ label, value, pct, lowerIsBetter = false, prev, hint }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <Delta pct={pct} lowerIsBetter={lowerIsBetter} />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {hint ? hint : `Antes: ${prev}`}
      </p>
    </div>
  );
}

// Sección completa de Google Search Console: visibilidad real en Google.
function SearchConsoleSection({ data, error, configured }) {
  const Title = (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-black text-white">G</span>
      <div>
        <p className="text-sm font-semibold text-gray-900">Visibilidad en Google (Search Console)</p>
        <p className="text-xs text-gray-400">
          Cuánta gente te VE y te busca en Google — incluye a quienes los bloqueadores ocultan a GA4.
        </p>
      </div>
    </div>
  );

  if (!configured) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        {Title}
        <p className="mt-3 text-sm text-indigo-900">
          Falta una variable para leer Search Console. Agregá <code>GSC_SITE_URL</code> (ej.{" "}
          <code>sc-domain:catalanpropiedades.com.ar</code>) en <code>.env.local</code> y en Vercel, y
          dale acceso de <strong>Lector</strong> al email de la cuenta de servicio dentro de Search
          Console (Configuración → Usuarios y permisos). Usa las mismas credenciales que GA4.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        {Title}
        <p className="mt-3 text-sm text-rose-900">
          Google rechazó la consulta de Search Console. Verificá que la cuenta de servicio tenga
          acceso a la propiedad y que <code>GSC_SITE_URL</code> coincida exactamente con la propiedad
          (dominio vs. URL).
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-white/60 p-3 text-xs text-rose-800">{error}</pre>
      </div>
    );
  }

  const { kpis, queries, pages } = data;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">{Title}</div>

      {/* KPIs de búsqueda */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GscKpiCard label="Impresiones" value={formatNum(kpis.impressions.current)} pct={kpis.impressions.changePct} prev={formatNum(kpis.impressions.previous)} />
        <GscKpiCard label="Clics" value={formatNum(kpis.clicks.current)} pct={kpis.clicks.changePct} prev={formatNum(kpis.clicks.previous)} />
        <GscKpiCard label="CTR" value={formatCtr(kpis.ctr.current)} pct={kpis.ctr.changePct} prev={formatCtr(kpis.ctr.previous)} />
        <GscKpiCard label="Posición media" value={formatPos(kpis.position.current)} pct={kpis.position.changePct} lowerIsBetter hint={`Antes: ${formatPos(kpis.position.previous)} · más bajo = mejor`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top búsquedas */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-gray-900">Qué busca la gente para encontrarte</p>
          <p className="mb-3 text-xs text-gray-400">Términos con más clics desde Google</p>
          <div className="space-y-2">
            {queries.map((q) => (
              <div key={q.query} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-gray-700" title={q.query}>{q.query}</span>
                <span className="w-16 text-right tabular-nums text-gray-400" title="Impresiones">{formatNum(q.impressions)}</span>
                <span className="w-12 text-right tabular-nums font-semibold text-gray-900" title="Clics">{formatNum(q.clicks)}</span>
                <span className="w-12 text-right tabular-nums text-indigo-600" title="Posición media">{formatPos(q.position)}</span>
              </div>
            ))}
            {queries.length === 0 && <p className="text-sm text-gray-400">Sin datos todavía.</p>}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">Columnas: impresiones · clics · posición</p>
        </div>

        {/* Top páginas en búsqueda */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-gray-900">Páginas que más entran por Google</p>
          <p className="mb-3 text-xs text-gray-400">Tus páginas mejor posicionadas</p>
          <div className="space-y-2">
            {pages.map((p) => (
              <div key={p.page} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-gray-700" title={p.page}>{p.page}</span>
                <span className="w-16 text-right tabular-nums text-gray-400" title="Impresiones">{formatNum(p.impressions)}</span>
                <span className="w-12 text-right tabular-nums font-semibold text-gray-900" title="Clics">{formatNum(p.clicks)}</span>
                <span className="w-12 text-right tabular-nums text-indigo-600" title="Posición media">{formatPos(p.position)}</span>
              </div>
            ))}
            {pages.length === 0 && <p className="text-sm text-gray-400">Sin datos todavía.</p>}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">Columnas: impresiones · clics · posición</p>
        </div>
      </div>
    </div>
  );
}

// Tarjeta que se muestra cuando aún no hay credenciales de GA4 configuradas.
function SetupCard() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
      <h2 className="text-base font-semibold">Falta conectar Google Analytics</h2>
      <p className="mt-2">
        El panel está listo, pero todavía no tiene las credenciales para leer tus datos. Una sola vez:
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>En <strong>Google Cloud Console</strong> (la misma cuenta de tu Analytics) habilitá la <em>“Google Analytics Data API”</em>.</li>
        <li>Creá una <strong>cuenta de servicio</strong> y descargá su <strong>clave JSON</strong>.</li>
        <li>En <strong>Google Analytics → Administrar → Acceso a la propiedad</strong>, agregá el email de esa cuenta (<code>…@….iam.gserviceaccount.com</code>) con rol <strong>Lector</strong>.</li>
        <li>Copiá el <strong>ID de propiedad</strong> numérico (Administrar → Configuración de la propiedad; es un número, no el código <code>G-XXXX</code>).</li>
        <li>Pegá en <code>.env.local</code> (y en Vercel) las variables <code>GA_PROPERTY_ID</code>, <code>GA_CLIENT_EMAIL</code> y <code>GA_PRIVATE_KEY</code> tomadas del JSON.</li>
      </ol>
      <p className="mt-3">Cuando estén cargadas, recargá esta página y verás las visitas.</p>
    </div>
  );
}

// Tarjeta de error si la API responde mal (property ID equivocado, sin permisos…).
function ErrorCard({ message }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
      <h2 className="text-base font-semibold">No se pudieron leer los datos</h2>
      <p className="mt-2">
        Las credenciales están cargadas pero Google rechazó la consulta. Revisá que el{" "}
        <code>GA_PROPERTY_ID</code> sea el número correcto y que la cuenta de servicio tenga acceso
        de <strong>Lector</strong> a la propiedad.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-white/60 p-3 text-xs text-rose-800">{message}</pre>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }) {
  const user = await requireUser();
  const sp = await searchParams;
  const range = normalizeRange(sp?.range);

  const Header = (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Analítica de visitas</h1>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver al panel
        </Link>
      </div>
    </header>
  );

  if (!isAnalyticsConfigured()) {
    return (
      <main className="min-h-screen bg-gray-50">
        {Header}
        <div className="mx-auto max-w-6xl px-4 py-10">
          <SetupCard />
        </div>
      </main>
    );
  }

  let overview;
  try {
    overview = await getAnalyticsOverview(range);
  } catch (err) {
    return (
      <main className="min-h-screen bg-gray-50">
        {Header}
        <div className="mx-auto max-w-6xl px-4 py-10">
          <ErrorCard message={String(err?.message || err)} />
        </div>
      </main>
    );
  }

  // Search Console: carga independiente y NO fatal. Si falla o no está
  // configurado, el panel de GA4 se muestra igual y la sección avisa qué pasó.
  const gscConfigured = isSearchConsoleConfigured();
  let gsc = null;
  let gscError = null;
  if (gscConfigured) {
    try {
      gsc = await getSearchConsoleOverview(range);
    } catch (err) {
      gscError = String(err?.message || err);
    }
  }

  const { kpis, series, topPages, channels, devices, conversions } = overview;
  const causas = summarizeCauses(overview);
  const totalPageViews = topPages.reduce((acc, p) => acc + p.views, 0) || 1;
  // Total de contactos "fuertes" (todo menos suscripciones al newsletter).
  const totalContactos = conversions
    .filter((c) => c.event !== "newsletter_signup")
    .reduce((acc, c) => acc + c.count, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {Header}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Selector de rango (server-side, sin JS) */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Comparando los últimos <strong>{range} días</strong> (hasta ayer) con los {range} previos.
          </p>
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 text-sm">
            {RANGOS.map((r) => (
              <Link
                key={r.dias}
                href={`/admin/analytics?range=${r.dias}`}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  r.dias === range ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Explicación automática de causas */}
        <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Qué pasó y por qué</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-800">{causas}</p>
        </div>

        {/* Excluir el propio tráfico de este dispositivo */}
        <NoTrackToggle />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Usuarios" value={formatNum(kpis.activeUsers.current)} pct={kpis.activeUsers.changePct} prev={formatNum(kpis.activeUsers.previous)} />
          <KpiCard label="Sesiones" value={formatNum(kpis.sessions.current)} pct={kpis.sessions.changePct} prev={formatNum(kpis.sessions.previous)} />
          <KpiCard label="Páginas vistas" value={formatNum(kpis.screenPageViews.current)} pct={kpis.screenPageViews.changePct} prev={formatNum(kpis.screenPageViews.previous)} />
          <KpiCard label="Duración media" value={formatDuration(kpis.avgSessionDuration.current)} pct={kpis.avgSessionDuration.changePct} prev={formatDuration(kpis.avgSessionDuration.previous)} />
          <KpiCard label="% Rebote" value={formatPct(kpis.bounceRate.current * 100)} pct={kpis.bounceRate.changePct} lowerIsBetter prev={formatPct(kpis.bounceRate.previous * 100)} />
        </div>

        {/* Conversiones / contactos: lo que de verdad importa para el negocio. */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Contactos y conversiones</p>
              <p className="text-xs text-gray-400">Cuántas personas dieron el paso de contactarte</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">{formatNum(totalContactos)}</p>
              <p className="text-xs text-gray-400">contactos directos</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {conversions.map((c) => (
              <div key={c.event} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-2xl font-black text-gray-900">{formatNum(c.count)}</p>
                <p className="mt-0.5 text-xs font-medium text-gray-600">{eventoES(c.event)}</p>
                <div className="mt-2"><Delta pct={c.changePct} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Visibilidad en Google (Search Console) */}
        <SearchConsoleSection data={gsc} error={gscError} configured={gscConfigured} />

        {/* Gráfico de tendencia */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-900">Usuarios por día</p>
          <TrendChart data={series} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top páginas */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-900">Páginas más visitadas</p>
            <div className="space-y-2">
              {topPages.map((p) => (
                <div key={p.path} className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-gray-700" title={p.path}>{p.path}</span>
                  <span className="tabular-nums text-gray-900">{formatNum(p.views)}</span>
                  <span className="w-16 text-right"><Delta pct={p.changePct} /></span>
                </div>
              ))}
              {topPages.length === 0 && <p className="text-sm text-gray-400">Sin datos.</p>}
            </div>
          </div>

          {/* Canales de tráfico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-gray-900">De dónde llegan</p>
            <p className="mb-3 text-xs text-gray-400">Canal de adquisición (sesiones)</p>
            <div className="space-y-2">
              {channels.map((c) => (
                <div key={c.channel} className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate capitalize text-gray-700">{canalES(c.channel)}</span>
                  <span className="tabular-nums text-gray-900">{formatNum(c.sessions)}</span>
                  <span className="w-16 text-right"><Delta pct={c.changePct} /></span>
                </div>
              ))}
              {channels.length === 0 && <p className="text-sm text-gray-400">Sin datos.</p>}
            </div>
          </div>
        </div>

        {/* Dispositivos */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-900">Dispositivos</p>
          <div className="flex flex-wrap gap-6">
            {devices.map((d) => (
              <div key={d.device}>
                <p className="text-2xl font-black text-gray-900">{formatNum(d.users)}</p>
                <p className="text-xs text-gray-500">{dispositivoES(d.device)}</p>
              </div>
            ))}
            {devices.length === 0 && <p className="text-sm text-gray-400">Sin datos.</p>}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Datos de Google Analytics 4 · actualizado {new Date(overview.updatedAt).toLocaleString("es-AR")}
        </p>
      </div>
    </main>
  );
}
