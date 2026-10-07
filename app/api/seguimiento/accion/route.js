// Los dos enlaces del mail mensual: darse de baja y "quiero vender".
//
// El GET solo muestra una página con un botón; la acción la hace el POST.
// Es a propósito: los filtros de correo (Outlook Safe Links, antivirus) abren
// los enlaces solos para revisarlos, y si el GET diera de baja, la gente se
// daría de baja sin haber tocado nada.
import nodemailer from "nodemailer";
import { CONTACT_EMAIL, SITE_URL, WA_URL } from "@/config";
import { darDeBaja, marcarQuiereVender, seguimientoPorToken } from "@/lib/seguimientoValor";
import { insertInquiry } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const escapar = (texto) =>
  String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function pagina(titulo, cuerpo) {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapar(titulo)} · Catalán Propiedades</title>
<style>body{margin:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827}main{max-width:460px;margin:12vh auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)}h1{font-size:22px;margin:0 0 10px}p{color:#4b5563;line-height:1.55}button,.btn{display:inline-block;margin-top:14px;border:0;border-radius:10px;padding:12px 18px;background:#e11d48;color:#fff;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer}.sec{background:#fff;color:#111827;border:1px solid #d1d5db;margin-left:8px}a{color:#e11d48}</style></head>
<body><main>${cuerpo}<p style="margin-top:26px;font-size:13px"><a href="${SITE_URL}/">catalanpropiedades.com.ar</a></p></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function leer(request) {
  const url = new URL(request.url);
  return { token: url.searchParams.get("t"), accion: url.searchParams.get("a") };
}

export async function GET(request) {
  const { token, accion } = leer(request);
  const seguimiento = await seguimientoPorToken(token).catch(() => null);
  if (!seguimiento || !["baja", "vender"].includes(accion)) {
    return pagina("Enlace vencido", `<h1>Este enlace no es válido</h1><p>Puede que ya no exista. Si necesitás algo, escribinos por <a href="${WA_URL}">WhatsApp</a>.</p>`);
  }

  const etiqueta = escapar(seguimiento.etiqueta);
  const destino = `?t=${encodeURIComponent(token)}&a=${accion}`;
  if (accion === "baja") {
    if (!seguimiento.activo) return pagina("Listo", `<h1>Ya estás dado de baja</h1><p>No te vamos a escribir más sobre tu ${etiqueta}.</p>`);
    return pagina(
      "Dejar de recibir",
      `<h1>¿Dejamos de escribirte?</h1><p>Vas a dejar de recibir el valor mensual de tu ${etiqueta}.</p><form method="post" action="${destino}"><button type="submit">Sí, dar de baja</button></form>`
    );
  }
  return pagina(
    "Quiero vender",
    `<h1>¿Querés vender tu ${etiqueta}?</h1><p>Le avisamos a Milton y te contacta para hacer una tasación profesional, sin compromiso.</p><form method="post" action="${destino}"><button type="submit">Sí, que me contacten</button></form>`
  );
}

export async function POST(request) {
  const { token, accion } = leer(request);
  const seguimiento = await seguimientoPorToken(token).catch(() => null);
  if (!seguimiento || !["baja", "vender"].includes(accion)) {
    return pagina("Enlace vencido", `<h1>Este enlace no es válido</h1><p>Si necesitás algo, escribinos por <a href="${WA_URL}">WhatsApp</a>.</p>`);
  }

  const etiqueta = escapar(seguimiento.etiqueta);

  if (accion === "baja") {
    await darDeBaja(token);
    return pagina("Listo", `<h1>Listo, no te escribimos más</h1><p>Te diste de baja del valor mensual de tu ${etiqueta}. Si cambiás de idea, podés volver a tasar en el sitio y anotarte de nuevo.</p>`);
  }

  // Quiere vender: queda como consulta en el panel y le llega un aviso a Milton.
  // Si ya lo había pedido, no se duplica la consulta.
  if (!seguimiento.quiere_vender) {
    await marcarQuiereVender(token);
    const valor = Number(seguimiento.valor_ultimo);
    await insertInquiry({
      tipo: "tasacion",
      nombre: seguimiento.nombre || null,
      email: seguimiento.email,
      mensaje: `Quiere vender. Venía siguiendo el valor de su ${seguimiento.etiqueta}${valor ? ` (último valor estimado: USD ${valor.toLocaleString("es-AR")})` : ""}.`,
      detalle: { origen: "seguimiento_valor", seguimiento_id: seguimiento.id, etiqueta: seguimiento.etiqueta, payload: seguimiento.payload },
    }).catch((err) => console.error("[seguimiento/accion] no se pudo crear la consulta:", err));

    if (GMAIL_APP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
        await transporter.sendMail({
          from: `"Catalán Propiedades" <${GMAIL_USER}>`,
          to: CONTACT_EMAIL,
          subject: `Quiere vender: ${seguimiento.etiqueta}`,
          html: `<p><b>${escapar(seguimiento.nombre || seguimiento.email)}</b> tocó "Quiero vender" en el mail mensual del valor.</p><p>Propiedad: ${etiqueta}<br>Correo: ${escapar(seguimiento.email)}${valor ? `<br>Último valor estimado: USD ${valor.toLocaleString("es-AR")}` : ""}</p><p>Quedó también en el panel de consultas.</p>`,
        });
      } catch (err) {
        console.error("[seguimiento/accion] no se pudo avisar por correo:", err);
      }
    }
  }

  return pagina(
    "¡Gracias!",
    `<h1>¡Gracias! Milton te va a contactar</h1><p>Te escribe al correo con el que te anotaste para coordinar una tasación profesional de tu ${etiqueta}.</p><a class="btn" href="${WA_URL}?text=${encodeURIComponent(`Hola Milton, quiero vender mi ${seguimiento.etiqueta}.`)}">Escribir por WhatsApp ahora</a>`
  );
}
