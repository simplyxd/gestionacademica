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
