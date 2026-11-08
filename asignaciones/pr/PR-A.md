# PR-A · `juan-branch` → `pre-main` (revisor: Endert)

**Título:** `feat(backend): esqueleto de la API, health, errores y utilidades base`

> **Nota de autoría:** el código de este PR lo escribió la IA (Claude) y se lo fue explicando a Juan. Juan tomó las decisiones de diseño respondiendo preguntas (D-01 a D-15 y las decisiones extra D-X1 a D-X14) y aprobó la defensa con 4 de 5. Consta en los commits (`Co-Authored-By`) y en la bitácora `asignaciones/bitacoras/juan.md`.

## Qué y por qué

Entrega **JUA-1** (esqueleto del backend, E0-2 y E0-3) y **JUA-2** (contrato de errores, respuestas y paginación). Es el camino crítico: hasta que esto esté en `pre-main`, el resto del equipo no puede montar sus dominios.

- **Esqueleto:** `backend/` como paquete ESM con Express 5 y Mongoose; `app.js` (`crearApp`, no escucha) separado de `server.js`; scripts `dev`, `start`, `test` y `lint`; Node 22 fijado en `.nvmrc` y `engines`.
- **Entorno:** `config/env.js` valida `MONGO_URI`, `JWT_SECRET` (mínimo 32 caracteres), `PORT` y `CORS_ORIGIN` al arrancar; falla con un mensaje que lista todo lo que falta. `.env.example` sin secretos.
- **Seguridad HTTP:** `helmet`, límite de body de 100kb, CORS con lista blanca (nunca `*`) y `morgan` sin query string, body ni tokens.
- **Contrato:** `GET /api/health` (público; 200 o 503 según Mongo), `constants/enums.js` con los enums del contrato y las rutas vacías de los 14 dominios, ya montadas en `/api/<dominio>`.
- **Errores y respuestas:** `AppError`, `errorHandler` (traduce errores de Mongoose y JWT sin filtrar internos), `notFound` en JSON, `validate` con `express-validator`, `paginar` (offset, tope 100, desempate por `_id`), `envolver`/`envolverLista` y plugin global `toJSON` (`_id` → `id`).
- **Documentación:** `backend/README.md` con cómo arrancar y cómo agregar un endpoint.

Cubre: RF1 (base de autenticación y errores), NFR de arquitectura en capas, seguridad y validación.

## Decisiones

Todas en `asignaciones/bitacoras/juan.md`:

- **JUA-1:** D-01 ESM · D-02 Express 5 · D-03 `app` separada de `server` · D-04 entorno fail-fast · D-05 proxy de Vite y CORS con lista blanca · D-06 `helmet`, límite de body y de intentos · D-07 logs sin datos sensibles.
- **JUA-2:** D-08 `express-validator` · D-09 422 para reglas académicas y 409 para duplicados · D-10 paginación por offset.
- **Extras:** D-X1/D-X1b Node 22 · D-X2 a D-X4 `/api/health` · D-X5 `JWT_SECRET` ≥ 32 · D-X6 variables obligatorias · D-X7 `--env-file-if-exists` · D-X8 a D-X14 paginación, `sort`, plugin global, campos sin regla, errores de validación, `oxlint`.
- **Hallazgo H-01:** `system-desing.md` §6.1 usa 409/422 al revés que el contrato. Este PR sigue el contrato del plan (400/409/422). Hay que cerrarlo con el grupo.

## Cómo probar

```bash
cd backend
npm install
npm test          # 187 tests; la primera vez descarga mongod (~70 MB)
npm run lint      # sin avisos
cp .env.example .env   # completa MONGO_URI y JWT_SECRET (32+ caracteres)
npm run dev
```

Debería verse: `GET http://localhost:3000/api/health` → `200 {"data":{"api":"ok","db":"conectada"}}`; una ruta inexistente → `404` en JSON; sin variables de entorno el arranque sale con error y lista lo que falta; con Mongo apagado falla en menos de 5 segundos sin mostrar la URI.

## Checklist (sección 5 del plan)

**Backend**
- [x] Capas respetadas: ruta → controlador → servicio. Cero reglas en el controlador.
- [x] Validación de entrada en el borde (`validate`). *La identidad saldrá del token cuando exista `authenticate` (Endert).*
- [ ] Cada ruta tiene `authenticate` + `authorize` y test de 401/403. *Pendiente de Endert; los routers de dominio están vacíos y `/api/health` es pública a propósito (D-X4).*
- [x] Errores con `AppError` y `code` estable; mensaje en español.
- [ ] Sin borrado físico de datos con historia. *No aplica: todavía no hay modelos.*
- [ ] Unicidad en la BD con error 409 legible. *El 409 por duplicado (E11000) está probado; los índices únicos los crea cada dominio.*
- [ ] Operaciones concurrentes atómicas. *No aplica todavía.*
- [x] Listas paginadas con tope; `paginar` evita filas repetidas con empates. *Sin consultas en bucle: no aplica aún.*
- [x] Sin secretos ni datos personales en logs; `.env.example` al día; `npm audit --omit=dev` sin vulnerabilidades.
- [ ] Tests: felices, bordes, regla violada y 401/403; seed idempotente. *Hay 187 tests; faltan 401/403 y el seed (JUA-3).*

**Frontend**
- No aplica: este PR no toca `frontend/`.

**Git**
- [ ] Commits `tipo(ámbito): mensaje` y atómicos; PR pequeño. *Formato correcto, pero hay un commit grande (`70a7a4b`) y el PR reúne JUA-1 y JUA-2.*
- [x] Sin `.env`, `node_modules`, `dist` ni cambios masivos de fin de línea. *`.DS_Store` de la raíz sigue versionado: se limpia en JUA-4.*

## Riesgos / pendientes

- El proxy de Vite no existe todavía (JUA-4): front y back no se hablan en desarrollo.
- Falta el límite de intentos del login (se coordina con Endert); `crearApp` no fija `trust proxy`.
- Los códigos `AUT_TOKEN_VENCIDO` y `AUT_TOKEN_INVALIDO` están en `errors/codigos/auth.js`, que es del dominio de Endert; los errores de JWT se detectan por nombre y hay que comprobarlos con `jsonwebtoken` real cuando exista `authenticate`.
- Valores decididos por la IA que Juan debe confirmar: límite de body `100kb`, `req.datos`, `envolver(undefined)` = `{ data: null }`, forma de los enums.
- Hallazgo H-01 (409/422) abierto con el grupo.

## Capturas

No aplica: no hay interfaz.
