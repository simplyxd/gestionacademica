# Spec — Requerimientos no funcionales

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

## What & why

El enunciado fija stack, arquitectura y calidad. Son constraints, no opciones.

## Acceptance criteria

### Experiencia y forma

- [ ] Responsive: computador, tableta, teléfono.
- [ ] Mensajes claros si una operación no se puede completar; si aplica, nombrar la regla académica.

### Arquitectura y stack

- [ ] Separación interfaz / lógica de negocio / persistencia.
- [ ] Frontend: React, HTML, CSS.
- [ ] Backend: Node.js + Express.
- [ ] Base de datos: MongoDB (NoSQL).

### Seguridad y validación

- [ ] Autenticación segura y autorización por roles/permisos.
- [ ] Validación de entradas en frontend y/o backend.
- [ ] Reglas de matrícula, prerrequisitos, cupos y horarios **principalmente en backend**.

### Datos

- [ ] Consistencia entre estudiantes, planes, asignaturas, períodos, secciones, matrículas e inscripciones.
- [ ] Sin delete físico de registros con historia; estados: activo, inactivo, vigente, cerrado (o equivalentes).

### Desempeño

- [ ] Consultas habituales (estudiante, docente, coordinador) con tiempos aceptables para una web académica.

## Constraints

Stack y capas no son negociables sin registrar decisión y riesgo de no cumplir el enunciado.

## Open questions

- [NEEDS CLARIFICATION] ¿Hay umbral numérico de performance (p. ej. p95) o basta «adecuado»?
- Resuelto (E1-5): hash de contraseña + JWT.

## References

- [overview.md](../general/overview.md) · [entregables.md](entregables.md) · E11 en [`backlog-sga.md`](../../backlog-sga.md)
