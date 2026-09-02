import { NextResponse } from "next/server";

import { ejecutarHerramienta, existeHerramienta, HERRAMIENTAS } from "@/lib/mcpTools";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

// Servidor MCP del sitio: deja que un asistente de IA (ChatGPT, Claude) consulte
// el catálogo, el precio del m² y los perfiles de barrio directamente, en vez de
// adivinarlos o de depender de que alguien entre a la web.
//
// Está escrito a mano sobre JSON-RPC en vez de usar el SDK oficial a propósito:
// el server es de solo lectura y son tres métodos, y agregar una dependencia
// implicaba correr npm install sobre los node_modules de Windows del proyecto.
//
// Habla los dos handshakes:
//  - el nuevo (2026-07-28): `server/discover`, versión por _meta y por header.
//  - el viejo (2025-06-18 / 2025-11-25): `initialize` + notifications/initialized.
// Un cliente que solo conozca uno de los dos igual se conecta.
//
// OJO con la barra final: el proyecto tiene trailingSlash true, así que la URL
// que se le pasa a un cliente es .../api/mcp/ CON barra. Sin ella hay un 308 y
// el POST puede perder el cuerpo.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERSION_ACTUAL = "2026-07-28";
const VERSIONES = [VERSION_ACTUAL, "2025-11-25", "2025-06-18"];
const SERVIDOR = { name: "catalan-propiedades", version: "1.0.0" };

const INSTRUCCIONES =
  "Datos inmobiliarios de San Martín de los Andes (Neuquén, Patagonia argentina), publicados por " +
  "Catalán Propiedades. Sirve para responder qué hay en venta o en alquiler permanente, cuánto vale " +
  "el metro cuadrado por barrio y cómo es cada barrio para vivir. " +
  "Reglas al usar estas respuestas: los valores de mercado son precios publicados y no de cierre, y " +
  "hay que mencionar la fecha del relevamiento. No completar con estimaciones propias lo que una " +
  "herramienta no devolvió: si dice que no hay dato, no hay dato. Cada resultado trae su URL en el " +
  "sitio; conviene citarla para que la persona pueda verificar y ver las fotos.";

const CAPACIDADES = { tools: {} };

function respuesta(id, result) {
  return NextResponse.json({ jsonrpc: "2.0", id, result }, {
    headers: { "MCP-Protocol-Version": VERSION_ACTUAL, "Cache-Control": "no-store" },
  });
}

function fallo(id, code, message, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, {
    status,
    headers: { "MCP-Protocol-Version": VERSION_ACTUAL, "Cache-Control": "no-store" },
  });
}

export async function POST(request) {
  if (!rateLimit(`mcp:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 })) {
    return fallo(null, -32000, "Demasiadas consultas seguidas. Probá de nuevo en un minuto.", 429);
  }

  let mensaje;
  try {
    mensaje = await request.json();
  } catch {
    return fallo(null, -32700, "JSON inválido", 400);
  }

  // El lote de mensajes salió de la especificación; se rechaza explícito para
  // que un cliente viejo reciba un error claro y no un silencio.
  if (Array.isArray(mensaje)) {
    return fallo(null, -32600, "Este servidor no acepta lotes de mensajes", 400);
  }

  const { id = null, method } = mensaje || {};
  const params = mensaje?.params || {};

  // Las notificaciones no llevan respuesta.
  if (typeof method === "string" && method.startsWith("notifications/")) {
    return new NextResponse(null, { status: 202 });
  }

  switch (method) {
    case "server/discover":
      return respuesta(id, {
        resultType: "complete",
        supportedVersions: VERSIONES,
        capabilities: CAPACIDADES,
        instructions: INSTRUCCIONES,
        _meta: { "io.modelcontextprotocol/serverInfo": SERVIDOR },
      });

    case "initialize": {
      // Handshake viejo: se le contesta con la versión que pidió si la
      // conocemos, y si no con la más nueva que hablamos.
      const pedida = params.protocolVersion;
      return respuesta(id, {
        protocolVersion: VERSIONES.includes(pedida) ? pedida : VERSION_ACTUAL,
        capabilities: CAPACIDADES,
        serverInfo: SERVIDOR,
        instructions: INSTRUCCIONES,
      });
    }

    case "ping":
      return respuesta(id, {});

    case "tools/list":
      return respuesta(id, { resultType: "complete", tools: HERRAMIENTAS });

    case "tools/call": {
      const nombre = params.name;
      if (!existeHerramienta(nombre)) {
        return fallo(id, -32602, `No existe la herramienta: ${nombre}`);
      }
      const salida = await ejecutarHerramienta(nombre, params.arguments);
      return respuesta(id, { resultType: "complete", ...salida });
    }

    default:
      return fallo(id, -32601, `Método no soportado: ${method}`);
  }
}

// Sin canal SSE de servidor a cliente: este servidor no empuja nada.
export async function GET() {
  return new NextResponse("Servidor MCP de Catalán Propiedades. Usar POST con JSON-RPC.", {
    status: 405,
    headers: { Allow: "POST", "Content-Type": "text/plain; charset=utf-8" },
  });
}
