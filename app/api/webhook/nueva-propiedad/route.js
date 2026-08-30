// POST /api/webhook/nueva-propiedad
// Dispara emails a usuarios cuando se crea una propiedad nueva

import { notifyUsersAboutNewProperty } from "@/lib/emailNuevaPropiedad";
import { avisarIndexNow } from "@/lib/indexNow";
import { getPropertySlug } from "@/data/properties";
import { canonicalUrl } from "@/config";

// Token secreto para verificar que la llamada viene del admin.
//
// Este endpoint manda correos a personas reales: si queda abierto, cualquiera
// que descubra la URL puede spamear a toda la lista y quemar la cuota de Gmail.
// Por eso, cuando falta el secreto en producción, RECHAZA en vez de permitir.
// La versión anterior devolvía `true` en ese caso "para desarrollo" y eso dejó
// el endpoint público durante el primer deploy.
//
// Se recorta con trim() a propósito: al pegar el valor en el panel de Vercel
// se cuelan espacios o un salto de línea con facilidad, y como la variable
// está marcada Sensitive no se puede volver a leer para comparar. Sin el trim,
// ese carácter invisible da un 401 imposible de diagnosticar desde afuera.
const WEBHOOK_SECRET = (process.env.WEBHOOK_SECRET_NUEVA_PROPIEDAD || "").trim();
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

  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const coincide = token === WEBHOOK_SECRET;

  // Sin filtrar el secreto: solo lo suficiente para distinguir "no llegó el
  // token" de "llegó pero no coincide", que es la duda real cuando falla.
  if (!coincide) {
    console.error(
      `[nueva-propiedad] token rechazado (recibido: ${token.length} caracteres, ` +
        `esperado: ${WEBHOOK_SECRET.length}).`
    );
  }

  return coincide;
}

export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("Authorization");
    if (!verifyToken(authHeader)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { property } = body;

    if (!property || !property.id) {
      return Response.json({ error: "Falta el objeto property" }, { status: 400 });
    }

    // Modo de prueba: si viene `testEmail`, el correo sale SOLO a esa
    // dirección. La lista real de destinatarios se calcula igual y se informa
    // en la respuesta, así se puede verificar el cruce por barrio sin
    // escribirle a ningún cliente.
    const testEmail = typeof body.testEmail === "string" ? body.testEmail.trim() : null;
    const esPrueba = Boolean(testEmail);

    console.log(
      `[nueva-propiedad] propiedad ${property.id} ("${property.title}"), ` +
        `barrio "${property.barrio || "sin barrio"}"${esPrueba ? ` — PRUEBA a ${testEmail}` : ""}`
    );

    const resultado = await notifyUsersAboutNewProperty(property, {
      soloA: testEmail,
    });

    // Aviso a los buscadores. En una prueba no se manda: no tiene sentido
    // pedirle a Bing que recorra una URL que capaz ni existe todavía.
    let indexNow = null;
    if (!esPrueba) {
      indexNow = await avisarIndexNow([
        canonicalUrl(`/propiedades/${getPropertySlug(property)}`),
        canonicalUrl("/propiedades"),
        canonicalUrl("/"),
      ]);
      console.log(
        `[nueva-propiedad] IndexNow ${indexNow.ok ? "aceptado" : "rechazado"} (${indexNow.status})`
      );
    }

    return Response.json(
      {
        ok: true,
        property_id: property.id,
        barrio: property.barrio || null,
        modo: resultado.modo,
        destinatarios_reales: resultado.destinatarios,
        correos_enviados: resultado.enviados,
        indexnow: indexNow,
      },
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
