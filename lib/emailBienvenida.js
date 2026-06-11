// Email de bienvenida para suscriptores nuevos. SOLO servidor.
// Envía desde la casilla de Gmail del negocio vía SMTP (nodemailer).
// Si faltan las credenciales (GMAIL_APP_PASSWORD), no envía y loguea un aviso:
// el alta del suscriptor nunca depende de que el email salga.
import nodemailer from "nodemailer";
import { SITE_URL, WA_URL, CONTACT_EMAIL } from "@/config";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Contenido según el interés declarado al suscribirse (o el origen del alta).
const CONTENIDOS = {
  comprar: {
    asunto: "Bienvenido — te avisamos antes que a nadie",
    titulo: "Vas a enterarte antes que nadie",
    cuerpo:
      "En San Martín de los Andes las mejores propiedades se venden rápido. A partir de ahora, cuando entre una propiedad nueva te llega a tu casilla antes de publicarse en los portales.",
    linkUrl: `${SITE_URL}/propiedades/`,
    linkTexto: "Ver las propiedades disponibles",
    extraUrl: `${SITE_URL}/blog/donde-vivir-san-martin-de-los-andes/`,
    extraTexto: "Guía: ¿dónde vivir en San Martín de los Andes?",
  },
  alquilar: {
    asunto: "Bienvenido — alquileres en San Martín de los Andes",
    titulo: "Te avisamos cuando entre un alquiler",
    cuerpo:
      "Los alquileres permanentes en San Martín de los Andes son escasos y duran días. Cuando entre uno nuevo a la cartera, te llega directo a tu casilla.",
    linkUrl: `${SITE_URL}/alquileres/`,
    linkTexto: "Ver los alquileres disponibles",
  },
  invertir: {
    asunto: "Bienvenido — oportunidades de inversión en la Patagonia",
    titulo: "Invertí con datos, no con promesas",
    cuerpo:
      "Analizamos el mercado de San Martín de los Andes con más de 600 propiedades relevadas. Cuando aparezca una oportunidad con números que cierran, vas a ser de los primeros en saberlo.",
    linkUrl: `${SITE_URL}/inversiones/`,
    linkTexto: "Ver el análisis de inversión",
    extraUrl: `${SITE_URL}/precio-m2/`,
    extraTexto: "Precio del m² por barrio, con datos reales",
  },
  mirar: {
    asunto: "Bienvenido a Catalán Propiedades",
    titulo: "Gracias por sumarte",
    cuerpo:
      "Te vamos a mandar novedades del mercado inmobiliario de San Martín de los Andes: propiedades nuevas, análisis de precios y oportunidades. Poco y bueno, cero spam.",
    linkUrl: `${SITE_URL}/blog/`,
    linkTexto: "Leer el blog",
  },
};

// Variante para quienes llegan desde el tasador: ya tienen su estimación,
// el paso natural siguiente es la tasación personal / venta.
const CONTENIDO_TASADOR = {
  asunto: "Tu tasación — y el paso siguiente si querés vender",
  titulo: "Ya tenés tu estimación. ¿Y ahora?",
  cuerpo:
    "El informe del tasador es un punto de partida basado en datos reales del mercado. Si estás pensando en vender, Milton puede afinar ese número con una tasación personal gratuita y contarte cómo es el proceso completo, de la publicación a la escritura.",
  linkUrl: `${SITE_URL}/vender/`,
  linkTexto: "Cómo trabajamos la venta de tu propiedad",
};

function buildHtml(c) {
  const extra =
    c.extraUrl && c.extraTexto
      ? `<p style="margin:16px 0 0"><a href="${c.extraUrl}" style="color:#e11d48;text-decoration:none">${c.extraTexto} →</a></p>`
      : "";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
    <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#e11d48;font-weight:bold;margin:0 0 12px">Catalán Propiedades</p>
    <h1 style="font-size:22px;margin:0 0 12px;color:#111827">${c.titulo}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#4b5563">${c.cuerpo}</p>
    <p style="margin:0 0 8px">
      <a href="${c.linkUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;text-decoration:none">${c.linkTexto}</a>
    </p>
    ${extra}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px">
      ¿Tenés una consulta puntual? Respondé este email o escribinos por
      <a href="${WA_URL}" style="color:#e11d48;text-decoration:none">WhatsApp</a>.
    </p>
    <p style="font-size:12px;color:#9ca3af;margin:0">
      Catalán Propiedades · San Martín de los Andes, Patagonia<br/>
      Si no querés recibir más novedades, respondé este email con la palabra BAJA y listo.
    </p>
  </div>`;
}

// Envía el email de bienvenida. Nunca lanza: cualquier error queda logueado.
export async function sendWelcomeEmail({ email, interes, source }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn("[emailBienvenida] GMAIL_APP_PASSWORD no configurada; no se envía el email de bienvenida.");
    return;
  }
  try {
    const contenido =
      source === "tasador" ? CONTENIDO_TASADOR : CONTENIDOS[interes] || CONTENIDOS.mirar;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Catalán Propiedades" <${GMAIL_USER}>`,
      to: email,
      subject: contenido.asunto,
      html: buildHtml(contenido),
    });
  } catch (err) {
    console.error("[emailBienvenida] error al enviar:", err);
  }
}
