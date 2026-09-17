"use client";

import { useState } from "react";

const ESTILOS = `.wd-shell{position:fixed;z-index:100;inset:0;overflow:auto;background:#f8fafc;color:#172033;font-family:Arial,sans-serif;padding:24px}.wd-card{max-width:920px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px #0f17201f}.wd-header{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid #edf0f4}.wd-brand{display:flex;align-items:center;gap:10px;font-size:15px}.wd-brand span{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;color:#fff;background:var(--wd-color);font-size:11px;font-weight:800}.wd-header small{color:#64748b}.wd-intro{padding:46px 48px 28px;background:linear-gradient(135deg,var(--wd-soft),#fff 68%)}.wd-kicker{margin:0 0 8px;color:var(--wd-color);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.wd-intro h1{margin:0;max-width:620px;font-size:clamp(31px,5vw,52px);line-height:1.02;letter-spacing:-.045em}.wd-intro>p:last-child{max-width:570px;color:#526174;line-height:1.55}.wd-tool{margin:0 48px 48px;padding:25px;border:1px solid #dfe5ed;border-radius:18px}.wd-tool-heading p,.wd-tool-heading h2,.wd-tool-heading small{margin:0}.wd-tool-heading p{color:var(--wd-color);font-size:12px;font-weight:700}.wd-tool-heading h2{margin-top:6px;font-size:24px}.wd-tool-heading small{display:block;margin-top:7px;color:#78869a;font-size:12px}.wd-step{display:flex;gap:13px;margin-top:23px;padding-top:22px;border-top:1px solid #edf0f4}.wd-step>span{display:grid;place-items:center;flex:none;width:25px;height:25px;border-radius:50%;background:var(--wd-soft);color:var(--wd-color);font-size:12px;font-weight:800}.wd-step h2,.wd-step p{margin:0}.wd-step h2{font-size:15px}.wd-step p{margin-top:4px;color:#718096;font-size:13px}.wd-options{display:flex;gap:8px;margin-top:12px}.wd-options button{border:1px solid #d6dde7;border-radius:9px;background:#fff;padding:10px 15px;cursor:pointer}.wd-options button.selected{border-color:var(--wd-color);background:var(--wd-soft);color:var(--wd-color);font-weight:700}.wd-metros{display:flex;align-items:center;gap:8px;width:150px;margin-top:12px;border:1px solid #d6dde7;border-radius:9px;padding:0 11px}.wd-metros input{width:100%;border:0;padding:11px 0;outline:0;font-size:15px}.wd-metros span{color:#718096;font-size:13px}.wd-result{margin-top:25px;border-radius:13px;background:#172033;color:#fff;padding:18px}.wd-result p,.wd-result strong,.wd-result small{display:block;margin:0}.wd-result p{color:#cbd5e1;font-size:12px}.wd-result strong{margin-top:6px;font-size:27px;letter-spacing:-.03em}.wd-result small{margin-top:7px;color:#aab7c8;font-size:11px}.wd-lead{display:flex;align-items:end;gap:10px;margin-top:17px}.wd-lead label{flex:1;font-size:12px;font-weight:700}.wd-lead input{box-sizing:border-box;display:block;width:100%;margin-top:6px;padding:11px;border:1px solid #d6dde7;border-radius:9px;font:inherit}.wd-lead button,.wd-integrar button{border:0;border-radius:9px;padding:12px 16px;background:var(--wd-color);color:#fff;font-weight:700;cursor:pointer}.wd-success{margin-top:16px;padding:14px;border-radius:10px;background:#ecfdf5;color:#166534}.wd-success p{margin:4px 0 0;font-size:13px}.wd-integrar{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:28px 48px;background:#f8fafc;border-top:1px solid #edf0f4}.wd-integrar h2,.wd-integrar p{margin:0}.wd-integrar h2{font-size:22px}.wd-integrar>div>p:last-child{margin-top:6px;color:#64748b;font-size:14px}.wd-widget{position:absolute;padding:0;min-height:100%}.wd-widget .wd-card{min-height:100%;border-radius:0;box-shadow:none}.wd-widget .wd-tool{margin:0;border:0;border-radius:0}.wd-widget .wd-header{padding:14px 18px}@media(max-width:640px){.wd-shell{padding:0}.wd-card{border:0;border-radius:0}.wd-intro{padding:32px 22px 22px}.wd-tool{margin:0;border:0;border-radius:0;padding:22px}.wd-integrar{align-items:flex-start;flex-direction:column;padding:24px 22px}.wd-lead{align-items:stretch;flex-direction:column}}`;

const ESTILOS_FINTECH = `.wd-shell{background:#edf2f7}.wd-card{max-width:1000px;border:0;border-radius:28px;box-shadow:0 32px 80px #13233a24}.wd-header{background:#0b1629;color:#e8f1ff;border:0}.wd-header small{color:#9fb2cd}.wd-brand span{border-radius:8px;background:#2f70ff}.wd-intro{background:#0b1629;color:#f7faff;padding:54px 52px 42px}.wd-intro>p:last-child{color:#aabbd4}.wd-kicker{color:#77a3ff}.wd-tool{margin:-10px 40px 42px;padding:32px;background:#fff;border:1px solid #dce5f0;border-radius:18px;box-shadow:0 16px 30px #0b162912}.wd-tool-heading h2{font-size:27px;letter-spacing:-.025em}.wd-step>span{border-radius:7px;background:#e9f0ff;color:#2463ed}.wd-analysis{margin-top:25px;padding:20px;border-radius:12px;background:#0b1629;color:#fff}.wd-analysis-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.wd-analysis h3,.wd-analysis p{margin:0}.wd-analysis h3{font-size:18px}.wd-analysis p{margin-top:5px;color:#b9c8dd;font-size:13px;line-height:1.5}.wd-analysis-badge{padding:6px 9px;border:1px solid #456181;border-radius:99px;color:#b8d0ff;font-size:11px;font-weight:700;white-space:nowrap}.wd-analysis-list{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:19px;background:#34465e;border:1px solid #34465e;border-radius:8px;overflow:hidden}.wd-analysis-list div{padding:12px;background:#13233a}.wd-analysis-list strong,.wd-analysis-list span{display:block}.wd-analysis-list strong{font-size:13px}.wd-analysis-list span{margin-top:4px;color:#aabbd4;font-size:11px;line-height:1.35}.wd-lead button,.wd-integrar button{border-radius:8px;background:#2463ed}@media(max-width:640px){.wd-intro{padding:36px 24px 28px}.wd-tool{margin:-4px 0 0;padding:24px}.wd-analysis-list{grid-template-columns:1fr}.wd-analysis-top{align-items:flex-start;flex-direction:column}}`;

function Paso({ numero, titulo, texto, children }) {
  return <section className="wd-step">
    <span>{numero}</span>
    <div><h2>{titulo}</h2><p>{texto}</p>{children}</div>
  </section>;
}

export default function WidgetTasadorDemo({ inmobiliaria, widget = false }) {
  const [tipo, setTipo] = useState("Casa");
  const [metros, setMetros] = useState(120);
  const [zona, setZona] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [origen, setOrigen] = useState("");
  const [nombre, setNombre] = useState("");

  const copiar = async () => {
    const base = origen || window.location.origin;
    const codigo = `<iframe src="${base}/tasador-demo/widget/" width="100%" height="690" style="border:0;border-radius:20px" loading="lazy" title="Tasador online"></iframe>`;
    await navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  };

  return <main className={`wd-shell ${widget ? "wd-widget" : "wd-landing"}`} style={{ "--wd-color": inmobiliaria.color, "--wd-soft": inmobiliaria.colorSuave }}>
    <style>{ESTILOS + ESTILOS_FINTECH}</style>
    <div className="wd-card">
      <header className="wd-header">
        <div className="wd-brand"><span>{inmobiliaria.iniciales}</span><strong>{inmobiliaria.nombre}</strong></div>
        {!widget && <small>Demo interactiva</small>}
      </header>

      {!widget && <div className="wd-intro">
        <p className="wd-kicker">Tasador online</p>
        <h1>Información clara para empezar una tasación seria.</h1>
        <p>Probá el recorrido que se puede compartir por enlace o insertar dentro de cualquier web.</p>
      </div>}

      <div className="wd-tool">
        <div className="wd-tool-heading"><p>Datos de la propiedad</p><h2>Prepará tu solicitud de tasación</h2><small>Esta demo no calcula precios: muestra cómo se ordena una consulta real.</small></div>
        <Paso numero="1" titulo="Tipo de propiedad" texto="Elegí la opción que mejor la describe.">
          <div className="wd-options">{["Casa", "Departamento"].map((item) => <button key={item} type="button" className={tipo === item ? "selected" : ""} onClick={() => setTipo(item)}>{item}</button>)}</div>
        </Paso>
        <Paso numero="2" titulo="Superficie cubierta" texto="Podés cambiar este dato para probar el flujo.">
          <label className="wd-metros"><input type="number" min="35" max="1000" value={metros} onChange={(event) => setMetros(event.target.value)} /><span>m²</span></label>
        </Paso>

        <Paso numero="3" titulo="Zona o barrio" texto="Es el dato que permite mirar el mercado correcto.">
          <label className="wd-metros"><input value={zona} onChange={(event) => setZona(event.target.value)} placeholder="Ej. Centro" /><span>⌁</span></label>
        </Paso>

        <section className="wd-analysis"><div className="wd-analysis-top"><div><h3>Análisis listo para iniciar</h3><p>{tipo} · {metros || 0} m²{zona ? ` · ${zona}` : ""}</p></div><span className="wd-analysis-badge">Sin valor inventado</span></div><div className="wd-analysis-list"><div><strong>Mercado local</strong><span>Datos de la zona y comparables.</span></div><div><strong>Modelo calibrado</strong><span>Solo cuando existe información suficiente.</span></div><div><strong>Revisión humana</strong><span>Para lo que los datos no pueden ver.</span></div></div></section>

        {enviado ? <div className="wd-success"><strong>Solicitud preparada, {nombre || "gracias"}.</strong><p>En una instalación real, el equipo recibe estos datos para continuar la tasación.</p></div> : <form className="wd-lead" onSubmit={(event) => { event.preventDefault(); setEnviado(true); }}>
          <label>Tu nombre<input required value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Cómo te llamás" /></label>
          <button type="submit">Preparar solicitud</button>
        </form>}
      </div>

      {!widget && <section className="wd-integrar"><div><p className="wd-kicker">Para cualquier web</p><h2>Un iframe y listo.</h2><p>El tasador vive en un solo lugar; la otra web solo pega este bloque.</p></div><button type="button" onClick={copiar}>{copiado ? "Código copiado" : "Copiar código del widget"}</button></section>}
    </div>
    {!widget && <button className="wd-origin" type="button" onClick={() => setOrigen(window.location.origin)}>Preparar código para este dominio</button>}
  </main>;
}
