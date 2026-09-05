# Spec — Modelo de negocio y dominio

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

## What & why

El Instituto presta educación superior en carreras organizadas por sede, modalidad y jornada. El valor de la plataforma es **una sola fuente de verdad** para el ciclo semestral: oferta → matrícula → inscripción → consulta.

## Entidades y relaciones (mínimo)

```
Institución
  └── Sede (n)
Carrera
  └── Plan de estudio (1..n)
        └── Asignatura (obligatoria | electiva)
              └── Prerrequisito (del plan) → Asignatura (aprobada)
Período académico (semestral)
  └── Sección (oferta)
        ├── Asignatura
        ├── Docente
        ├── Sede, jornada, modalidad
        ├── Cupo máximo
        ├── Sala física | ambiente virtual
        └── Bloques horarios
Estudiante
  ├── Historial académico (aprobadas)
  └── Matrícula (carrera + plan + período, vigente)
        └── Inscripción → Sección
```

## Ciclo operativo

1. **Antes del semestre:** coordinación planifica asignaturas, crea secciones, asigna docentes, horarios, salas/ambientes y cupos.
2. **Inscripción:** estudiantes matriculados consultan la oferta e inscriben según su plan. El sistema acepta solo si se cumplen las reglas (ver [inscripcion-asignaturas.md](inscripcion-asignaturas.md)).
3. **Durante el período:** docentes ven secciones y nómina; coordinación supervisa oferta, inscripciones y carga docente; administración mantiene usuarios y parámetros.

## Acceptance criteria

- [ ] El modelo de datos cubre: sede, carrera, plan, asignatura, prerrequisito (por plan), período, docente, estudiante, matrícula, sección, bloque horario, sala/ambiente, inscripción, historial académico.
- [ ] Una sección siempre referencia asignatura, período, docente, sede, jornada, modalidad, horario, cupo máximo y sala o ambiente virtual cuando corresponda.
- [ ] Un estudiante inscrito queda ligado a una sección de un período en el que tiene matrícula vigente.

## Constraints

Consistencia referencial en MongoDB entre esas entidades (RNF). Estados en vez de delete físico cuando hay historia.

## Open questions

- [NEEDS CLARIFICATION] Catálogo de jornadas (¿diurna/vespertina/otra?).
- Resuelto (E5-3): una sola matrícula **vigente** por estudiante en el período; otra carrera exigiría otra matrícula no vigente a la vez.
- [NEEDS CLARIFICATION] Semipresencial: ¿el bloque tiene modalidad propia o la hereda? (pendiente de grupo; define si sala aplica por bloque.)
- [NEEDS CLARIFICATION] Electivas: ¿bolsa libre o lista fija del plan?
- Hueco E0-1: añadir `salas` (o equiv.) — E6-1 las pide y no están en la lista mínima.

## References

- [overview.md](../general/overview.md)
- [inscripcion-asignaturas.md](inscripcion-asignaturas.md)
