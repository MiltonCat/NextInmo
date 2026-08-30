/**
 * Aviso a los buscadores de que una URL cambió, por IndexNow.
 *
 * Por qué importa más de lo que parece: ChatGPT responde apoyándose en el
 * índice de Bing, y el análisis de citas muestra que la enorme mayoría de lo
 * que cita coincide con los primeros resultados de Bing. Estar indexado ahí
 * dejó de ser un detalle de SEO y pasó a ser el requisito para que un asistente
 * pueda nombrarte. IndexNow es la vía directa: en vez de esperar a que pasen a
 * mirar, se les avisa.
 *
 * Un solo POST alcanza para Bing, Yandex, Naver y Seznam, que comparten el
 * protocolo. Google no participa y sigue por sitemap.
 *
 * La clave vive en public/${INDEXNOW_KEY}.txt: el buscador la pide para
 * confirmar que quien avisa controla el dominio. Si se rota la clave hay que
 * renombrar ese archivo también.
 */
import { SITE_URL } from "@/config";

export const INDEXNOW_KEY = "33fce6d5d904424a7631679f9ef8dd4a";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Avisa por un puñado de URLs. Es fire-and-forget desde el punto de vista del
 * llamador: nunca lanza. Un aviso perdido no vale romper un alta de propiedad.
 * Devuelve { ok, status } para poder loguearlo.
 */
export async function avisarIndexNow(urls) {
  const lista = (Array.isArray(urls) ? urls : [urls]).filter(Boolean).slice(0, 100);
  if (!lista.length) return { ok: false, status: "sin urls" };

  let host;
  try {
    host = new URL(SITE_URL).hostname;
  } catch {
    return { ok: false, status: "SITE_URL inválida" };
  }

  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: lista,
      }),
    });
    // 200 y 202 son los dos "recibido". 422 suele ser clave o host mal puestos.
    return { ok: respuesta.status === 200 || respuesta.status === 202, status: respuesta.status };
  } catch (error) {
    return { ok: false, status: error.message };
  }
}
