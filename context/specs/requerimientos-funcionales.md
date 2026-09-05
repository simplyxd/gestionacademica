# Spec — Requerimientos funcionales

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

Tabla reconstruida del enunciado (el original llegó con markdown roto).

## What & why

Alcance funcional mínimo del SGA. Prioridad **Alta** = núcleo del prototipo; **Media** = consulta/reporte.

| ID | Prioridad | Requerimiento |
|---|---|---|
| RF1 | Alta | Registro, autenticación y administración de usuarios por perfil: Administrador, Coordinador Académico, Docente, Estudiante. |
| RF2 | Alta | Administrar estructura institucional y académica: sedes, carreras, planes de estudio y asignaturas. |
| RF3 | Alta | Definir y administrar prerrequisitos entre asignaturas de los planes de estudio. |
| RF4 | Alta | Administrar períodos académicos: fechas de inicio y término, período de inscripción y estado. |
| RF5 | Alta | Registrar y administrar docentes y estudiantes (datos académicos e institucionales). |
| RF6 | Alta | Registrar matrícula de un estudiante: carrera, plan de estudio y período académico. |
| RF7 | Alta | Crear oferta académica: secciones con asignatura, docente, sede, jornada, modalidad, cupo, sala y período. |
| RF8 | Alta | Administrar bloques horarios de secciones y validar conflictos de docente y de sala. |
| RF9 | Alta | Estudiante consulta y filtra la oferta: asignatura, jornada, modalidad, día y disponibilidad de cupos. |
| RF10 | Alta | Estudiante inscribe asignaturas validando matrícula, período de inscripción, cupos, plan, prerrequisitos, aprobación previa y conflictos de horario. |
| RF11 | Media | Docente consulta sus secciones y la nómina de inscritos de cada una. |
| RF12 | Media | Consultas: matrícula, estudiantes por carrera o asignatura, ocupación de secciones, cupos disponibles y carga académica docente. |

## Trazabilidad RF → CU

| RF | Casos de uso |
|---|---|
| RF1 | CU1 |
| RF2, RF3 | CU2 |
| RF4 | CU3 |
| RF5 | CU4 |
| RF6 | CU5 |
| RF7, RF8 | CU6 |
| RF9 | CU7 |
| RF10 | CU8 |
| RF11 | CU9 |
| RF12 | CU10 |

## Acceptance criteria

- [ ] Cada RF Alta tiene flujo evidenciable (UI + API + persistencia) o está explícitamente diferido en un handoff.
- [ ] RF10 implementa las 7 validaciones listadas (detalle en [inscripcion-asignaturas.md](inscripcion-asignaturas.md)).
- [ ] RF8 bloquea cruce de docente y de sala física.
- [ ] RF11 y RF12 existen al menos como consultas (prioridad Media).

## Constraints

Roles y permisos según [overview.md](../general/overview.md). Reglas de RF8 y RF10 en backend.

## Open questions

- Resuelto (backlog E1/E2): **permisos** — Coordinador hace estructura y oferta; Admin hace usuarios y parámetros. El enunciado lista Admin en CU2: el diagrama puede mostrarlo; la matriz de permisos sigue el backlog.
- Resuelto (E1): RF1 es alta/ABM por administración, no auto-registro. Login + recuperar/cambio de clave.

## References

- [casos-de-uso.md](casos-de-uso.md)
