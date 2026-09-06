# Decision log

Append-only. Más reciente arriba.

## 2026-09-06 — Sistema de Diseño institucional: Mantine v7, paleta Navy/Indigo/Amber y Liquid Glass

**Decision:** Se adopta **Mantine UI v7** como librería exclusiva para React. Paleta institucional basada en Navy (`#0f2347` / `#1e3a8a`), Índigo (`#312e81` / `#4338ca`), Acento Ámbar dorado (`#d97706`), Neutros Slate y semánticos (Teal/Crimson). Se define una identidad visual *Liquid Glass* sutil (`backdrop-filter: blur(12px)` en Headers/Navbars/Cards resumen) con filosofía UX *anti-agobio* (espaciado `md`/`lg`, tablas de máx. 7 columnas con Drawer lateral, Stepper para formularios y mapeo visual de las 7 reglas de inscripción). Documentado exhaustivamente en `system-design.md`.

**Rationale:** El prototipo del SGA debe ser legible, moderno y coherente para un equipo de 6 personas trabajando en paralelo. Mantine v7 ofrece sistema de temas centralizado, hooks nativos (`@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`) y evita inconsistencias o mezclas de frameworks.

**Rejected:** Ant Design (demasiado rígido/denso tipo ERP legacy), MUI (muy verboso), Tailwind/shadcn sin base previa instalada, interfaces recargadas sin paginación ni jerarquía.

**Scope/links:** [`system-design.md`](../../system-design.md) · [requerimientos-no-funcionales.md](../specs/requerimientos-no-funcionales.md)

## 2026-09-05 — Backlog curado como mapa, no como dump

**Decision:** Las 85 tarjetas siguen en `backlog-sga.md`. En `context/` solo el mapa de épicos, sprints y decisiones extraídas.

**Rationale:** El backlog ya está bien escrito; duplicarlo pudre el contexto. Se carga el épico just-in-time.

**Rejected:** Copiar E0–E11 enteros a `specs/`.

**Scope/links:** [backlog.md](../specs/backlog.md) · [`backlog-sga.md`](../../backlog-sga.md)

## 2026-09-05 — Auth JWT + hash; alta de usuarios por administración

**Decision:** Login con hash de contraseña y JWT; middleware por rol; ABM de usuarios con baja lógica. No hay auto-registro de estudiantes.

**Rationale:** E1 del backlog cierra el mecanismo que el enunciado dejaba abierto. Cuatro perfiles, responsabilidades distintas (Admin = usuarios/parámetros; Coordinador = estructura y oferta).

**Rejected:** Sesiones server-side sin JWT; auto-registro público.

**Scope/links:** E1 · [requerimientos-no-funcionales.md](../specs/requerimientos-no-funcionales.md)

## 2026-09-05 — Prerrequisito pertenece al plan; detectar ciclos

**Decision:** El grafo de prerrequisitos es por plan de estudios (misma asignatura, distintos prereqs). Backend impide ciclos (A→B→A). Carrera con matriculados no se borra: se cierra a nuevo ingreso.

**Rationale:** E2-4/E2-6/E2-9. Un ciclo deja asignaturas imposibles de inscribir.

**Rejected:** Prerrequisito global por código de asignatura.

**Scope/links:** [modelo-de-negocio.md](../specs/modelo-de-negocio.md)

## 2026-09-05 — Máquina de estados de período y de matrícula

**Decision:** Período: `planificación → inscripción abierta → en curso → cerrado`. Ventana de inscripción ≠ fechas del semestre. Un solo período en curso. Cerrado congela inscripciones. Matrícula: `vigente | suspendida | egresada | retirada`; una vigente por alumno en el período.

**Rationale:** E3 y E5. RF10 valida la ventana, no el semestre calendario.

**Rejected:** Un solo par inicio/fin para todo; varias matrículas vigentes en el mismo período.

**Scope/links:** E3 · E5

## 2026-09-05 — Choque de sala solo presencial; cupo atómico; docente solo lectura

**Decision:** E6-8 aplica a sala física / modalidad presencial (online no ocupa sala; el docente sí puede chocar). Cupo de inscripción = operación atómica (no `find` + `insert`). Portal docente (E9) sin notas ni asistencia.

**Rationale:** Dos validaciones independientes. Condición de carrera en el último cupo. Alcance extra se decide, no se agrega por inercia.

**Rejected:** Validar sala en secciones online; validar cupo en dos pasos; módulo de actas sin acuerdo.

**Scope/links:** E6 · E8 · E9 · [inscripcion-asignaturas.md](../specs/inscripcion-asignaturas.md)

## 2026-09-05 — Estructura de repo y seed

**Decision:** Carpetas `/frontend`, `/backend`, `/db`. Seed E0-4: 3 sedes, 4 carreras, 2 planes, 40 asignaturas, 20 docentes, 200 alumnos, 2 períodos, más historial de aprobadas.

**Rationale:** Entregable de estructura clara + datos para demostrar reglas.

**Rejected:** Empezar pantallas sin modelo (E0-1) ni seed.

**Scope/links:** E0

## 2026-09-05 — Contexto curado en `context/` (no un solo dump)

**Decision:** El enunciado se partió en overview + glosario + specs temáticas. RF y CU viven en tablas limpias; las reglas de inscripción tienen spec propia.

**Rationale:** El texto original llegó con tablas rotas. Un único markdown gigante obliga a cargar ruido. Specs chicas se abren just-in-time.

**Rejected:** Pegar el enunciado crudo en `sources/` o un `caso-completo.md`. Viola punteros-sobre-dumps.

**Scope/links:** `context/README.md`; todas las specs.

## 2026-09-05 — Stack y capas fijos por enunciado

**Decision:** React + HTML/CSS; Node.js + Express; MongoDB. Interfaz, negocio y persistencia separados. Auth por roles. Soft-states, no delete físico de historia.

**Rationale:** RNF del caso; no son preferencias del equipo.

**Rejected:** Otro frontend, SQL relacional u omitir capas — incumple la entrega.

**Scope/links:** [requerimientos-no-funcionales.md](../specs/requerimientos-no-funcionales.md)

## 2026-09-05 — Reglas académicas en backend

**Decision:** Matrícula, prerrequisitos, cupos y conflictos de horario se validan en la lógica de negocio del servidor. La UI puede adelantar el error, no ser la única barrera.

**Rationale:** Exigencia explícita del enunciado; evita bypass por cliente.

**Rejected:** Validar solo en React.

**Scope/links:** [inscripcion-asignaturas.md](../specs/inscripcion-asignaturas.md)
