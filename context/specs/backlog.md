# Spec — Backlog de implementación

> Status: ready · Owner: equipo de 6 (P1–P6) · Updated: 2026-09-05

## What & why

Plan de trabajo del SGA. Las tarjetas vivas están en [`backlog-sga.md`](../../backlog-sga.md) (abrir solo el épico que se implementa). Aquí: mapa, dependencias y lo que no hay que re-decidir.

Etiquetas: `wireframe` · `modelo-datos` · `backend` · `frontend` · `integracion` · `docs`.  
Trazabilidad RF/CU va **en el título** de cada tarjeta (rúbrica).

## Épicos

| Épico | Tema | Traza | Tarjetas | Notas |
|---|---|---|---|---|
| E0 | Base del proyecto | — | E0-1…E0-5 | **E0-1 bloquea todo.** Colecciones + seed. |
| E1 | Auth y usuarios | RF1 / CU1 | E1-1…E1-10 | 4 perfiles. Alta única con campos según rol. |
| E2 | Estructura académica | RF2, RF3 / CU2 | E2-1…E2-10 | Prerrequisito es del **plan**. Detectar ciclos. |
| E3 | Períodos | RF4 / CU3 | E3-1…E3-4 | Estados + un solo período en curso. |
| E4 | Docentes y estudiantes | RF5 / CU4 | E4-1…E4-7 | |
| E5 | Matrícula | RF6 / CU5 | E5-1…E5-5 | Se olvida fácil; es precondición de E8. |
| E6 | Oferta y horarios | RF7, RF8 / CU6 | E6-1…E6-9 | Choque docente ≠ choque sala. E6-4 es pantalla cara. |
| E7 | Consulta de oferta | RF9 / CU7 | E7-1…E7-4 | Default: plan del alumno. |
| E8 | Inscripción | RF10 / CU8 | E8-1…E8-12 | 7 reglas = 7 tarjetas backend. Cupo atómico. |
| E9 | Portal docente | RF11 / CU9 | E9-1…E9-6 | Solo lectura. |
| E10 | Reportes | RF12 / CU10 | E10-1…E10-5 | |
| E11 | NFR y evidencia | NFR / entregable | E11-1…E11-8 | Capas, mensajes, API, diagrama, guion demo. |

Total: **85 tarjetas**. Detalle de cada una: no copiar aquí; ir al archivo fuente.

## Ruta crítica

E8 depende de E0, E1, E2, E3, E5 y E6. Si algo se atrasa, que no sea **E0, E2, E5 ni E6**.

```
Sprint 1  E0 + E1 + E3
Sprint 2  E2 + E4
Sprint 3  E5 + E6
Sprint 4  E7 + E8
Sprint 5  E9 + E10 + E11
```

## Seed mínimo (E0-4)

3 sedes · 4 carreras · 2 planes · 40 asignaturas · 20 docentes · 200 alumnos · 2 períodos · `historialAcademico` con aprobadas (si no, E8-8 y E8-9 no se demuestran).

## Colecciones mínimas (E0-1)

`sedes` · `carreras` · `planesEstudio` · `asignaturas` · `periodos` · `usuarios` · `docentes` · `estudiantes` · `matriculas` · `secciones` · `bloquesHorarios` · `inscripciones` · `historialAcademico`

Hueco: E6-1 pide ABM de salas/ambientes y **no** están en esa lista. Cerrarlas en el modelo (colección `salas` o equivalente).

## Acceptance criteria

- [ ] E0-1 cerrado antes de código de negocio.
- [ ] Cada tarjeta de E8-4…E8-10 produce un mensaje de error distinto y testeable por API.
- [ ] E11-2: reglas académicas demostrables pegándole a la API, sin React.

## Constraints

Ver `decisions/log.md`. No agregar notas ni asistencia (E9) sin decisión explícita de alcance extra.

## Open questions (grupo)

Pendientes en el backlog, no en el enunciado:

1. Historial académico: ¿solo seed, o pantalla extra de cierre de acta?
2. Semipresencial: ¿el bloque tiene modalidad propia o la hereda de la sección?
3. Electivas: ¿bolsa libre o lista fija del plan?
4. ¿Tope de créditos por período? (sería 8ª regla en E8)

Siguen abiertas: catálogo de jornadas; lista de espera; formato concreto de docs de API.

## References

- Fuente: [`backlog-sga.md`](../../backlog-sga.md)
- [inscripcion-asignaturas.md](inscripcion-asignaturas.md) · [entregables.md](entregables.md)
