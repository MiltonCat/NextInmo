// POST /api/webhook/nueva-propiedad
// Dispara emails a usuarios cuando se crea una propiedad nueva

import { notifyUsersAboutNewProperty } from "@/lib/emailNuevaPropiedad";

// Token secreto para verificar que la llamada viene del admin
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_NUEVA_PROPIEDAD;

function verifyToken(authHeader) {
  if (!WEBHOOK_SECRET) {
    console.warn(
      "[nueva-propiedad] WEBHOOK_SECRET no configurada; no verificando token"
    );
    return true; // En desarrollo, permitir sin token
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
