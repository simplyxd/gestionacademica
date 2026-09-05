# Handoff 001 — Organizar caso SGA

> Date: 2026-09-05 · Author: context-manager
> Continues: —

## Goal

Dejar el Caso 1 (Sistema Web de Gestión Académica) como memoria curada en `context/`, con RF/CU reconstruidos y listos para implementar.

## Current status

- **Done:** Scaffold de `context/`. Overview, glosario, 6 specs, sources, decision log, este handoff. Tablas RF1–RF12 y CU1–CU10 reconstruidas. Repo de código aún vacío (solo `README.md` del curso).
- **In progress:** Nada de implementación.
- **Remaining:** Bootstrap fullstack (React + Express + MongoDB), seed de datos de prueba, flujos por rol, evidencia de RF10.

## What worked

Partir el enunciado por *uso* (dominio / RF / CU / inscripción / RNF / entregables) en vez de copiar el PDF. CU8 aislado porque es el flujo que hay que evidenciar.

## What didn't work (and why)

El enunciado original no se puede usar como spec: las tablas markdown están colapsadas (celdas `| RF2 | Alta |` mezcladas con prosa). Había que reconstruir IDs, prioridades, actores y trazabilidad a mano. No existe diagrama de CU en el repo (solo la mención a «Figura 1»).

## Key decisions

Ver `decisions/log.md`: stack y reglas en backend son del enunciado; la partición de specs es nuestra.

## Evidence & data

- Institución: Instituto Universitario Nueva Formación — 3 sedes, ~4.500 estudiantes, semestres, 3 modalidades.
- 12 RF (10 Alta, 2 Media: RF11, RF12).
- 10 CU; el diagrama mínimo del enunciado lista 9 (omite CU10).
- 7 reglas de inscripción en `specs/inscripcion-asignaturas.md`.
- Código de aplicación: 0 (repo sin `package.json` ni carpetas de app).

## Next steps (ordered)

1. Confirmar o cerrar los `[NEEDS CLARIFICATION]` (jornadas, auto-registro, historial de aprobadas, anulación de inscripción, formato de API).
2. Bootstrap del monorepo/carpeta: `frontend/` (React) + `backend/` (Express) + MongoDB.
3. Implementar auth + 4 roles (RF1 / CU1).
4. Estructura académica y períodos (RF2–RF6).
5. Oferta + conflictos docente/sala (RF7–RF8).
6. Inscripción con las 7 reglas y mensajes (RF9–RF10).
7. Consulta docente y reportes (RF11–RF12) + seed demostrable.
- Blocked: nada técnico; el brief alcanza para empezar. Las aclaraciones no bloquean un primer scaffold.

## Quick start

```
# Mapa
open context/README.md
open context/general/overview.md
open context/specs/inscripcion-asignaturas.md

# Implementación: aún no hay app. Crear frontend/ y backend/ en la raíz del repo.
```

## Source links

- Enunciado: Caso 1 del curso (puntero en `sources/index.md`)
- Specs: `context/specs/`
