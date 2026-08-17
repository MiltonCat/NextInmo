// POST /api/webhook/nueva-propiedad
// Dispara emails a usuarios cuando se crea una propiedad nueva

import { notifyUsersAboutNewProperty } from "@/lib/emailNuevaPropiedad";

// Token secreto para verificar que la llamada viene del admin.
//
// Este endpoint manda correos a personas reales: si queda abierto, cualquiera
// que descubra la URL puede spamear a toda la lista y quemar la cuota de Gmail.
// Por eso, cuando falta el secreto en producción, RECHAZA en vez de permitir.
// La versión anterior devolvía `true` en ese caso "para desarrollo" y eso dejó
// el endpoint público durante el primer deploy.
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_NUEVA_PROPIEDAD;
const EN_PRODUCCION = process.env.NODE_ENV === "production";

function verifyToken(authHeader) {
  if (!WEBHOOK_SECRET) {
    if (EN_PRODUCCION) {
      console.error(
        "[nueva-propiedad] WEBHOOK_SECRET_NUEVA_PROPIEDAD no configurada en producción: se rechaza el pedido."
      );
      return false;
    }
    console.warn(
      "[nueva-propiedad] WEBHOOK_SECRET no configurada; en desarrollo se permite sin token."
    );
    return true;
  }

  const token = authHeader?.replace("Bearer ", "");
  return token === WEBHOOK_SECRET;
}

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("Authorization");
    if (!verifyToken(authHeader)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parsear body
    const body = await request.json();
    const { property } = body;

    if (!property || !property.id) {
      return Response.json(
        { error: "Missing property data" },
        { status: 400 }
      );
    }

    console.log(
      `[nueva-propiedad] Received property ${property.id}: ${property.title}`
    );

    // Enviar emails en background (no bloquea la respuesta)
    const sent = await notifyUsersAboutNewProperty(property);

    return Response.json(
      { ok: true, property_id: property.id, emails_sent: sent },
      { status: 200 }
    );
  } catch (error) {
    console.error("[nueva-propiedad] error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
