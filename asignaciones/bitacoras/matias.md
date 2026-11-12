# Bitácora de Matias — Períodos e Inscripción

Guía para defender el código. Cada parte dice **qué hice**, **por qué** y **qué te pueden preguntar**.

> Nota honesta: el código lo escribió la IA a pedido de Matias. Esta bitácora es para que Matias lo entienda y lo pueda explicar.

## Estado

| Tarea | Estado |
|---|---|
| Traer el backend de `juan-branch` | ✅ |
| MAT-1 · Modelo `Periodo` + seed 06 | ✅ |
| MAT-2 · Servicio de períodos (estados) | ✅ servicio · ⏳ rutas (falta `authenticate` de Endert) |
| MAT-3 · Modelo `Inscripcion` | ✅ modelo · ⏳ seed 10 (faltan secciones de Diego y matrículas de Angel) |
| MAT-4 · Las 7 reglas puras | ✅ |
| MAT-5 a MAT-8 · Inscribir, endpoints, evidencia y front | ⏳ dependen de Endert, Angel y Diego |
| Demo UI para el profesor (estudiante + períodos) | ✅ login demo local sin backend |

Tests: `cd backend && npm test` → todo verde (tus tests están en `backend/tests/inscripcion/`).

---

## Guion de demo al profesor (frontend mock)

1. `cd frontend && npm run dev` → abrir http://localhost:5173
2. En el login: **Entrar como Javiera Soto (estudiante)**
3. Ir a **Inscripción** → ver asignaturas por tomar → tocar una → en Oferta abrir una sección → **Inscribir**
4. Ir a **Mi horario** y mostrar que quedó inscrita
5. (Opcional) Cerrar sesión → **Entrar como coordinador (períodos)** → pantalla **Períodos** (ventana de inscripción vs fechas del semestre)

Cuenta demo estudiante: `estudiante@iunf.cl` (botón en el login; no necesita API ni Mongo).

---

## Paso 0 · Traer el backend de Juan

- **Qué:** creé `matias-branch` desde `pre-main` y copié `backend/`, `db/`, `asignaciones/` y `context/` de `juan-branch`.
- **Por qué:** `pre-main` todavía no tenía el backend; Juan dejó ahí la base (errores, transacciones, seed y tests con Mongo en memoria).
- **Pregunta posible:** *¿por qué no hiciste merge de toda la rama de Juan?* → Porque su rama también trae cambios del frontend que chocan con `pre-main`. Traje solo lo del backend.

---

## MAT-1 · Modelo `Periodo`

Archivo: `backend/src/models/periodo.model.js`

### D-01 · La ventana de inscripción no es lo mismo que el semestre
- El **semestre** es cuando hay clases (por ejemplo, del 1 de agosto al 15 de diciembre).
- La **ventana de inscripción** es cuando puedes tomar ramos (por ejemplo, del 20 de julio al 10 de agosto).
- La ventana puede **abrir antes** de que partan las clases. La regla 2 revisa la ventana, no el semestre.

### D-02 · Validaciones de fechas
1. El término tiene que ser después del inicio.
2. El cierre de la inscripción no puede ser antes de la apertura.
3. El cierre de la inscripción no puede ser después del término del semestre.

Cada error dice qué fecha está mal. Las fechas se guardan como texto `AAAA-MM-DD`, así se comparan fácil y sin problemas de zona horaria.

- **Pregunta posible:** *¿no revisas que dos períodos se solapen?* → No; no lo pide la tarea y pueden convivir uno en curso y otro en inscripción.

### D-03 · Un solo período `en_curso`
- Usé un **índice parcial único** en Mongo: solo se aplica a los documentos con `estado: 'en_curso'`.
- **¿Por qué no basta con buscar antes?** Si dos coordinadores aprietan al mismo tiempo, los dos buscan, ninguno ve otro en curso y los dos guardan. Con el índice, la base rechaza al segundo sí o sí.

### Seed `db/seed/06-periodos.js`
- Crea 2 períodos con **fechas calculadas desde hoy**: uno `en_curso` y otro `inscripcion_abierta` (la ventana abrió hace 5 días y cierra en 10).
- Así la demo funciona cualquier día. Se puede correr varias veces sin duplicar porque busca por `codigo`.

---

## MAT-2 · Servicio de períodos

Archivo: `backend/src/services/periodos.service.js`

### D-04 · Los estados solo avanzan
`planificacion → inscripcion_abierta → en_curso → cerrado`. No se puede retroceder ni saltarse pasos; si se intenta, responde **409** `PER_TRANSICION_INVALIDA` con el estado actual y los permitidos.
- **¿Por qué no se puede reabrir la inscripción?** Porque ya hay clases y cupos usados; reabrir dejaría inscripciones a medio camino. Si hiciera falta, se decide en grupo.
- Un período `cerrado` no se puede editar (409 `PER_CERRADO`).

### D-05 · Qué es "hoy"
- "Hoy" se calcula con la hora de **Chile** (`America/Santiago`), no con UTC. Ejemplo: a las 02:00 UTC del 1 de agosto en Chile todavía es 31 de julio.
- La ventana es **inclusiva**: el último día todavía se puede inscribir. Está probado justo en el borde.

### D-06 · Cuál es el período "actual"
- Primero el que tiene la **inscripción abierta**; si no hay, el que está **en curso**.
- **Por qué:** al estudiante le importa dónde se puede inscribir. ⚠️ Esto hay que confirmarlo con Diego porque define qué oferta se ve.

---

## MAT-3 · Modelo `Inscripcion`

Archivo: `backend/src/models/inscripcion.model.js`

### D-07 · Anular no borra
- Anular cambia `estado` a `anulada` y guarda `fechaAnulacion`. Así queda la historia.
- El índice único `(estudianteId, seccionId)` solo cuenta las **activas**. Por eso:
  - un doble clic no crea dos inscripciones (la base rechaza la segunda);
  - después de anular, sí puedes volver a inscribir la misma sección.

---

## MAT-4 · Las 7 reglas

Archivo: `backend/src/services/reglasInscripcion.js`

### D-08 · Las reglas no tocan la base de datos
- El servicio **junta los datos** (matrícula, período, sección, aprobadas e inscritas) y las reglas **solo deciden**.
- **Ventaja:** se prueban en milisegundos sin levantar Mongo y se pueden reutilizar.

| # | Regla | Code | Ejemplo de mensaje |
|---|---|---|---|
| 1 | Matrícula vigente en ese período | `INS_MATRICULA_NO_VIGENTE` | No tienes una matrícula vigente en el período 2026-2 (tu matrícula está suspendida). |
| 2 | Ventana abierta | `INS_FUERA_DE_VENTANA` | La inscripción está abierta del 2026-07-20 al 2026-08-10; hoy es … |
| 3 | Cupo | `INS_SIN_CUPO` | La sección MAT-201 A está llena (30/30). |
| 4 | Del plan | `INS_ASIGNATURA_FUERA_DE_PLAN` | … no es parte de tu plan de estudios. |
| 5 | Prerrequisitos | `INS_PREREQUISITO_PENDIENTE` | Te falta aprobar Cálculo I (MAT-101). |
| 6 | No aprobada antes | `INS_YA_APROBADA` | Ya aprobaste Cálculo II (MAT-201). |
| 7 | Sin choque de horario | `INS_CHOQUE_HORARIO` | Choca con Física II (FIS-201), lunes 08:30–10:30. |

### D-09 · Devuelvo **todas** las reglas que fallan
- Van en orden de 1 a 7, y la primera es la principal (su `code` va en la respuesta).
- **Por qué:** la pantalla (`ReglasRechazadasModal`) ya muestra varias; así el alumno arregla todo de una vez.

### D-10 · Contra qué matrícula
- La matrícula **vigente del alumno en el período de la sección**, no cualquiera. Si es de otro período, falla la regla 1.

### D-11 · Qué cuenta como "aprobado"
- Lo que esté en el historial de aprobadas del alumno, sin importar el plan en que lo aprobó. ⚠️ Es una propuesta: hay que confirmarla con el grupo.

### Choque de horario (regla 7)
- Los bloques van en minutos y el intervalo es `[inicio, fin)`. Una clase que termina a las 10:00 y otra que parte a las 10:00 **no chocan** (está probado).
- ⚠️ Usé un `bloquesChocan` propio porque `utils/horario.js` de Diego aún no existe. Cuando él lo suba, se cambia por el suyo.

---

## Acuerdos con Diego (secciones y oferta)

### D-09 (de Diego) · Cambiar el horario de una sección con inscritos · acordado
- **Pregunta de Diego:** si una sección ya tiene inscritos activos, ¿se pueden cambiar sus bloques?
- **Respuesta:** no. Si tiene inscritos activos, el cambio se rechaza con 409.
- **Por qué:** si se cambia el horario, a un alumno le puede quedar un choque que la regla 7 nunca revisó.
- **Alternativa descartada:** permitir el cambio y volver a revisar choques de todos. Es más complejo y deja alumnos con tope sin que lo pidan.
- **Si hay que cambiarlo sí o sí:** se cancela la sección (ver D-30) y se abre otra.

### D-11 (de Diego) · Qué período usa `GET /api/oferta` · acordado
- **Pregunta de Diego:** ¿la oferta muestra `inscripcion_abierta` o también `en_curso`?
- **Respuesta:** por defecto, solo `inscripcion_abierta` (ahí se toman ramos). `en_curso` es para el horario y la carga académica.
- **Por qué:** calza con mi D-06 (el "período actual" prefiere el de inscripción abierta).
- **Si no hay período con inscripción abierta:** la oferta sale vacía con un mensaje, no muestra secciones del período en curso.

### D-30 (de Diego) · Cancelar una sección con inscritos · acordado
- **Pregunta de Diego:** ¿qué pasa con las inscripciones activas si se cancela la sección?
- **Respuesta:**
  - Se **anulan**, no se borran: `estado: 'anulada'`, `fechaAnulacion` y `motivo: 'seccion_cancelada'`.
  - **No se libera cupo:** la sección cancelada ya no recibe alumnos.
  - **No se reubica automáticamente:** la otra sección tendría que pasar de nuevo las 7 reglas. El alumno se vuelve a inscribir solo.
  - **Aviso:** sin correos por ahora. El alumno lo ve en su lista de anuladas con el motivo.
- **Cómo se hace:** Diego cancela la sección y, en la misma transacción, llama a `anularPorCancelacion(seccionId, sesion)`. Si algo falla, se deshace todo y nunca queda una sección cancelada con inscritos activos.
- **Código:**
  - `backend/src/models/inscripcion.model.js`: campo nuevo `motivo` (`estudiante` | `seccion_cancelada` | `null`).
  - `backend/src/services/inscripciones.service.js`: `anularPorCancelacion`.
  - `backend/tests/inscripcion/anularPorCancelacion.test.js`: 5 tests (anula con motivo, no toca otras secciones, no pisa el motivo de las ya anuladas, se deshace si falla la transacción y el motivo solo acepta valores válidos).
- **Pregunta posible:** *¿por qué `updateMany` y no un `for`?* → Es una sola operación en la base: más rápida, y no hay ningún momento en que queden algunas anuladas y otras no.

## Preguntas de defensa (E6) con respuesta corta

1. **¿Por qué un índice y no un `find` antes de guardar?** → Por la condición de carrera: dos peticiones al mismo tiempo pasan las dos el `find`. El índice lo frena la base.
2. **Caso borde:** *¿y el último día de la ventana?* → Se puede inscribir; la ventana es inclusiva y hay un test para eso.
3. **Seguridad:** *¿de dónde sale el alumno?* → Del token (`req.user.id`), nunca del body. (Se aplica en MAT-6 cuando esté `authenticate`.)
4. **Dos personas a la vez por el último cupo:** el cupo se va a reservar con una operación atómica (`$inc` con la condición `inscritos < cupoMaximo`), así solo gana una (MAT-5).
5. **¿Cómo lo probaste?** → `npm test`: tests del modelo, del servicio y de cada regla, con casos felices, bordes y errores.

## Pendiente (no depende de mí)

- `authenticate` y `authorize` (Endert) → para las rutas `/api/periodos` y `/api/inscripciones`.
- Modelos `Seccion` (Diego) y `Matricula` + aprobadas (Angel) → para `inscribir()`, el seed 10 y la evidencia con supertest.
- Confirmar D-11 (qué cuenta como "aprobado") con el grupo. D-06 ya quedó acordada con Diego (ver su D-11).
