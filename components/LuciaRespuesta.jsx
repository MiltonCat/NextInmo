import styles from "./LuciaRespuesta.module.css";

// Solo nodos de React: el texto del modelo nunca se interpreta como HTML.
function textoConEnfasis(texto) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**")
      ? <strong key={i}>{parte.slice(2, -2)}</strong>
      : parte
  );
}

export default function LuciaRespuesta({ texto = "" }) {
  const bloques = [];
  for (const linea of texto.split("\n")) {
    const limpia = linea.trim();
    if (!limpia) { bloques.push({ tipo: "salto" }); continue; }
    const item = limpia.match(/^(?:[-*•]\s+|\d+[.)]\s+)(.+)$/);
    const tipo = item ? (/^\d/.test(limpia) ? "ordenada" : "lista") : "parrafo";
    const ultimo = bloques.at(-1);
    if (ultimo?.tipo === tipo) ultimo.lineas.push(item ? item[1] : limpia);
    else bloques.push({ tipo, lineas: [item ? item[1] : limpia] });
  }

  return <div className={styles.respuesta}>
    {bloques.map((bloque, i) => {
      if (bloque.tipo === "salto") return null;
      if (bloque.tipo === "parrafo") return <p key={i}>{textoConEnfasis(bloque.lineas.join("\n"))}</p>;
      const anios = bloque.lineas.map((linea) => linea.replace(/\*\*/g, "").match(/^(\d{4})\s*:\s*([+−-]?\d+(?:[.,]\d+)?\s*%)$/));
      if (anios.length > 1 && anios.every(Boolean)) {
        return <dl key={i} className={styles.datos} aria-label="Variación por año">
          {anios.map((dato, j) => <div key={j} className={styles.fila}>
            <dt>{dato[1]}</dt><dd>{dato[2]}</dd>
          </div>)}
        </dl>;
      }
      const Lista = bloque.tipo === "ordenada" ? "ol" : "ul";
      return <Lista key={i}>{bloque.lineas.map((linea, j) => <li key={j}>{textoConEnfasis(linea)}</li>)}</Lista>;
    })}
  </div>;
}
