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

function buildHtml(property, nombreUser) {
  const priceLabel = property.price
    ? `USD ${Number(property.price).toLocaleString("es-AR")}`
    : "Consultar";

  const zona = property.location || "San Martín de los Andes";
  const propertyUrl = `${SITE_URL}/propiedades/${property.slug || property.id}/`;
  const saludo = nombreUser ? `Hola ${nombreUser},` : "Hola,";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
    <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#e11d48;font-weight:bold;margin:0 0 12px">Catalán Propiedades</p>

    <h1 style="font-size:22px;margin:0 0 12px;color:#111827">Entró una propiedad en una zona que venías mirando</h1>

    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#4b5563">
      ${saludo}<br/><br/>
      Guardaste favoritos en esta zona, así que te avisamos apenas entró esta
      publicación nueva a la cartera.
    </p>

    ${property.photo ? `
    <div style="margin:0 0 20px;border-radius:8px;overflow:hidden">
      <img src="${property.photo}" alt="" style="width:100%;height:auto;display:block;max-height:300px;object-fit:cover" />
    </div>
    ` : ""}

    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:0 0 20px">
      <h2 style="font-size:18px;margin:0 0 8px;color:#111827">${property.title || "Propiedad nueva"}</h2>
      <p style="margin:0 0 8px;color:#4b5563">
        <strong>${priceLabel}</strong>${property.bedrooms ? ` · ${property.bedrooms} ambientes` : ""}${property.area ? ` · ${property.area} m²` : ""}
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px">${zona}</p>
    </div>

    <p style="margin:0 0 8px">
      <a href="${propertyUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;text-decoration:none">Ver la propiedad</a>
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />

    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px">
      ¿Querés verla o tenés una consulta? Respondé este correo o escribinos por
      <a href="${WA_URL}" style="color:#e11d48;text-decoration:none">WhatsApp</a>.
    </p>

    <p style="font-size:12px;color:#9ca3af;margin:0">
      Catalán Propiedades · San Martín de los Andes, Patagonia<br/>
      Si no querés recibir estos avisos, respondé este correo con la palabra BAJA.
    </p>
  </div>`;
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
