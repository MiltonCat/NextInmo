// Email: Notificar usuarios cuando llega propiedad nueva que matchea sus favoritas

import nodemailer from "nodemailer";
import { SITE_URL, WA_URL, CONTACT_EMAIL } from "@/config";
import { getUsersWithFavoritesInLocation } from "@/lib/userPreferences";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const GMAIL_USER = process.env.GMAIL_USER || CONTACT_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function buildHtml(property, nombreUser) {
  const priceLabel = property.price
    ? `USD ${property.price.toLocaleString()}`
    : "Consultar";

  const propertyUrl = `${SITE_URL}/propiedades/${property.slug || property.id}`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
    <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#e11d48;font-weight:bold;margin:0 0 12px">Catalán Propiedades</p>

    <h1 style="font-size:22px;margin:0 0 12px;color:#111827">⚡ Nueva propiedad en ${property.location || "San Martín"}</h1>

    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#4b5563">
      Hola ${nombreUser || ""},<br/><br/>
      Acaba de llegar una propiedad que coincide con tus búsquedas.
      <strong>Alguien más la está mirando ahora.</strong>
    </p>

    ${property.photo ? `
    <div style="margin:0 0 20px;border-radius:8px;overflow:hidden">
      <img src="${property.photo}" alt="${property.title}" style="width:100%;height:auto;display:block;max-height:300px;object-fit:cover" />
    </div>
    ` : ''}

    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:0 0 20px">
      <h2 style="font-size:18px;margin:0 0 8px;color:#111827">${property.title}</h2>
      <p style="margin:0 0 8px;color:#4b5563">
        <strong>${priceLabel}</strong> ${property.bedrooms ? `· ${property.bedrooms} ambientes` : ''} ${property.area ? `· ${property.area} m²` : ''}
      </p>
      <p style="margin:0;color:#6b7280;font-size:14px">${property.location || "San Martín de los Andes"}</p>
    </div>

    <p style="margin:0 0 8px">
      <a href="${propertyUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;text-decoration:none">Ver propiedad completa →</a>
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />

    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px">
      ¿Querés hablar con nosotros sobre esta propiedad?
      <a href="${WA_URL}" style="color:#e11d48;text-decoration:none">Escribe por WhatsApp →</a>
    </p>

    <p style="font-size:12px;color:#9ca3af;margin:0">
      Catalán Propiedades · San Martín de los Andes, Patagonia<br/>
      Si no querés recibir estos avisos, respondé este email con la palabra BAJA.
    </p>
  </div>`;
}

export async function sendNewPropertyEmail({ email, nombre, property }) {
  if (!GMAIL_APP_PASSWORD) {
    console.warn(
      "[emailNuevaPropiedad] GMAIL_APP_PASSWORD no configurada; no se envía el email."
    );
    return false;
  }

  try {
    const priceLabel = property.price
      ? `USD ${property.price.toLocaleString()}`
      : "Consultar";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Catalán Propiedades" <${GMAIL_USER}>`,
      to: email,
      subject: `⚡ Nueva propiedad en ${property.location || "San Martín"} — ${priceLabel}`,
      html: buildHtml(property, nombre),
    });

    console.log(`[emailNuevaPropiedad] Sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`[emailNuevaPropiedad] Error sending to ${email}:`, err);
    return false;
  }
}

// Notificar a TODOS los usuarios que tienen favoritas en un barrio
export async function notifyUsersAboutNewProperty(property) {
  if (!property.location) {
    console.warn("[notifyUsersAboutNewProperty] property.location required");
    return 0;
  }

  try {
    // Obtener usuarios que tienen favoritas en este barrio
    const userIds = await getUsersWithFavoritesInLocation(property.location);

    if (!userIds || userIds.length === 0) {
      console.log(
        `[notifyUsersAboutNewProperty] No users with favorites in ${property.location}`
      );
      return 0;
    }

    console.log(
      `[notifyUsersAboutNewProperty] Found ${userIds.length} users in ${property.location}`
    );

    // Obtener datos de usuarios (email, nombre) desde auth.users
    const supabaseAdmin = createSupabaseAdmin();
    const { data: authUsers, error } = await supabaseAdmin.auth.admin
      .listUsers();

    if (error || !authUsers) {
      console.error(
        "[notifyUsersAboutNewProperty] Failed to fetch auth users:",
        error
      );
      return 0;
    }

    // Enviar email a cada usuario (fire & forget)
    let sent = 0;
    for (const userId of userIds) {
      const authUser = authUsers.users.find((u) => u.id === userId);
      if (!authUser) continue;

      const email = authUser.email;
      const nombre = authUser.user_metadata?.full_name || authUser.email;

      const success = await sendNewPropertyEmail({ email, nombre, property });
      if (success) sent++;
    }

    console.log(
      `[notifyUsersAboutNewProperty] Sent ${sent}/${userIds.length} emails`
    );

    return sent;
  } catch (err) {
    console.error("[notifyUsersAboutNewProperty] error:", err);
    return 0;
  }
}
