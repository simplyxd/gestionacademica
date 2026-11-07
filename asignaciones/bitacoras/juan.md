# Bitácora de Juan — SGA

> Solo se **agrega**, nunca se borra. La escribe la IA con las **palabras de la persona**. Se enlaza en cada PR.

### D-01 · Sistema de módulos del backend (ESM o CommonJS) · 2026-11-07 · ayuda: N3
- **Pregunta que se hizo:** ¿Qué módulos usará todo el backend: ESM, CommonJS, que cada persona elija, o mezclados según la librería?
- **Respuesta de Juan (sus palabras):** «A) porque según yo es más simple y fácil de implementar para el equipo y va acorde a lo que existe en el frontend.»
- **Alternativa que se descartó y por qué:** CommonJS en todo el backend (B). Juan no dio un motivo propio contra B; su razón fue a favor de ESM. «Que cada persona elija» (C) y «mezclar» (D) quedaron fuera porque el plan exige una sola opción para los 6.
- **Decisión final:** ESM en todo el backend (`"type": "module"` en `backend/package.json`).
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que Express, Morgan y Mongoose están publicados en CommonJS pero se pueden importar sin problema desde archivos ESM, así que no hay conflicto con el stack pedido. La elección afecta solo cómo se escriben los archivos propios.
  - Pendiente: los imports relativos llevan extensión (`./config.js`); no existen `require`, `__dirname` ni `__filename` (se usa `import.meta.url`); el runner de tests de D-11 debe llevarse bien con ESM.
  - Pendiente: la decisión afecta a las 6 personas, así que se registra en `context/decisions/log.md` al cerrar JUA-1.

### D-02 · Versión de Express (4 o 5) y rechazos en handlers `async` · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué versión de Express usará el equipo? Con contexto: en Express 4 un handler `async` que falla no llega al manejador de errores; en Express 5 sí.
- **Respuesta de Juan (sus palabras):** «B)», sin justificación propia (a pedido suyo, las preguntas se responden solo con la letra). La alternativa B decía: Express 5, que reenvía los rechazos al manejador de errores sin envoltorio.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: Express 4 con `asyncHandler`, riesgo de olvidar envolver un handler y perder el error. C: Express 4 con `try/catch` repetido en los 6 dominios. D: Express 5 más `asyncHandler`, redundante.
- **Decisión final:** Express 5 (hoy la 5.3.0 en npm), sin `asyncHandler`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió la diferencia: Express 4 pierde el rechazo de una promesa y deja la petición colgada; Express 5 lo manda al manejador de errores que se hará en JUA-2.
  - Pendiente: el plan pide decidir leyendo la documentación; falta confirmar en la guía de migración a Express 5 («Rejected promises handled from middleware and handlers») y revisar la versión mínima de Node que exige.
  - Pendiente: afecta a las 6 personas, se registra en `context/decisions/log.md`.

### D-03 · Separar `app` de `server` · 2026-11-07 · ayuda: N3
- **Pregunta que se hizo:** ¿Por qué se separan `app.js` (construye la aplicación) y `server.js` (conecta a la base y escucha en un puerto)?
- **Respuesta de Juan (sus palabras):** primero dudó entre «compartir archivo entre `npm run dev` y `npm start`» y «poder probar la app en tests»; eligió la primera dos veces. Tras la analogía y la explicación eligió «B)»: *para que un test importe la `app` sin que se abra el puerto fijo ni se conecte a la base real*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** (según la explicación dada, no palabras de Juan) que `dev` y `start` compartan archivo: ejecutan el mismo arranque con o sin separación. Que Express lo obligue: no es cierto, permite rutas y `listen` en el mismo archivo. Que sea por velocidad en producción: no tiene relación.
- **Decisión final:** `app.js` construye y exporta la aplicación sin escuchar; `server.js` la importa, conecta a la base de datos y llama a `listen`. Los tests importan solo `app`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que importar un archivo que ya hace `listen` y conecta a Mongo arranca un servidor real y toca la base real, y que 6 archivos de test en paralelo pelearían por el mismo puerto.
  - Matiz: `supertest` levanta la app en un puerto temporal que elige el sistema; no es el puerto fijo de la app.
  - Pendiente: confirmar que no quede lógica de arranque (conexión a Mongo, `listen`) dentro de `app.js`.

### D-04 · Validación de variables de entorno · 2026-11-07 · ayuda: N1
- **Pregunta que se hizo:** ¿Cómo se tratan `MONGO_URI`, `JWT_SECRET`, `PORT` y `CORS_ORIGIN`, y qué pasa si falta una?
- **Respuesta de Juan (sus palabras):** primero eligió «A)» (no revisarlas); tras una pista en forma de escenario (falta `JWT_SECRET` el día de la demo) eligió «C)»: *al arrancar se revisan todas; si falta una o `JWT_SECRET` es demasiado corto, la app no arranca y muestra un mensaje claro de cuál falla*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: no revisar, el error aparece tarde y lo descubre un usuario. B: valor por defecto para `JWT_SECRET`, cualquiera podría firmar tokens. D: solo un aviso en consola y arrancar igual, el error pasa inadvertido.
- **Decisión final:** fail-fast al arrancar: todas las variables requeridas presentes, `JWT_SECRET` con largo mínimo, ningún valor por defecto inseguro, mensaje claro de cuál falla.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué es fail-fast y por qué un secreto por defecto es un riesgo de seguridad.
  - Pendiente: fijar el largo mínimo concreto de `JWT_SECRET` (el plan no da número) y con qué herramienta se valida el entorno (puede depender de D-08, la librería de validación).
  - Pendiente: crear `.env.example` con las 4 variables y sin valores reales.

### D-05 · CORS o proxy de Vite · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** El frontend (p. ej. `localhost:5173`) y el backend (p. ej. `localhost:3000`) son orígenes distintos para el navegador. ¿Qué se usa y qué origen se permite?
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo). La alternativa C decía: *en desarrollo, el proxy de Vite (el navegador ve un solo origen); en despliegue, CORS con lista blanca tomada de `CORS_ORIGIN`*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: `*` siempre, permite que cualquier sitio llame a la API. B: lista fija escrita en el código, cambiar un origen obliga a tocar código. D: desactivar la seguridad del navegador, no resuelve el problema y es peligroso.
- **Decisión final:** proxy de Vite para `/api` en desarrollo (en `frontend/vite.config.ts`); en despliegue, CORS con lista blanca leída de `CORS_ORIGIN`, nunca `*`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué es un origen, qué hace CORS y por qué el proxy evita el problema en desarrollo.
  - Pendiente: configurar el proxy en `vite.config.ts` y leer `CORS_ORIGIN` en el backend (puede ser más de un origen).
  - Pendiente: la decisión afecta a las 6 personas, se registra en `context/decisions/log.md`.

### D-06 · Cabeceras y límites de seguridad HTTP · 2026-11-07 · ayuda: N1
- **Pregunta que se hizo:** ¿Qué cabeceras y límites de seguridad HTTP se aplican (`helmet`, tamaño del body, límite de intentos en el login)?
- **Respuesta de Juan (sus palabras):** primero eligió «A)» (ninguna por ahora, por ser un prototipo); tras dos pistas (la seguridad es un requisito no funcional y 10.000 contraseñas contra el admin) eligió «D)»: *un mínimo que se pueda explicar: `helmet`, un límite de tamaño del body JSON y un límite de intentos en el login coordinado con Endert*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: dejar la seguridad para el final, es un requisito y arreglarlo tarde es más caro. B: copiar una configuración larga sin entenderla, lo que el plan llama «cargo cult». C: solo el límite de intentos, deja sin cubrir cabeceras y tamaño del body.
- **Decisión final:** `helmet`, límite de tamaño del body JSON y límite de intentos en el login, este último coordinado con Endert.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió para qué sirve cada una de las tres medidas y que la seguridad se incorpora desde el inicio.
  - Pendiente: fijar los valores concretos (tamaño máximo del body, intentos por ventana de tiempo) y qué opciones de `helmet` se dejan por defecto.
  - Pendiente: coordinar con Endert dónde se aplica el límite del login. Cuando se escriba el código, explicar en el PR qué hace cada medida.

### D-07 · Qué se registra en los logs · 2026-11-07 · ayuda: N1
- **Pregunta que se hizo:** ¿Qué se registra en los logs del servidor y qué no (`morgan`, bodies, cabeceras)?
- **Respuesta de Juan (sus palabras):** primero eligió «A)» (registrar todo); tras una pista sobre qué queda escrito en el login eligió «B)»: *método, ruta, código de estado y tiempo de cada petición, con `morgan` en desarrollo; nunca bodies con contraseñas ni tokens*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: guardar todo expone contraseñas y tokens en consolas que se copian y se suben a capturas. C: no registrar nada impide depurar. D: el body del login «solo en desarrollo» igual termina en chats y capturas.
- **Decisión final:** `morgan` en desarrollo con método, ruta, código de estado y tiempo; nunca bodies con credenciales, ni el token de `Authorization`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué datos sensibles viajan en una petición de login y por qué los logs se tratan como algo que sale del computador.
  - Pendiente: decidir el formato de `morgan` para desarrollo y qué se registra en producción.
  - Cierra las decisiones de JUA-1 (D-01 a D-07). Falta registrarlas en `context/decisions/log.md`.

### D-08 · Librería de validación para todo el equipo · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué librería de validación usará todo el equipo (zod, joi o express-validator)? Se mostró una tabla comparativa (forma de escribir, encaje con `validate(schema)`, mensajes en español, reutilización en el frontend, dependencias y tamaño en npm).
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo). La alternativa C era `express-validator`.
- **Alternativa que se descartó y por qué:** `zod` y `joi` (esquemas) y «cada dominio a su manera». Juan no dio un motivo de descarte.
- **Decisión final:** `express-validator` para los 6 dominios.
- **Qué aprendió / qué quedó pendiente:**
  - Consecuencia que se mostró: `express-validator` valida con cadenas de reglas dentro de la ruta y solo funciona con Express, así que no se reutiliza en el frontend. Tu plan dice que `validate(schema)` se adapta «según la librería elegida», por lo que en JUA-2 ese middleware será distinto a uno basado en esquemas (ejecutar las reglas y juntar los errores).
  - Pendiente: el criterio del plan pide comparar con criterios escritos y registrar el porqué en `context/decisions/log.md`. La tabla comparativa la armó la IA a partir de npm; Juan debe revisarla y escribir allí su motivo.
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log.

### D-09 · 422 para reglas académicas y 409 para conflictos de unicidad o estado · 2026-11-07 · ayuda: asistida
- **Pregunta que se hizo:** ¿Qué código HTTP corresponde a «sección llena (30/30)» y a «código de sede repetido»? (400 forma inválida, 422 regla de negocio, 409 choque con lo existente.)
- **Respuesta de Juan (sus palabras):** tres intentos, solo con la letra y sin justificación: «B)» (llena 409, repetido 422), «A)» (ambos 400) y «C)» (ambos 500). Ninguno fue correcto, incluso después de una pista, una analogía y la cita del contrato.
- **Alternativa que se descartó y por qué:** (explicación de la IA, no palabras de Juan) 400: la petición estaba bien formada. 500: es para errores inesperados del servidor, y estos casos son previstos del negocio. El cruce 409/422 invierte lo que dice el contrato.
- **Decisión final:** sección llena → **422** (regla académica: cupo); código de sede repetido → **409** (duplicado). 400 para forma inválida; 500 solo para errores inesperados.
- **Qué aprendió / qué quedó pendiente:**
  - Decisión marcada como asistida: la respuesta se dio tras agotar N1, N2 y N3.
  - Pendiente: en la defensa (E6) pedir a Juan un ejemplo propio de cada código (400, 409, 422), que es lo que pide el criterio de D-09.
  - Pendiente: la decisión afecta a las 6 personas, está en el contrato transversal del plan y se registra en el log.

### D-10 · Paginación: offset con tope y desempate por `id` · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Cómo pagina todo el equipo (offset o cursor, tope máximo, qué pasa si dos filas empatan en el campo de orden)?
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo). La alternativa C decía: *offset con `page` y `limit`, un tope máximo de 100 y desempate por `id` en el orden*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: sin tope, un `limit` enorme puede tumbar la API. B: cursor, no es «siempre mejor» y el plan elige offset por simplicidad. D: sin desempate, con empates una fila puede repetirse o desaparecer entre páginas.
- **Decisión final:** paginación por offset (`?page=1&limit=20`), `limit` máximo 100, orden estable con desempate por `id`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué es el offset y por qué un orden con empates puede repetir o perder filas entre páginas.
  - Pendiente: implementar `paginar` en JUA-2 y escribir primero un test con empates en el campo de orden.
  - Pendiente: la decisión afecta a las 6 personas y ya está en el contrato transversal del plan.

### D-11a · Runner de tests del backend · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué runner de tests usará el backend (Vitest, Jest, `node:test` o a mano)? Se mostró una comparación verificada en la documentación: el soporte de ESM de Jest es experimental y exige `--experimental-vm-modules`; Vitest es el que ya usa el frontend.
- **Respuesta de Juan (sus palabras):** «A)», sin justificación propia (a pedido suyo). La alternativa A era Vitest.
- **Alternativa que se descartó y por qué:** (según la comparación presentada, no palabras de Juan) Jest: ESM experimental y configuración extra. `node:test`: más básico y distinto al del frontend. Probar a mano: no es repetible. Juan no dio motivos propios.
- **Decisión final:** Vitest en el backend, junto con `supertest`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que la elección de ESM en D-01 influye en qué runner conviene.
  - Pendiente: la base de datos de prueba (D-11b) y consultar a Matias si necesitará transacciones.
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log.

### D-11b · Base de datos de prueba · 2026-11-07 · ayuda: N1
- **Pregunta que se hizo:** ¿Qué base de datos de prueba te cubre tanto si Matias necesita transacciones como si no, y respeta que `npm test` no dependa de internet ni de Atlas?
- **Respuesta de Juan (sus palabras):** primero eligió «D)» (contenedor Docker levantado a mano); tras dos preguntas guía eligió «B)»: *`mongodb-memory-server` en modo replica set (`MongoMemoryReplSet`), base temporal en memoria, nueva en cada suite y compatible con transacciones*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: Atlas compartida, depende de internet y de datos que cambian otras personas. C: instancia simple, no permite transacciones si Matias las necesita. D: Docker a mano, cada persona debe instalarlo y levantarlo antes de los tests.
- **Decisión final:** `mongodb-memory-server` con `MongoMemoryReplSet`, una base temporal por suite.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que MongoDB exige un replica set para las transacciones y que `mongodb-memory-server` descarga el binario de `mongod` la primera vez (verificado en su documentación); desde la segunda no necesita internet.
  - Pendiente: confirmar con Matias si su D-13 usará transacciones.
  - Pendiente: documentar en el README del backend que el primer `npm test` descarga `mongod`.
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log.

### D-12 · Seed idempotente y referencias por clave natural · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Cómo se hace el seed idempotente y cómo se referencian las colecciones entre sí sin `ObjectId` fijos?
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo). La alternativa C decía: *cada archivo hace upsert por clave natural (código, RUT, correo); al referenciar otra colección, busca el documento por su código para obtener su `id` en ese momento; los archivos corren en orden numerado*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: `deleteMany` más `ObjectId` a mano, borra datos y rompe referencias. B: `insertMany`, duplica al correr dos veces. D: `ObjectId` fijos copiados de una ejecución, se rompen en otra base.
- **Decisión final:** upsert por clave natural (`upsertPorClave`), referencias resueltas por código (`resolver(coleccion, claveNatural)`), archivos `NN-*.js` en orden explícito, nunca `deleteMany` implícito.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué es idempotente, qué es una clave natural y por qué los `ObjectId` fijos no sirven entre bases distintas.
  - Pendiente: implementar `upsertPorClave` y `resolver` en `db/seed/lib.js`, escribiendo primero el test.
  - Pendiente: `--reset` pide confirmación y se niega con `NODE_ENV=production`, como exige JUA-3.

### D-13 · Dónde guardar el JWT en el frontend · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Dónde se guarda el token: `sessionStorage`, `localStorage` o cookie `httpOnly`? Se explicó XSS (código malicioso que lee lo que el JavaScript puede leer) y CSRF (el navegador adjunta solo las cookies) y se mostró una tabla comparativa. El contrato exige `Authorization: Bearer <jwt>`.
- **Respuesta de Juan (sus palabras):** «A)», sin justificación propia (a pedido suyo). La alternativa A era `sessionStorage`.
- **Alternativa que se descartó y por qué:** (según la tabla presentada, no palabras de Juan) `localStorage`: sobrevive al cerrar la pestaña, más tiempo expuesto a XSS. Cookie `httpOnly`: no encaja con `Authorization: Bearer` y exigiría cambiar el contrato y configurar CORS con credenciales. Escribirlo en el código: no es una opción válida. Juan no dio motivos propios.
- **Decisión final:** `sessionStorage` (almacenamiento provisional en `lib/session.ts`). El token se pierde al cerrar la pestaña.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió la diferencia entre XSS y CSRF y por qué una cookie `httpOnly` cambia el contrato.
  - Pendiente: el criterio del plan pide justificar la elección para el alcance del curso; Juan debe escribir su motivo, y Endert la revisa en su D-xx.
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log.

### H-01 · Discrepancia entre `system-desing.md` §6.1 y el contrato del plan · 2026-11-07 · hallazgo de la IA (no es una D-xx)
- **Qué se encontró:** `system-desing.md` §6.1 dice que el API responde `409` para reglas de inscripción y conflictos y `422` para validación de formulario, con una forma de error `{ status, code, message, reglas?, field? }`. El contrato transversal de `asignacion-juan.md` dice lo contrario: `422` para reglas académicas, `409` para unicidad o estado, `400` para forma inválida, con la forma `{ code, regla, message, details }`.
- **Por qué importa:** el frontend de `pre-main` se hizo siguiendo `system-desing.md`; el backend se hará siguiendo el contrato del plan. Si no se alinean, `lib/api.ts` y las pantallas de inscripción leerán mal los errores.
- **Qué quedó pendiente:** que Juan, como dueño del contrato, lleve la diferencia al grupo y la registre en `context/decisions/log.md` (qué documento manda y quién actualiza el otro). Mientras tanto se sigue el contrato del plan, que es lo que Juan decidió en D-09.

### D-14 · Cómo se traduce un `ApiError` a la experiencia de usuario · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué ve la persona según el tipo de error del API (formulario, regla académica, 5xx, 401)? Se citó `system-desing.md` §6.2 y §6.3: el toast es para errores técnicos o de red, una regla académica nunca se comunica solo con un toast.
- **Respuesta de Juan (sus palabras):** «D)», sin justificación propia (a pedido suyo). La alternativa D decía: *formulario, mensaje en línea junto al campo; regla académica, mensaje que nombra la regla, persistente en la vista y con una salida; 5xx, mensaje genérico sin detalles; 401, cierra sesión y redirige*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) toast para todo con el detalle técnico del 500, modal bloqueante para todo, o error solo en la consola. Juan no dio motivos propios.
- **Decisión final:** `ApiError { status, code, regla, message, details }` se traduce así: formulario en línea; regla académica persistente, con la regla, el dato concreto y una salida; 5xx genérico; 401 cierra sesión y redirige.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió qué canal corresponde a cada tipo de error y por qué una regla no se comunica solo con un toast.
  - Pendiente: la clase `ApiError` y el manejo de 401 y 5xx en `lib/api.ts`, escribiendo primero los tests.
  - Pendiente: los números de código exactos que lee el frontend dependen de cerrar H-01 (409 y 422).

### D-15 · Por qué `git status` mostraba archivos con 5957 líneas añadidas y 5957 borradas (CRLF y LF) · 2026-11-07 · ayuda: N3
- **Pregunta que se hizo:** Si un archivo de 100 líneas cambia solo su fin de línea (LF a CRLF), ¿qué muestra `git diff --stat`? Se explicaron LF (`\n`) y CRLF (`\r\n`) como caracteres invisibles.
- **Respuesta de Juan (sus palabras):** tres intentos, solo con la letra y sin justificación: «A)» (0 líneas), «B)» (1 añadida y 1 borrada) y, tras una analogía con una lista de compras, «D)»: *100 líneas añadidas y 100 borradas; cada línea cambió, aunque el texto se vea igual*.
- **Alternativa que se descartó y por qué:** (explicación de la IA, no palabras de Juan) A: el plan dice que git sí mostró cambios. B: solo valdría si cambiara la última línea, aquí cambia el salto de cada línea. C: git sí puede comparar archivos con distinto fin de línea.
- **Decisión final:** el efecto 5957/5957 se explica porque cambió el fin de línea de cada línea de esos 28 archivos. La solución planeada es `.gitattributes` con `* text=auto eol=lf` y `.editorconfig`, **después** de investigar la causa real.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que git compara línea por línea y que el salto invisible forma parte de la línea.
  - Dato de este equipo: `core.autocrlf=true` (de fábrica en Git para Windows); `git ls-files --eol` muestra 167 archivos con `i/lf w/crlf` y `git status` está limpio. El problema de los 28 archivos aparece en otra configuración o en otro equipo.
  - Pendiente: Juan debe investigar con `git diff --stat` y `git ls-files --eol` en el estado donde aparezca el problema, y entender la causa antes de tocar nada. Después crear `.gitattributes`, `.editorconfig` y normalizar sin cambios masivos.

### S-01 · Montaje de `backend/` (JUA-1) · 2026-11-07 · ayuda: N3 (en la pregunta de dependencias)
- **Qué se hizo:** la IA creó `backend/package.json` (`type: module`, `private: true`, script `test` = `vitest run`) e instaló 6 dependencias (`express`, `mongoose`, `morgan`, `helmet`, `cors`, `express-validator`) y 3 de desarrollo (`vitest`, `supertest`, `mongodb-memory-server`). Se añadieron `node_modules/`, `.env`, `.env.*` (menos `.env.example`) y `coverage/` al `.gitignore` de la raíz. Sin commits.
- **Pregunta que se hizo:** ¿Cuáles van en `devDependencies`? Juan respondió «A)», luego «D)» y, tras una analogía y revisar dónde se usa cada paquete, «B)»: *`vitest`, `supertest` y `mongodb-memory-server`*.
- **Qué aprendió:** `dependencies` es lo que la app necesita ya desplegada; `devDependencies` es lo que solo se usa para desarrollar o probar.
- **Hallazgo:** `npm` instaló `vitest 4.1.12` y no la 5.1.0 anunciada, porque la 5.x declara soportar Node 22, 24 y 26 en adelante y este equipo tiene Node 25.8.0. El frontend usa `vitest 5.0.3`. `mongodb-memory-server` ya descargó `mongod` (cache local de 74 MB), así que `npm test` ya no necesita internet.
- **Qué quedó pendiente:** decisión no listada en el plan: qué versión de Node usa el equipo (y anotarla en `engines` y `.nvmrc`). Scripts `dev`, `start`, `lint` y `seed`, `.env.example` y herramienta de lint siguen sin definir.

### D-X1 · Versión de Node del equipo (decisión no listada en el plan) · 2026-11-07 · ayuda: asistida
- **Pregunta que se hizo:** ¿Qué versión de Node usa el equipo: una LTS común, cada quien la suya, siempre la última o Node 18? Datos verificados en npm: Express 5 pide Node ≥ 18; `mongoose` y `mongodb-memory-server`, ≥ 20.19; `vitest` 5, ^22.12 || ^24 || ≥ 26.
- **Respuesta de Juan (sus palabras):** tres intentos, solo con la letra y sin justificación: «C)» (siempre la última), «D)» (Node 18) y «A)» (cada persona la suya). Ninguno fue correcto, incluso después de una pista y de la explicación de los requisitos de cada paquete.
- **Alternativa que se descartó y por qué:** (explicación de la IA, no palabras de Juan) la última versión: justo eso hizo que npm instalara `vitest` 4.1.12 con Node 25. Node 18: no cumple lo que piden `mongoose` ni `mongodb-memory-server`. Cada quien la suya: versiones distintas de paquetes en cada computador.
- **Decisión final:** todo el equipo usa la **misma versión LTS** de Node, anotada en `engines` de `backend/package.json` y en un archivo `.nvmrc`. Según nodejs.org/en/about/previous-releases (consultado hoy) las LTS son 22, 24 y 26, y Node 25 figura como EOL. La versión exacta queda por elegir.
- **Qué aprendió / qué quedó pendiente:**
  - Decisión marcada como asistida: la respuesta se dio tras agotar N1 y N2/N3.
  - Corrección de la IA: antes se mencionaron solo 22 y 24 como LTS; según la página consultada, la 26 también lo es.
  - Pendiente: elegir 22, 24 o 26 para `.nvmrc` y `engines`; Juan debe instalar esa versión en su equipo (hoy usa 25.8.0, marcada EOL).
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log.

### D-X1b · Versión exacta de Node: 22 · 2026-11-07 · ayuda: N1
- **Pregunta que se hizo:** ¿Qué LTS fijamos (22, 24 o 26)? Se mostró una tabla de criterios: soporte de paquetes, antigüedad y tiempo de soporte.
- **Respuesta de Juan (sus palabras):** primero eligió «D)» (Node 25, la que ya tenía), que no es LTS; luego eligió «a», es decir *Node 22 (desde la 22.12)*. Sin justificación propia (a pedido suyo).
- **Alternativa que se descartó y por qué:** Node 24 y Node 26 (también válidas) y Node 25 (EOL). Juan no dio motivos propios.
- **Decisión final:** Node 22 desde la 22.12. Se registró en `.nvmrc` (raíz, valor `22`) y en `engines` de `backend/package.json` (`>=22.12.0 <23`). Con eso también se alineó `vitest` del backend con el del frontend: `^5.1.0`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que `engines` y `.nvmrc` fijan la versión de Node para todo el equipo.
  - Pendiente: Juan debe instalar Node 22 (≥ 22.12) en su equipo. Mientras tenga Node 25, `npm` mostrará el aviso `EBADENGINE`, que no bloquea.
  - Pendiente: la decisión afecta a las 6 personas, se registra en el log. El `frontend/` no tiene `engines`; decidir si se alinea.

### D-X2 · Código HTTP de `/api/health` con la base caída (decisión no listada en el plan) · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué responde `GET /api/health` cuando Mongo no está disponible? Los servicios de despliegue suelen mirar el código HTTP para saber si la app está sana.
- **Respuesta de Juan (sus palabras):** «B)», sin justificación propia (a pedido suyo). La alternativa B decía: *200 cuando todo está bien y 503 (servicio no disponible) cuando la base está caída, con el mismo cuerpo que dice cuál falla*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A: siempre 200, un monitor no detectaría el fallo mirando el código. C: 500 es un error inesperado. D: 404 significa «no existe». Juan no dio motivos propios.
- **Decisión final:** `GET /api/health` responde 200 si la API y la base funcionan y 503 si la base no responde.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que el código HTTP de un health check lo leen los servicios de despliegue.
  - Pendiente: definir la forma exacta del cuerpo en éxito y en el 503, y si `/api/health` es público (sin token).

### D-X3 · Cuerpo de la respuesta de `/api/health` (decisión no listada en el plan) · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Cómo es el cuerpo de `/api/health` en éxito y con la base caída? La tensión: el contrato exige errores planos (`code`, `regla`, `message`), pero health es un endpoint operativo.
- **Respuesta de Juan (sus palabras):** «A)», sin justificación propia (a pedido suyo). La alternativa A decía: *éxito `{ "data": { "api": "ok", "db": "conectada" } }`; con la base caída, 503 con el mismo formato y `"db": "desconectada"`*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) B: el error plano del contrato, no deja ver el estado de cada parte. C: texto plano, rompe el formato JSON del contrato. D: no incluir el estado de la base, incumple JUA-1. Juan no dio motivos propios.
- **Decisión final:** 200 `{ "data": { "api": "ok", "db": "conectada" } }`; 503 `{ "data": { "api": "ok", "db": "desconectada" } }`.
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que un health check puede usar el mismo formato `{ data }` en éxito y en fallo, porque su propósito es informar el estado.
  - Pendiente: decidir si el endpoint es público. Anotar en el log del equipo que `/api/health` es una excepción al formato de error plano.

### D-X4 · `/api/health` es público (decisión no listada en el plan) · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿`GET /api/health` pide token? Quién lo llama: un servicio de despliegue o un compañero que solo quiere saber si el servidor está vivo.
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo). La alternativa C decía: *no, es público, para que cualquiera pueda consultarlo sin iniciar sesión*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) A y B: un servicio de monitoreo no tiene token. D: solo `localhost` impediría consultarlo en un despliegue. Juan no dio motivos propios.
- **Decisión final:** `/api/health` es público: sin `authenticate` ni `authorize`. Es una excepción documentada a la regla «toda ruta tiene authenticate y authorize».
- **Qué aprendió / qué quedó pendiente:**
  - Aprendió que algunas rutas operativas se dejan públicas a propósito y que la excepción se documenta.
  - Pendiente: la respuesta pública de health no debe exponer datos internos (nada de la URI de Mongo, ni versiones, ni rutas). Registrar la excepción en el log del equipo.
  - Cierra el contrato de `/api/health`; siguiente: Etapa 2, casos de prueba.

### S-02 · `/api/health` implementado con tests primero (JUA-1) · 2026-11-07 · código escrito por la IA
- **Qué pasó:** Juan pidió que la IA escribiera el código y se lo explicara («yo no voy a codear»). Es un cambio respecto de R3 y R7 de la asignación, que piden lo contrario; se dejó constancia aquí y en los commits (`Co-Authored-By`). Se mantuvo el orden «tests primero». Los casos de prueba (base caída → 503, base disponible → 200, sin token, cuerpo exacto sin datos internos) los eligió la IA a partir del contrato que Juan decidió en D-X2, D-X3 y D-X4.
- **Archivos:** `backend/vitest.config.js`, `backend/tests/helpers/db.js` (base temporal en memoria, D-11b), `backend/tests/health/health.test.js`, `backend/src/app.js` (D-03), `backend/src/routes/{index,health.routes}.js`, `backend/src/controllers/health.controller.js`, `backend/src/services/health.service.js`.
- **Rojo y verde:** con solo `app.js` vacío, los 2 tests fallaron con 404 (la ruta no existía), que es la razón correcta. Con las 3 capas implementadas, pasan los 2.
- **Qué quedó pendiente:** Juan debe poder explicar este código en la defensa (E6). La descripción del PR debe decir que el código lo escribió la IA con explicación. Sin commits todavía.
  - Actualización: los commits `599e53e` (proyecto, dependencias, Node 22, `.gitignore`) y `05a4b6c` (`GET /api/health`) ya se hicieron en `juan-branch`, con `Co-Authored-By`. Comprobación de defensa (por qué `toEqual` con el objeto completo): acertó al tercer intento («D», tras analogía de la vitrina); el motivo es que un endpoint público no debe filtrar datos internos.

### D-X5 · Largo mínimo de `JWT_SECRET` (cierra el pendiente de D-04) · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué largo mínimo se exige al arrancar (8, 16, 32 caracteres o sin mínimo)? Dato: el estándar de HS256 (RFC 7518) pide una clave de al menos 256 bits, es decir 32 bytes.
- **Respuesta de Juan (sus palabras):** «C)», sin justificación propia (a pedido suyo): *32 caracteres*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) 8 y 16: por debajo de lo que exige el estándar; sin mínimo: cualquier clave trivial sería válida.
- **Decisión final:** `JWT_SECRET` de al menos 32 caracteres; el arranque falla si es más corta, y el mensaje nunca incluye su valor.

### D-X6 · Qué variables de entorno son obligatorias · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿Qué variables exige el arranque? Tensión entre D-04 (falla si falta una) y D-05 (en desarrollo el proxy evita CORS).
- **Respuesta de Juan (sus palabras):** «B)», sin justificación propia (a pedido suyo): *`MONGO_URI` y `JWT_SECRET` siempre; `PORT` con valor por defecto 3000; `CORS_ORIGIN` obligatoria solo en producción, y nunca con `*`*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) las cuatro siempre: obliga a inventar `CORS_ORIGIN` en desarrollo; ninguna obligatoria: la app arrancaría con una base o un secreto inventados; solo `JWT_SECRET`: sin base de datos no hay sistema.
- **Decisión final:** `MONGO_URI` y `JWT_SECRET` obligatorias; `PORT` por defecto 3000; `CORS_ORIGIN` obligatoria solo con `NODE_ENV=production`, como lista de orígenes y sin `*`.

### S-03 · Validación del entorno implementada con tests primero (cierra D-04) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/config/env.js` (función `leerEntorno` y la clase `ErrorDeConfiguracion`) y `backend/tests/config/env.test.js` (20 tests).
- **Rojo y verde:** con un archivo provisional que no validaba nada, 19 de los 20 tests fallaron por aserción (no lanzaba errores ni devolvía valores); con la implementación pasan los 20, y junto al health son 22 de 22.
- **Qué hace:** recibe un objeto (por defecto `process.env`), junta **todos** los problemas y lanza un solo error que los lista; devuelve la configuración congelada. Nunca incluye el valor del secreto en el mensaje.
- **Pendiente:** cargar el archivo `.env` (decisión no tomada: la bandera `--env-file` de Node o la librería `dotenv`) y llamar a `leerEntorno` desde `server.js`. Crear `.env.example`.

### D-X7 · Cómo se carga el archivo `.env` · 2026-11-07 · ayuda: N0
- **Pregunta que se hizo:** ¿`dotenv`, la bandera `--env-file-if-exists`, `--env-file` o guardar el `.env` en el repositorio? Datos verificados en la documentación de Node: `--env-file` existe desde 20.6 y falla si el archivo no existe; `--env-file-if-exists` desde 22.9 y no falla; en ambas, lo ya definido en el entorno tiene prioridad.
- **Respuesta de Juan (sus palabras):** «B)», sin justificación propia (a pedido suyo): *la bandera `--env-file-if-exists=.env` en los scripts `dev` y `start`: no instala nada, no falla si no hay archivo (producción) y gana lo que ya esté definido en el entorno*.
- **Alternativa que se descartó y por qué:** (según las opciones presentadas, no palabras de Juan) `dotenv`: válida, pero agrega una dependencia que Node 22 ya no necesita. `--env-file`: falla en producción donde no hay archivo. Guardar el `.env` en el repositorio: rompe la regla de no subir secretos.
- **Decisión final:** scripts `dev` (`node --env-file-if-exists=.env --watch src/server.js`) y `start` (`node --env-file-if-exists=.env src/server.js`).

### S-04 · `server.js`, `.env.example` y scripts (JUA-1) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/server.js`, `backend/.env.example`, scripts `dev` y `start` en `backend/package.json`.
- **Qué hace `server.js`:** valida el entorno con `leerEntorno`; conecta a Mongo con un plazo de 5 segundos; escucha en el puerto; cierra ordenadamente con SIGINT y SIGTERM. Si falta configuración imprime solo el mensaje; si Mongo no responde, no imprime la URI (puede traer usuario y contraseña).
- **Verificación (prueba de humo, sin test unitario porque no tiene reglas de negocio):** sin variables, sale con código 1 y lista `MONGO_URI` y `JWT_SECRET`; con variables válidas y Mongo apagado, sale con código 1 sin mostrar la URI; con una base temporal, arranca y `GET /api/health` responde `200 {"data":{"api":"ok","db":"conectada"}}`.
- **Pendiente:** `helmet`, límite de body, `cors` y `morgan` en `app.js` (D-05, D-06, D-07); `enums.js` y rutas vacías de los dominios; errores de JUA-2. Sin commit de `config/env.js`, `server.js`, `.env.example` ni de los scripts.

### S-05 · Seguridad HTTP en `app.js`: `helmet`, límite de body, `cors` y `morgan` (cierra D-05, D-06 y D-07 en código) · 2026-11-07 · código escrito por la IA
- **Qué cambió:** `app.js` ahora exporta `crearApp({ corsOrigins, registro })` en vez de una app ya creada, porque el CORS necesita la lista de orígenes que lee `server.js`. Se actualizaron `server.js` y el test del health. Se comprobó que el cambio no rompía nada: los 22 tests anteriores siguieron pasando.
- **Archivos:** `backend/src/app.js`, `backend/src/server.js`, `backend/tests/health/health.test.js` y el nuevo `backend/tests/app/seguridad-http.test.js` (10 tests).
- **Rojo y verde:** 6 de los 10 tests nuevos fallaron por la razón correcta (sin cabeceras, 404 en vez de 413, sin CORS, sin registro); los otros 4 comprueban que no se hace algo y pasaban sin implementar. Con la implementación, 32 de 32. Prueba de humo: el servidor arranca, el registro dice `GET /api/health 200 3.642 ms` (sin la query string `?token=...` que se envió) y la respuesta lleva `x-content-type-options: nosniff` sin `x-powered-by`.
- **Valores que decidió la IA sin preguntar (Juan debe confirmarlos o cambiarlos):** límite de body = `100kb`; formato de registro = método, ruta sin query string, estado y tiempo; el mismo registro mínimo se usa en producción (D-07 solo hablaba de desarrollo).
- **Pendiente:** límite de intentos del login (se coordina con Endert); `enums.js`, rutas vacías de los dominios y la parte de errores (JUA-2).

### S-06 · Enums del contrato y rutas vacías de los 14 dominios (JUA-1) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/constants/enums.js`, `backend/src/routes/<dominio>.routes.js` (14 archivos vacíos), `backend/src/routes/index.js` (ahora exporta `DOMINIOS` y monta cada uno en `/api/<nombre>`), `backend/src/models/.gitkeep`, y los tests `backend/tests/constants/enums.test.js` y `backend/tests/routes/dominios.test.js`.
- **Rojo y verde:** con un `enums.js` vacío y sin routers, 30 tests fallaron por la razón correcta (faltaban los enums y los routers); con la implementación, 98 de 98 en toda la suite.
- **Forma de los enums (decidida por la IA, Juan debe confirmarla):** objetos congelados cuyas claves son el valor en mayúsculas (`ROLES.ADMIN === 'admin'`); para Mongoose o validaciones se usa `Object.values(ROLES)`. El test compara los valores con la tabla del contrato y exige solo minúsculas ASCII y guion bajo, así que agregar un enum nuevo obliga a tocar el test, que es lo que pide el plan (nadie crea sus propias copias).
- **Cómo se probó el montaje:** el test agrega una ruta de prueba al principio del router de `sedes` y comprueba que responde bajo `/api/sedes/...`; así no lo tapa ningún middleware que su dueño agregue después. Los routers vacíos no se testean como «vacíos», para no romper los PR de los demás.
- **Pendiente:** las carpetas `errors`, `middlewares` y `utils` se crean junto con los errores de JUA-2; `models` queda con `.gitkeep`. Faltan los scripts `lint` y `seed` (JUA-1, ligados a la herramienta de lint y a JUA-3).

### S-07 · `AppError`, `errorHandler` y `notFound` (JUA-2) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/errors/AppError.js`, `backend/src/errors/codigos/general.js` (prefijo `GEN_`), `backend/src/errors/codigos/auth.js` (solo `AUT_TOKEN_VENCIDO` y `AUT_TOKEN_INVALIDO`), `backend/src/middlewares/errorHandler.js`, `backend/src/middlewares/notFound.js`, `app.js` (los conecta al final) y los tests `backend/tests/errors/AppError.test.js` y `backend/tests/middlewares/errorHandler.test.js`.
- **Rojo y verde:** con archivos provisionales que no hacían nada, 33 tests fallaron por aserción (no respondían JSON, no traducían errores, no validaban); con la implementación, 134 de 134 en toda la suite.
- **Qué hace:** todo error sale en el formato plano `{ code, regla, message, details? }`. `AppError(status, code, message, { regla, details })` valida sus argumentos (status entero 400-599, código `PREFIJO_MAYUSCULAS` con prefijo del contrato, mensaje no vacío) y lanza `TypeError` si no. Se traducen: `ValidationError` de Mongoose a 400 con `details.campos`; `CastError` a 400 llamando «id» a `_id`; `E11000` a 409 mostrando solo los nombres de los campos (nunca el valor ni la colección); `TokenExpiredError` y `JsonWebTokenError` a 401; body demasiado grande a 413; JSON mal formado a 400; cualquier otro 4xx de Express conserva su status sin su texto; todo lo demás es un 500 genérico. Los 5xx se registran con `console.error(err)`; los 4xx esperados no. La ruta inexistente responde 404 en JSON, sin repetir la query string.
- **Decisiones de la IA que Juan debe confirmar:** (1) los códigos `AUT_` viven en `errors/codigos/auth.js`, que es del dominio de Endert: hay que avisarle; (2) los errores de JWT se detectan por `err.name`, sin depender de `jsonwebtoken`, y falta comprobarlo con la librería real cuando Endert entregue `authenticate`; (3) el motivo de cada campo inválido está en español en un pequeño diccionario (`es obligatorio`, `no es un valor permitido`...); (4) los status siguen el contrato del plan (400, 409, 422), no `system-desing.md` §6.1 (ver H-01).
- **Pendiente de JUA-2:** `paginar` y el formato `{ data, meta }`, el plugin `toJSON` de Mongoose y `validate` con `express-validator`.

### D-X8 a D-X14 · Decisiones para cerrar JUA-2 y JUA-1 (siete preguntas respondidas juntas, solo con la letra) · 2026-11-07 · ayuda: N0
- **1B · `page` y `limit` inválidos:** se rechazan con 400 (`GEN_PAGINACION_INVALIDA`) con el máximo en el mensaje; no se corrigen en silencio. Descartadas (según las opciones presentadas): corregir en silencio, ignorar el tope (contradice D-10), usar siempre el valor por defecto.
- **2A · formato de `sort`:** `?sort=apellido` ascendente y `?sort=-apellido` descendente, varios campos separados por coma, solo campos permitidos por cada dominio (`id` siempre). Descartadas: `campo:desc`, cualquier campo del modelo (filtraría información por el orden), no tener `sort`.
- **3A · plugin `toJSON`:** global, registrado una sola vez antes de compilar los modelos. Descartadas: plugin por esquema (se puede olvidar y filtrar `_id` y `__v`), transformar a mano, dejar `_id` y `__v`.
- **4B · campos del body sin regla:** se descartan; el servicio recibe solo lo validado. Descartadas: pasarlos tal cual o guardarlos (*mass assignment*); se podía haber rechazado con 400 (opción C).
- **5C · varios campos inválidos:** se informan todos los errores de todos los campos, con todos sus motivos. Descartadas: solo el primer error, solo «datos inválidos».
- **6A · lint:** `oxlint`, como el frontend. Descartadas: ESLint, ninguna, solo Prettier.
- **7B · commits:** uno solo con todo lo pendiente (`70a7a4b`). El plan prefería commits pequeños; Juan eligió uno grande.
- **Sin justificación propia** (a pedido de Juan); las alternativas descartadas son las del texto de las preguntas, no palabras suyas.

### S-08 · Cierre de JUA-2: `paginar`, `toJSON`, `validate`, `respuesta` y `lint` · 2026-11-07 · código escrito por la IA
- **Archivos nuevos:** `backend/src/utils/{paginar,respuesta,toJSONPlugin}.js`, `backend/src/config/mongoose.js`, `backend/src/middlewares/validate.js`, `backend/.oxlintrc.json`, script `lint` y `oxlint` en `backend/package.json`; `app.js` importa `config/mongoose.js` primero; dos códigos nuevos en `errors/codigos/general.js` (`GEN_PAGINACION_INVALIDA`, `GEN_ORDEN_INVALIDO`). Tests: `tests/utils/{paginar,respuesta,toJSONPlugin}.test.js`, `tests/config/mongoose.test.js`, `tests/middlewares/validate.test.js`.
- **Rojo y verde:** con archivos provisionales que no hacían nada, 51 tests fallaron por aserción; con la implementación y un ajuste de un test mío, 187 de 187 en toda la suite y `npm run lint` limpio.
- **Un test mío estaba mal:** había supuesto que `schema.plugin()` llega a los subdocumentos. No es así; el plugin **global** sí. Se corrigió el test y se probó el caso global en `tests/config/mongoose.test.js`.
- **Qué hace cada pieza:** `paginar` consulta una página y devuelve `{ data, meta: { page, limit, total } }` con orden estable (el test recorre 25 filas con 5 apellidos repetidos sin repetir ni perder ninguna, que era el caso de D-10); `leerPaginacion` valida `page`, `limit` y `sort` (rechaza `__proto__`, `constructor` y `$where`); `validate([reglas])` responde 400 con todos los campos, no repite los valores enviados y deja lo validado en `req.datos.{body,params,query}` y en `req.body`; `envolver` y `envolverLista` fijan el formato de éxito.
- **Decisiones de la IA que Juan debe confirmar:** (1) el nombre `req.datos` y reemplazar `req.body` por lo validado; (2) en `validate`, el mensaje «no es válido» cuando una regla no trae mensaje propio; (3) `envolver(undefined)` entrega `{ data: null }`; (4) el filtro de `paginar` lo arma siempre el servicio, nunca la query string (documentado en el código).
- **Estado:** JUA-2 completa. De JUA-1 queda solo el script `seed`, que llega con JUA-3. Sin commit de estas piezas.

### S-09 · Revisión del PR-A contra el checklist de la sección 5 (Etapa 5) · 2026-11-07 · hecha por la IA, no por Juan
- **Nota de honestidad:** el plan pide que Juan se autorrevise primero; esta revisión la hizo la IA (Juan delegó el trabajo). Cada punto lleva su evidencia.
- **Backend:** capas respetadas (ruta, controlador, servicio) sí; validación en el borde con `validate` sí; errores con `AppError` y códigos estables sí; listas paginadas con tope 100 sí; sin secretos ni datos personales en logs sí (`console.*` en `src/` solo imprime mensajes de arranque y el error de los 5xx; `.env` no existe en el repo; `.env.example` tiene las 5 variables; `npm audit --omit=dev` da 0 vulnerabilidades). Parcial: el 409 legible por valor duplicado está probado, pero los índices únicos los crea cada dominio; los tests cubren casos felices, bordes y errores, pero faltan 401/403 y el seed. Pendiente de otras personas: `authenticate` y `authorize` en cada ruta (Endert); `/api/health` es pública a propósito (D-X4). No aplica todavía: borrado físico, concurrencia y N+1 (no hay modelos).
- **Git:** formato de commits correcto, pero `70a7a4b` no es atómico (elección 7B) y las piezas de JUA-2 aún no tienen commit. El PR-A reúne JUA-1 y JUA-2 (unos 60 archivos y 187 tests), que es lo que el plan define como PR-A, pero es grande para revisar. `.DS_Store` de la raíz sigue versionado (es de JUA-4).
- **Pruebas de humo finales:** sin variables sale con código 1 y lista lo que falta; con Mongo apagado falla sin mostrar la URI; con una base temporal `GET /api/health` responde 200 y una ruta inexistente responde 404 en JSON sin repetir la query string.
- **Agregado:** `backend/README.md` (cómo arrancar, variables, scripts, estructura, cómo agregar un endpoint y resumen del contrato). Cierra el pendiente de D-11b: la primera vez `npm test` descarga `mongod` (~70 MB).
- **Riesgos anotados:** el proxy de Vite aún no existe (JUA-4), así que front y back no se hablan todavía en desarrollo; falta el límite de intentos del login (Endert); `crearApp` no fija `trust proxy`, que habrá que revisar al poner un límite de intentos detrás de un proxy.

### S-10 · Defensa del PR-A (Etapa 6, cinco preguntas con alternativas) · 2026-11-07 · resultado: 4 de 5, aprobada
- **Respuestas de Juan (solo la letra):** 1A, 2A, 3C, 4D, 5B.
- **Correctas (4):** por qué `validate` descarta los campos sin regla (evitar *mass assignment*); qué ve el cliente ante un error inesperado (500 genérico sin mensaje ni traza, y el servidor lo registra); qué garantiza la unicidad ante dos peticiones simultáneas (índice único en la base y 409 desde el `errorHandler`); cómo se comprobó `server.js` (prueba de humo real).
- **Incorrecta (1):** pregunta 2, qué evita que una persona se repita o se pierda entre páginas cuando hay empates en el orden. Juan eligió «el tope de 100 en `limit`»; la correcta era el desempate por `_id`. El tope limita el tamaño de la página, no el orden. Es el mismo concepto de D-10, que Juan había decidido bien: **repasar antes de la revisión de Endert.**
- **Qué falta para dar el PR por terminado (definición de «terminado»):** commit de lo pendiente (JUA-2, `lint`, README), subir `juan-branch`, abrir el PR hacia `pre-main` con `asignaciones/pr/PR-A.md`, la aprobación de Endert, y las decisiones que afectan al equipo en `context/decisions/log.md`.

### D-X15 a D-X17 · Decisiones del PR-B (tres preguntas respondidas juntas, solo con la letra) · 2026-11-07 · ayuda: N0
- **1C · cómo se firma el token de prueba:** esperar a que Endert entregue `authenticate` y usar la librería que él elija. Descartadas (según las opciones presentadas): `jsonwebtoken` como dependencia de desarrollo (posible conflicto en `package.json`), firmar a mano con `node:crypto`, y no usar JWT (contradice el plan). **Consecuencia:** el helper `asUser(rol, { sedes })` queda pendiente.
- **2A · cómo conoce la app el secreto de los tokens:** `crearApp({ jwtSecret })` lo guarda en `app.locals.jwtSecret` y `authenticate` lo lee con `req.app.locals.jwtSecret`. Descartadas: leer `process.env` en cada petición, leer `leerEntorno()` al cargar el módulo, un secreto fijo en el código. **Es un contrato con Endert.**
- **3A · limpieza de la base entre tests:** helper `limpiarBase()` que borra los documentos de todas las colecciones y conserva los índices, usado en `afterEach`. Descartadas: una base nueva por test (unos 2 segundos cada una), no limpiar, volver a correr el seed (contradice D-12).

### S-11 · Helpers de prueba y `jwtSecret` (PR-B, parte 1) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/app.js` (opción `jwtSecret` y `app.locals.jwtSecret`), `backend/src/server.js` (pasa `config.jwtSecret`), `backend/tests/helpers/app.js` (`crearAppDePrueba` y `SECRETO_DE_PRUEBA`, 40 caracteres), `backend/tests/helpers/db.js` (`limpiarBase`), y los tests `backend/tests/app/jwtSecret.test.js` y `backend/tests/helpers/helpers.test.js`. Además, la sección «Cómo escribir un test de API en 5 minutos» del `backend/README.md`.
- **Rojo y verde:** con archivos provisionales, 7 tests fallaron por la razón correcta (el secreto no quedaba en `app.locals`, `limpiarBase` no vaciaba nada ni avisaba sin conexión); con la implementación, 195 de 195 en toda la suite y `npm run lint` limpio.
- **Detalles:** `limpiarBase` falla con un mensaje que nombra `conectarBaseDePrueba()` si no hay conexión; el test comprueba que conserva el índice único (sigue rechazando un duplicado con el código 11000).
- **Pendiente del PR-B:** `asUser(rol, { sedes })` y los helpers de token vencido y de firma ajena, cuando Endert entregue `authenticate`. Falta el checklist, la defensa y la descripción del PR-B. Sin commit de estas piezas.

### D-X18 a D-X23 · Decisiones del PR-C y PR-D (seis preguntas respondidas juntas, solo con la letra) · 2026-11-07 · ayuda: N0
- **1A · dónde vive el seed:** el runner y las utilidades en `backend/src/seed/`; `db/seed/` guarda solo los archivos de datos `NN-*.js`, que importan los modelos con ruta relativa. `npm run seed` corre desde `backend/`. Motivo técnico verificado: un archivo en `db/` no puede importar `mongoose` si está instalado solo en `backend/` (`ERR_MODULE_NOT_FOUND`). Descartadas: `package.json` propio en `db/` (dos copias de `mongoose`), ruta relativa a `node_modules`, *workspaces*. **Consecuencia:** `index.js` y `lib.js` ya no están en `db/seed/`, como decía la lista de archivos propios.
- **2A · con qué trabajan `upsertPorClave` y `resolver`:** modelos de Mongoose (validaciones, valores por defecto y fechas). Descartadas: colecciones crudas, que cada archivo elija.
- **3B · `--reset`:** borra toda la base tras una pregunta «s/n». **Protecciones que agregó la IA** por ser una confirmación débil: la pregunta muestra el nombre de la base y el servidor; se niega con `NODE_ENV=production` (antes de conectarse); no corre si no hay terminal. Descartadas: escribir el nombre de la base (más seguro), borrar solo lo conocido, sin confirmación en bases locales.
- **4A · si un archivo del seed falla:** se detiene en el primero, dice cuál y por qué, y sale con error; se puede repetir porque es idempotente. Descartadas: seguir, deshacer todo con una transacción, ignorar.
- **5A · qué devuelve `lib/api.ts`:** el JSON completo (`{ data }` o `{ data, meta }`). Descartadas: solo `data` con `lista()` aparte, siempre solo `data` (impide paginar), `fetch` en cada pantalla. **Aún sin implementar (PR-D).**
- **6A · respuesta 401 en el frontend:** `api.ts` borra el token y avisa con un evento; el contexto de sesión redirige al login con React Router, sin recargar. Descartadas: `window.location.href`, que cada pantalla decida, no hacer nada. **Aún sin implementar (PR-D).**
- **Decididas por la IA (Juan debe confirmarlas):** el seed lee el mismo `.env` (necesita también `JWT_SECRET`); un fallo de red en el frontend será un `ApiError` de status 0 con «Sin conexión con el servidor»; `usePaginacionServidor` cancela peticiones atrasadas; `VITE_API_URL` vacío en desarrollo y se usa `/api` con el proxy de Vite; `.gitattributes` con `* text=auto eol=lf`.

### S-12 · Runner de seed, `--reset` y `db/README.md` (PR-C) · 2026-11-07 · código escrito por la IA
- **Archivos:** `backend/src/seed/{lib,runner,cli}.js`, script `seed` en `backend/package.json`, `db/seed/.gitkeep`, `db/README.md`; tests `backend/tests/seed/{lib,runner,reset}.test.js` y fixtures en `backend/tests/seed/fixtures/` (carpetas `ok`, `falla`, `repetida`, `sin-funcion`, `vacia`).
- **Rojo y verde:** con archivos provisionales, 39 tests fallaron por la razón correcta; con la implementación, 235 de 235 en toda la suite y `npm run lint` limpio.
- **Un test mío estaba mal:** `reset.test.js` no limpiaba la base entre casos y los documentos se acumulaban (5 fallos). Se corrigió con `afterEach(limpiarBase)`, el helper del PR-B.
- **Qué hace:** `upsertPorClave(Modelo, clave, datos)` actualiza o inserta por clave natural, valida y cuenta creados y actualizados; rechaza claves vacías o con valores vacíos (una clave `{}` podría tocar un registro cualquiera, hay un test que lo comprueba). `resolver(Modelo, clave)` devuelve el `_id`; falla si no existe (sugiere revisar el orden) o es ambigua. El runner ejecuta `NN-*.js` en orden, ignora lo demás, rechaza números repetidos, exige una función por defecto y se detiene en el primer fallo. Segunda corrida: 0 creados.
- **Prueba de humo del CLI:** sin variables lista lo que falta; con una base temporal y sin archivos avisa «No hay archivos de semilla» (código 0); `--reset` con `NODE_ENV=production` se niega antes de conectar; `--reset` sin terminal se niega. Los rechazos esperados imprimen solo el mensaje (`ErrorDeUso`).
- **No probado:** el `--reset` con terminal real y el borrado de una base de verdad desde el CLI (sí está probado `reiniciarBase` con `dropDatabase` en la base temporal). `db/seed/` está vacío: los archivos de datos son de cada dueño.
- **Pendiente:** el PR-D (frontend e higiene), `asUser`, el log de decisiones, los checklist y las defensas de PR-B y PR-C. Sin commit.

### S-13 · Base del frontend e higiene del repo (PR-D, JUA-4) · 2026-11-07 · código escrito por la IA
- **D-15 resuelta (la investigación que pedía el plan):** al buscar archivos de texto guardados con CRLF dentro de cada rama, `origin/biñi` tiene **28**, la cifra exacta del plan; `main` y las ramas que parten de ella tienen 6 (los `wireframes/*.html`); `pre-main`, `juan-branch` y `feat/login-404-abm` tienen 0. Ninguna rama tenía `.gitattributes`. Causa más probable: Git compara línea por línea, y con archivos CRLF en el repositorio más `core.autocrlf` distinto en cada computador, cada línea aparece borrada y vuelta a añadir. No se reprodujo el recuento exacto de 5957 líneas. En este equipo `git status` salía limpio porque `core.autocrlf=true` convierte solo.
- **Archivos nuevos:** `frontend/src/lib/{session,sesionInvalida,api,usePaginacionServidor}.ts` con sus tests, `frontend/src/app/EscucharSesionInvalida.tsx`, `frontend/.env.example`, `.gitattributes` (`* text=auto eol=lf`), `.editorconfig`. **Modificados:** `frontend/vite.config.ts` (proxy `/api` a `http://localhost:3000`, `API_PROXY_TARGET` para cambiarlo), `frontend/src/vite-env.d.ts` (tipo de `VITE_API_URL`), `frontend/src/app/router.tsx` (una línea: monta el aviso de sesión inválida dentro de `RequireAuth`), `README.md`, `frontend/README.md` y `context/decisions/log.md` (cinco entradas). `.DS_Store` salió del índice de git (sigue en el disco, ignorado).
- **Rojo y verde:** con archivos provisionales, 38 tests fallaron por la razón correcta; con la implementación, 115 de 115 en el frontend (75 de antes y 40 nuevos), `tsc` limpio y `npm run build` correcto. Con `.gitattributes` puesto, `git status` no muestra cambios fantasma de fines de línea.
- **Un aviso de lint mío, corregido:** el hook llamaba a `setState` dentro de un `useEffect` (React lo desaconseja: render extra). Se derivó `cargando` del resultado y desapareció; ninguno de los archivos nuevos tiene avisos (los 31 que quedan son anteriores).
- **Prueba de punta a punta en un navegador real:** con el backend (base temporal) y Vite, `fetch('/api/health')` desde `localhost:5173` responde 200 a través del proxy; `api.get` de la app devuelve `{ data }`; un 404 y un 413 llegan como `ApiError` con su `code`; el token de la URL no se repite en el mensaje. Con el login simulado, un 401 con token borró la sesión y llevó a `/login` sin recargar.
- **Verificado en la guía de Express 5:** reenvía los rechazos de promesas de los handlers `async` al manejador de errores y exige Node 18 o superior. **Cierra el pendiente de D-02.**
- **No probado con tests:** el hook `usePaginacionServidor` (la lógica pura sí tiene tests; el hook es pegamento de React y el frontend no tiene herramientas de prueba de componentes) y el componente `EscucharSesionInvalida` (solo la prueba manual de arriba).
- **Pendiente:** Juan debe revisar las cinco entradas de `context/decisions/log.md` antes de subirlas, porque están redactadas por la IA a partir de sus decisiones y del plan; llevar a Endert dónde enchufar `session.setToken` en su login; los checklist y las defensas de los PR-B, PR-C y PR-D; `asUser`; los commits y subir.

### S-14 · Commits de lo pendiente · 2026-11-07 · hecho por la IA a pedido de Juan («Antes el commit»)
- **Cinco commits en `juan-branch`, uno por idea** (Juan no indicó cuántos; la IA los separó por área porque el plan pide commits atómicos y el checklist había marcado el commit grande como incumplimiento; se deshacen con `git reset --soft HEAD~5` si prefiere uno solo): `6fb3fe5` fines de línea y `.DS_Store` · `26de9f9` backend (paginación, validación, plugin `toJSON`, helpers y lint) · `0e527af` seed · `1fa6bb1` frontend · `316cba5` README y log de decisiones. Todos con `Co-Authored-By`.
- **Antes de commitear:** se comprobó la rama (`juan-branch`) y que no entrara `node_modules`, `.env`, `dist`, `coverage` ni `.DS_Store`. Backend 235 de 235 y frontend 115 de 115 al momento de commitear.
- **Limitación:** `package.json` del backend entra en el commit del backend con el script `seed` ya incluido, aunque el seed llega en el commit siguiente (no se pudo separar sin edición interactiva). Ese commit intermedio no ejecuta el seed.
- **Sin versionar a propósito:** `asignaciones/` (esta bitácora y `asignaciones/pr/PR-A.md`) y `.cursor/`. El plan pide enlazar la bitácora en cada PR, así que habrá que decidir cómo versionarla.
- **Estado:** `juan-branch` va 33 commits por delante de `origin/juan-branch`; nada se ha subido.

### S-15 · Subida de `juan-branch` a origin · 2026-11-07 · a pedido de Juan («haz el push commit de todo para que esté arriba»)
- **Qué se subió:** todo lo de las entradas anteriores más `asignaciones/` (las seis asignaciones, el README del reparto, la plantilla, esta bitácora y `asignaciones/pr/PR-A.md`) y `.cursor/plans/pendientes_sga_y_roles_4366da4a.plan.md`, que las asignaciones citan en «Primero lee». Antes de subir se revisó que esos 12 archivos (265 KB) no tuvieran claves, contraseñas, correos ni direcciones de base de datos: no había ninguno.
- **Solo a `juan-branch`**, sin `--force`, sin tocar `pre-main` ni `main`. No se abrió ningún PR.
- **Defensa:** Juan la hará después. Siguen pendientes los checklist y las defensas de los PR-B, PR-C y PR-D, `asUser`, la revisión del log de decisiones por Juan, el PR hacia `pre-main` con la aprobación de Endert y el aviso al equipo.
- **Nota:** esta bitácora ahora es pública en la rama; las entradas escritas por la IA dicen explícitamente que el código lo escribió ella.
