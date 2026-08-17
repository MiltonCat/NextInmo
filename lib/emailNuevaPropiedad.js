// Aviso por correo cuando entra una propiedad nueva en un barrio que a alguien
// ya le interesa. SOLO servidor.
//
// Lee los favoritos de `client_favorites`, que es la tabla real del proyecto
// (la escribe `app/cuenta/FavoriteSync` vía `syncLocalFavorites`, y la lee
// `lib/clientPortal.js`). Una versión anterior de este archivo consultaba una
// tabla `user_preferences` creada por error en paralelo: no existe más.
//
// El cruce es por `barrio` —la columna con slugs tipo `centro` o
// `chapelco-golf`— y NO por `location`, que es la dirección de la calle
// ("Rivadavia 155, San Martín de los Andes") y nunca coincidiría.

import "server-only";
import nodemailer from "nodemailer";
import { SITE_URL, WA_URL, CONTACT_EMAIL } from "@/config";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getProperties } from "@/lib/properties";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Pila de fuentes del sistema. No se puede usar una tipografía propia: Gmail y
// Outlook descartan @font-face, así que un webfont no llegaría a renderizarse.
// Estas tres son las que ya trae cada plataforma (San Francisco en Apple,
// Segoe UI en Windows, Roboto en Android): geométricas y limpias, bastante más
// cerca del aire de Cereal que la Arial que estaba antes.
const FUENTE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const ROSA = "#e11d48";
const TINTA = "#111827";
const GRIS = "#6b7280";

// Las imágenes del catálogo pueden venir con URL completa (Supabase Storage) o
// como ruta del sitio ("/foto.jpg"). En un correo la ruta relativa no resuelve
// contra nada, así que hay que completarla siempre.
function urlAbsoluta(src) {
  if (!src) return null;
  const texto = String(src);
  if (/^https?:\/\//i.test(texto)) return texto;
  return `${SITE_URL}${texto.startsWith("/") ? "" : "/"}${texto}`;
}

function buildHtml(property, nombreUser) {
  const priceLabel = property.price
    ? `USD ${Number(property.price).toLocaleString("es-AR")}`
    : "Consultar";

  const zona = property.location || "San Martín de los Andes";
  const propertyUrl = `${SITE_URL}/propiedades/${property.slug || property.id}/`;
  const saludo = nombreUser ? `Hola ${nombreUser}` : "Hola";

  // El campo del catálogo es `image`. `photo` queda como red por si el webhook
  // se llama a mano con esa clave.
  const foto = urlAbsoluta(property.image || property.photo);

  // Fila de datos: solo se arman los que la propiedad realmente tiene, para no
  // dejar separadores sueltos ni "0 ambientes".
  const datos = [
    property.bedrooms ? `${property.bedrooms} ambientes` : null,
    property.bathrooms ? `${property.bathrooms} baños` : null,
    property.area ? `${property.area} m²` : null,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Nueva propiedad en ${zona}</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f7;">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

  <tr>
    <td style="padding:28px 32px 24px;">
      <img src="${SITE_URL}/marca1.png" width="150" alt="Catalán Propiedades"
           style="display:block;border:0;width:150px;height:auto;" />
    </td>
  </tr>

  ${foto ? `
  <tr>
    <td style="padding:0;">
      <a href="${propertyUrl}" style="display:block;">
        <img src="${foto}" width="600" alt="${property.title || "Propiedad"}"
             style="display:block;border:0;width:100%;height:auto;max-height:340px;object-fit:cover;" />
      </a>
    </td>
  </tr>` : ""}

  <tr>
    <td style="padding:32px;">

      <p style="margin:0 0 6px;font-family:${FUENTE};font-size:13px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:${ROSA};">
        Nueva en ${zona}
      </p>

      <h1 style="margin:0 0 20px;font-family:${FUENTE};font-size:26px;line-height:1.25;font-weight:700;color:${TINTA};">
        ${property.title || "Propiedad nueva"}
      </h1>

      <p style="margin:0 0 4px;font-family:${FUENTE};font-size:30px;font-weight:700;color:${TINTA};letter-spacing:-0.5px;">
        ${priceLabel}
      </p>

      ${datos.length ? `
      <p style="margin:0 0 28px;font-family:${FUENTE};font-size:15px;color:${GRIS};">
        ${datos.join(" &nbsp;·&nbsp; ")}
      </p>` : `<div style="height:20px;"></div>`}

      <p style="margin:0 0 28px;font-family:${FUENTE};font-size:16px;line-height:1.65;color:#374151;">
        ${saludo}: guardaste favoritos en esta zona, así que te avisamos apenas
        entró esta publicación a la cartera. Todavía no salió en los portales.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="background:${ROSA};border-radius:12px;">
            <a href="${propertyUrl}"
               style="display:block;padding:16px 24px;font-family:${FUENTE};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
              Ver la propiedad
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <tr><td style="padding:0 32px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>

  <tr>
    <td style="padding:28px 32px 32px;">
      <p style="margin:0 0 14px;font-family:${FUENTE};font-size:16px;font-weight:700;color:${TINTA};">
        Milton Catalán
      </p>
      <p style="margin:0 0 16px;font-family:${FUENTE};font-size:14px;line-height:1.6;color:${GRIS};">
        Catalán Propiedades · San Martín de los Andes
      </p>
      <p style="margin:0 0 6px;font-family:${FUENTE};font-size:15px;line-height:1.6;">
        <a href="mailto:${CONTACT_EMAIL}" style="color:${ROSA};text-decoration:none;font-weight:600;">${CONTACT_EMAIL}</a>
      </p>
      <p style="margin:0;font-family:${FUENTE};font-size:15px;line-height:1.6;">
        <a href="${WA_URL}" style="color:${ROSA};text-decoration:none;font-weight:600;">WhatsApp</a>
        <span style="color:#d1d5db;"> · </span>
        <a href="${SITE_URL}" style="color:${ROSA};text-decoration:none;font-weight:600;">catalanpropiedades.com.ar</a>
      </p>
    </td>
  </tr>

</table>

<p style="margin:20px 0 0;font-family:${FUENTE};font-size:12px;line-height:1.6;color:#9ca3af;max-width:600px;">
  Recibís este correo porque guardaste propiedades en tu cuenta de Catalán Propiedades.<br/>
  Si no querés más avisos, respondé este correo con la palabra BAJA.
</p>

</td></tr>
</table>
</body>
</html>`;
}

// Manda un correo. Nunca lanza: un fallo no puede cortar el envío al resto.
export async function sendNewPropertyEmail({ email, nombre, property }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn("[emailNuevaPropiedad] GMAIL_APP_PASSWORD no configurada; no se envía.");
    return false;
  }

  try {
    const zona = property.location || "San Martín de los Andes";
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Catalán Propiedades" <${GMAIL_USER}>`,
      // Las respuestas van a la casilla del negocio, no a la que envía.
      replyTo: CONTACT_EMAIL,
      to: email,
      subject: `Nueva propiedad en ${zona}`,
      html: buildHtml(property, nombre),
    });

    return true;
  } catch (err) {
    console.error(`[emailNuevaPropiedad] error enviando a ${email}:`, err);
    return false;
  }
}

// Quiénes tienen algún favorito en el mismo barrio que la propiedad nueva.
// Devuelve una lista de user_id sin repetir.
async function usuariosConFavoritosEnBarrio(barrio) {
  const todas = await getProperties();
  const idsDelBarrio = todas
    .filter((p) => p.barrio && p.barrio === barrio)
    .map((p) => Number(p.id))
    .filter(Number.isSafeInteger);

  if (idsDelBarrio.length === 0) return [];

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("client_favorites")
    .select("user_id")
    .in("property_id", idsDelBarrio);

  if (error) {
    console.error("[emailNuevaPropiedad] error leyendo client_favorites:", error.message);
    return [];
  }

  return [...new Set((data || []).map((r) => r.user_id))];
}

// Correo y nombre de cada usuario, resueltos contra auth.users.
async function datosDeUsuarios(userIds) {
  if (userIds.length === 0) return [];

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error || !data?.users) {
    console.error("[emailNuevaPropiedad] no se pudo listar usuarios:", error?.message);
    return [];
  }

  const buscados = new Set(userIds);
  return data.users
    .filter((u) => buscados.has(u.id) && u.email)
    .map((u) => ({
      email: u.email,
      nombre: u.user_metadata?.full_name || u.user_metadata?.name || null,
    }));
}

// Punto de entrada del webhook.
//
// `soloA` es el modo de prueba: calcula igual la lista real de destinatarios
// —así se verifica que el cruce por barrio funciona— pero manda el correo a
// esa única dirección. Existe porque los favoritos son de personas reales y
// no hay forma de probar el envío sin escribirle a un cliente.
//
// Devuelve { destinatarios, enviados, modo }.
export async function notifyUsersAboutNewProperty(property, { soloA = null } = {}) {
  const barrio = property?.barrio;
  const modo = soloA ? "prueba" : "real";

  // Sin barrio no hay a quién avisarle. Mandar a todos sería spam, así que
  // preferimos no mandar nada y dejarlo anotado en el log.
  if (!barrio) {
    console.warn(
      `[emailNuevaPropiedad] la propiedad ${property?.id} no tiene barrio: no se avisa a nadie.`
    );
    return { destinatarios: 0, enviados: 0, modo };
  }

  try {
    const userIds = await usuariosConFavoritosEnBarrio(barrio);
    if (userIds.length === 0) {
      console.log(`[emailNuevaPropiedad] nadie tiene favoritos en "${barrio}".`);
      return { destinatarios: 0, enviados: 0, modo };
    }

    const usuarios = await datosDeUsuarios(userIds);

    // En prueba se reemplaza la lista entera por el único destinatario pedido.
    // El conteo de `destinatarios` sigue reflejando a cuánta gente le habría
    // llegado de verdad, que es el dato que se quiere verificar.
    const aQuienesLeMando = soloA
      ? [{ email: soloA, nombre: null }]
      : usuarios;

    let enviados = 0;
    for (const usuario of aQuienesLeMando) {
      if (await sendNewPropertyEmail({ ...usuario, property })) enviados++;
    }

    console.log(
      `[emailNuevaPropiedad] barrio "${barrio}": ${usuarios.length} destinatarios reales, ` +
        `${enviados} correos enviados (modo ${modo}).`
    );

    return { destinatarios: usuarios.length, enviados, modo };
  } catch (err) {
    console.error("[emailNuevaPropiedad] error general:", err);
    return { destinatarios: 0, enviados: 0, modo };
  }
}
