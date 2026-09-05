# Overview — Sistema Web de Gestión Académica (SGA)

> Brief estable. Qué es el proyecto y las reglas de juego. Cambia poco.

## What it is

Plataforma web para el Instituto Universitario Nueva Formación (3 sedes, ~4.500 estudiantes, modalidades presencial / semipresencial / online). Centraliza lo que hoy vive en hojas de cálculo, archivos sueltos, correos y formularios: estructura académica, oferta de secciones, matrículas e inscripciones, con perfiles diferenciados para Administrador, Coordinador Académico, Docente y Estudiante.

## Goal

Que la institución opere el ciclo semestral en un solo sistema: planificar oferta, matricular, inscribir con reglas automáticas y consultar información actualizada — sin duplicidad ni versiones divergentes.

Éxito observable: un prototipo fullstack (React + Node.js/Express + MongoDB) con autenticación por roles, flujos end-to-end y evidencia de las reglas de inscripción.

## What to aim at

- Centralizar estudiantes, docentes, carreras, planes, asignaturas, secciones e inscripciones.
- Automatizar validaciones académicas (no solo UI).
- Reducir errores administrativos (cupos, horarios, prerrequisitos, salas).
- Dar visión consolidada a coordinación y administración.
- Entrega académica: evidencia Fullstack, no un mock desconectado.

## Rules & constraints

- Stack fijo: frontend React + HTML + CSS; backend Node.js + Express; persistencia MongoDB.
- Arquitectura en capas: interfaz, lógica de negocio y persistencia separadas.
- Responsive: computador, tableta y móvil.
- Autenticación segura y control de acceso por roles.
- Validación de formularios en frontend y/o backend; **reglas académicas principalmente en backend**.
- Sin borrado físico de registros con historia; usar estados (activo, inactivo, vigente, cerrado).
- Mensajes de error que indiquen la regla académica que bloquea la acción.
- Institución de referencia: Instituto Universitario Nueva Formación; organización por semestres.
- Repo: `/frontend`, `/backend`, `/db`. Auth: hash de contraseña + JWT (backlog E1).
- Trabajo: equipo de 6 (P1–P6). Plan en `specs/backlog.md`; tarjetas en `backlog-sga.md`.

## Stakeholders

| Perfil | Qué hace en el sistema |
|---|---|
| Administrador | Usuarios y parámetros institucionales; consultas/reportes |
| Coordinador Académico | Estructura académica, períodos, personas, matrícula, oferta, reportes |
| Docente | Consulta secciones asignadas y nómina de inscritos |
| Estudiante | Consulta oferta e inscribe asignaturas de su plan |

Cliente institucional: Instituto Universitario Nueva Formación (caso de curso Desarrollo Web y Móvil).

## Out of scope

No aparecen en el enunciado; no implementar salvo que se pida:

- Cobranza, aranceles o pagos
- Ingreso de notas / actas / evaluación (E9 lo confirma; solo seed de historial salvo decisión extra)
- LMS o contenidos de aula virtual
- Asistencia
- Títulos, certificados o egreso
- Multi-institución (es una sola institución)

## Problema (resumen)

Información fragmentada → versiones distintas → conflictos de horario docente/sala → cupos opacos → validación manual de inscripción → sin portal único ni reportes consolidados.

## Solución (resumen)

SGA web con auth por perfiles, CRUD de estructura y oferta, inscripción con reglas automáticas, y consultas para planificación.
