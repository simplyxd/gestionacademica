# Asignación de Diego — Oferta de secciones y horarios

| | |
|---|---|
| **Responsable** | Diego |
| **Tu rama** | `diego-branch` (se crea desde `origin/pre-main`) |
| **Épicos** | **E6** oferta y horarios (RF7, RF8) · **E7** consulta de oferta (RF9) |
| **Depende de** | Juan (H0) · Endert (`authenticate`, listado de docentes) · Lorenzo (sedes, asignaturas) · Matias (períodos) · Angel (matrícula/plan del alumno para la oferta por defecto) |
| **Desbloquea** | **Matias** (su regla 7 usa tu `utils/horario.js` y sus inscripciones apuntan a tus secciones) · Endert (portal docente) · Lorenzo (reportes) |
| **Tu PR lo revisa** | Matias (y tú revisas los de Matias) |

> **Cómo usar este archivo:** abre tu IA en la raíz del repo y dile: *«Lee `asignaciones/asignacion-diego.md` completo y síguelo al pie de la letra como mi tutor. Empieza por la Etapa 0.»*

---

## 🧭 PROTOCOLO OBLIGATORIO PARA LA IA

> **IA que estás leyendo esto:** implementas la tarea de **Diego**. Si te piden que construyas el código, lo escribes tú: modelos, servicios, rutas, componentes y tests.

### 1. Reglas duras

| # | Regla |
|---|---|
| **R1** | **Una pregunta a la vez.** Contexto en 2–3 líneas → UNA pregunta → espera. Nunca respondas tu propia pregunta en el mismo mensaje. |
| **R2** | **Toda decisión de diseño se pregunta.** Las decisiones `D-xx` de las tareas son obligatorias, una por una. Si aparece una decisión que no está listada (nombres, estructura, librería, código HTTP, índice, validación, qué hacer en un caso borde…), también se pregunta. No decides por la persona. |
| **R3** | **Escribes el código de la tarea.** Modelos, servicios, rutas, componentes y tests, siguiendo el contrato de este archivo. |
| **R4** | **Escala de ayuda** ante una respuesta débil o errónea (no corrijas de golpe): **N1** pregunta que apunta al hueco → **N2** analogía o contraejemplo → **N3** explicas el concepto y la persona vuelve a decidir con sus palabras. Solo si N3 también falla puedes dar la respuesta, y la decisión queda marcada como *asistida* en la bitácora. |
| **R5** | **Tests primero** en toda regla de negocio: la persona escribe el test que falla (rojo) antes de la regla (verde). Pregunta: «¿qué caso borde probarías primero y por qué?». |
| **R6** | **Avanzas por etapas con puertas** (sección 3). No pasas a la siguiente etapa sin cumplir el criterio de salida de la actual. |
| **R7** | **Construcción.** Si la persona pide que construyas la tarea, la implementas. No te niegas a escribir el código. |
| **R8** | **Defensa de código.** Todo código que la persona escriba o pegue se revisa pidiéndole que lo explique línea por línea («¿qué pasa si este valor llega vacío?»). Si hace falta corregirlo, lo reescribes tú. |
| **R9** | **Bitácora.** Tras cada decisión, agrega una entrada a `asignaciones/bitacoras/diego.md` con la plantilla (secc. 4), **con las palabras de la persona**, no las tuyas. Es la evidencia de aprendizaje y se enlaza en cada PR. |
| **R10** | **Límite de alcance.** Solo se tocan los archivos de «Archivos propios». Si hay que cambiar un archivo ajeno: detente, indica a quién pertenece y ayuda a redactar el mensaje (plantilla en secc. 6). |
| **R11** | **Honestidad.** Si algo de este MD, del plan o del repo no coincide con la realidad, o no sabes algo, dilo y pregunta; no inventes. Si una decisión afecta a otras personas, súbela al grupo (`context/decisions/log.md`), no la tomes en silencio. |
| **R12** | **Seguridad por defecto.** Nunca secretos en el repo, nunca contraseñas reales, nunca desactivar validaciones «para probar». Si la persona lo pide, pregunta qué riesgo corre. |
| **R13** | **Git.** Antes de cada commit/push verifica `git branch --show-current`. Si no es `diego-branch`, detente. Jamás commits a `main` ni `pre-main`. |
| **R14** | **Tono.** Español, tuteo, cercano, sin condescendencia. Define cada término técnico la primera vez y pide un ejemplo propio de la persona. |

### 2. Lo que sí puedes hacer sin preguntar (Delegable general)

Instalar dependencias *después* de explicar para qué sirve cada una · generar datos de relleno para seeds (nombres, RUTs ficticios válidos, textos) · redactar la bitácora y la descripción del PR a partir de lo que la persona decidió · ejecutar y leer resultados de tests/lint/build · buscar en el repo y resumir lo que encuentres · formatear. Cada tarea agrega su propia lista «Delegable».

### 3. Etapas y puertas

| Etapa | Qué haces tú (IA) | Criterio de salida |
|---|---|---|
| **E0 · Comprensión** | Pide que lea «Primero lee». Luego pídele que explique **sin mirar**: qué construye, para quién, de qué depende, qué NO incluye. Recién ahí contrasta con el repo. | Explica en ≤5 frases correctas y formula ≥2 dudas propias. |
| **E1 · Diseño** | Recorre las `D-xx` **una por una** (R1, R2). Pide que escriba el contrato (rutas, permisos, respuestas, errores) y el modelo en la bitácora. | Contrato escrito + todas las `D-xx` respondidas y registradas. |
| **E2 · Tests primero** | Escribes los tests (feliz, bordes, error de regla, 401/403) y después el código que los pone en verde. | Tests en rojo **por la razón correcta**. |
| **E3 · Implementación** | Una capa a la vez (modelo → servicio → controlador → ruta), un commit pequeño por paso. Revisa con R8. | Tests en verde, lint limpio, commits atómicos. |
| **E4 · Integración (front)** | Mismo método para la parte de pantallas: contrato → estados (cargando/vacío/error) → conexión. | Pantalla funciona contra la API real; mock retirado o justificado. |
| **E5 · Revisión** | La persona se autorrevisa con el checklist (secc. 5) **antes** que tú. Tú señalas lo que falte *como preguntas*, no como parches. | Checklist completo, sin pendientes ocultos. |
| **E6 · Defensa y PR** | Haz **5 preguntas**: (1) por qué una decisión clave, (2) un caso borde, (3) permisos/seguridad, (4) qué pasa si algo falla o dos personas hacen lo mismo a la vez, (5) cómo lo probó. Luego redacta el PR con la plantilla (secc. 7). | ≥4/5 respondidas sin llegar a N3; si no, vuelve a E3 en lo débil. |

### 4. Plantilla de bitácora (`asignaciones/bitacoras/diego.md`, solo se agrega, nunca se borra)

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Diego (sus palabras):
- Alternativa que se descartó y por qué:
- Decisión final:
- Qué aprendió / qué quedó pendiente:
```

### 5. Checklist de revisión (E5)

**Backend**
- [ ] Capas respetadas: ruta (cableado + authz + validación) → controlador (solo HTTP) → servicio (reglas) → modelo. **Cero reglas de negocio en el controlador.**
- [ ] Validación de entrada en el borde; la identidad y el rol salen del **token**, jamás del body.
- [ ] Cada ruta tiene `authenticate` + `authorize(...)` explícitos y test de **401** y **403**.
- [ ] Errores con `AppError` y `code` estable; el mensaje (español) **nombra la regla y el dato concreto**.
- [ ] Sin borrado físico de datos con historia: se cambia `estado`.
- [ ] Unicidad e invariantes garantizadas **en la BD** (índices únicos/parciales), no solo en código; el error llega como 409 legible.
- [ ] Operaciones concurrentes (contadores, «solo uno vigente») son atómicas.
- [ ] Listas paginadas con tope; sin consultas en bucle (N+1).
- [ ] Sin secretos ni datos personales en logs; `.env.example` al día.
- [ ] Tests: caso feliz + bordes + regla violada + 401/403. Seed idempotente.

**Frontend**
- [ ] Respeta `design-system/sga/MASTER.md`: tokens, **cero hex**, tuteo, un `h1`, una acción primaria por vista.
- [ ] Estados **cargando / vacío / error** resueltos; errores de regla persistentes y con salida (no solo toast).
- [ ] Accesible: labels visibles, `aria-label` en `ActionIcon`, foco visible, color no es el único canal.
- [ ] Tipos del API sin `any`; enums ASCII del contrato con su etiqueta en español.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` en verde.
- [ ] El mock reemplazado se elimina o se justifica por escrito.

**Git**
- [ ] Commits en formato `tipo(ámbito): mensaje` y atómicos. PR pequeño y con una sola idea.
- [ ] Sin `.env`, `node_modules`, `dist`, `.DS_Store`, ni cambios masivos de fin de línea.

### 6. Plantilla para pedir un cambio a otra persona (R10)

```
Hola <nombre>, estoy en <tarea>. Necesito que <archivo/contrato> haga <qué>
porque <regla o caso de uso>. Lo probé así: <qué intenté>. ¿Lo agregas tú o me
das tu OK para tocar solo estas líneas en mi PR? Contexto: <enlace a la entrada de bitácora>.
```

### 7. Plantilla de PR

```
Título: tipo(ámbito): resumen en imperativo
## Qué y por qué     (qué cambia y qué requerimiento cubre: RF/CU/épico)
## Decisiones        (enlaces a las entradas de bitácora D-xx)
## Cómo probar       (pasos y comandos; qué debería verse)
## Checklist         (secc. 5 pegada y marcada)
## Riesgos / pendientes
## Capturas          (si hay UI)
```

---

## 📐 CONTRATO TRANSVERSAL (igual para las 6 personas; no se negocia por tarea)

Si crees que algo de aquí debe cambiar, **no lo cambies en tu código**: propónselo a Juan y regístralo en `context/decisions/log.md`.

### API

- Prefijo `/api`, JSON, recursos en **plural español minúscula**: `/api/sedes`, `/api/carreras`, `/api/planes`, `/api/asignaturas`, `/api/periodos`, `/api/usuarios`, `/api/matriculas`, `/api/secciones`, `/api/oferta`, `/api/inscripciones`, `/api/parametros`, `/api/reportes`, `/api/auth`, `/api/docente`.
- **Éxito:** `{ "data": <objeto> }` · listas: `{ "data": [...], "meta": { "page", "limit", "total" } }` · query de listas: `?page=1&limit=20&q=&sort=` (límite máximo 100).
- **Error (plano):** `{ "code": "INS_SIN_CUPO", "regla": "Cupo disponible", "message": "La sección MAT-101 A está llena (30/30).", "details": {…opcional} }`. `message` en español, nombra la regla y el dato concreto. `regla` es `null` si no es una regla académica.
- **Códigos HTTP:** `400` forma inválida (campos) · `401` sin sesión / token inválido o vencido · `403` rol sin permiso · `404` no existe (o no es tuyo: no filtres existencia) · `409` choque de unicidad o de estado (duplicado, transición inválida) · `422` **regla académica violada** (cupo, prerrequisito, choque de horario, ciclo…).
- **Prefijos de `code`:** `GEN_` genérico · `AUT_` · `USR_` · `PAR_` · `SED_` · `ASG_` · `CAR_` · `PLN_` · `PER_` · `PRS_` (perfiles) · `MTR_` (matrícula) · `SEC_` · `OFE_` · `INS_` · `DOC_` · `REP_`. Cada dominio declara sus códigos en `backend/src/errors/codigos/<dominio>.js` (nunca strings sueltos).
- **Auth:** `Authorization: Bearer <jwt>`, payload `{ sub, rol, sedes }`; el middleware deja `req.user = { id, rol, sedes }`. **La identidad sale del token, nunca del body.**
- **IDs** viajan como `id` (string); `_id`/`__v` no salen al cliente. **Fechas** `YYYY-MM-DD`; marcas de tiempo ISO 8601.

### Enums (viajan en ASCII, sin tildes ni espacios; el front los traduce a etiquetas)

| Concepto | Valores |
|---|---|
| rol | `admin` · `coordinador` · `docente` · `estudiante` |
| estado usuario | `activo` · `inactivo` |
| estado sede | `activa` · `en_mantenimiento` · `inactiva` |
| estado carrera | `activa` · `inactiva` (inactiva = cerrada a nuevo ingreso) |
| estado plan | `vigente` · `historico` |
| tipo de asignatura en plan | `obligatoria` · `electiva` |
| estado período | `planificacion` · `inscripcion_abierta` · `en_curso` · `cerrado` |
| estado matrícula | `vigente` · `suspendida` · `egresada` · `retirada` |
| modalidad | `presencial` · `semipresencial` · `online` |
| jornada | `diurna` · `vespertina` (catálogo abierto: lo cierra el grupo) |
| estado sección | `abierta` · `cerrada` · `cancelada` (Diego confirma en su D-xx) |
| estado inscripción | `activa` · `anulada` |

**Bloque horario:** `{ "dia": 0..5, "inicioMin": 480, "finMin": 570 }` — `0` = lunes … `5` = sábado; minutos desde 00:00; intervalo **semiabierto `[inicioMin, finMin)`**: un bloque que termina a las 10:00 y otro que empieza a las 10:00 **no** chocan. (El plan original decía `horaInicio/horaFin`; se usan minutos porque el frontend ya los usa y la aritmética de solapes es más simple y menos propensa a errores.)

### Capas y nombres en `backend/src/`

`routes/<dominio>.routes.js` → `controllers/<dominio>.controller.js` → `services/<dominio>.service.js` → `models/<entidad>.model.js` (singular). Validación en `<dominio>.schemas.js`. Enums compartidos en `constants/enums.js` (los define Juan; nadie crea sus propias copias). Pruebas junto a cada servicio o en `backend/tests/<dominio>/`.

### Seed (`db/seed/`)

Archivos numerados que se ejecutan en orden y son **idempotentes** (correrlos dos veces no duplica): `01-parametros-usuarios` (Endert) · `02-sedes` · `03-asignaturas` · `04-carreras` · `05-planes` (Lorenzo) · `06-periodos` (Matias) · `07-personas` · `08-matriculas` (Angel) · `09-secciones` (Diego) · `10-inscripciones` (Matias). Se referencian entre sí por **clave natural** (código, RUT, correo), nunca por `ObjectId` fijo.

### Frontend

`frontend/src/lib/api.ts` (lo crea Juan) es el **único** lugar que hace `fetch`. Cada dominio reemplaza su Context/mock por llamadas a la API; las reglas de `rules.ts` quedan solo como **validación previa** (la autoridad es el backend y su mensaje se muestra tal cual). `router.tsx` y `navigation.ts` son de Juan: si necesitas una ruta nueva, cambia **solo tu línea** y avísalo en el PR.

---

## 🎯 Tus tareas

### Primero lee (E0)
`context/specs/requerimientos-funcionales.md` (RF7, RF8, RF9) · `context/specs/casos-de-uso.md` (CU6, CU7) · `context/specs/inscripcion-asignaturas.md` (consulta de oferta + la regla 7, que también usa tus bloques) · `context/specs/modelo-de-negocio.md` · `context/decisions/log.md` (entrada «Choque de sala solo presencial; cupo atómico») · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` (modelo `secciones`, E6, E7) · en el frontend: `features/oferta/*` (`conflictos.ts` y `reglasOferta.ts` con sus tests son una **especificación ejecutable**), `features/horario/types.ts`, `mock/oferta.ts`, `mock/docentes.ts`, `mocks/sga.ts`, `mock/datos-de-prueba.ts`.

### Archivos propios
`backend/src/utils/horario.js` · `backend/src/models/seccion.model.js` · `backend/src/{routes,controllers,services}/{secciones,oferta}.*` · `backend/src/errors/codigos/{secciones,oferta}.js` · `db/seed/09-secciones.js` · Frontend: `features/oferta/**` · `mock/oferta.ts` · `mock/docentes.ts` · `mocks/sga.ts` (se retira junto con Matias; quien termine último lo borra).
**Ajenos que usas:** listado de docentes `GET /api/usuarios?rol=docente&estado=activo` (Endert) · estados de período (Matias).

---

### DIE-1 · `utils/horario.js`: solapes de bloques *(PR pequeño, primero)*
**Objetivo:** una función pura de la que dependen **dos reglas del sistema**: tu choque de docente y la regla 7 de inscripción de Matias.

**Aceptación**
- [ ] `bloquesSeSolapan(a, b)` y `buscarSolapes(listaA, listaB)` sobre `{dia, inicioMin, finMin}` con intervalos **semiabiertos** `[inicio, fin)`.
- [ ] Valida un bloque (`dia` 0..5, `0 ≤ inicioMin < finMin ≤ 1440`).
- [ ] Tests de bordes: contiguos (10:00 fin / 10:00 inicio → **no** chocan), contenido, mismo inicio, distinto día, bloque de 1 minuto, bloque inválido.
- [ ] Mismos resultados que `detectarChoques` del front para los mismos casos.
- [ ] Avisas a Matias cuando esté mergeado.

**Decisiones guiadas**
- **D-01** ¿Por qué `[inicio, fin)` y no `[inicio, fin]`? Muestra el caso que se rompería con el otro. — *Criterio:* dos clases consecutivas (08:30–10:00 y 10:00–11:30) no deben chocar.
- **D-02** ¿Qué haces si llega un bloque inválido: lanzas, devuelves falso, lo ignoras? — *Criterio:* nunca silenciar datos inválidos; fallar con mensaje.

### DIE-2 · Modelo `Seccion` + seed (E6-1…E6-3)
**Aceptación**
- [ ] Campos: `asignaturaId`, `periodoId`, `docenteId`, `sedeId`, `jornada`, `modalidad`, `sala` (texto opcional), `letra`, `cupoMaximo`, `inscritos` (contador, nunca negativo ni mayor al cupo), `estado`, `bloques[]` embebidos.
- [ ] `letra` única por (`asignaturaId`, `periodoId`).
- [ ] Índices: (`periodoId`,`asignaturaId`) y (`docenteId`,`periodoId`) — di para qué consulta sirve cada uno.
- [ ] Seed `09`: secciones para ambos períodos, con docentes y sedes reales del seed, sin choques de docente, y con **algunas llenas o casi llenas** para demostrar la regla 3.
- [ ] Tests de modelo.

**Decisiones guiadas**
- **D-03** ¿Cómo asignas la letra (A, B, C…) sin que dos coordinadores obtengan la misma? — *Criterio:* único por índice; asignación sin condición de carrera.
- **D-04** ¿Qué estados tiene una sección y qué significa cada uno para el estudiante? — *Criterio:* propón `abierta/cerrada/cancelada` (contrato) o justifica otro; una `cancelada` ¿qué pasa con sus inscritos? Coordina con Matias y registra.
- **D-05** `inscritos` es un contador y no se calcula al vuelo: ¿por qué? ¿Quién lo modifica? — *Criterio:* lectura barata de la oferta; **solo** el servicio de inscripción (Matias) lo cambia, de forma atómica. Tú nunca lo editas a mano.
- **D-06** Semipresencial: ¿la modalidad es de la sección o de cada bloque? — *Criterio:* es un pendiente del grupo; presenta pros/contras (complejidad vs. fidelidad), propón y registra la decisión antes de modelar.

**Delegable:** datos de relleno del seed una vez diseñada la lógica de reparto sin choques.

### DIE-3 · API de secciones y choque de docente (E6-4…E6-9)
**Contrato** (`authenticate`; escritura solo `coordinador` dentro de sus sedes)
| Ruta | Notas |
|---|---|
| `GET /api/secciones?periodoId=&sedeId=&docenteId=&asignaturaId=` | coordinador/admin |
| `POST /api/secciones`, `PATCH /api/secciones/:id` | valida y detecta choques |
| `PATCH /api/secciones/:id/estado` | `abierta/cerrada/cancelada` (sin borrado físico) |

**Aceptación**
- [ ] **Choque de docente:** el mismo docente, mismo período, bloques que se solapan → `422 SEC_CHOQUE_DOCENTE` con `details` que nombra la otra sección y el bloque. Al **editar**, la propia sección se excluye de la comparación.
- [ ] El docente debe existir, estar **activo** y tener rol `docente`; la asignatura y la sede existen; la sede está en el alcance del coordinador.
- [ ] No se edita la oferta de un período `cerrado`.
- [ ] Una sección **online** no ocupa sala. Choque de sala: solo si el grupo lo incluye (D-08); en ese caso, solo presencial.
- [ ] Mínimo un bloque; todos válidos; sin bloques que se solapen **entre sí**.
- [ ] Tests: caso feliz, cada rechazo, 401/403/404, edición sin falso choque contra sí misma.

**Decisiones guiadas**
- **D-07** Definición exacta de «choque de docente»: ¿cuenta aunque sean sedes distintas? ¿y modalidad online? — *Criterio:* el docente no puede estar en dos lugares a la vez, así que **sí** cuenta en cualquier sede/modalidad; escríbelo y testéalo.
- **D-08** Choque de sala (`sala` es texto libre): ¿lo incluyes en el MVP? ¿cómo comparas «A-101» con «a 101»? — *Criterio:* el plan lo deja opcional; decisión de grupo. Si entra: normalización y solo presencial. Si no entra: queda registrado como límite conocido.
- **D-09** Un coordinador edita los bloques o baja el cupo de una sección que **ya tiene inscritos**: ¿qué permites? — *Criterio:* el cupo nunca puede ser menor a los inscritos (el front tiene ese caso de prueba); mover bloques puede romper horarios ya inscritos → prohibirlo, advertirlo o exigir anular; elige, argumenta y avisa a Matias.
- **D-10** Dos coordinadores crean al mismo tiempo secciones que chocan para el mismo docente: ¿tu validación lo detecta? — *Criterio:* reconoce el límite de «validar y luego insertar»; decide si basta con documentarlo o si necesitas una defensa adicional.

### DIE-4 · Consulta de oferta para el estudiante (E7-1…E7-4)
**Contrato** (`authenticate`; estudiante y coordinador)
| Ruta | Notas |
|---|---|
| `GET /api/oferta?periodoId=&q=&jornada=&modalidad=&dia=&cupo=con_cupo\|llena&todas=false&page=` | por defecto **el plan del alumno** (`todas=true` para ver todo) |

**Aceptación**
- [ ] Filtros: asignatura (código o nombre), jornada, modalidad, día y disponibilidad de cupo; paginación de servidor.
- [ ] Cada sección trae `cupoDisponible` y `llena`; **no** expone datos que el alumno no necesita.
- [ ] Por defecto el período correcto y el plan de la matrícula vigente del alumno (usa el servicio de Angel `matriculaVigente`).
- [ ] Consulta con índices adecuados (compruébalo con `explain`).
- [ ] Tests: cada filtro, combinación de filtros, alumno sin matrícula, página vacía.

**Decisiones guiadas**
- **D-11** ¿De qué período muestra secciones al estudiante: `en_curso`, `inscripcion_abierta` o ambos? — *Criterio:* el estudiante se inscribe mientras la inscripción está abierta; **acuerda la regla con Matias** (su D-06) y regístrala.
- **D-12** Si el alumno no tiene matrícula vigente, ¿qué devuelves? — *Criterio:* una respuesta útil (la oferta general con aviso), no un error opaco; la regla 1 se aplica al *inscribir*, no al *mirar*.
- **D-13** ¿Cómo evitas calcular `cupoDisponible` en JS para miles de secciones? — *Criterio:* proyección/agregación en la BD con el contador `inscritos`.

### DIE-5 · Frontend de la oferta del coordinador
**Aceptación**
- [ ] `OfertaContext`/`useOferta` contra la API; `OfertaCoordinadorPage`, `OfertaSecciones`, `OfertaSemanal`, `SeccionFormDrawer` y `OfertaSeccionDrawer` funcionan con datos reales.
- [ ] El formulario sigue el patrón de pasos del design system (`Stepper`, ≤7 campos por paso); el selector de docentes lista **solo activos** desde la API.
- [ ] El `422 SEC_CHOQUE_DOCENTE` se muestra con la sección y el bloque en conflicto, de forma persistente.
- [ ] `conflictos.ts`/`reglasOferta.ts` quedan como validación previa; sus tests siguen pasando.
- [ ] `mock/oferta.ts` y `mock/docentes.ts` retirados o justificados.

**Decisiones guiadas**
- **D-14** ¿Qué valida el front antes de enviar y qué se deja al servidor? — *Criterio:* el front adelanta lo evidente; el servidor decide y su mensaje manda.
- **D-15** En `OfertaSemanal`, ¿cómo muestras un choque sin depender solo del color? — *Criterio:* icono + texto, `MASTER.md` §4 (color no es el único canal).

### DIE-6 · Frontend de la oferta del estudiante (RF9)
**Aceptación**
- [ ] `OfertaPage` con filtros (asignatura, jornada, modalidad, día, cupo) que viajan a la API; `CupoIndicator` usa `cupoDisponible`.
- [ ] Se distingue claramente **sección llena** vs. con cupo; estados cargando/vacío/error resueltos.
- [ ] Desaparece el campo `inscritosOtros` del mock: ahora el dato real viene del contador.
- [ ] Responsive (computador, tableta, móvil); la tabla pasa a lista de tarjetas en móvil (design system §5.2).
- [ ] `mocks/sga.ts` se retira cuando Matias también termine.

**Decisiones guiadas**
- **D-16** Con filtros activos y paginación de servidor, ¿qué pasa al cambiar un filtro estando en la página 3? — *Criterio:* se vuelve a la página 1; el estado de los filtros vive en la URL o en un solo lugar.

---

## 🌿 FLUJO DE GIT (obligatorio)

El repositorio es la carpeta `gestionacademica/gestionacademica/` (la que contiene `.git`). `pre-main` es la rama de integración; `main` es la entrega final.

**1. Tu rama y tu working tree.** Trabajas **solo** en `diego-branch`. Te recomendamos tu propio *git worktree* (una carpeta aparte con tu rama, así no mezclas tu trabajo con el de otros ni pierdes cambios al cambiar de rama):

```bash
git fetch origin
git worktree add -b diego-branch ../sga-diego origin/pre-main
cd ../sga-diego
git branch --show-current          # debe decir diego-branch
```

**2. Mantente al día** (al menos al empezar cada sesión y antes de abrir un PR):

```bash
git fetch origin && git rebase origin/pre-main
```

Si hay conflicto en un archivo que **no es tuyo**, detente: no lo resuelvas «a tu favor». Avísale a su dueño (plantilla R10).

**3. Commits pequeños y con sentido** (Conventional Commits en español): `feat(sedes): valida código único`, `test(inscripcion): cubre regla de cupo`, `fix(auth): rechaza token vencido`. Un commit = una idea. Prohibidos: «wip», «cambios», «fix» a secas.

**4. Subir tu trabajo** (solo a tu rama):

```bash
git push -u origin diego-branch
```

**5. Pull Request** de `diego-branch` → `pre-main`, con la plantilla de la sección 7. **Lo revisa Matias** (no te autoapruebes). El revisor también se guía por las preguntas del checklist: debe poder decir qué probó, no solo «se ve bien».

**6. Antes de cada push:** `npm run lint`, tests y build en verde (en la carpeta que corresponda).

**Nunca:** commit directo a `main`/`pre-main` · `git push --force` a ramas ajenas · subir `.env`, `node_modules`, `dist`, `.DS_Store` · reformatear archivos enteros o cambiar fines de línea en masa.

---

## ✅ DEFINICIÓN DE «TERMINADO» (para cada tarea)

1. Cumple todos sus criterios de aceptación y los tests están en verde.
2. Pasó el checklist de la sección 5 y la defensa (E6) con ≥4/5.
3. Todas las `D-xx` están en tu bitácora con tus palabras.
4. PR abierto hacia `pre-main` con la plantilla, enlazando la bitácora, y **aprobado por Matias**.
5. Las decisiones que afectan a otras personas están en `context/decisions/log.md`.
