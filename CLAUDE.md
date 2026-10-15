@AGENTS.md

## Segunda opinión con Codex

Codex CLI está instalado en esta máquina y se lo puede consultar para una revisión
independiente. **No hay servidor MCP**: OpenAI quitó `codex mcp-server` en la versión
0.154.0. La forma que funciona es la CLI directa:

```bash
codex exec --sandbox read-only "<pregunta>"
```

`--sandbox read-only` es obligatorio: Codex no escribe en el repo ni toca archivos de
imagen. Los cambios los aplica Claude después de evaluar la respuesta.

**Cuándo llamarlo:** revisión antes de un deploy a Vercel, edge cases de un componente,
lógica de captura de leads, o un bug ya buscado sin éxito. No para escribir código ni
refactorizar: Codex no conoce las convenciones de este repo (App Router, JavaScript sin
TypeScript, Tailwind) ni las reglas de `AGENTS.md` sobre fotos del catálogo, y puede
proponer cambios que las violen. Las consultas se acotan a un archivo o una función,
nunca "refactorizá este módulo".

**Cómo preguntarle:** sin adelantarle las conclusiones nuestras. El valor está en que
llegue frío al código; si se le cuenta el razonamiento previo, lo confirma en vez de
auditarlo.
