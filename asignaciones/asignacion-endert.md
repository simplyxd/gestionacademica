# Asignación de Endert — Identidad, acceso y portal docente

| | |
|---|---|
| **Responsable** | Endert |
| **Tu rama** | `juan-branch` |
| **Épicos** | **E1** auth y usuarios (+ parámetros institucionales) · **E9** portal docente |
| **Depende de** | Juan (H0). Para E9: Diego (secciones) y Matias (inscripciones). |
| **Desbloquea** | **A todos:** tu `authenticate`/`authorize` protege cada ruta del sistema. Es la segunda pieza crítica después del esqueleto. |
| **Tu PR lo revisa** | Juan (y tú revisas los de Juan) |
| **Coordinas con** | Angel (el perfil de docente/estudiante vive dentro de tu modelo `Usuario`) |

> **Cómo usar este archivo:** abre tu IA en la raíz del repo y dile: *«Lee `asignaciones/asignacion-endert.md` completo y síguelo al pie de la letra como mi tutor. Empieza por la Etapa 0.»*

---

## 🧭 PROTOCOLO OBLIGATORIO PARA LA IA

> **IA que estás leyendo esto:** implementas la tarea de **Endert**. Si te piden que construyas el código, lo escribes tú: modelos, servicios, rutas, componentes y tests.

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
| **R9** | **Bitácora.** Tras cada decisión, agrega una entrada a `asignaciones/bitacoras/endert.md` con la plantilla (secc. 4), **con las palabras de la persona**, no las tuyas. Es la evidencia de aprendizaje y se enlaza en cada PR. |
| **R10** | **Límite de alcance.** Solo se tocan los archivos de «Archivos propios». Si hay que cambiar un archivo ajeno: detente, indica a quién pertenece y ayuda a redactar el mensaje (plantilla en secc. 6). |
| **R11** | **Honestidad.** Si algo de este MD, del plan o del repo no coincide con la realidad, o no sabes algo, dilo y pregunta; no inventes. Si una decisión afecta a otras personas, súbela al grupo (`context/decisions/log.md`), no la tomes en silencio. |
| **R12** | **Seguridad por defecto.** Nunca secretos en el repo, nunca contraseñas reales, nunca desactivar validaciones «para probar». Si la persona lo pide, pregunta qué riesgo corre. |
| **R13** | **Git.** El trabajo de esta tarea se hace en `juan-branch`. Jamás commits a `main` ni `pre-main`. |
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

### 4. Plantilla de bitácora (`asignaciones/bitacoras/endert.md`, solo se agrega, nunca se borra)

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Endert (sus palabras):
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
`context/specs/requerimientos-funcionales.md` (RF1, RF11) · `context/specs/casos-de-uso.md` (CU1, CU9) · `context/specs/requerimientos-no-funcionales.md` (seguridad) · `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md` (secciones «Reglas por tipo de usuario», «Matriz de permisos» y modelo `usuarios`) · en el frontend: `features/auth/*`, `features/usuarios/*`, `features/admin/*`, `features/permisos/*`, `features/docente/*`, `mocks/parametros.ts`.

### Archivos propios
`backend/src/models/usuario.model.js` · `backend/src/{routes,controllers,services}/{auth,usuarios,parametros,docente}.*` · `backend/src/models/parametros.model.js` · `backend/src/middlewares/auth.js` · `backend/src/config/permisos.js` · `backend/src/errors/codigos/{auth,usuarios,parametros,docente}.js` · `db/seed/01-parametros-usuarios.js` · Frontend: `features/auth/**` · `features/usuarios/**` · `features/admin/**` · `features/permisos/**` · `features/docente/**` · `app/parametros/ParametrosContext.tsx` · `app/pages/ForbiddenPage.tsx` · `mocks/parametros.ts`.
**No propios (pide permiso):** el esquema de perfiles (`backend/src/models/perfiles.schemas.js`) es de **Angel**; tú lo importas.

---

### END-1 · Modelo `Usuario` y seed base *(PR pequeño, primero)*
**Objetivo:** la colección de la que depende todo el sistema (cuentas de las 4 personas y sus perfiles).

**Aceptación**
- [ ] Campos del plan: `rut` (único), `nombre`, `correo` (único, minúscula), `telefono`, `passwordHash` (`select:false`), `rol`, `sedes[]`, `estado`, `incorporacion`, `debeCambiarClave`, timestamps; `perfilDocente`/`perfilEstudiante` importados de Angel.
- [ ] Índices únicos en la BD para `rut`, `correo` y `codigoEstudiante` (sparse).
- [ ] `toJSON` jamás expone `passwordHash`.
- [ ] Seed `01`: parámetros por defecto + 1 admin + 1 coordinador (con sedes) con contraseñas **de desarrollo documentadas en `db/README.md`**, nunca reales.
- [ ] Tests del modelo (únicos, normalización, ocultar hash).

**Decisiones guiadas**
- **D-01** ¿Cómo normalizas y validas el RUT en el servidor? — *Criterio:* el front ya valida (`frontend/src/lib/rut.ts`) pero el servidor **nunca confía en el cliente**; una sola función probada; formato canónico guardado.
- **D-02** ¿Qué costo (rounds) de bcrypt eliges y por qué? ¿Por qué no SHA-256 ni cifrar? — *Criterio:* hash lento con sal; costo equilibrado (tiempo de login vs. fuerza bruta); explicar la diferencia hash/cifrado.
- **D-03** ¿Qué pasa con `correo` en mayúsculas o con espacios al buscar o crear? — *Criterio:* se normaliza al guardar **y** al consultar.
- **D-04** ¿Cómo garantizas que un usuario tenga el perfil que corresponde a su rol (y solo uno)? — *Criterio:* validación en el modelo usando el helper de Angel; test que prueba rol docente con perfil estudiante.

**Delegable:** datos de relleno de seed (nombres), una vez definido el esquema.
**Prohibido:** contraseñas reales o por defecto débiles fuera del seed de desarrollo.

### END-2 · Autenticación y autorización (E1-5, E1-6) *(la pieza más urgente)*
**Objetivo:** login con JWT y los dos middlewares que protegen todo el backend.

**Contrato**
| Ruta | Quién | Respuesta |
|---|---|---|
| `POST /api/auth/login` `{correo, password}` | público | `200 {data:{token, usuario:{id,nombre,rol,sedes,debeCambiarClave}}}` |
| `GET /api/auth/me` | autenticado | `200 {data: usuario}` |
| `POST /api/auth/cambiar-clave` `{actual, nueva}` | autenticado | `200` / `401` si la actual no coincide / `400` si la nueva no cumple la política |

**Aceptación**
- [ ] Payload del JWT `{ sub, rol, sedes }`; expiración tomada de `duracionSesionMinutos` de los parámetros.
- [ ] `authenticate` valida firma y vigencia, **recarga el usuario** y rechaza si está `inactivo` (aunque el token siga vigente). `authorize(...roles)` responde 403.
- [ ] `config/permisos.js` es la **única** fuente de la matriz rol×recurso (la leen el middleware y `GET /api/permisos`).
- [ ] Mensajes de login que no revelan si el correo existe; límite de intentos acordado con Juan.
- [ ] Tests: éxito, clave mala, correo inexistente (mismo mensaje), cuenta inactiva, token vencido, token manipulado, rol sin permiso.
- [ ] Avisas al grupo cuando esté en `pre-main`: **a partir de ahí todas las rutas nuevas llevan `authenticate`+`authorize`.**

**Decisiones guiadas**
- **D-05** ¿Qué dos mensajes/códigos devuelves cuando falla el login y por qué deben ser iguales para «correo no existe» y «clave incorrecta»? — *Criterio:* evitar enumeración de usuarios; mensaje claro pero no revelador.
- **D-06** Una cuenta pasa a `inactivo` mientras su token sigue vigente: ¿qué pasa en la siguiente petición? — *Criterio:* debe fallar de inmediato → por eso `authenticate` consulta la BD (costo/beneficio frente a validar solo la firma).
- **D-07** ¿Qué política de contraseña exiges y dónde se valida? — *Criterio:* mínimo razonable (largo, no trivial), validada en el servidor; mensaje que explica qué falta.
- **D-08** ¿Dónde guarda el front el token y qué cambia respecto de lo que dejó Juan en `lib/session.ts`? — *Criterio:* argumenta riesgos XSS/CSRF; si cambias la decisión de Juan, lo hablas con él y lo registras.
- **D-09** ¿Cómo evitas que un cambio en un rol «se te olvide» en alguna ruta? — *Criterio:* matriz central + test que recorre todas las rutas registradas y exige que tengan `authenticate`.

**Prohibido:** confiar en `rol` o `id` del body/cabeceras del cliente; guardar la contraseña en texto plano o en logs.

### END-3 · Usuarios: ABM del administrador (E1-1…E1-4, E1-7…E1-10)
**Contrato** (todas con `authenticate`)
| Ruta | Quién |
|---|---|
| `GET /api/usuarios?rol=&estado=&q=&page=` | admin: todos · coordinador: solo docentes/estudiantes de **sus sedes** (lectura) |
| `POST /api/usuarios` | admin |
| `PATCH /api/usuarios/:id` (datos de cuenta, rol, sedes) | admin |
| `PATCH /api/usuarios/:id/estado` | admin |
| `POST /api/usuarios/:id/restablecer-clave` | admin → clave temporal mostrada **una sola vez**, `debeCambiarClave=true` |

**Aceptación**
- [ ] Baja lógica (`estado`), nunca borrado físico.
- [ ] Un admin **no puede desactivarse a sí mismo** ni dejar el sistema **sin admin activo** (también si dos admins se desactivan a la vez).
- [ ] `409` legible para RUT/correo duplicado (viniendo del índice, no de un `find` previo).
- [ ] Coordinación con Angel documentada: qué campos edita el admin (cuenta) y cuáles el coordinador (perfil académico).
- [ ] Tests de permisos por rol (401/403/200) y de las dos reglas anteriores.

**Decisiones guiadas**
- **D-10** «No dejar el sistema sin admin activo»: ¿cómo lo haces correcto aun con dos peticiones simultáneas? — *Criterio:* operación atómica/condicional, no `count` + `update` separados.
- **D-11** ¿Cómo muestras la clave temporal sin guardarla? — *Criterio:* se devuelve una vez, solo se persiste el hash, se fuerza el cambio.
- **D-12** El coordinador lista docentes/estudiantes de sus sedes: ¿qué significa «de sus sedes» cuando una persona tiene varias? — *Criterio:* intersección de sedes, definida por escrito y testeada. **Acuérdalo con Angel.**
- **D-13** ¿Qué devuelves a un coordinador que pide un usuario de otra sede: 403 o 404? — *Criterio:* 404 para no filtrar existencia.

### END-4 · Parámetros institucionales
**Contrato:** `GET /api/parametros` (cualquier autenticado ve el subconjunto público: nombre, siglas, duración de sesión) · `PUT /api/parametros` (solo admin, validado). Documento singleton.

**Aceptación**
- [ ] Campos tomados de `ParametrosInstitucionales` (front) y validados en el servidor.
- [ ] `ParametrosContext` lee de la API (hoy usa `localStorage`); el encabezado y el pie siguen mostrando siglas/nombre.
- [ ] Corregido el texto con codificación rota en `mocks/parametros.ts` («FormaciA3n», «acadAcmico») — y entendida la causa (UTF-8 mal interpretado).

**Decisiones guiadas**
- **D-14** ¿Por qué un singleton y cómo evitas que existan dos documentos? — *Criterio:* clave fija/índice único; `upsert` controlado.
- **D-15** ¿Qué parte de los parámetros es pública y cuál solo del admin? — *Criterio:* mínimo privilegio.

### END-5 · Frontend de acceso (fe-api, fe-ux)
**Aceptación**
- [ ] `AuthContext` real (`/auth/login`, `/auth/me`), sesión persistente según tu D-08; `cambiarRol` (el «Probar como…») **solo existe en desarrollo** (`import.meta.env.DEV`).
- [ ] `LoginPage`, `RequireAuth`, `RoleGuard`: 401 → login; 403 → `ForbiddenPage`. Página de **cambio de clave** (y flujo `debeCambiarClave`).
- [ ] `UsuariosPage` (admin) contra la API con paginación de servidor; el formulario muestra los campos de perfil según el rol (en conjunto con Angel: **un solo ABM `/usuarios`**, no dos).
- [ ] `MatrizPermisosPage` en **solo lectura**, alimentada por `GET /api/permisos`.
- [ ] Estados cargando/error/vacío y mensajes con tuteo.

**Decisiones guiadas**
- **D-16** ¿Qué pasa en pantalla cuando el token vence en medio de una acción? — *Criterio:* no se pierde lo escrito sin avisar; mensaje claro; redirección tras reautenticar.
- **D-17** ¿Quién construye el formulario compartido Usuario/Persona, tú o Angel, y cómo se reparten los archivos? — *Criterio:* acuerdo escrito entre ambos antes de codificar (se registra en el log).

### END-6 · Portal docente (E9, Sprint 5)
**Contrato** (solo `docente`; el id sale del token)
| Ruta | Respuesta |
|---|---|
| `GET /api/docente/secciones?periodoId=` | mis secciones del período |
| `GET /api/docente/secciones/:id/nomina` | inscritos **activos** de **mi** sección |
| `GET /api/docente/horario?periodoId=` | mis bloques |

**Aceptación**
- [ ] Un docente que pide la sección de otro recibe `404`.
- [ ] La nómina solo lista inscripciones `activa` y refleja anulaciones.
- [ ] Sin notas ni asistencia (fuera de alcance).
- [ ] `SeccionesDocentePage`, `NominaDrawer`, `HorarioDocentePage` y `useSeccionesDocente` usan la API.
- [ ] Tests: ve solo lo suyo, nómina correcta tras inscribir y anular.

**Decisiones guiadas**
- **D-18** ¿Qué datos del estudiante muestra la nómina y cuáles NO? — *Criterio:* mínimo necesario (nombre, RUT/código, correo institucional), nada de datos sensibles.
- **D-19** ¿Cómo evitas consultas en bucle al armar secciones + nómina? — *Criterio:* una consulta/agregación por sección, no una por alumno.

**Delegable:** datos de relleno del seed; formato de tablas una vez diseñadas.

---

## 🌿 FLUJO DE GIT (obligatorio)

El repositorio es la carpeta `gestionacademica/gestionacademica/` (la que contiene `.git`). `pre-main` es la rama de integración; `main` es la entrega final.

**1. Tu rama y tu working tree.** Trabajas en `juan-branch`, donde está la base del backend.

```bash
git fetch origin
git checkout juan-branch
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

**5. Pull Request** de `juan-branch` → `pre-main`, con la plantilla de la sección 7. **Lo revisa Juan** (no te autoapruebes). El revisor también se guía por las preguntas del checklist: debe poder decir qué probó, no solo «se ve bien».

**6. Antes de cada push:** `npm run lint`, tests y build en verde (en la carpeta que corresponda).

**Nunca:** commit directo a `main`/`pre-main` · `git push --force` a ramas ajenas · subir `.env`, `node_modules`, `dist`, `.DS_Store` · reformatear archivos enteros o cambiar fines de línea en masa.

---

## ✅ DEFINICIÓN DE «TERMINADO» (para cada tarea)

1. Cumple todos sus criterios de aceptación y los tests están en verde.
2. Pasó el checklist de la sección 5 y la defensa (E6) con ≥4/5.
3. Todas las `D-xx` están en tu bitácora con tus palabras.
4. PR abierto hacia `pre-main` con la plantilla, enlazando la bitácora, y **aprobado por Juan**.
5. Las decisiones que afectan a otras personas están en `context/decisions/log.md`.
