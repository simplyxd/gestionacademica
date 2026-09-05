# Glosario — SGA

Términos del dominio. No re-derivar.

| Término | Significado |
|---|---|
| SGA | Sistema Web de Gestión Académica |
| Sede | Campus físico de la institución (hoy: 3) |
| Modalidad | Presencial, semipresencial u online |
| Jornada | Franja en que se imparte (p. ej. diurna / vespertina). El enunciado no fija el catálogo. |
| Período académico | Semestre con fechas de inicio, término, ventana de inscripción y estado |
| Carrera | Programa técnico o profesional ofertado en sedes / modalidades / jornadas |
| Plan de estudio | Conjunto de asignaturas obligatorias y electivas de una carrera |
| Asignatura | Unidad curricular: código, nombre, créditos, horas pedagógicas, semestre sugerido, prerrequisitos |
| Prerrequisito | Asignatura que debe estar **aprobada** antes de inscribir otra. Vive en el **plan**, no en la asignatura suelta (puede diferir entre planes). |
| Sección | Oferta concreta de una asignatura en un período: docente, sede, jornada, modalidad, horario, cupo, sala o ambiente virtual |
| Oferta académica | Conjunto de secciones creadas para un período |
| Bloque horario | Franja día/hora de una sección; base para detectar cruces |
| Sala / ambiente virtual | Recurso de dictado; una sala física no puede asignarse a dos secciones a la vez |
| Cupo | Máximo de inscritos de una sección |
| Matrícula | Vínculo estudiante–carrera–plan–período; debe estar vigente para inscribir |
| Inscripción | Alta de un estudiante en una sección, sujeta a reglas (RF10) |
| Carga académica docente | Distribución de secciones/horas asignadas a un docente |
| Soft-delete / estado | No borrar físicamente registros con historia; marcar activo/inactivo/vigente/cerrado |
| Historial académico | Colección `historialAcademico`: asignaturas ya aprobadas. Alimenta prerrequisitos y «ya aprobó». El enunciado no pide actas; el seed (E0-4) es el camino mínimo. |
| Estados de período | `planificación` → `inscripción abierta` → `en curso` → `cerrado`. La ventana de inscripción ≠ fechas del semestre. Cerrado congela inscripciones. Un solo período «en curso». |
| Estados de matrícula | `vigente`, `suspendida`, `egresada`, `retirada`. Una vigente por estudiante en el período. |
| Épico (E0–E11) | Bloque del backlog. Tarjetas `E{n}-{m}` en `backlog-sga.md`. |

## Perfiles (roles)

| Rol | Código informal |
|---|---|
| Administrador | `admin` |
| Coordinador Académico | `coordinador` |
| Docente | `docente` |
| Estudiante | `estudiante` |
