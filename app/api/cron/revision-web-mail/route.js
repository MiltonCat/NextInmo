// Resumen diario de analítica del sitio, por correo.
//
// Corre como cron de Vercel todas las mañanas y le manda a Milton la foto de
// GA4 + Search Console ya digerida: los KPIs con su variación, de dónde vino
// la gente, qué páginas se miraron y qué keywords están a un empujón del top 3.
// El JSON completo va adjunto, por si hace falta mirarlo en detalle o pasárselo
// al skill /revision-web.
//
// Existe para no tener que entrar al panel ni correr `npm run revision-web:datos`
// a mano: las credenciales de Google viven solo en Vercel, así que es Vercel
// quien consulta y empuja el resultado.
//
// Auth: Bearer con CRON_SECRET. Vercel agrega ese header solo en las
// invocaciones de cron cuando la variable está definida en el proyecto.

import "server-only";
import nodemailer from "nodemailer";
import { CONTACT_EMAIL, SITE_URL } from "@/config";
import { construirRevisionWeb } from "@/lib/revisionWeb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// La consulta a GA4 + Search Console puede tardar; el default no alcanza.
export const maxDuration = 60;

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const DESTINO = process.env.REVISION_WEB_EMAIL || CONTACT_EMAIL;

// Mismas convenciones visuales que los otros correos del proyecto: Gmail y
// Outlook descartan @font-face, así que solo tipografías del sistema.
const FUENTE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const ROSA = "#e11d48";
const TINTA = "#111827";
const GRIS = "#6b7280";
const VERDE = "#047857";
const BORDE = "#e5e7eb";

const nf = new Intl.NumberFormat("es-AR");

// Un KPI del panel llega como { current, previous, changePct }.
// `invertido` es para las métricas donde subir es malo —rebote y posición
// media—: sin eso un empeoramiento se pintaría de verde.
function delta(kpi, invertido = false) {
  const pct = Math.round(Number(kpi?.changePct ?? 0));
  if (!pct) return `<span style="color:${GRIS}">sin cambio</span>`;
  const bueno = invertido ? pct < 0 : pct > 0;
  return `<span style="color:${bueno ? VERDE : ROSA}">${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}%</span>`;
}

function fila(etiqueta, valor, kpi, invertido = false) {
  return `<tr>
    <td style="padding:7px 0;color:${GRIS};font-size:14px">${etiqueta}</td>
    <td style="padding:7px 0;color:${TINTA};font-size:15px;font-weight:600;text-align:right">${valor}</td>
    <td style="padding:7px 0 7px 14px;font-size:13px;text-align:right;white-space:nowrap">${kpi ? delta(kpi, invertido) : ""}</td>
  </tr>`;
}

function seccion(titulo, cuerpo) {
  if (!cuerpo) return "";
  return `<h2 style="margin:26px 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${GRIS};font-weight:600">${titulo}</h2>${cuerpo}`;
}

function lista(items) {
  if (!items?.length) return "";
  return `<table style="width:100%;border-collapse:collapse">${items.join("")}</table>`;
}

function buildHtml(datos) {
  const ga = datos?.ga4?.overview;
  const gsc = datos?.searchConsole?.overview;
  const radar = datos?.searchConsole?.radar;

  const kpis = ga?.kpis
    ? lista([
        fila("Usuarios", nf.format(ga.kpis.activeUsers?.current ?? 0), ga.kpis.activeUsers),
        fila("Sesiones", nf.format(ga.kpis.sessions?.current ?? 0), ga.kpis.sessions),
        fila("Páginas vistas", nf.format(ga.kpis.screenPageViews?.current ?? 0), ga.kpis.screenPageViews),
        fila("Rebote", `${Math.round((ga.kpis.bounceRate?.current ?? 0) * 100)}%`, ga.kpis.bounceRate, true),
        fila(
          "Duración media",
          `${Math.round((ga.kpis.avgSessionDuration?.current ?? 0) / 60)} min`,
          ga.kpis.avgSessionDuration,
        ),
      ])
    : `<p style="color:${GRIS};font-size:14px;margin:0">Sin datos de GA4.</p>`;

  const buscador = gsc?.kpis
    ? lista([
        fila("Clics", nf.format(gsc.kpis.clicks?.current ?? 0), gsc.kpis.clicks),
        fila("Impresiones", nf.format(gsc.kpis.impressions?.current ?? 0), gsc.kpis.impressions),
        fila("CTR", `${((gsc.kpis.ctr?.current ?? 0) * 100).toFixed(1)}%`, gsc.kpis.ctr),
        fila("Posición media", (gsc.kpis.position?.current ?? 0).toFixed(1), gsc.kpis.position, true),
      ])
    : "";

  const canales = lista(
    (ga?.channels || [])
      .slice(0, 5)
      .map((c) => fila(c.channel, nf.format(c.sessions), { changePct: c.changePct })),
  );

  const paginas = lista(
    (ga?.topPages || [])
      .slice(0, 6)
      .map((p) => fila(p.path, nf.format(p.views), { changePct: p.changePct })),
  );

  const contactos = lista(
    (ga?.conversions || [])
      .filter((c) => c.count > 0 || c.prevCount > 0)
      .map((c) => fila(c.event, nf.format(c.count), { changePct: c.changePct })),
  );

  // Lo más accionable del correo: lo que ya rankea y está cerca del top 3.
  const oportunidades = (radar?.opportunities || []).slice(0, 6);
  const seo = oportunidades.length
    ? `<table style="width:100%;border-collapse:collapse">${oportunidades
        .map(
          (o) => `<tr>
            <td style="padding:7px 0;font-size:14px;color:${TINTA}">${o.query}<br>
              <span style="font-size:12px;color:${GRIS}">${o.page || ""}</span>${
                o.recommendation
                  ? `<br><span style="font-size:12px;color:${TINTA}">${o.recommendation}</span>`
                  : ""
              }</td>
            <td style="padding:7px 0;font-size:13px;color:${GRIS};text-align:right;white-space:nowrap">
              pos ${Number(o.position ?? 0).toFixed(1)}<br>${nf.format(o.impressions ?? 0)} impr.</td>
          </tr>`,
        )
        .join("")}</table>`
    : "";

  const avisos = datos.errores?.length
    ? `<p style="margin:22px 0 0;padding:10px 12px;background:#fef2f2;border-radius:8px;color:${ROSA};font-size:13px">
        ${datos.errores.join("<br>")}</p>`
    : "";

  return `<div style="font-family:${FUENTE};max-width:560px;margin:0 auto;padding:24px;color:${TINTA}">
    <p style="margin:0 0 2px;font-size:13px;color:${GRIS}">Últimos ${datos.rangoDias || 7} días · comparado con el período anterior</p>
    <h1 style="margin:0 0 18px;font-size:20px;font-weight:700">Revisión web</h1>
    ${seccion("Tráfico", kpis)}
    ${seccion("Buscador", buscador)}
    ${seccion("De dónde vino", canales)}
    ${seccion("Páginas más vistas", paginas)}
    ${seccion("Contactos", contactos)}
    ${seccion("A un empujón del top 3", seo)}
    ${avisos}
    <p style="margin:26px 0 0;padding-top:14px;border-top:1px solid ${BORDE};font-size:12px;color:${GRIS}">
      El JSON completo va adjunto. Panel: <a href="${SITE_URL}/admin/analytics" style="color:${ROSA}">/admin/analytics</a>
    </p>
  </div>`;
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!GMAIL_APP_PASSWORD) {
    return Response.json({ ok: false, error: "Falta GMAIL_APP_PASSWORD" }, { status: 503 });
  }

  // 7 días es el rango de la revisión diaria: suficiente señal, poco ruido.
  const datos = await construirRevisionWeb(7);
  const fecha = new Date().toISOString().slice(0, 10);

  // El asunto adelanta el titular para poder triar desde la notificación.
  const usuarios = datos?.ga4?.overview?.kpis?.activeUsers;
  const resumen = usuarios
    ? `${nf.format(usuarios.current ?? 0)} usuarios (${usuarios.changePct >= 0 ? "+" : ""}${Math.round(usuarios.changePct ?? 0)}%)`
    : "sin datos de GA4";

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Revisión web" <${GMAIL_USER}>`,
      to: DESTINO,
      subject: `[revision-web] ${fecha} · ${resumen}`,
      html: buildHtml(datos),
      attachments: [
        {
          filename: `revision-web-${fecha}.json`,
          content: JSON.stringify(datos, null, 2),
          contentType: "application/json",
        },
      ],
    });
  } catch (error) {
    console.error("[revision-web-mail] no se pudo enviar", error);
    return Response.json({ ok: false, error: "No se pudo enviar el correo" }, { status: 500 });
  }

  console.info("[revision-web-mail] enviado", { generado: datos.generado, errores: datos.errores });

  return Response.json({ ok: true, generado: datos.generado, enviadoA: DESTINO });
}
