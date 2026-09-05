# Spec — Inscripción de asignaturas (flujo crítico)

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

## What & why

CU8 / RF10 es el corazón del caso: automatiza lo que hoy se revisa a mano y es lo que el enunciado pide **evidenciar** (reglas + validaciones). Si esto falla, el resto del SGA no demuestra valor.

También cubre RF9 / CU7 (consulta y filtros de oferta), precondición de inscribir.

## Acceptance criteria

### Consulta de oferta (RF9)

- [ ] El estudiante ve secciones del período vigente/habilitado.
- [ ] Filtros: asignatura, jornada, modalidad, día, disponibilidad de cupos.
- [ ] Se distingue sección llena vs. con cupo.

### Inscripción (RF10) — rechazar y decir *qué* regla falló

Aceptar solo si **todas** se cumplen:

| # | Regla | Rechazar cuando |
|---|---|---|
| 1 | Matrícula vigente | No hay matrícula del estudiante en el período (carrera/plan). |
| 2 | Período de inscripción | La fecha actual está fuera de la ventana o el período no está habilitado. |
| 3 | Cupos | `inscritos >= cupo máximo`. |
| 4 | Plan de estudio | La asignatura no pertenece al plan de la matrícula. |
| 5 | Prerrequisitos | Algún prerrequisito no está aprobado. |
| 6 | Aprobación previa | El estudiante ya aprobó esa asignatura. |
| 7 | Conflicto de horario | Algún bloque de la sección se solapa con otra inscripción del mismo período. |

- [ ] Las 7 reglas corren en **backend** (no solo en el formulario).
- [ ] La respuesta/UI nombra la regla que bloquea.
- [ ] Una inscripción exitosa incrementa ocupación y aparece en la nómina del docente (RF11).

## Constraints

- Lógica de negocio en backend (RNF). Frontend puede adelantar validación, no ser la única.
- Cupo: operación **atómica** (E8). No `find` + `insert` (condición de carrera).
- Anulación: E8-11 libera el cupo; no borrar historia — estado `anulada` o similar.
- Oferta (RF9): por defecto el plan del alumno, con opción de ver todo (E7).
- Cada regla = mensaje distinto (E8-2, E11-5). «Error al inscribir» no cumple.

## Open questions

- [NEEDS CLARIFICATION] ¿Lista de espera si no hay cupo? El backlog no la incluye → fuera de alcance salvo decisión.
- Resuelto (E8-11): sí se puede anular inscripción y liberar cupo.
- Pendiente de grupo: historial de aprobadas — ¿solo seed (E0-4) o pantalla extra de acta?
- Pendiente de grupo: ¿tope de créditos? Si sí, es 8ª regla (no está en el enunciado).

## References

- RF8 (conflictos docente/sala al crear oferta) es distinto: allá es coordinación; aquí es cruce del *estudiante*.
- [requerimientos-funcionales.md](requerimientos-funcionales.md)
- [requerimientos-no-funcionales.md](requerimientos-no-funcionales.md)
- Tarjetas: E8-1…E8-12 en [`backlog-sga.md`](../../backlog-sga.md)
