# Decision log

Append-only. Más reciente arriba.

## 2026-11-08 — Choques concurrentes: transacción con bloqueo por docente y período

**Decision:** Los endpoints que validan «no choca» y luego insertan (el choque de docente al crear o mover secciones, y cualquier invariante entre documentos distintos) corren con `conTransaccion(trabajo, { bloqueos: [claveDeBloqueo('docente', docenteId, 'periodo', periodoId)] })` (`backend/src/utils/transaccion.js`). La utilidad toma primero un documento de bloqueo por clave (colección `bloqueos`, índice único) con un `$inc`; así dos creaciones simultáneas se turnan: una reintenta sola, ve la sección de la otra y se rechaza con el mensaje de choque. El cuerpo de la transacción puede ejecutarse más de una vez, así que no debe tener efectos fuera de ella. Las transacciones exigen MongoDB como replica set: los tests usan uno en memoria y Atlas lo es; en local hay que levantar `mongod --replSet rs0`, ejecutar `rs.initiate()` y usar `?replicaSet=rs0`. Un MongoDB suelto da un error claro (`ErrorDeTransaccion`). El cupo (`inscritos < cupoMaximo`) sigue siendo una sola operación atómica y no necesita bloqueo.

**Rationale:** Se comprobó con un experimento: dos transacciones simultáneas con el mismo bloque dejaron **ambas** secciones guardadas (cada una lee un estado sin choque e inserta un documento distinto). Con el documento de bloqueo se guarda una sola y la otra se rechaza. Hay un test que deja esa prueba ejecutable. Responde la D-10 de Diego y la D-13 de Matias.

**Rejected:** Una transacción sola (no basta); «validar y luego insertar» sin defensa (deja una ventana de carrera: solo sería aceptable si el grupo decide documentarla como límite); un índice único por franja horaria (inserciones parciales difíciles de deshacer).

**Scope/links:** E6-8 (Diego) y E8 (Matias) · [`backend/README.md`](../../backend/README.md) · `backend/tests/utils/transaccion.test.js`

## 2026-11-08 — Modalidad semipresencial: atributo de la sección

**Decision:** Para el alcance actual la modalidad (`presencial`, `semipresencial`, `online`) es un atributo de la **sección completa**, no de cada bloque horario. Los bloques solo llevan el día y el intervalo en minutos. No hay colección de salas: la sala es un texto opcional e informativo de la sección, así que no se valida choque de sala. El choque que sí se valida es el de docente, y vale igual para las tres modalidades.

**Rationale:** Es lo que ya describe el modelo del MVP (`modalidad` en `secciones`, bloques sin `salaId`) y evita validar salas que no existen. Responde la D-06 de Diego.

**Rejected:** Modalidad por bloque (más fiel a las clases mixtas, pero obliga a modelar salas y a validar el choque de sala por bloque). Si el grupo lo necesita más adelante, se agrega un campo opcional `modalidad` al bloque y esta decisión se reemplaza.

**Scope/links:** E6 (Diego) · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md`. **Pendiente de confirmar con el grupo:** el plan lo dejaba como pendiente de dominio.

## 2026-11-07 — Seed y fines de línea

**Decision:** El seed son archivos `db/seed/NN-*.js` (numeración única, orden numérico) que se ejecutan con `npm run seed` desde `backend/`; son idempotentes y referencian por clave natural (código, RUT, correo), nunca por `ObjectId`. El runner vive en `backend/src/seed/` porque `mongoose` solo está instalado en `backend/` y un archivo en `db/` no puede importarlo. `--reset` borra toda la base tras una confirmación y se niega en producción. El repositorio fija `* text=auto eol=lf` (`.gitattributes`) y `.editorconfig`.

**Rationale:** Datos de demostración repetibles sin duplicar. Los «28 archivos modificados» coinciden con los 28 archivos que la rama `biñi` guarda con fines de línea CRLF dentro del repositorio: Git los ve reescritos línea a línea según la configuración de cada computador (causa más probable; no se pudo reproducir el recuento exacto de líneas). Quien tenga una rama con archivos CRLF debe correr `git add --renormalize .` después de traer `pre-main`.

**Rejected:** `package.json` propio en `db/` (dos copias de `mongoose`); `deleteMany` implícito; IDs fijos en los archivos de semilla.

**Scope/links:** [`db/README.md`](../../db/README.md) · JUA-3 y JUA-4

## 2026-11-07 — Seguridad y sesión

**Decision:** `helmet`, límite de body de 100 kb y CORS con lista blanca tomada de `CORS_ORIGIN` (nunca `*`); en desarrollo el proxy de Vite evita CORS. Los registros (`morgan`) solo llevan método, ruta sin query string, estado y tiempo: nunca bodies, cabeceras ni tokens. `validate` descarta los campos sin regla (el servicio solo recibe lo validado, contra *mass assignment*) e informa todos los errores de todos los campos sin repetir los valores enviados. Un error inesperado responde 500 genérico y se registra solo en el servidor. El token JWT vive en `sessionStorage` (provisional; lo revisa Endert) y un 401 con token cierra la sesión y lleva al login sin recargar.

**Rationale:** Reducir lo que la API puede filtrar y lo que un cliente puede colar.

**Rejected:** `localStorage` (el token queda expuesto más tiempo a XSS); cookie `httpOnly` (cambia el contrato `Authorization: Bearer` y exige CORS con credenciales).

**Scope/links:** JUA-1, JUA-2 y JUA-4 · [`backend/README.md`](../../backend/README.md) · [`frontend/README.md`](../../frontend/README.md)

## 2026-11-07 — Stack y herramientas del backend

**Decision:** Node 22 (22.12 o superior, fijado en `.nvmrc` y `engines`), módulos ESM, Express 5, Mongoose, `express-validator` para validar la entrada, Vitest y Supertest para las pruebas, `mongodb-memory-server` (replica set) como base temporal de los tests y `oxlint` como linter (el mismo del frontend). `app.js` construye la aplicación sin escuchar; `server.js` valida el entorno, conecta y escucha. El entorno falla al arrancar si falta algo (`MONGO_URI`, `JWT_SECRET` de 32 caracteres o más; `CORS_ORIGIN` solo es obligatoria en producción) y se carga con `--env-file-if-exists`.

**Rationale:** ESM es lo que ya usa el frontend; Express 5 reenvía solo los rechazos de promesas de los handlers `async` al manejador de errores (verificado en su guía de migración); Node 22 es LTS y lo soportan todos los paquetes; los tests no dependen de internet ni de Atlas (solo la primera vez descargan `mongod`).

**Rejected:** CommonJS; Express 4 con `asyncHandler`; Jest (ESM experimental); `dotenv`; Atlas compartida para los tests.

**Scope/links:** JUA-1 y JUA-3 · [`backend/README.md`](../../backend/README.md)

## 2026-11-07 — Contrato de la API: formato, códigos HTTP, enums y paginación

**Decision:** Éxito `{ data }` o `{ data, meta: { page, limit, total } }`; error plano `{ code, regla, message, details? }` (`regla` es `null` si no es una regla académica). Códigos HTTP: 400 forma inválida, 401 sin sesión o token vencido, 403 sin permiso, 404 no existe, 409 duplicado o estado, 422 regla académica violada. Los `code` llevan prefijo de dominio (`GEN_`, `AUT_`, `INS_`…) y se declaran en `backend/src/errors/codigos/`. Los ids viajan como `id` (`_id` y `__v` nunca salen), las fechas en ISO 8601 y los enums en ASCII sin tildes (`backend/src/constants/enums.js`). Las listas paginan por offset (`?page&limit&sort`) con `limit` máximo de 100, `sort=campo` o `sort=-campo` solo con campos permitidos por cada dominio, y desempate por `_id`; un valor inválido se rechaza con 400. Los bloques horarios viajan en minutos desde las 00:00 (`dia` 0 = lunes … 5 = sábado, intervalo semiabierto).

**Rationale:** Una sola forma de responder y de fallar para los seis dominios. El 422 distingue «el dato es válido pero rompe una regla» del 409 «choca con el estado actual». Los minutos simplifican el cálculo de choques de horario.

**Rejected:** Corregir en silencio `page` y `limit` inválidos; ordenar por cualquier campo del modelo (filtraría información por el orden); exponer `_id`.

**Scope/links:** [`backend/README.md`](../../backend/README.md) · JUA-2. **Abierto con el grupo:** `system-desing.md` §6.1 usa 409 para las reglas de inscripción y 422 para los formularios, al revés que este contrato; hay que acordar cuál manda y actualizar el otro.

## 2026-11-07 — MVP simplificado: 10 colecciones y permisos fijos por rol

**Decision:** El modelo tiene 10 colecciones: `usuarios` (docentes y estudiantes como `perfilDocente` y `perfilEstudiante` embebidos, con el historial de aprobadas), `sedes`, `carreras`, `asignaturas`, `planesEstudio` (prerrequisitos por plan), `periodos`, `matriculas`, `secciones` (con los bloques horarios embebidos y sin salas), `inscripciones` y `parametros` (un documento único). Los permisos son fijos por rol en el código (middleware); la pantalla de permisos del administrador es informativa.

**Rationale:** Menos colecciones y menos referencias; lo embebido se lee en una sola consulta.

**Rejected:** Colecciones `docentes`, `estudiantes`, `salas`, `bloquesHorarios`, `historialAcademico` y `permisos`.

**Scope/links:** `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` (sección «Modelo MongoDB») · E1–E8

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
