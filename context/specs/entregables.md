# Spec — Entregables mínimos del grupo

> Status: ready · Owner: equipo SGA · Updated: 2026-09-05

## What & why

Criterio de «el grupo entregó lo pedido», no un backlog extra.

## Acceptance criteria

- [ ] Repo con frontend, backend y base de datos claramente separados.
- [ ] Prototipo usable: navegación, autenticación, formularios, tablas/listados, filtros, diseño responsive.
- [ ] Los 4 perfiles implementados: Administrador, Coordinador Académico, Docente, Estudiante.
- [ ] API REST (u homóloga) documentada alineada a los CU elegidos.
- [ ] Reglas de inscripción implementadas y evidenciadas (RF10 / CU8).
- [ ] Flujos end-to-end: React → Node.js/Express → MongoDB.
- [ ] Datos de prueba según E0-4 (incluye `historialAcademico`).
- [ ] Diagrama de CU con 4 actores (E11-7).
- [ ] Guion de demo end-to-end (E11-8).
- [ ] Catálogo de mensajes de error por regla (E11-5).

## Constraints

La evidencia Fullstack pesa más que pantallas aisladas. CU8 es el flujo que hay que poder demostrar. E11-2 se prueba contra la API, sin navegador.

## Open questions

- [NEEDS CLARIFICATION] Formato de documentación de API (OpenAPI, README de rutas, Postman) — E11-6 pide documentar; no fija el formato.

## References

- [casos-de-uso.md](casos-de-uso.md)
- [inscripcion-asignaturas.md](inscripcion-asignaturas.md)
