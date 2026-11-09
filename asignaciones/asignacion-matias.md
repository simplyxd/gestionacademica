# Asignación de Matias — Períodos e Inscripción (el flujo crítico)

| | |
|---|---|
| **Responsable** | Matias |
| **Tu rama** | `matias-branch` (se crea desde `origin/pre-main`) |
| **Épicos** | **E3** períodos académicos · **E8** inscripción con las 7 reglas (RF10 / CU8) |
| **Depende de** | Juan (H0) · Lorenzo (planes y prerrequisitos) · Angel (matrículas e historial de aprobadas) · Diego (secciones y `utils/horario.js`) · Endert (`authenticate`) |
| **Desbloquea** | Endert (la nómina del portal docente sale de tus inscripciones) · Lorenzo (reportes de ocupación) · Juan (guion de demo) |
| **Tu PR lo revisa** | Diego (y tú revisas los de Diego) |

> **Por qué importa tanto tu parte:** CU8 es lo que el enunciado pide **evidenciar**. Si las 7 reglas no se demuestran contra la API, el resto del sistema no demuestra valor. Empieza por lo que no depende de nadie (períodos y reglas puras) y deja la integración para cuando los demás hayan entregado.

> **Cómo usar este archivo:** abre tu IA en la raíz del repo y dile: *«Lee `asignaciones/asignacion-matias.md` completo y síguelo al pie de la letra como mi tutor. Empieza por la Etapa 0.»*

---

## 🧭 PROTOCOLO OBLIGATORIO PARA LA IA

> **IA que estás leyendo esto:** implementas la tarea de **Matias**. Si te piden que construyas el código, lo escribes tú: modelos, servicios, rutas, componentes y tests.

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
| **R9** | **Bitácora.** Tras cada decisión, agrega una entrada a `asignaciones/bitacoras/matias.md` con la plantilla (secc. 4), **con las palabras de la persona**, no las tuyas. Es la evidencia de aprendizaje y se enlaza en cada PR. |
| **R10** | **Límite de alcance.** Solo se tocan los archivos de «Archivos propios». Si hay que cambiar un archivo ajeno: detente, indica a quién pertenece y ayuda a redactar el mensaje (plantilla en secc. 6). |
| **R11** | **Honestidad.** Si algo de este MD, del plan o del repo no coincide con la realidad, o no sabes algo, dilo y pregunta; no inventes. Si una decisión afecta a otras personas, súbela al grupo (`context/decisions/log.md`), no la tomes en silencio. |
| **R12** | **Seguridad por defecto.** Nunca secretos en el repo, nunca contraseñas reales, nunca desactivar validaciones «para probar». Si la persona lo pide, pregunta qué riesgo corre. |
| **R13** | **Git.** Antes de cada commit/push verifica `git branch --show-current`. Si no es `matias-branch`, detente. Jamás commits a `main` ni `pre-main`. |
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

### 4. Plantilla de bitácora (`asignaciones/bitacoras/matias.md`, solo se agrega, nunca se borra)

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Matias (sus palabras):
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
`context/specs/inscripcion-asignaturas.md` (**es tu especificación**) · `context/specs/requerimientos-funcionales.md` (RF4, RF10) · `context/specs/casos-de-uso.md` (CU3, CU8) · `context/general/glossary.md` («Estados de período») · `context/decisions/log.md` (entradas de estados, cupo atómico) · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` (E3, E8, modelos `periodos` e `inscripciones`) · en el frontend: `features/periodos/*` (con `rules.ts` y su test), `features/inscripcion/*` (`reglas.ts`, `ReglasRechazadasModal`, `EstadoReglas`, `CambiarSeccionPanel`), `features/horario/*`, `mocks/sga.ts`, `mock/datos-de-prueba.ts`.

### Archivos propios
`backend/src/models/{periodo,inscripcion}.model.js` · `backend/src/{routes,controllers,services}/{periodos,inscripciones}.*` · `backend/src/services/reglasInscripcion.js` · `backend/src/errors/codigos/{periodos,inscripciones}.js` · `backend/tests/inscripcion/**` · `db/seed/{06-periodos,10-inscripciones}.js` · Frontend: `features/periodos/**` · `features/inscripcion/**` · `features/horario/**` · `mocks/sga.ts` (se retira junto con Diego; quien termine último lo borra).
**Ajenos que usas:** `utils/horario.js` (Diego) · `perfilEstudiante.aprobadas` (Angel) · grafo de prerrequisitos del plan (Lorenzo).

---

### MAT-1 · Modelo `Periodo` + seed *(PR pequeño, primero)*
**Aceptación**
- [ ] Campos: `codigo` (único, `AAAA-S`), `nombre`, `inicio`, `termino`, `inscripcionInicio`, `inscripcionTermino`, `estado` (4 valores del contrato).
- [ ] **Índice parcial único** que impide dos períodos `en_curso` a la vez.
- [ ] Validaciones de fechas coherentes (inicio < término; ventana bien formada).
- [ ] Seed `06`: 2 períodos — uno `en_curso` y uno `inscripcion_abierta` (con fechas relativas a «hoy» para que la demo siempre funcione).
- [ ] Tests de modelo, incluido el índice parcial.

**Decisiones guiadas**
- **D-01** ¿Por qué la **ventana de inscripción no es lo mismo** que las fechas del semestre? Da un ejemplo real. — *Criterio:* la ventana puede abrir antes del inicio y cerrar antes del término; la regla 2 valida la ventana, no el semestre.
- **D-02** ¿Qué validaciones de fechas exiges (cruces, orden, solapamiento entre períodos)? — *Criterio:* lista escrita y testeada; mensajes que dicen qué fecha sobra.
- **D-03** ¿Cómo garantizas «un solo `en_curso`» aunque dos coordinadores lo intenten a la vez? — *Criterio:* **índice parcial único** en la BD; un `find` previo no basta (condición de carrera).

**Delegable:** fechas de ejemplo del seed, calculadas desde la fecha actual, una vez que describas la lógica.

### MAT-2 · API de períodos y máquina de estados (E3-1…E3-4)
**Contrato**
| Ruta | Quién |
|---|---|
| `GET /api/periodos`, `GET /api/periodos/actual` | autenticado (el estudiante necesita el actual) |
| `POST /api/periodos`, `PATCH /api/periodos/:id` | coordinador (no se edita un `cerrado`) |
| `PATCH /api/periodos/:id/estado` `{estado}` | coordinador |

**Aceptación**
- [ ] Transiciones permitidas: `planificacion → inscripcion_abierta → en_curso → cerrado`. Cualquier otra → `409 PER_TRANSICION_INVALIDA` con el estado actual y los permitidos.
- [ ] `cerrado` **congela**: no se crean ni se anulan inscripciones en él (lo verifica tu servicio de inscripción).
- [ ] Un período duplicado (mismo `codigo`) → `409`.
- [ ] Frontend: `PeriodosContext`, `PeriodosPage`, `PeriodoFormDrawer`, `estado.ts` y `rules.ts` contra la API, con los enums ASCII y sus etiquetas.

**Decisiones guiadas**
- **D-04** ¿Se puede retroceder un estado (p. ej. reabrir la inscripción)? ¿Quién lo decide? — *Criterio:* decisión de dominio: justifícala; si retrocedes, ¿qué pasa con las inscripciones ya hechas? Regístrala.
- **D-05** ¿Cómo determina el servidor «hoy» al comparar con la ventana? — *Criterio:* zona horaria de la institución (`America/Santiago`), límites **inclusivos** definidos por escrito, y un test justo en el borde (último día de la ventana).
- **D-06** ¿Qué período es «el actual» para un estudiante: `en_curso` o `inscripcion_abierta`? ¿Puede haber ambos? — *Criterio:* pregunta de dominio; propón una regla clara y acuérdala con Diego (afecta qué oferta ve el estudiante).

### MAT-3 · Modelo `Inscripcion` + seed
**Aceptación**
- [ ] Campos del plan: `estudianteId`, `seccionId`, `periodoId`, `matriculaId`, `estado` (`activa|anulada`), `fechaInscripcion`, `fechaAnulacion`.
- [ ] **Índice parcial único** (`estudianteId`,`seccionId`) con `estado:'activa'`.
- [ ] Seed `10`: unas pocas inscripciones de muestra para que la nómina y el horario no estén vacíos (los alumnos «reservados» para demostrar rechazos los define Angel; **no los inscribas**).

**Decisiones guiadas**
- **D-07** ¿Por qué anular crea estado y no borra? ¿Se puede volver a inscribir la misma sección tras anular? — *Criterio:* el índice parcial lo permite; se conserva la historia.

### MAT-4 · Las 7 reglas como funciones puras (E8-3…E8-10)
**Objetivo:** que cada regla sea una función pequeña, sin acceso a la BD, que se pueda probar sola con datos de ejemplo.

**Aceptación**
- [ ] `reglasInscripcion.js` exporta **una función por regla** que devuelve `{ ok:true }` o `{ ok:false, code, regla, message, details }`, con los códigos `INS_MATRICULA_NO_VIGENTE`, `INS_FUERA_DE_VENTANA`, `INS_SIN_CUPO`, `INS_ASIGNATURA_FUERA_DE_PLAN`, `INS_PREREQUISITO_PENDIENTE`, `INS_YA_APROBADA`, `INS_CHOQUE_HORARIO`.
- [ ] Cada mensaje es **distinto**, en español, y nombra el dato concreto («Te falta aprobar Cálculo I (MAT-101)», «Choca con Física II, lunes 08:30–10:00»).
- [ ] Un test (o más) por regla, escrito **antes** que la regla (R5), con casos borde: cupo justo lleno, último día de ventana, bloques contiguos que NO chocan.
- [ ] La regla 7 usa `utils/horario.js` de Diego; la 5 usa el grafo del plan de Lorenzo; la 6 el historial de Angel.

**Decisiones guiadas**
- **D-08** ¿Qué datos necesita cada regla y quién los carga? ¿Por qué las reglas no deben consultar la BD? — *Criterio:* separar «reunir datos» (I/O) de «decidir» (puro) → tests rápidos y reglas reutilizables.
- **D-09** ¿Respondes con la **primera** regla que falla o con **todas**? — *Criterio:* argumenta con la UI (`ReglasRechazadasModal` muestra varias) vs. costo y claridad; define el orden y el `code` principal si devuelves varias. Regístralo: Juan lo usa en el catálogo de errores.
- **D-10** Regla 4 (plan) y regla 1 (matrícula): ¿contra el plan de **qué** matrícula se evalúa? — *Criterio:* la matrícula **vigente del estudiante en el período de la sección**, no cualquiera.
- **D-11** Regla 5: ¿qué cuenta como «aprobado»? ¿Y si un prerrequisito fue aprobado en un plan distinto? — *Criterio:* pregunta de dominio; si no está decidida, propón y registra (no la inventes en silencio).

**Delegable:** ninguno de los tests ni de las reglas. Sí: formatear los textos de mensaje una vez que tú los redactes.

### MAT-5 · Inscribir, anular y cambiar sección (cupo atómico)
**Objetivo:** el servicio que orquesta datos + reglas + escritura sin carreras de condición.

**Aceptación**
- [ ] `inscribir({estudianteId, seccionId})`: carga datos → evalúa reglas → **reserva el cupo con una operación atómica** (`findOneAndUpdate` con condición `inscritos < cupoMaximo` y `$inc`) → crea la inscripción.
- [ ] Si algo falla **después** de reservar el cupo, el cupo no queda perdido (compensación o transacción).
- [ ] `anular(inscripcionId)`: solo el dueño; solo si el período lo permite; libera el cupo atómicamente sin dejarlo negativo.
- [ ] Doble clic / dos peticiones iguales → una sola inscripción activa (`409` amigable por el índice parcial).
- [ ] **Prueba de concurrencia:** N peticiones simultáneas por el último cupo → exactamente 1 éxito y N−1 `INS_SIN_CUPO`.

**Decisiones guiadas**
- **D-12** Orden de operaciones: ¿reservas cupo primero o validas todo primero? ¿Qué se rompe en cada caso? — *Criterio:* validar lo barato y sin efectos primero; reservar al final; y definir cómo se deshace.
- **D-13** ¿Transacción de Mongo o compensación manual? — *Criterio:* las transacciones exigen replica set (también en la BD de prueba: coordina con Juan, su D-11); compara complejidad, garantías y entorno. Decide y justifica.
- **D-14** ¿Hasta cuándo se puede anular y qué pasa con el cupo si el período está `en_curso`? — *Criterio:* regla de dominio escrita y testeada.
- **D-15** El front trae `CambiarSeccionPanel`; el plan no menciona «cambiar sección». ¿Qué haces? — *Criterio:* si lo mantienen, que sea **una operación atómica** (valida la nueva ANTES de soltar la anterior); si no, retirarlo del front. Decídanlo con el grupo y regístrenlo.

### MAT-6 · Endpoints de inscripción
**Contrato** (todos con `authenticate`; la identidad del alumno sale del token)
| Ruta | Quién |
|---|---|
| `POST /api/inscripciones` `{seccionId}` | estudiante → `201` o `422` con la regla |
| `PATCH /api/inscripciones/:id/anular` | estudiante (la suya) |
| `GET /api/inscripciones/mias?periodoId=` | estudiante (la lista de su horario) |
| `GET /api/inscripciones?periodoId=&seccionId=` | coordinador/admin (lectura) |

**Aceptación**
- [ ] El body **no** acepta `estudianteId` (si llega, se ignora o se rechaza con 400).
- [ ] Pedir la inscripción de otro alumno → `404`.
- [ ] Una inscripción exitosa incrementa la ocupación y aparece en la nómina del docente (Endert).
- [ ] 401/403/422/409 cubiertos con tests.

**Decisiones guiadas**
- **D-16** ¿Qué pasa si el cliente manda un `estudianteId` distinto del token? — *Criterio:* nunca se usa; es un intento de suplantación y se prueba.

### MAT-7 · Evidencia de las reglas (E11-2)
**Aceptación**
- [ ] Un test por regla, **contra la API (supertest), sin React**, usando alumnos y secciones del seed (`10` + los casos de demostración de Angel), más el caso exitoso y el de concurrencia.
- [ ] Cada rechazo verifica `status`, `code`, `regla` **y** el texto del mensaje.
- [ ] `npm test` corre todo en limpio desde un seed fresco.

**Decisiones guiadas**
- **D-17** ¿Qué datos exactos necesita cada regla para demostrarse y cómo se los pides a Angel/Diego? — *Criterio:* tabla «regla → alumno/sección del seed» acordada por escrito.

### MAT-8 · Frontend de inscripción y horario
**Aceptación**
- [ ] `InscripcionPage`, `PorTomarList`, `useInscripciones`, `CupoIndicator`, `SeccionDrawer`, `AnuladasList` usan la API; `HorarioPage` muestra tus inscripciones con `HorarioSemanal`.
- [ ] `ReglasRechazadasModal`/`EstadoReglas` muestran **el mensaje del backend** (regla, dato concreto y una salida), persistentes.
- [ ] El selector «Escenario de prueba» (sin matrícula, ventana cerrada…) se **retira o queda solo en desarrollo**: ahora los escenarios salen de los datos del seed.
- [ ] `reglas.ts` queda como validación previa; los tests siguen pasando.
- [ ] Sin `mocks/sga.ts` cuando Diego también haya terminado.

**Decisiones guiadas**
- **D-18** Si falla más de una regla, ¿cómo lo presentas sin agobiar (design system §6.4)? — *Criterio:* una lista corta con la causa y qué hacer; lo crítico primero.
- **D-19** ¿Qué haces con el botón «Inscribir» mientras la petición está en vuelo? — *Criterio:* deshabilitado/`loading` para no duplicar; el backend igual es la defensa final.

---

## 🌿 FLUJO DE GIT (obligatorio)

El repositorio es la carpeta `gestionacademica/gestionacademica/` (la que contiene `.git`). `pre-main` es la rama de integración; `main` es la entrega final.

**1. Tu rama y tu working tree.** Trabajas **solo** en `matias-branch`. Te recomendamos tu propio *git worktree* (una carpeta aparte con tu rama, así no mezclas tu trabajo con el de otros ni pierdes cambios al cambiar de rama):

```bash
git fetch origin
git worktree add -b matias-branch ../sga-matias origin/pre-main
cd ../sga-matias
git branch --show-current          # debe decir matias-branch
```

**2. Mantente al día** (al menos al empezar cada sesión y antes de abrir un PR):

```bash
git fetch origin && git rebase origin/pre-main
```

Si hay conflicto en un archivo que **no es tuyo**, detente: no lo resuelvas «a tu favor». Avísale a su dueño (plantilla R10).

**3. Commits pequeños y con sentido** (Conventional Commits en español): `feat(sedes): valida código único`, `test(inscripcion): cubre regla de cupo`, `fix(auth): rechaza token vencido`. Un commit = una idea. Prohibidos: «wip», «cambios», «fix» a secas.

**4. Subir tu trabajo** (solo a tu rama):

```bash
git push -u origin matias-branch
```

**5. Pull Request** de `matias-branch` → `pre-main`, con la plantilla de la sección 7. **Lo revisa Diego** (no te autoapruebes). El revisor también se guía por las preguntas del checklist: debe poder decir qué probó, no solo «se ve bien».

**6. Antes de cada push:** `npm run lint`, tests y build en verde (en la carpeta que corresponda).

**Nunca:** commit directo a `main`/`pre-main` · `git push --force` a ramas ajenas · subir `.env`, `node_modules`, `dist`, `.DS_Store` · reformatear archivos enteros o cambiar fines de línea en masa.

---

## ✅ DEFINICIÓN DE «TERMINADO» (para cada tarea)

1. Cumple todos sus criterios de aceptación y los tests están en verde.
2. Pasó el checklist de la sección 5 y la defensa (E6) con ≥4/5.
3. Todas las `D-xx` están en tu bitácora con tus palabras.
4. PR abierto hacia `pre-main` con la plantilla, enlazando la bitácora, y **aprobado por Diego**.
5. Las decisiones que afectan a otras personas están en `context/decisions/log.md`.
