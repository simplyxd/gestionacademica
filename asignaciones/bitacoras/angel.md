# Bitácora de Angel — Personas y Matrícula (E4 · E5)

Solo se agrega, nunca se borra. Cada entrada registra una decisión con las palabras de Angel.
Asignación: [asignacion-angel.md](../asignacion-angel.md).

Plantilla:

```
### D-xx · <título corto> · <fecha> · ayuda: N0|N1|N2|N3|asistida
- Pregunta que se hizo:
- Respuesta de Angel (sus palabras):
- Alternativa que se descartó y por qué:
- Decisión final:
- Qué aprendió / qué quedó pendiente:
```

## Pendientes de coordinación

- **Endert:** contrato cuenta/perfil (ANG-1), rutas `/api/usuarios/:id/perfil` y `/ficha`, regla de sedes (su D-12), formulario único (ANG-5).
- **Juan:** base del backend (H0): Express, conexión, `constants/enums.js`, `AppError`.
- **Endert (modelo Usuario):** importar `perfilDocenteSchema`/`perfilEstudianteSchema` de `perfiles.schemas.js`; llamar `validarPerfilSegunRol(this)` en un `pre('validate')` y usar `this.invalidate(...)` con el motivo; índice único *sparse* en `perfilEstudiante.codigoEstudiante` (ANG-2, D-04).
- **Frontend (ANG-5):** alinear `TIPOS_VINCULO` (`planta`/`contrata`/`honorarios`), `especialidad` opcional y `nivelCursando` numérico (1–8) con lo decidido en D-01.

---

### G-01 · Orden de trabajo sin la base del backend · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: no existe `backend/` en ninguna rama y la base es de Juan (H0); ¿cómo seguimos?
- Respuesta de Angel (sus palabras): empezar por la lógica pura (servicio de matrícula + tests con Mongo en memoria), sin Express ni auth; cuando llegue la base de Juan, se conectan las rutas.
- Alternativa que se descartó y por qué: crear una base propia de backend (duplicaría H0 de Juan) o esperar a Juan (bloquea el avance).
- Decisión final: servicios y modelos primero, con las dependencias de otros dominios inyectadas.
- Qué aprendió / qué quedó pendiente: conectar rutas, `authenticate`/`authorize` y tests 401/403 cuando exista H0.

### G-02 · Ubicación de la asignación · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿dónde vive `asignacion-angel.md`?
- Respuesta de Angel (sus palabras): moverlo a `asignaciones/asignacion-angel.md` y crear ahí la bitácora.
- Alternativa que se descartó y por qué: dejarlo en la raíz (no coincide con lo que dice el propio archivo).
- Decisión final: `asignaciones/asignacion-angel.md` y `asignaciones/bitacoras/angel.md`.
- Qué aprendió / qué quedó pendiente: —

### G-03 · Herramienta de tests y sistema de módulos del backend · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿qué runner de tests y qué estilo de imports usa el backend?
- Respuesta de Angel (sus palabras): vitest (el mismo del frontend) y CommonJS (`require`/`module.exports`, el estilo clásico de Express).
- Alternativa que se descartó y por qué: jest (configuración extra), `node:test` (menos cómodo); ESM.
- Decisión final: vitest con `globals: true` (vitest no se carga con `require`) + `mongodb-memory-server` para probar índices reales. Base mínima: solo `package.json`, `vitest.config.mjs` y `tests/helpers/mongo.js`; sin Express ni `app.js`.
- Qué aprendió / qué quedó pendiente: avisar a Juan que `backend/package.json` ya existe con CommonJS + vitest, para que su H0 lo extienda en vez de duplicarlo (o que diga si prefiere otra cosa).

### D-01 · Campos obligatorios de los perfiles · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿qué campos son obligatorios en cada perfil y qué valores acepta `tipoVinculo`?
- Respuesta de Angel (sus palabras): docente: solo `tipoVinculo` obligatorio; `especialidad` y `departamentos` opcionales. `tipoVinculo`: planta, contrata, honorarios. Estudiante: `codigoEstudiante`, `contactoEmergencia` y `nivelCursando` obligatorios; `aprobadas` empieza vacía. `nivelCursando` como número entero de 1 a 8.
- Alternativa que se descartó y por qué: los 4 vínculos del frontend (tiempo completo, media jornada, por horas, honorarios); `nivelCursando` como texto «Nivel N» (difícil de ordenar y comparar).
- Decisión final: enum cerrado `planta | contrata | honorarios`; `codigoEstudiante` con formato `EST-AAAA-NNN` (el mismo del frontend), normalizado a mayúsculas.
- Qué aprendió / qué quedó pendiente: el frontend actual difiere (vínculos, especialidad obligatoria, nivel en texto): se alinea en ANG-5.

### D-02 · `aprobadas[]` embebido en el estudiante · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ventaja y riesgo de embeber el historial; qué hacer con duplicados.
- Respuesta de Angel (sus palabras): rechazar solo el par repetido (misma asignatura y mismo período); permitir la misma asignatura en períodos distintos. Tope de 100 elementos.
- Alternativa que se descartó y por qué: rechazar cualquier repetición de asignatura; deduplicar en silencio (esconde errores del seed); sin tope.
- Decisión final: validador de pares únicos `asignaturaId + periodoId` y máximo 100 aprobadas. Ventaja: las reglas 5 y 6 se resuelven con una sola lectura del estudiante. Riesgo: límite de 16 MB por documento (el tope lo deja explícito).
- Qué aprendió / qué quedó pendiente: para la regla 6 («ya aprobó») basta con que la asignatura aparezca en cualquier período.

### D-03 · Perfiles en archivo aparte · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿por qué `perfiles.schemas.js` y no dentro de `usuario.model.js`?
- Respuesta de Angel (sus palabras): un archivo = un dueño (Endert y yo no editamos el mismo archivo, sin conflictos de merge) y además se reutilizan los esquemas en seeds y tests sin cargar todo el modelo Usuario.
- Alternativa que se descartó y por qué: definir los perfiles dentro del modelo de Endert.
- Decisión final: `backend/src/models/perfiles.schemas.js` exporta los esquemas (sin `_id`) y `validarPerfilSegunRol`.
- Qué aprendió / qué quedó pendiente: —

### G-04 · Forma de `validarPerfilSegunRol` · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿el perfil es obligatorio para docente/estudiante? ¿qué devuelve la función?
- Respuesta de Angel (sus palabras): el perfil puede faltar (se completa después); lo que se prohíbe es el perfil del rol equivocado. Devuelve `null` si es válido o un mensaje en español con el motivo.
- Alternativa que se descartó y por qué: perfil obligatorio (depende de lo que se acuerde con Endert sobre el alta); lanzar error o devolver booleano (sin motivo).
- Decisión final: `null | string`; Endert lo usa con `invalidate()` en su modelo.
- Qué aprendió / qué quedó pendiente: revisar si el perfil pasa a obligatorio cuando se cierre el acuerdo con Endert.

### D-07 · Índice único parcial para «una vigente por período» · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿por qué un índice parcial y no solo un `find` antes de insertar? Describe una secuencia que lo rompe.
- Respuesta de Angel (sus palabras): dos coordinadores (o un doble clic) envían el alta a la vez: ambos hacen el find, ninguno ve una vigente, ambos insertan y quedan dos vigentes. El índice hace que la BD rechace la segunda (E11000) y respondemos 409 MTR_YA_VIGENTE.
- Alternativa que se descartó y por qué: solo `find` + `insert` (condición de carrera).
- Decisión final: índice `{ estudianteId, periodoId }` único con `partialFilterExpression: { estado: 'vigente' }`. Test con dos altas simultáneas: solo una queda.
- Qué aprendió / qué quedó pendiente: traducir E11000 a `409 MTR_YA_VIGENTE` cuando exista `AppError` (Juan).

### D-09 · Estados finales sin atajos · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿cómo impedir que un PATCH directo se salte las transiciones?
- Respuesta de Angel (sus palabras): tabla TRANSICIONES central en el servicio, y el update condicional y atómico: `findOneAndUpdate({ _id, estado: actual }, { estado: nuevo })`; si otro la cambió entre medio, no se aplica.
- Alternativa que se descartó y por qué: leer + `save()` (dos pasos, carrera entre lectura y escritura); hook `pre('save')` (no cubre `updateOne`/`findOneAndUpdate`).
- Decisión final: `TRANSICIONES` congelada (`Object.freeze`) en `matriculas.service.js`. El `cambiarEstado` atómico queda para cuando exista `AppError`.
- Qué aprendió / qué quedó pendiente: implementar `cambiarEstado` con el update condicionado.

### D-08 · Carrera cerrada: nuevo ingreso vs. renovación · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: con la carrera `inactiva`, ¿qué pasa con quien ya estaba matriculado y pide matrícula para el siguiente período?
- Respuesta de Angel (sus palabras): renovación permitida: si el estudiante ya tuvo una matrícula en esa carrera (cualquier período anterior), puede renovar; solo se bloquea al que entra por primera vez.
- Alternativa que se descartó y por qué: bloquear todo (deja sin continuidad a quienes cursan); solo mismo plan (más restrictivo de lo que pide el dominio).
- Decisión final: **propuesta** a Lorenzo, registrada en `context/decisions/log.md`.
- Qué aprendió / qué quedó pendiente: OK de Lorenzo; implementarla en `registrar`.

### D-10 · Suspensión e inscripciones activas · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: al suspender, ¿qué pasa con las inscripciones activas del período?
- Respuesta de Angel (sus palabras): se conservan tal cual, pero no puede inscribir nuevas (la regla 1 ya exige matrícula vigente). Al pasar a retirada recién se anulan.
- Alternativa que se descartó y por qué: anular al suspender (pierde cupos); impedir suspender con inscripciones (burocrático).
- Decisión final: **propuesta** a Matias, registrada en `context/decisions/log.md`.
- Qué aprendió / qué quedó pendiente: OK de Matias; acordar quién anula las inscripciones al retirar (su servicio, llamado desde `cambiarEstado`).

### G-05 · Alcance del Paso 3 y forma del servicio · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: sin `AppError` y sin los modelos de otros, ¿qué se implementa y cómo recibe el servicio las dependencias?
- Respuesta de Angel (sus palabras): avanzar con lo que no necesite dependencia de otra persona; los errores quedan pendientes hasta que Juan suba sus cosas. Dependencias por fábrica: `crearMatriculasService({ buscarEstudiante, buscarCarrera, buscarPlan, buscarPeriodo })`. `contarPorCarrera` sin estado cuenta todas; `listar` más recientes primero (page 1, limit 20, tope 100); `matriculaVigente` devuelve la matrícula o `null`.
- Alternativa que se descartó y por qué: `require` directo de modelos ajenos (no existen); devolver `{ ok, error }` como el frontend (se reescribiría).
- Decisión final: hechos el modelo con índice, `TRANSICIONES`, `matriculaVigente`, `contarPorCarrera` y `listar`. Pendientes: `registrar` y `cambiarEstado` (con la fábrica), `errors/codigos/matriculas.js`, búsqueda `q` y alcance por sedes en `listar`.
- Qué aprendió / qué quedó pendiente: la fábrica se crea junto con `registrar`, que es lo único que usa las dependencias.

### D-12 · Alumnos de demo por regla · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿qué alumnos necesita cada regla para poder demostrarse y qué intentan inscribir?
- Respuesta de Angel (sus palabras): aprobó la tabla propuesta tal cual (sinmatricula → regla 1, otroplan → 4, sinprerrequisito → 5, yaaprobo → 6, choque → 7, feliz → acepta); se documenta en `db/README.md` como propuesta para Matias.
- Alternativa que se descartó y por qué: un alumno por cada una de las 7 reglas (las reglas 2 y 3 dependen del período y la sección, no del alumno).
- Decisión final: `db/seed/lib/demo.js` + tabla en `db/README.md`; tests que comprueban que cada caso realmente provoca su regla.
- Qué aprendió / qué quedó pendiente: OK de Matias (su D-17); la inscripción previa de `demo.choque` la pone él en el seed 10.

### D-11 · Historiales realistas y coherentes · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿cómo generar el historial de 200 estudiantes respetando prerrequisitos?
- Respuesta de Angel (sus palabras): recorrer el plan semestre a semestre hasta su nivel - 1; cada asignatura se aprueba solo si sus prerrequisitos ya están aprobados, con ~85% de probabilidad (algunos reprueban), usando una semilla fija para que siempre salga igual.
- Alternativa que se descartó y por qué: aprobar todo lo anterior a su nivel (simple pero poco realista).
- Decisión final: `generarHistorial` + `verificarHistorial` en `db/seed/lib/historial.js`; test de consistencia sobre 200 historiales. Un prerrequisito del mismo semestre no habilita la asignatura ese semestre.
- Qué aprendió / qué quedó pendiente: adaptar la entrada al modelo de plan de Lorenzo cuando exista (hoy: `{ codigo, semestre, prerrequisitos[] }`).

### G-06 · Ubicación de los generadores del seed · 2026-11-07 · ayuda: N0
- Pregunta que se hizo: ¿dónde va el código de los generadores y sus tests?
- Respuesta de Angel (sus palabras): `db/seed/lib/*.js`, y los tests se corren con el vitest del backend agregando `db/` al include.
- Alternativa que se descartó y por qué: `db/` con su propio `package.json` (duplica herramientas).
- Decisión final: generadores sin dependencias externas; el test que valida perfiles carga `mongoose` desde `backend/`. Los perfiles generados se validan contra los esquemas reales.
- Qué aprendió / qué quedó pendiente: escribir `07-personas.js` y `08-matriculas.js` cuando existan el modelo `Usuario` (Endert) y los seeds 04–06.
