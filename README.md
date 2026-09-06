# Sistema Web de Gestión Académica (SGA)

Prototipo fullstack del **Caso 1** del ramo **Desarrollo Web y Móvil**.

El sistema centraliza el ciclo semestral del *Instituto Universitario Nueva Formación* (3 sedes, ~4.500 estudiantes, modalidades presencial / semipresencial / online): estructura académica, oferta de secciones, matrícula e inscripción, con perfiles diferenciados.

Hoy esa información vive en hojas de cálculo, archivos sueltos y correos. El SGA es una sola fuente de verdad para planificar oferta, matricular, inscribir con reglas automáticas y consultar información actualizada.

> Estado actual: documentación del caso y backlog curados. Aún no hay código de `/frontend`, `/backend` ni `/db`.

## Objetivo de la entrega

Un prototipo usable (React + Node.js/Express + MongoDB) con autenticación por roles, flujos de punta a punta y **evidencia** de las reglas de inscripción. Lo que pesa en la rúbrica es el Fullstack, no pantallas desconectadas del backend.

## Stack (fijo por enunciado)

| Capa | Tecnología |
|---|---|
| Interfaz | React, HTML, CSS (responsive: computador, tableta y móvil) |
| Lógica de negocio | Node.js + Express (API REST) |
| Persistencia | MongoDB |

Arquitectura en capas: interfaz, negocio y persistencia separados. Las reglas académicas (matrícula, prerrequisitos, cupos, horarios) se validan **en el backend**; la UI puede adelantar el error, no ser la única barrera.

Autenticación: hash de contraseña + JWT, con control de acceso por rol. No hay auto-registro: el administrador da de alta a los usuarios.

## Perfiles

| Rol | Qué hace |
|---|---|
| **Administrador** | Usuarios, parámetros institucionales, consultas y reportes |
| **Coordinador académico** | Estructura académica, períodos, personas, matrícula, oferta y reportes |
| **Docente** | Consulta sus secciones y la nómina de inscritos (solo lectura) |
| **Estudiante** | Consulta la oferta e inscribe asignaturas de su plan |

## Alcance funcional

| ID | Prioridad | Qué cubre |
|---|---|---|
| RF1 | Alta | Autenticación y administración de usuarios por perfil |
| RF2–RF3 | Alta | Sedes, carreras, planes, asignaturas y prerrequisitos |
| RF4 | Alta | Períodos académicos (fechas, ventana de inscripción, estado) |
| RF5–RF6 | Alta | Docentes, estudiantes y matrícula |
| RF7–RF8 | Alta | Oferta de secciones, horarios y conflictos de docente/sala |
| RF9–RF10 | Alta | Consulta de oferta e **inscripción con 7 reglas automáticas** |
| RF11 | Media | Portal docente (secciones y nómina) |
| RF12 | Media | Consultas: matrícula, ocupación, cupos, carga docente |

El flujo crítico es **CU8 / RF10** (inscribir asignaturas). El sistema acepta la inscripción solo si se cumplen todas las reglas, y el mensaje de error nombra *cuál* falló:

1. Matrícula vigente en el período
2. Ventana de inscripción abierta
3. Cupo disponible
4. Asignatura del plan de la matrícula
5. Prerrequisitos aprobados
6. Asignatura no aprobada previamente
7. Sin choque de horario con otras inscripciones del mismo período

Detalle: [`context/specs/inscripcion-asignaturas.md`](context/specs/inscripcion-asignaturas.md).

## Fuera de alcance

No están en el enunciado; no se implementan salvo decisión explícita del grupo:

- Cobranza, aranceles o pagos
- Notas, actas o evaluación (el historial de aprobadas se carga por seed)
- LMS / aula virtual, asistencia, títulos o egreso
- Multi-institución

## Estructura del repositorio

Cuando arranque la implementación (épico E0):

```
gestionacademica/
├── frontend/     # React
├── backend/      # Node.js + Express
├── db/           # modelo, seed e instrucciones de MongoDB
├── context/      # enunciado curado, specs y decisiones
└── README.md
```

Registros con historia no se borran físicamente: se marcan con estado (`activo`, `inactivo`, `vigente`, `cerrado`, etc.).

## Cómo levantar el proyecto

Pendiente del bootstrap (E0-2 / E0-3). Cuando existan las carpetas, este apartado tendrá:

1. Requisitos (Node.js, MongoDB / Atlas)
2. Variables de entorno (nunca commitear secretos)
3. Seed de datos de prueba
4. Cómo arrancar frontend y backend

**Seed mínimo previsto:** 3 sedes, 4 carreras, 2 planes, 40 asignaturas, 20 docentes, 200 alumnos, 2 períodos y historial de asignaturas aprobadas (sin eso no se demuestran prerrequisitos ni «ya aprobó»).

## Documentación del caso

El enunciado original se partió en specs temáticas en [`context/`](context/README.md). Abrir solo lo que haga falta:

| Documento | Para qué |
|---|---|
| [Sistema de Diseño (UI/UX)](system-design.md) | **Fuente de verdad visual y técnica:** Mantine v7, paletas, tokens glass, componentes, feedback de 7 reglas y Do's/Don'ts |
| [Overview](context/general/overview.md) | Qué es el proyecto, reglas y fuera de alcance |
| [Glosario](context/general/glossary.md) | Términos del dominio (sección, matrícula, período, etc.) |
| [Modelo de negocio](context/specs/modelo-de-negocio.md) | Entidades y ciclo semestral |
| [Requerimientos funcionales](context/specs/requerimientos-funcionales.md) | RF1–RF12 |
| [Casos de uso](context/specs/casos-de-uso.md) | CU1–CU10 y actores |
| [Inscripción](context/specs/inscripcion-asignaturas.md) | Reglas de CU8 / RF10 |
| [Requerimientos no funcionales](context/specs/requerimientos-no-funcionales.md) | Stack, seguridad, UX |
| [Entregables](context/specs/entregables.md) | Checklist mínimo del grupo |
| [Backlog](context/specs/backlog.md) | Épicos E0–E11, sprints y ruta crítica |
| [Decisiones](context/decisions/log.md) | Por qué se eligió cada cierre de diseño |

Plan de trabajo: 5 sprints, 12 épicos. La ruta crítica hacia inscripción (E8) pasa por modelo y seed (E0), auth (E1), estructura académica (E2), períodos (E3), matrícula (E5) y oferta (E6).

## Equipo

Trabajo en grupo de 6. Curso: Desarrollo Web y Móvil. Institución de referencia del caso: Instituto Universitario Nueva Formación.
