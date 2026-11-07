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
