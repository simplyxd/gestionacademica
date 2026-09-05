# Handoff 002 — Organizar backlog SGA

> Date: 2026-09-05 · Author: context-manager
> Continues: handoff-001-organizar-caso.md

## Goal

Integrar `backlog-sga.md` al `context/` sin duplicar 85 tarjetas: mapa de épicos, decisiones extraídas y preguntas del caso que el backlog ya cierra.

## Current status

- **Done:** Spec `specs/backlog.md` (E0–E11, sprints, seed, colecciones). Puntero en `sources/`. Decisiones de JWT, prerreq-por-plan, estados, cupo atómico, E9 solo lectura. Specs del caso actualizadas (RF, CU, inscripción, entregables, RNF, dominio, glosario, overview).
- **In progress:** Nada de código.
- **Remaining:** Cerrar las 4 decisiones de grupo; E0-1 (modelo Mongo, incluir `salas`); bootstrap `/frontend` `/backend` `/db`.

## What worked

Tratar el backlog como fuente JIT y el context como índice. El backlog ya venía ordenado; el valor estuvo en cruzarlo con las specs del caso y **cerrar** abiertos (JWT, anulación, diagrama CU, split Admin/Coordinador, una matrícula vigente).

## What didn't work (and why)

Pegar E0–E11 en `context/` habría sido un segundo dump. El listado mínimo de colecciones de E0-1 **omite salas** aunque E6-1 las exige — si se implementa E0-1 al pie de la letra, E6 queda cojo.

## Key decisions

Ver entradas 2026-09-05 en `decisions/log.md` (JWT, plan/prereqs, estados, sala presencial, cupo atómico, repo/seed).

## Evidence & data

- 12 épicos, 85 tarjetas, 5 sprints, equipo de 6.
- Seed: 3 / 4 / 2 / 40 / 20 / 200 / 2 + historial.
- 7 reglas de E8 = 7 endpoints/validaciones + E8-11 anulación.
- Ruta crítica: E8 espera E0, E1, E2, E3, E5, E6.

## Next steps (ordered)

1. Decidir en grupo las 4 pendientes (historial, semipresencial, electivas, tope de créditos) y append a `decisions/log.md`.
2. E0-1: modelo Mongo **incluyendo `salas`**.
3. E0-2 / E0-3: estructura de repo + `.env` (Atlas nunca en git).
4. E0-4 seed + E1 auth.
- Blocked: E8 bloqueado hasta E0+E2+E5+E6. Las 4 pendientes no bloquean E0–E1.

## Quick start

```
open context/README.md
open context/specs/backlog.md
# Tarjeta concreta (JIT):
#   backlog-sga.md  → sección del épico (p. ej. E0 o E8)
```

## Source links

- [`backlog-sga.md`](../../backlog-sga.md)
- [handoff-001-organizar-caso.md](handoff-001-organizar-caso.md)
