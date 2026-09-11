import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const texto = (value, fallback = "No especificado") => String(value ?? fallback).slice(0, 180);
const usd = (value) => `USD ${Math.round(Number(value) || 0).toLocaleString("es-AR")}`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { datos = {}, resultado = {}, contexto = {} } = body;
    if (!datos.tipo || !datos.barrio || !Number.isFinite(Number(resultado.valorTotal))) {
      return NextResponse.json({ error: "datos_incompletos" }, { status: 400 });
    }

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const logoBytes = await readFile(path.join(process.cwd(), "public", "logo-catalan.png"));
    const logo = await pdf.embedPng(logoBytes);
    const dark = rgb(0.08, 0.08, 0.08);
    const gray = rgb(0.38, 0.38, 0.38);
    const light = rgb(1, 1, 1);
    const accent = rgb(0.52, 0.12, 0.24);
    const draw = (text, x, y, size = 10, font = regular, color = dark) => page.drawText(texto(text, ""), { x, y, size, font, color });
    const line = (y) => page.drawLine({ start: { x: 42, y }, end: { x: 553, y }, thickness: 0.7, color: rgb(0.82, 0.82, 0.80) });
    const box = (x, y, width, height, color) => page.drawRectangle({ x, y, width, height, color });

    box(0, 780, 595, 62, light);
    const logoScale = Math.min(220 / logo.width, 28 / logo.height);
    page.drawImage(logo, { x: 42, y: 795, width: logo.width * logoScale, height: logo.height * logoScale });
    draw(new Date().toLocaleDateString("es-AR"), 470, 812, 8, regular, gray);
    line(770);

    draw("IDENTIFICACION DEL INMUEBLE", 42, 742, 10, bold, accent);
    draw(`Referencia: ${datos.referencia || "Tasacion sin referencia"}`, 42, 718, 10, regular, gray);
    draw(`Ubicacion: ${datos.direccion || datos.barrio}`, 42, 701, 10, regular, gray);
    draw(`${datos.tipo} · ${datos.barrio} · ${datos.superficie} m2 cubiertos`, 42, 684, 10, regular, gray);
    line(665);

    box(42, 548, 511, 96, rgb(0.98, 0.96, 0.95));
    draw("VALOR ESTIMADO DE MERCADO", 62, 616, 10, bold, accent);
    draw(usd(resultado.valorTotal), 62, 575, 28, bold, dark);
    draw(`${usd(resultado.valorM2)} por m2 cubierto`, 382, 580, 12, bold, dark);
    draw(`Rango sugerido: ${usd(resultado.rangoMin)} - ${usd(resultado.rangoMax)}`, 62, 558, 10, regular, gray);

    draw("LECTURA DEL RESULTADO", 42, 510, 10, bold, accent);
    const lectura = [
      ["Rango estimado", resultado.intervaloPct ? `Puede variar aproximadamente ±${Math.round(resultado.intervaloPct)}%` : "Calculado por el modelo"],
      ["Comparables", contexto.nBarrio ? `${contexto.nBarrio} propiedades relevadas en el barrio` : "Comparables locales consultados"],
      ["Mercado", contexto.medianaBarrio ? `Mediana del barrio: ${usd(contexto.medianaBarrio)} / m2` : "Referencia local disponible en la tasacion"],
      ["Modelo", resultado.modelo || "Modelo predictivo inmobiliario"],
    ];
    lectura.forEach(([label, value], index) => {
      const y = 482 - index * 24;
      draw(`${label}:`, 42, y, 10, bold, dark);
      draw(value, 125, y, 10, regular, gray);
    });

    line(380);
    draw("FICHA TECNICA", 42, 355, 10, bold, accent);
    const ficha = [
      ["Superficie cubierta", `${datos.superficie || "-"} m2`],
      ["Superficie de terreno", datos.superficieTerreno ? `${datos.superficieTerreno} m2` : "No especificada"],
      ["Dormitorios / banos", `${datos.dormitorios ?? "-"} / ${datos.banos ?? "-"}`],
      ["Ambientes / cocheras", `${datos.ambientes ?? "-"} / ${datos.cocheras ?? "-"}`],
      ["Caracteristicas", Array.isArray(datos.extras) && datos.extras.length ? datos.extras.join(", ") : "Sin extras declarados"],
    ];
    ficha.forEach(([label, value], index) => {
      const y = 329 - index * 22;
      draw(label, 42, y, 9, bold, dark);
      draw(value, 180, y, 9, regular, gray);
    });

    line(198);
    draw("METODOLOGIA Y ALCANCE", 42, 174, 10, bold, accent);
    const nota = "Estimacion orientativa basada en datos de oferta del mercado local, variables de la propiedad y modelos segmentados. El precio publicado puede diferir del precio de cierre. Este informe no reemplaza una tasacion profesional formal ni constituye una garantia de venta.";
    const palabras = nota.split(" ");
    let actual = "";
    let y = 151;
    for (const palabra of palabras) {
      const candidato = actual ? `${actual} ${palabra}` : palabra;
      if (regular.widthOfTextAtSize(candidato, 9) > 500) { draw(actual, 42, y, 9, regular, gray); y -= 14; actual = palabra; } else actual = candidato;
    }
    if (actual) draw(actual, 42, y, 9, regular, gray);
    draw("Catalan Propiedades · San Martin de los Andes", 42, 52, 8, bold, gray);
    draw("Documento generado automaticamente para uso profesional.", 42, 38, 8, regular, gray);

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Reporte_Tasacion_Profesional.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[/api/tasacion/pdf] error:", error);
    return NextResponse.json({ error: "no_se_pudo_generar" }, { status: 500 });
  }
}
