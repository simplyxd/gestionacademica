# Asignación de Angel — Personas y Matrícula

| | |
|---|---|
| **Responsable** | Angel |
| **Tu rama** | `angel-branch` (ya existe: actualízala con `pre-main` antes de empezar) |
| **Épicos** | **E4** docentes y estudiantes (perfiles académicos) · **E5** matrícula |
| **Depende de** | Juan (H0) · Endert (modelo `Usuario`, `authenticate`) · Lorenzo (carreras, planes, asignaturas) · Matias (períodos) · Diego (secciones, para la carga docente de la ficha) |
| **Desbloquea** | Matias (la matrícula vigente y el historial de aprobadas son las reglas 1, 5 y 6) · Lorenzo (`contarPorCarrera`) · Juan (datos de demostración) |
| **Tu PR lo revisa** | Lorenzo (y tú revisas los de Lorenzo) |
| **Coordinas con** | Endert (un solo ABM `/usuarios`) |

> **Cómo usar este archivo:** abre tu IA en la raíz del repo y dile: *«Lee `asignaciones/asignacion-angel.md` completo y síguelo al pie de la letra como mi tutor. Empieza por la Etapa 0.»*

---

## 🧭 PROTOCOLO OBLIGATORIO PARA LA IA

> **IA que estás leyendo esto:** implementas la tarea de **Angel**. Si te piden que construyas el código, lo escribes tú: modelos, servicios, rutas, componentes y tests.

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
| **R9** | **Bitácora.** Tras cada decisión, agrega una entrada a `asignaciones/bitacoras/angel.md` con la plantilla (secc. 4), **con las palabras de la persona**, no las tuyas. Es la evidencia de aprendizaje y se enlaza en cada PR. |
| **R10** | **Límite de alcance.** Solo se tocan los archivos de «Archivos propios». Si hay que cambiar un archivo ajeno: detente, indica a quién pertenece y ayuda a redactar el mensaje (plantilla en secc. 6). |
| **R11** | **Honestidad.** Si algo de este MD, del plan o del repo no coincide con la realidad, o no sabes algo, dilo y pregunta; no inventes. Si una decisión afecta a otras personas, súbela al grupo (`context/decisions/log.md`), no la tomes en silencio. |
| **R12** | **Seguridad por defecto.** Nunca secretos en el repo, nunca contraseñas reales, nunca desactivar validaciones «para probar». Si la persona lo pide, pregunta qué riesgo corre. |
| **R13** | **Git.** Antes de cada commit/push verifica `git branch --show-current`. Si no es `angel-branch`, detente. Jamás commits a `main` ni `pre-main`. |
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

### 4. Plantilla de bitácora (`asignaciones/bitacoras/angel.md`, solo se agrega, nunca se borra)

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Angel (sus palabras):
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
`context/specs/requerimientos-funcionales.md` (RF5, RF6) · `context/specs/casos-de-uso.md` (CU4, CU5) · `context/general/glossary.md` («Estados de matrícula», «Historial académico») · `context/decisions/log.md` · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` (modelo `usuarios` con perfiles embebidos y `matriculas`) · en el frontend: `features/personas/*` (`rules.ts` y su test, `carga.ts`), `features/matricula/*` (`rules.ts` y su test, `catalogos.ts`), `mock/personas*.ts`, `mock/matriculas.ts`, `mock/datos-de-prueba.ts`.

### Archivos propios
`backend/src/models/perfiles.schemas.js` · `backend/src/models/matricula.model.js` · `backend/src/{routes,controllers,services}/{personas,matriculas}.*` · `backend/src/errors/codigos/{personas,matriculas}.js` · `db/seed/{07-personas,08-matriculas}.js` · Frontend: `features/personas/**` · `features/matricula/**` · `mock/personas.ts` · `mock/personas-academicas.ts` · `mock/matriculas.ts`.
**Ajenos que tocas con permiso:** `usuario.model.js` (Endert importa tu `perfiles.schemas.js`) · `features/usuarios/**` (Endert).

---

### ANG-1 · Esquemas de perfil y contrato con Endert *(PR pequeño, primero)*
**Objetivo:** que `Usuario` (de Endert) pueda tener un perfil docente o estudiante válido, sin que ustedes dos editen el mismo archivo.

**Aceptación**
- [ ] `perfiles.schemas.js` exporta `perfilDocenteSchema` `{ especialidad, tipoVinculo, departamentos[] }` y `perfilEstudianteSchema` `{ codigoEstudiante, contactoEmergencia, nivelCursando, aprobadas[] { asignaturaId, periodoId } }`.
- [ ] Exporta `validarPerfilSegunRol(usuario)`: docente ⇒ solo `perfilDocente`; estudiante ⇒ solo `perfilEstudiante`; admin/coordinador ⇒ ninguno. Endert la llama desde el modelo.
- [ ] **Acuerdo escrito con Endert** (registrado en `context/decisions/log.md`): qué edita el admin (cuenta) y qué edita el coordinador (perfil), qué ruta usa cada uno y quién construye el formulario único.
- [ ] Tests de `validarPerfilSegunRol` (todas las combinaciones rol/perfil).

**Decisiones guiadas**
- **D-01** ¿Qué campos son obligatorios en cada perfil y cuáles opcionales? ¿Qué valores acepta `tipoVinculo`? — *Criterio:* mínimo necesario para la operación (carga académica, contacto); enums cerrados cuando el dominio es cerrado.
- **D-02** `aprobadas[]` va embebido en el estudiante: ¿qué ventaja tiene y qué problema podría traer a futuro? ¿Y un duplicado de la misma asignatura? — *Criterio:* simple y suficiente para el MVP (solo seed); evita duplicados y sabe explicar el límite de tamaño del documento.
- **D-03** Reparto del trabajo con Endert: ¿por qué conviene que el esquema de perfiles esté en un archivo aparte y no dentro de `usuario.model.js`? — *Criterio:* un archivo = un dueño (menos conflictos de merge).

### ANG-2 · API de perfiles académicos y ficha (E4-1…E4-7)
**Contrato** (`authenticate`; lectura/escritura del **coordinador dentro de sus sedes**; admin solo lectura)
| Ruta | Notas |
|---|---|
| `GET /api/usuarios/:id/perfil` | perfil del docente/estudiante |
| `PATCH /api/usuarios/:id/perfil` | solo campos del perfil de **su** rol |
| `GET /api/usuarios/:id/ficha` | perfil + resumen: docente → carga del período; estudiante → matrículas y nº de aprobadas |

(El listado y el alta de cuentas son de Endert: `GET/POST /api/usuarios`).

**Aceptación**
- [ ] `codigoEstudiante` único (índice *sparse*) y asignado de forma segura.
- [ ] La baja lógica (`estado` de la cuenta) deja de ofrecer a la persona en selectores (oferta, matrícula) — verificado con test.
- [ ] El coordinador no puede ver ni editar a nadie fuera de sus sedes (`404`).
- [ ] No se puede poner `perfilDocente` a un estudiante (`422`/`400` con el motivo).
- [ ] Tests de permisos (401/403/404/200) y de cada validación.

**Decisiones guiadas**
- **D-04** ¿El `codigoEstudiante` lo escribe una persona o lo genera el sistema? Si lo genera, ¿cómo evitas que dos altas simultáneas obtengan el mismo? — *Criterio:* único por índice; generación sin condición de carrera (contador atómico o regla derivada con reintento).
- **D-05** ¿Cómo calculas la carga académica del docente sin acoplarte a la colección de secciones de Diego? — *Criterio:* un servicio con firma acordada con Diego (por ejemplo `seccionesDeDocente(docenteId, periodoId)`); en tus tests, un doble.
- **D-06** Alcance por sedes: «una persona de las sedes A y B» y «un coordinador de B y C», ¿la ve? — *Criterio:* misma regla de intersección que Endert (su D-12); un test con ese caso.

### ANG-3 · Matrícula: modelo y API (E5-1…E5-5)
**Contrato** (`authenticate`)
| Ruta | Quién |
|---|---|
| `GET /api/matriculas?periodoId=&carreraId=&estado=&estudianteId=&q=` | coordinador (sus sedes), admin (lectura) |
| `GET /api/matriculas/mia?periodoId=` | estudiante |
| `POST /api/matriculas` `{estudianteId, carreraId, planId, periodoId}` | coordinador |
| `PATCH /api/matriculas/:id/estado` | coordinador |

**Aceptación**
- [ ] **Una sola matrícula `vigente` por estudiante y período**, garantizado con índice parcial único; el error llega como `409 MTR_YA_VIGENTE` con el dato concreto.
- [ ] Alta válida solo si: la persona es un **estudiante activo**; el plan pertenece a esa carrera; la carrera está `activa` (no cerrada a nuevo ingreso); el período no está `cerrado`.
- [ ] Estados: `vigente`, `suspendida`, `egresada`, `retirada`. `egresada` y `retirada` son **finales**; `suspendida` solo puede pasar a `retirada`. Transición inválida → `409` con las permitidas.
- [ ] Exporta `matriculas.service.contarPorCarrera(carreraId, {estado})` y `matriculaVigente(estudianteId, periodoId)` (los usan Lorenzo y Matias).
- [ ] Los casos de `features/matricula/rules.test.ts` se cumplen también en el backend.

**Decisiones guiadas**
- **D-07** ¿Por qué el índice parcial y no solo un `find` antes de insertar? Describe una secuencia de dos peticiones que lo rompería. — *Criterio:* condición de carrera; la BD es la última defensa.
- **D-08** Matrícula en una carrera cerrada a nuevo ingreso: ¿qué pasa con quien ya estaba matriculado y con una *renovación* para el siguiente período? — *Criterio:* pregunta de dominio: define «nuevo ingreso» vs «renovación», acuérdala con Lorenzo y regístrala.
- **D-09** `egresada` y `retirada` como estados finales: ¿cómo lo haces cumplir de forma que no se pueda saltar por un `PATCH` directo? — *Criterio:* tabla de transiciones central en el servicio; el modelo no se actualiza por fuera.
- **D-10** Un estudiante que pasa a `suspendida`: ¿qué ocurre con sus inscripciones activas del período? — *Criterio:* decisión de dominio que **afecta a Matias**; propónla, acuérdenla y regístrenla.

### ANG-4 · Datos de demostración (seed 07 y 08)
**Objetivo:** que los datos permitan **demostrar cada una de las 7 reglas** y sean coherentes entre sí.

**Aceptación**
- [ ] 20 docentes y 200 estudiantes con perfil válido; RUT válidos y únicos; correos únicos.
- [ ] Historial `aprobadas[]` **coherente con los prerrequisitos del plan**: nadie aprobó algo sin haber aprobado antes sus prerrequisitos.
- [ ] Matrículas de ambos períodos coherentes con carrera/plan.
- [ ] **Alumnos reservados para la demo**, documentados en `db/README.md` con su correo (acordados con Matias, su D-17): uno sin matrícula · uno con matrícula en otro plan · uno al que le falta un prerrequisito · uno que ya aprobó la asignatura · uno con un choque de horario esperable · uno «feliz» que puede inscribir.
- [ ] Un **script/test de consistencia** que recorre el seed y falla si hay historial incoherente.

**Decisiones guiadas**
- **D-11** ¿Cómo generas historiales realistas respetando prerrequisitos? — *Criterio:* recorrer el plan por semestres y aprobar solo lo habilitado; reproducible (semilla fija), no aleatorio puro.
- **D-12** ¿Qué alumnos necesita cada regla para poder demostrarse y qué sección les corresponde? — *Criterio:* tabla regla → caso → datos, hecha antes de generar nada.

**Delegable:** generar nombres, RUT válidos y correos de relleno (mecánico); **no** la lógica de coherencia.

### ANG-5 · Frontend de personas (fe-api, fusión de ABM)
**Aceptación**
- [ ] `PersonasContext`/`PersonasPage`/`FichaDrawer`/`PersonaFormDrawer` contra la API, con paginación de servidor y filtros por rol, estado y sede.
- [ ] **Un solo ABM de personas/usuarios** en conjunto con Endert: el formulario muestra los campos de perfil según el rol elegido; el acuerdo de quién escribe qué archivo está en el log.
- [ ] La ficha muestra carga académica (docente) o matrículas/aprobadas (estudiante) desde la API.
- [ ] `rules.ts` queda como validación previa; `rules.test.ts` sigue pasando; mocks retirados.

**Decisiones guiadas**
- **D-13** Con 4.500 estudiantes reales, ¿qué cambia en la tabla y en la búsqueda? — *Criterio:* paginación y búsqueda en el servidor, índices, `debounce` en el input.
- **D-14** ¿Qué haces en el `FichaDrawer` si faltan datos (docente sin secciones, alumno sin matrícula)? — *Criterio:* `EmptyState` claro con la siguiente acción, no pantallas en blanco.

### ANG-6 · Frontend de matrícula
**Aceptación**
- [ ] `MatriculaContext`, `MatriculaPage`, `MatriculaFormDrawer`, `MatriculasTable`, `EstadoMatriculaBadge` y `catalogos.ts` contra la API.
- [ ] El alta muestra solo estudiantes **activos**, carreras activas y planes de **esa** carrera; los errores `409/422` del backend se muestran con su mensaje.
- [ ] Estados con color y texto (no solo color) según `MASTER.md`.

**Decisiones guiadas**
- **D-15** ¿Cómo evitas que el selector de plan muestre planes de otra carrera mientras cambia la selección (datos obsoletos)? — *Criterio:* el estado dependiente se reinicia al cambiar el padre; no confiar solo en el front: el backend valida igual.

---

## 🌿 FLUJO DE GIT (obligatorio)

El repositorio es la carpeta `gestionacademica/gestionacademica/` (la que contiene `.git`). `pre-main` es la rama de integración; `main` es la entrega final.

**1. Tu rama y tu working tree.** Trabajas **solo** en `angel-branch`. Te recomendamos tu propio *git worktree* (una carpeta aparte con tu rama, así no mezclas tu trabajo con el de otros ni pierdes cambios al cambiar de rama):

```bash
git fetch origin
git worktree add --track -b angel-branch ../sga-angel origin/angel-branch
cd ../sga-angel
git branch --show-current          # debe decir angel-branch
```

**2. Mantente al día** (al menos al empezar cada sesión y antes de abrir un PR):

```bash
git fetch origin && git rebase origin/pre-main
```

Si hay conflicto en un archivo que **no es tuyo**, detente: no lo resuelvas «a tu favor». Avísale a su dueño (plantilla R10).

**3. Commits pequeños y con sentido** (Conventional Commits en español): `feat(sedes): valida código único`, `test(inscripcion): cubre regla de cupo`, `fix(auth): rechaza token vencido`. Un commit = una idea. Prohibidos: «wip», «cambios», «fix» a secas.

**4. Subir tu trabajo** (solo a tu rama):

```bash
git push -u origin angel-branch
```

**5. Pull Request** de `angel-branch` → `pre-main`, con la plantilla de la sección 7. **Lo revisa Lorenzo** (no te autoapruebes). El revisor también se guía por las preguntas del checklist: debe poder decir qué probó, no solo «se ve bien».

**6. Antes de cada push:** `npm run lint`, tests y build en verde (en la carpeta que corresponda).

**Nunca:** commit directo a `main`/`pre-main` · `git push --force` a ramas ajenas · subir `.env`, `node_modules`, `dist`, `.DS_Store` · reformatear archivos enteros o cambiar fines de línea en masa.

---

## ✅ DEFINICIÓN DE «TERMINADO» (para cada tarea)

1. Cumple todos sus criterios de aceptación y los tests están en verde.
2. Pasó el checklist de la sección 5 y la defensa (E6) con ≥4/5.
3. Todas las `D-xx` están en tu bitácora con tus palabras.
4. PR abierto hacia `pre-main` con la plantilla, enlazando la bitácora, y **aprobado por Lorenzo**.
5. Las decisiones que afectan a otras personas están en `context/decisions/log.md`.
