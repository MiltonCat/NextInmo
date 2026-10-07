// El mail mensual de "Seguí el valor de tu propiedad". SOLO servidor.
//
// Regla de contenido: solo números que salen del modelo o del índice del
// barrio. Si algo no está (mes anterior, movimiento del barrio), la línea no
// aparece; nunca se rellena.
import "server-only";
import nodemailer from "nodemailer";
import { CONTACT_EMAIL, SITE_URL, WA_URL } from "@/config";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const FUENTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const ROSA = "#e11d48";
const TINTA = "#111827";
const GRIS = "#6b7280";
const VERDE = "#047857";

const usd = (n) => `USD ${Math.round(Number(n)).toLocaleString("es-AR")}`;
const escapar = (texto) =>
  String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function variacion(pct) {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) return "";
  if (Math.abs(pct) < 0.5) return `<span style="color:${GRIS}">sin cambios</span>`;
  const sube = pct > 0;
  return `<span style="color:${sube ? VERDE : ROSA}">${sube ? "▲" : "▼"} ${Math.abs(pct).toLocaleString("es-AR")}%</span>`;
}

export function armarMailSeguimiento({ seguimiento, resultado, barrio }) {
  const enlace = (a) => `${SITE_URL}/api/seguimiento/accion/?t=${seguimiento.token}&a=${a}`;
  const anterior = Number(seguimiento.valor_ultimo);
  const cambioPct =
    anterior > 0 ? Math.round(((resultado.valorTotal - anterior) / anterior) * 1000) / 10 : null;
  const saludo = seguimiento.nombre ? `Hola ${escapar(seguimiento.nombre)},` : "Hola,";
  const etiqueta = escapar(seguimiento.etiqueta);
  const tipoPlural = seguimiento.tipo === "Departamento" ? "Los departamentos" : `Las ${String(seguimiento.tipo).toLowerCase()}s`;

  const lineaAnterior = anterior > 0
    ? `<p style="margin:8px 0 0;font-size:14px;color:${GRIS}">El mes pasado: ${usd(anterior)} · ${variacion(cambioPct)}</p>`
    : "";

  const rango = Number.isFinite(resultado.rangoMin) && Number.isFinite(resultado.rangoMax)
    ? `<p style="margin:6px 0 0;font-size:13px;color:${GRIS}">Rango probable: ${usd(resultado.rangoMin)} a ${usd(resultado.rangoMax)}</p>`
    : "";

  const bloqueBarrio = barrio
    ? `<tr><td style="padding:0 32px 24px">
        <div style="border:1px solid #f1d5dc;border-radius:12px;padding:16px 18px;background:#fff7f9">
          <p style="margin:0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${GRIS};font-weight:600">Tu barrio</p>
          <p style="margin:6px 0 0;font-size:15px;color:${TINTA}">${tipoPlural} en ${escapar(seguimiento.barrio)} se publican a una mediana de <b>${usd(barrio.medianaM2)}/m²</b> (${barrio.n} publicaciones).</p>
          ${barrio.variacionPct !== null ? `<p style="margin:6px 0 0;font-size:14px">Contra el mes anterior: ${variacion(barrio.variacionPct)}</p>` : ""}
        </div>
      </td></tr>`
    : "";

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>El valor de tu propiedad</title></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:${FUENTE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f7"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
  <tr><td style="padding:28px 32px 8px">
    <p style="margin:0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${ROSA};font-weight:700">El valor de tu propiedad · este mes</p>
    <p style="margin:14px 0 0;font-size:16px;color:${TINTA}">${saludo}</p>
    <p style="margin:8px 0 0;font-size:15px;color:#374151;line-height:1.55">Así está hoy tu <b>${etiqueta}</b> según nuestro modelo:</p>
  </td></tr>
  <tr><td style="padding:12px 32px 24px">
    <p style="margin:0;font-size:34px;font-weight:700;color:${TINTA};letter-spacing:-.02em">${usd(resultado.valorTotal)}</p>
    ${rango}
    ${lineaAnterior}
  </td></tr>
  ${bloqueBarrio}
  <tr><td style="padding:0 32px 28px">
    <a href="${enlace("vender")}" style="display:inline-block;background:${ROSA};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:10px">Quiero vender</a>
    <a href="${WA_URL}" style="display:inline-block;margin-left:8px;color:${TINTA};text-decoration:none;font-weight:600;font-size:15px;padding:11px 18px;border-radius:10px;border:1px solid #d1d5db">Hablar por WhatsApp</a>
  </td></tr>
  <tr><td style="padding:18px 32px 26px;border-top:1px solid #eee">
    <p style="margin:0;font-size:12px;color:${GRIS};line-height:1.5">Es una estimación automática sobre precios de publicación de la zona, no una tasación profesional. Para un valor firmado, tocá "Quiero vender" y te contactamos.</p>
    <p style="margin:10px 0 0;font-size:12px;color:${GRIS}">Catalán Propiedades · San Martín de los Andes · <a href="${enlace("baja")}" style="color:${GRIS}">Dejar de recibir este correo</a></p>
  </td></tr>
</table></td></tr></table></body></html>`;

  return {
    asunto: `Tu ${seguimiento.etiqueta}: ${usd(resultado.valorTotal)} este mes`,
    html,
  };
}

export async function enviarMailSeguimiento({ seguimiento, resultado, barrio }) {
  if (!GMAIL_APP_PASSWORD) throw new Error("Falta GMAIL_APP_PASSWORD");
  const { asunto, html } = armarMailSeguimiento({ seguimiento, resultado, barrio });
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  await transporter.sendMail({
    from: `"Catalán Propiedades" <${GMAIL_USER}>`,
    to: seguimiento.email,
    subject: asunto,
    html,
    headers: { "List-Unsubscribe": `<${SITE_URL}/api/seguimiento/accion/?t=${seguimiento.token}&a=baja>` },
  });
}
