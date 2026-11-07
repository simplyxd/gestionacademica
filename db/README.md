# db — seed de MongoDB

Archivos numerados en `db/seed/` que se ejecutan en orden y son idempotentes (correrlos dos veces no duplica). Se referencian entre sí por **clave natural** (código, RUT, correo), nunca por `ObjectId` fijo. Orden y dueños: ver el contrato transversal en `asignaciones/`.

> Estado: los seeds aún no existen. En `db/seed/lib/` están los generadores de personas, historial y alumnos de demo (Angel), con sus tests. `07-personas` y `08-matriculas` se escriben cuando existan el modelo `Usuario` (Endert) y los seeds 04–06 (Lorenzo, Matias).

## Generadores (`db/seed/lib/`)

| Archivo | Qué hace |
|---|---|
| `azar.js` | Pseudoaleatorio con semilla fija: el seed sale siempre igual |
| `rut.js` | RUT chileno válido (módulo 11) |
| `personas.js` | 20 docentes y 200 estudiantes con RUT y correos únicos y perfil válido |
| `historial.js` | `generarHistorial` (aprueba solo lo habilitado por prerrequisitos, semestre a semestre) y `verificarHistorial` (falla si un historial es incoherente) |
| `demo.js` | Alumnos reservados para la demo de las reglas de inscripción |

Los tests se corren desde `backend/` con `npm test` (incluye `db/seed/**/*.test.js`).

## Alumnos reservados para la demo (propuesta para Matias, D-12)

Período 2026-2. Plan Informática 2024 salvo que se indique otro. Las aprobadas se registran en 2026-1.

| Regla | Correo | Datos | Intenta inscribir | Resultado esperado |
|---|---|---|---|---|
| 1 Matrícula vigente | `demo.sinmatricula@alumnos.nuevaformacion.cl` | Sin matrícula en 2026-2 | INF-101 | Rechazo regla 1 |
| 4 Plan | `demo.otroplan@alumnos.nuevaformacion.cl` | Matrícula en Administración (plan 2023) | INF-201 | Rechazo regla 4 |
| 5 Prerrequisitos | `demo.sinprerrequisito@alumnos.nuevaformacion.cl` | Aprobó MAT-101 e INF-101, **no** MAT-100 | MAT-201 | Rechazo regla 5 |
| 6 Ya aprobó | `demo.yaaprobo@alumnos.nuevaformacion.cl` | Aprobó MAT-100, MAT-101 e INF-101 | INF-101 | Rechazo regla 6 |
| 7 Choque de horario | `demo.choque@alumnos.nuevaformacion.cl` | Igual que feliz; Matias lo inscribe (seed 10) en una sección que se cruza con la de INF-201 | INF-201 | Rechazo regla 7 |
| Feliz | `demo.feliz@alumnos.nuevaformacion.cl` | Aprobó MAT-100, MAT-101 e INF-101 | INF-201 | Inscripción aceptada |

Las reglas 2 (ventana de inscripción) y 3 (cupo) dependen del período y de la sección, no del alumno: se demuestran con `demo.feliz` en un período fuera de ventana (Matias) y en una sección llena (Diego).
