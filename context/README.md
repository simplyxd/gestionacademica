# Context — Sistema Web de Gestión Académica (SGA)

Memoria externa del proyecto. Leer esto primero.

> Última actualización: 2026-09-05 · Último handoff: [handoff-002-organizar-backlog.md](handoff/handoff-002-organizar-backlog.md)

## Mapa

| Carpeta | Qué hay |
|---|---|
| `general/` | Qué es el proyecto, meta, reglas — `overview.md`; términos — `glossary.md` |
| `sources/` | Punteros al enunciado y artefactos — no dumps |
| `specs/` | Requerimientos y criterios de aceptación, un archivo por tema |
| `decisions/` | Log append-only de decisiones y por qué — `log.md` |
| `handoff/` | Un handoff por sesión, numerado; el más reciente es el punto de resume |

## Specs (cargar solo la que haga falta)

| Spec | Cuándo abrirla |
|---|---|
| [modelo-de-negocio.md](specs/modelo-de-negocio.md) | Entidades, relaciones y valor del producto |
| [requerimientos-funcionales.md](specs/requerimientos-funcionales.md) | RF1–RF12 con prioridad |
| [casos-de-uso.md](specs/casos-de-uso.md) | CU1–CU10, actores y diagrama mínimo |
| [inscripcion-asignaturas.md](specs/inscripcion-asignaturas.md) | Reglas de negocio del flujo crítico (RF10 / CU8) |
| [requerimientos-no-funcionales.md](specs/requerimientos-no-funcionales.md) | Stack, arquitectura, seguridad, UX |
| [entregables.md](specs/entregables.md) | Mínimos del grupo para la entrega |
| [backlog.md](specs/backlog.md) | Épicos E0–E11, sprints y ruta crítica — tarjetas en `backlog-sga.md` |

## Cómo usar

- **¿Retomar?** Leer el último handoff y luego `general/overview.md`. El resto, just-in-time.
- **¿Se tomó una decisión?** Añadirla a `decisions/log.md`.
- **¿Implementar un RF/CU?** Abrir la spec + el épico en [`backlog-sga.md`](../backlog-sga.md); no cargar todas las tarjetas.
