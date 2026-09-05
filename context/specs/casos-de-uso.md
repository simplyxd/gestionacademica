# Spec — Casos de uso

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

## What & why

Contrato didáctico: cada CU debe **evidenciarse** en interfaz, backend o flujo integrado. CU8 además debe evidenciar reglas de negocio.

| ID | Caso de uso | RF | Actores | Observación |
|---|---|---|---|---|
| CU1 | Autenticar usuarios | RF1 | Administrador, Coordinador Académico, Docente, Estudiante | Evidencia en UI, backend o flujo integrado |
| CU2 | Administrar estructura académica | RF2, RF3 | Administrador, Coordinador Académico | Incluye prerrequisitos |
| CU3 | Administrar períodos académicos | RF4 | Coordinador Académico | |
| CU4 | Administrar docentes y estudiantes | RF5 | Coordinador Académico | |
| CU5 | Registrar matrícula | RF6 | Coordinador Académico | |
| CU6 | Gestionar oferta académica | RF7, RF8 | Coordinador Académico | Incluye horarios y conflictos |
| CU7 | Consultar oferta académica | RF9 | Estudiante | Filtros |
| CU8 | Inscribir asignaturas | RF10 | Estudiante | Debe evidenciar reglas y validaciones |
| CU9 | Consultar secciones asignadas | RF11 | Docente | Nómina por sección |
| CU10 | Generar reportes (consultas) | RF12 | Coordinador Académico, Administrador | |

## Diagrama referencial (actores y CU mínimos)

Actores: Administrador, Coordinador Académico, Docente, Estudiante.

Dentro del límite del SGA, **como mínimo**:

1. Autenticar usuarios
2. Administrar estructura académica
3. Administrar períodos académicos
4. Administrar docentes y estudiantes
5. Registrar matrícula
6. Gestionar oferta académica
7. Consultar oferta académica
8. Inscribir asignaturas
9. Consultar secciones asignadas

CU10 (reportes) está en la tabla de CU pero **no** en la lista mínima del enunciado. E11-7 pide diagrama con los 4 actores; incluir CU10 es coherente con RF12.

Asociaciones típicas (para dibujar):

- Todos → CU1
- Admin + Coordinador → CU2
- Coordinador → CU3, CU4, CU5, CU6
- Estudiante → CU7, CU8
- Docente → CU9
- Coordinador + Admin → CU10

## Acceptance criteria

- [ ] Existe un diagrama (o equivalente) con los 4 actores y al menos los 9 CU del enunciado.
- [ ] Cada CU de la tabla tiene un flujo demostrable (ver observación).
- [ ] CU8 muestra mensajes cuando una regla rechaza la inscripción.

## Constraints

No sustituir un CU por un mock que no toque API/Mongo si el grupo promete evidencia Fullstack ([entregables.md](entregables.md)).

## Open questions

- Resuelto (E11-7): sí hay que entregar diagrama de casos de uso con los 4 actores.

## References

- [requerimientos-funcionales.md](requerimientos-funcionales.md)
- Figura 1 del enunciado (diagrama referencial; no versionado en el repo)
