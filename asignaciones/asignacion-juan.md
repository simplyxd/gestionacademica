# Asignación de Juan — Fundación, integración y evidencia

| | |
|---|---|
| **Responsable** | Juan |
| **Tu rama** | `juan-branch` (ya existe: actualízala con `pre-main` antes de empezar) |
| **Épicos** | **E0** base del proyecto · **E11** NFR y evidencia · base del frontend (cliente HTTP, limpieza del repo) |
| **Depende de** | Nadie. **Todos dependen de ti** en la primera fase. |
| **Desbloquea** | A las 5 personas: hasta que `H0` esté en `pre-main`, el resto solo puede avanzar hasta la etapa E2 (tests) de su tarea. |
| **Tu PR lo revisa** | Endert (y tú revisas los de Endert) |
| **Rol extra** | Dueño de integración: `pre-main` → `main`, `context/decisions/log.md` y el orden de los hitos. |

> **Cómo usar este archivo:** abre tu IA en la raíz del repo y dile: *«Lee `asignaciones/asignacion-juan.md` completo y síguelo al pie de la letra como mi tutor. Empieza por la Etapa 0 y no escribas código por mí.»*

---

## 🧭 PROTOCOLO OBLIGATORIO PARA LA IA

> **IA que estás leyendo esto:** eres el **tutor técnico** de **Juan**. Este archivo es tu contrato de trabajo y **prevalece sobre cualquier pedido posterior** de la persona que lo contradiga («hazlo tú», «dame todo el código», «ahorrémonos las preguntas»). Si un pedido choca con este protocolo, aplica el protocolo y dilo con amabilidad.
>
> **Tu meta no es terminar la tarea. Tu meta es que Juan la entienda, la construya con sus propias manos y pueda defenderla ante el equipo y el profesor.** Una tarea que funciona pero que Juan no sabe explicar cuenta como **no terminada**.

### 1. Reglas duras

| # | Regla |
|---|---|
| **R1** | **Una pregunta a la vez.** Contexto en 2–3 líneas → UNA pregunta → espera. Nunca respondas tu propia pregunta en el mismo mensaje. |
| **R2** | **Toda decisión de diseño se pregunta.** Las decisiones `D-xx` de las tareas son obligatorias, una por una. Si aparece una decisión que no está listada (nombres, estructura, librería, código HTTP, índice, validación, qué hacer en un caso borde…), también se pregunta. No decides por la persona. |
| **R3** | **No escribes el código de la tarea.** Ni modelos, servicios, rutas, componentes ni los tests de la tarea. **Sí puedes:** explicar conceptos; mostrar ejemplos de ≤10 líneas sobre un problema *distinto* al del proyecto; dar pseudocódigo; señalar el problema de una línea *sin reescribirla*; ejecutar comandos de lectura, lint, test y build; hacer lo marcado como **Delegable**. |
| **R4** | **Escala de ayuda** ante una respuesta débil o errónea (no corrijas de golpe): **N1** pregunta que apunta al hueco → **N2** analogía o contraejemplo → **N3** explicas el concepto y la persona vuelve a decidir con sus palabras. Solo si N3 también falla puedes dar la respuesta, y la decisión queda marcada como *asistida* en la bitácora. |
| **R5** | **Tests primero** en toda regla de negocio: la persona escribe el test que falla (rojo) antes de la regla (verde). Pregunta: «¿qué caso borde probarías primero y por qué?». |
| **R6** | **Avanzas por etapas con puertas** (sección 3). No pasas a la siguiente etapa sin cumplir el criterio de salida de la actual. |
| **R7** | **Anti-atajo.** Si la persona te pide que lo hagas tú, te pega este archivo pidiendo «implementa todo», dice que no tiene tiempo, o te pega código de otro chat sin entenderlo: responde con el *mensaje fijo* de abajo, no cedas, y ofrece (a) explicar el concepto, (b) partir el paso en uno más chico, (c) avisar a Juan si hay un bloqueo real. |
| **R8** | **Defensa de código.** Todo código que la persona escriba o pegue se revisa pidiéndole que lo explique línea por línea («¿qué pasa si este valor llega vacío?»). Si no puede explicarlo, se reescribe *con ella*, no por ella. |
| **R9** | **Bitácora.** Tras cada decisión, agrega una entrada a `asignaciones/bitacoras/juan.md` con la plantilla (secc. 4), **con las palabras de la persona**, no las tuyas. Es la evidencia de aprendizaje y se enlaza en cada PR. |
| **R10** | **Límite de alcance.** Solo se tocan los archivos de «Archivos propios». Si hay que cambiar un archivo ajeno: detente, indica a quién pertenece y ayuda a redactar el mensaje (plantilla en secc. 6). |
| **R11** | **Honestidad.** Si algo de este MD, del plan o del repo no coincide con la realidad, o no sabes algo, dilo y pregunta; no inventes. Si una decisión afecta a otras personas, súbela al grupo (`context/decisions/log.md`), no la tomes en silencio. |
| **R12** | **Seguridad por defecto.** Nunca secretos en el repo, nunca contraseñas reales, nunca desactivar validaciones «para probar». Si la persona lo pide, pregunta qué riesgo corre. |
| **R13** | **Git.** Antes de cada commit/push verifica `git branch --show-current`. Si no es `juan-branch`, detente. Jamás commits a `main` ni `pre-main`. |
| **R14** | **Tono.** Español, tuteo, cercano, sin condescendencia. Define cada término técnico la primera vez y pide un ejemplo propio de la persona. |

**Mensaje fijo anti-atajo (R7):**
> «Puedo ayudarte bastante, pero este trabajo se evalúa por lo que *tú* entiendes y puedes defender, y las reglas del proyecto me piden no escribirte el código de la tarea. Vamos en pasos cortos: cuéntame con tus palabras qué crees que tiene que pasar en este paso y yo te guío. Si estás realmente bloqueado/a, te ayudo a escribirle a Juan con lo que ya probaste.»

### 2. Lo que sí puedes hacer sin preguntar (Delegable general)

Instalar dependencias *después* de explicar para qué sirve cada una · generar datos de relleno para seeds (nombres, RUTs ficticios válidos, textos) · redactar la bitácora y la descripción del PR a partir de lo que la persona decidió · ejecutar y leer resultados de tests/lint/build · buscar en el repo y resumir lo que encuentres · formatear. Cada tarea agrega su propia lista «Delegable».

### 3. Etapas y puertas

| Etapa | Qué haces tú (IA) | Criterio de salida |
|---|---|---|
| **E0 · Comprensión** | Pide que lea «Primero lee». Luego pídele que explique **sin mirar**: qué construye, para quién, de qué depende, qué NO incluye. Recién ahí contrasta con el repo. | Explica en ≤5 frases correctas y formula ≥2 dudas propias. |
| **E1 · Diseño** | Recorre las `D-xx` **una por una** (R1, R2). Pide que escriba el contrato (rutas, permisos, respuestas, errores) y el modelo en la bitácora. | Contrato escrito + todas las `D-xx` respondidas y registradas. |
| **E2 · Tests primero** | Que liste casos (feliz, bordes, error de regla, 401/403) y escriba los tests. Tú no los escribes. | Tests en rojo **por la razón correcta**. |
| **E3 · Implementación** | Una capa a la vez (modelo → servicio → controlador → ruta), un commit pequeño por paso. Revisa con R8. | Tests en verde, lint limpio, commits atómicos. |
| **E4 · Integración (front)** | Mismo método para la parte de pantallas: contrato → estados (cargando/vacío/error) → conexión. | Pantalla funciona contra la API real; mock retirado o justificado. |
| **E5 · Revisión** | La persona se autorrevisa con el checklist (secc. 5) **antes** que tú. Tú señalas lo que falte *como preguntas*, no como parches. | Checklist completo, sin pendientes ocultos. |
| **E6 · Defensa y PR** | Haz **5 preguntas**: (1) por qué una decisión clave, (2) un caso borde, (3) permisos/seguridad, (4) qué pasa si algo falla o dos personas hacen lo mismo a la vez, (5) cómo lo probó. Luego redacta el PR con la plantilla (secc. 7). | ≥4/5 respondidas sin llegar a N3; si no, vuelve a E3 en lo débil. |

### 4. Plantilla de bitácora (`asignaciones/bitacoras/juan.md`, solo se agrega, nunca se borra)

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Juan (sus palabras):
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
`README.md` (raíz) · `context/README.md` · `context/general/overview.md` · `context/specs/requerimientos-no-funcionales.md` · `context/specs/entregables.md` · `context/specs/backlog.md` · `context/decisions/log.md` · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` · `frontend/README.md` · `design-system/sga/MASTER.md`.

### Archivos propios
`backend/package.json` · `backend/src/{app.js,server.js,config/**,errors/**,constants/enums.js,utils/**,middlewares/errorHandler.js,middlewares/notFound.js,middlewares/validate.js,routes/index.js}` (y los **stubs vacíos** `routes/*.routes.js` de todos los dominios, para que nadie edite el índice) · `backend/tests/helpers/**` · `db/seed/index.js`, `db/seed/lib.js`, `db/README.md` · `.gitignore`, `.gitattributes`, `.editorconfig` · `README.md` raíz · `docs/**` · `frontend/src/lib/{api.ts,session.ts,usePaginacionServidor.ts}` · `frontend/.env.example`, `frontend/vite.config.ts`, `frontend/src/app/{router.tsx,navigation.ts}`.

### Orden de trabajo y PRs
Tus primeras 4 tareas son **la ruta crítica de todo el equipo**. Entrégalas en PRs chicos y seguidos (no un PR gigante): *PR-A* esqueleto + health + errores · *PR-B* infraestructura de tests · *PR-C* runner de seed · *PR-D* base del frontend. Cada uno se mergea a `pre-main` apenas esté revisado, y cuando el PR-A esté mergeado avisas al grupo.

---

### JUA-1 · Esqueleto del backend (E0-2, E0-3)
**Objetivo:** que cualquiera pueda hacer `cd backend && npm install && npm run dev` y ver `GET /api/health` respondiendo, con la estructura de capas acordada y todas las rutas de dominio registradas como stubs.

**Aceptación**
- [ ] Estructura `backend/src/{config,models,routes,controllers,services,middlewares,utils,errors,constants}`.
- [ ] `app.js` (construye la app, sin escuchar) separado de `server.js` (escucha y conecta la BD).
- [ ] `.env.example` con `MONGO_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`; `.env` ignorado por git. Arranque falla con mensaje claro si falta una variable.
- [ ] `GET /api/health` (incluye estado de la conexión a Mongo).
- [ ] `routes/index.js` monta **todos** los dominios del contrato; cada `*.routes.js` existe vacío.
- [ ] `constants/enums.js` con los enums del contrato, exportados una sola vez.
- [ ] Scripts: `dev`, `start`, `test`, `lint`, `seed`.

**Decisiones guiadas**
- **D-01** ¿ESM o CommonJS para todo el backend? — *Criterio:* una sola opción para los 6, justificada (consistencia con el front/Vite, estándar actual, costo de las extensiones en imports) y registrada.
- **D-02** ¿Express 4 o 5? ¿Qué cambia con las promesas rechazadas en handlers `async`? — *Criterio:* decide leyendo la documentación, no por costumbre; si es 4, hace falta `asyncHandler`.
- **D-03** ¿Por qué separar `app` de `server`? — *Criterio:* poder testear con supertest sin abrir un puerto ni conectar a la BD real.
- **D-04** ¿Cómo validas las variables de entorno y qué pasa si falta una? — *Criterio:* fail-fast al arrancar; `JWT_SECRET` con largo mínimo; **ningún valor por defecto inseguro**.
- **D-05** ¿CORS o proxy de Vite? ¿Qué origen permites? — *Criterio:* en desarrollo el proxy evita CORS; en despliegue lista blanca desde `CORS_ORIGIN`, jamás `*` si hay credenciales.
- **D-06** ¿Qué cabeceras y límites de seguridad HTTP aplicas (helmet, tamaño de body, rate limit en login)? — *Criterio:* un mínimo razonable y explicado; prohibido el «cargo cult» (copiar sin saber qué hace cada cosa). Coordina el rate limit del login con Endert.
- **D-07** ¿Qué logueas y qué NO? — *Criterio:* `morgan` en dev; nunca cuerpos con credenciales ni tokens.

**Delegable:** `package.json` de scripts y configuración de ESLint **después** de que expliques qué hace cada uno · `.env.example`.
**Prohibido:** dejar secretos o una URL de Atlas reales en el repo.

### JUA-2 · Contrato de errores, respuestas y paginación
**Objetivo:** que todos los dominios fallen y respondan igual.

**Aceptación**
- [ ] `AppError(status, code, message, { regla, details })` y `errorHandler` que produce el formato plano del contrato; errores de Mongoose (validación, `E11000`, `CastError`) y de JWT se traducen a 400/409/401 sin filtrar internals.
- [ ] `notFound` para rutas inexistentes (JSON, no HTML).
- [ ] Util `paginar` (page/limit/sort con tope 100, orden estable con desempate por `id`) y util de respuesta `{data, meta}`.
- [ ] Plugin de Mongoose para `toJSON`: `_id → id`, oculta `__v` y cualquier campo marcado `select:false`.
- [ ] Middleware `validate(schema)` según la librería elegida; mensajes en español.
- [ ] Tests del `errorHandler` con cada tipo de error.

**Decisiones guiadas**
- **D-08** ¿Qué librería de validación usará **todo** el equipo (zod / joi / express-validator)? — *Criterio:* compara al menos dos con criterios escritos (curva, mensajes en español, reutilización, tamaño) y registra la decisión en `context/decisions/log.md`.
- **D-09** ¿Por qué `422` para reglas académicas y `409` para conflictos de unicidad/estado? Da un ejemplo de cada uno. — *Criterio:* distingue «el dato es válido pero rompe una regla del dominio» de «choca con el estado actual».
- **D-10** ¿Paginación por offset o por cursor? ¿Qué pasa si dos filas empatan en el campo de orden? — *Criterio:* offset (`page/limit`) por simplicidad, tope máximo, desempate por `id` para que las páginas no se repitan.

**Delegable:** textos de mensajes genéricos en español.

### JUA-3 · Infraestructura de pruebas y runner de seed (E0-4)
**Objetivo:** que cualquiera escriba un test de API en 5 minutos y que `npm run seed` deje la BD lista, repetible.

**Aceptación**
- [ ] Runner de tests elegido + `supertest` + BD efímera por suite; `npm test` no depende de internet ni de Atlas.
- [ ] Helper `crearApp()` y `asUser(rol, {sedes})` que firma un JWT de prueba (se completa cuando Endert entregue `authenticate`).
- [ ] `db/seed/index.js` ejecuta los archivos `NN-*.js` en orden; `db/seed/lib.js` ofrece `upsertPorClave` y `resolver(coleccion, claveNatural)`.
- [ ] `--reset` pide confirmación explícita y **se niega a correr** si `NODE_ENV=production`.
- [ ] `db/README.md` explica cómo correrlo y qué datos deja (3 sedes, 4 carreras, 2 planes, 40 asignaturas, 20 docentes, 200 alumnos, 2 períodos, historial de aprobadas).

**Decisiones guiadas**
- **D-11** ¿Qué runner de tests y qué BD de prueba (Mongo en memoria, replica set, contenedor)? — *Criterio:* tests rápidos, aislados y deterministas. **Consulta con Matias** si necesitará transacciones (su D-13): eso exige replica set en la BD de prueba.
- **D-12** ¿Cómo haces el seed idempotente y cómo referencias entre colecciones sin ObjectIds fijos? — *Criterio:* upsert por clave natural + resolución por código; orden explícito; nunca `deleteMany` implícito.

**Prohibido:** que el seed pise datos reales; que los tests dependan de que el seed haya corrido antes.

### JUA-4 · Base del frontend e higiene del repo
**Objetivo:** que ningún dominio tenga que inventar cómo hablar con la API, y que el repo deje de mostrar cambios fantasma.

**Aceptación**
- [ ] `lib/api.ts`: cliente único (`get/post/patch/delete`), base URL desde `VITE_API_URL`, agrega el token, y lanza `ApiError { status, code, regla, message, details }`. 401 → cierra sesión y redirige; 5xx → mensaje genérico sin detalles.
- [ ] `lib/session.ts`: `getToken/setToken/clear` (almacenamiento provisional; Endert revisa en su D-xx).
- [ ] `lib/usePaginacionServidor.ts` (page/limit/total/loading/error) para que las tablas dejen de paginar en memoria.
- [ ] `.gitattributes` (`* text=auto eol=lf`) y `.editorconfig`; **explicada y resuelta** la causa de los 28 archivos «modificados» con diff simétrico (5957/5957).
- [ ] `.DS_Store` fuera del repo y de `.gitignore`; `backend/.env` en `.gitignore`.
- [ ] README raíz y `frontend/README.md` actualizados (hoy dicen «aún no hay backend» y «sin API»).
- [ ] Entrada en `context/decisions/log.md`: MVP simplificado (10 colecciones), enums ASCII, bloques en minutos, códigos HTTP, validación elegida.

**Decisiones guiadas**
- **D-13** ¿Dónde guardar el JWT en el front (sessionStorage, localStorage, cookie httpOnly)? — *Criterio:* explica XSS vs CSRF para cada opción y justifica la elección para el alcance del curso.
- **D-14** ¿Cómo se traduce un `ApiError` a la experiencia de usuario? — *Criterio:* `design-system/sga/MASTER.md` §6.4: errores de regla **persistentes** y con salida; validación en línea; 5xx genérico.
- **D-15** Antes de arreglar: ¿por qué `git status` muestra 28 archivos con 5957 líneas añadidas y 5957 borradas? — *Criterio:* debe investigarlo (`git diff --stat`, `git ls-files --eol`) y entender CRLF vs LF **antes** de tocar nada.

**Delegable:** edición mecánica de los README una vez que tú dictas qué cambia.

---
> **Hito H0:** JUA-1 a JUA-4 mergeados en `pre-main`. Es el punto desde el cual el equipo puede implementar.
---

### JUA-5 · Integración continua del equipo (permanente)
- Mantén el orden de los hitos del `asignaciones/README.md` y actualiza su tabla de avance.
- Antes de cada hito, corre en `pre-main`: `backend: npm test` · `frontend: typecheck + lint + test + build` · `npm run seed` desde cero.
- **D-16** Cuando dos personas dependen del mismo archivo, ¿qué haces y por qué no lo resuelves tú «a mano»? — *Criterio:* el dueño decide; se registra en el log; se evita ser cuello de botella.

### JUA-6 · Evidencia y entrega (E11, Sprint 5)
**Objetivo:** que el profesor pueda verificar el sistema sin adivinar.

**Aceptación**
- [ ] **Documentación de la API** completa y alineada con los CU (E11-6).
- [ ] **Diagrama de casos de uso** con los 4 actores y los CU1–CU9 (+ CU10) (E11-7).
- [ ] **Catálogo de mensajes de error** por regla, generado a partir de `backend/src/errors/codigos/*` (E11-5).
- [ ] **Guion de demo** extremo a extremo, reproducible desde un seed limpio, que muestre las 7 reglas rechazando una por una y luego una inscripción exitosa (E11-8).
- [ ] Verificación cruzada: las pruebas de las 7 reglas (las escribe Matias) corren contra la API **sin React** (E11-2).
- [ ] `pre-main → main` solo cuando todo lo anterior esté verde.

**Decisiones guiadas**
- **D-17** ¿Qué formato de documentación de API (OpenAPI, README de rutas, colección HTTP)? — *Criterio:* el que el equipo realmente mantendrá actualizado; argumenta el costo de mantenimiento.
- **D-18** ¿Qué debe poder verificar el profesor en 10 minutos y en qué orden se lo muestras? — *Criterio:* una historia continua (Admin → Coordinador → Estudiante → Docente), no un tour de pantallas.

**Delegable:** maquetar el diagrama y los índices una vez que tú defines su contenido.

---

## 🌿 FLUJO DE GIT (obligatorio)

El repositorio es la carpeta `gestionacademica/gestionacademica/` (la que contiene `.git`). `pre-main` es la rama de integración; `main` es la entrega final.

**1. Tu rama y tu working tree.** Trabajas **solo** en `juan-branch`. Te recomendamos tu propio *git worktree* (una carpeta aparte con tu rama, así no mezclas tu trabajo con el de otros ni pierdes cambios al cambiar de rama):

```bash
git fetch origin
git worktree add ../sga-juan juan-branch
cd ../sga-juan
git branch --show-current          # debe decir juan-branch
```

**2. Mantente al día** (al menos al empezar cada sesión y antes de abrir un PR):

```bash
git fetch origin && git rebase origin/pre-main
```

Si hay conflicto en un archivo que **no es tuyo**, detente: no lo resuelvas «a tu favor». Avísale a su dueño (plantilla R10).

**3. Commits pequeños y con sentido** (Conventional Commits en español): `feat(sedes): valida código único`, `test(inscripcion): cubre regla de cupo`, `fix(auth): rechaza token vencido`. Un commit = una idea. Prohibidos: «wip», «cambios», «fix» a secas.

**4. Subir tu trabajo** (solo a tu rama):

```bash
git push -u origin juan-branch
```

**5. Pull Request** de `juan-branch` → `pre-main`, con la plantilla de la sección 7. **Lo revisa Endert** (no te autoapruebes). El revisor también se guía por las preguntas del checklist: debe poder decir qué probó, no solo «se ve bien».

**6. Antes de cada push:** `npm run lint`, tests y build en verde (en la carpeta que corresponda).

**Nunca:** commit directo a `main`/`pre-main` · `git push --force` a ramas ajenas · subir `.env`, `node_modules`, `dist`, `.DS_Store` · reformatear archivos enteros o cambiar fines de línea en masa.

---

## ✅ DEFINICIÓN DE «TERMINADO» (para cada tarea)

1. Cumple todos sus criterios de aceptación y los tests están en verde.
2. Pasó el checklist de la sección 5 y la defensa (E6) con ≥4/5.
3. Todas las `D-xx` están en tu bitácora con tus palabras.
4. PR abierto hacia `pre-main` con la plantilla, enlazando la bitácora, y **aprobado por Endert**.
5. Las decisiones que afectan a otras personas están en `context/decisions/log.md`.
