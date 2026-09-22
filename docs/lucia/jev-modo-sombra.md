# Jev en modo sombra

Jev (TypeSafe AI) interpreta cada frase escrita a Lucía **en paralelo** al router actual. No cambia nada de lo que ve el visitante: el router (`rutaDelTexto`, en el navegador) sigue decidiendo y GPT sigue redactando.

## Flujo

```
ChatBot.handleText ──(ya decidió: tasador | ia_tasacion | ia | guiado)
      │ fetch keepalive, sin await
      ▼
/api/lucia-sombra  → 202 al instante
      │ after()
      ▼
lib/luciaSombra.procesarSombra
  ├─ recalcula rutaDelTexto + parseLuciaText (filtros del router)
  ├─ Jev /v1/systemone (frase y contexto saneados, sin mails ni teléfonos)
  ├─ lib/luciaJev.planSegunJev → ruta + módulos (supabase, inversion, legal, tasador, contenido, aclaracion)
  └─ INSERT en lucia_sombra_jev
```

Fuera de Jev, a propósito: disponibilidad y fechas (reglas + Supabase), números (parseLuciaText) y la redacción (GPT).

## Encender

1. `node scripts/setup-lucia-sombra.mjs` (una vez)
2. Variables **de servidor** en Vercel (nunca `NEXT_PUBLIC_`):
   - `JEV_API_KEY`
   - `LUCIA_JEV_SOMBRA=1`
   - opcional: `JEV_MODEL` (default `jev-latest`), `JEV_API_URL` (default `https://api.typesafe.ai/v1/systemone`)
3. Apagar: sacar `LUCIA_JEV_SOMBRA`. El endpoint devuelve 204 y no llama a nadie.

## Consultas para comparar

```sql
-- Resumen: cuánto coinciden y cuánto tarda Jev
select count(*) total,
       count(*) filter (where coincide) coinciden,
       count(*) filter (where coincide = false) difieren,
       count(*) filter (where error is not null) errores,
       percentile_cont(0.5) within group (order by latencia_ms) p50_ms,
       percentile_cont(0.95) within group (order by latencia_ms) p95_ms
from lucia_sombra_jev where not interno;

-- Tipos de diferencia
select d, count(*) from lucia_sombra_jev, unnest(diferencias) d
where not interno group by d order by 2 desc;

-- Las frases que el router mandó al árbol y Jev habría mandado a la IA
select created_at, pregunta, paso, operacion_jev, modulos_jev, aclarar_entre
from lucia_sombra_jev
where not interno and 'router_arbol_jev_ia' = any(diferencias)
order by created_at desc limit 50;

-- Casos ambiguos: operación con menos de 70% de confianza
select pregunta, probabilidades->'operacion' from lucia_sombra_jev
where (select max(v::numeric) from jsonb_each_text(probabilidades->'operacion') as t(k, v)) < 0.7
order by created_at desc limit 50;
```

## Diferencias que se registran

| código | qué significa |
|---|---|
| `router_arbol_jev_ia` | el router mandó al árbol algo que Jev ve como consulta (inversión, legal, decisión, duda) |
| `router_ia_jev_arbol` | la IA recibió una búsqueda pelada que el árbol resolvía |
| `router_perdio_alquiler` | Jev ve alquiler por contexto y el router no lo tenía |
| `operacion_distinta` | router dice alquiler y Jev ve comprar o vender |
| `arbol_con_operacion_incierta` | el árbol arrancó sin que la operación esté clara |
| `tasador_sin_senal_jev` | se abrió el tasador y Jev no ve pedido de tasación |
| `jev_ve_tasacion_de_venta` | Jev ve tasación para vender y no se abrió el tasador |
