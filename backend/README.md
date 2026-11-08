# Backend — SGA

API REST del Sistema de Gestión Académica: Node.js + Express + MongoDB (Mongoose). Código en ESM.

## Requisitos

- **Node 22 (22.12 o superior).** El archivo `.nvmrc` de la raíz fija la versión.
- **MongoDB** para ejecutar la API. Los tests **no** la necesitan: levantan una base temporal en memoria.

## Cómo arrancar

```bash
cd backend
npm install
cp .env.example .env     # y completa MONGO_URI y JWT_SECRET (ver abajo)
npm run dev              # recarga sola al guardar
```

Prueba que responde: `GET http://localhost:3000/api/health` → `{ "data": { "api": "ok", "db": "conectada" } }`.

El arranque **falla con un mensaje claro** si falta una variable, en lugar de arrancar a medias.

### Variables de entorno (`.env`, nunca se sube al repositorio)

| Variable | Obligatoria | Notas |
|---|---|---|
| `MONGO_URI` | Sí | `mongodb://...` (local) o `mongodb+srv://...` (Atlas) |
| `JWT_SECRET` | Sí | Mínimo **32 caracteres**. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT` | No | Por defecto 3000 |
| `CORS_ORIGIN` | Solo en producción | Orígenes separados por coma. Nunca `*`. En desarrollo el proxy de Vite evita CORS |
| `NODE_ENV` | No | `development` (por defecto) o `production` |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca con recarga automática |
| `npm start` | Arranca sin recarga |
| `npm test` | Ejecuta los tests (Vitest + Supertest). **La primera vez descarga `mongod` (~70 MB)**; después funciona sin internet |
| `npm run lint` | Revisa el código con `oxlint` |

## Cómo escribir un test de API en 5 minutos

```js
// tests/sedes/sedes.test.js
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { crearAppDePrueba } from '../helpers/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

const app = crearAppDePrueba();  // la app real, con un secreto de prueba para los tokens

beforeAll(conectarBaseDePrueba); // base temporal en memoria, nueva para este archivo
afterEach(limpiarBase);          // deja las colecciones vacías entre un test y otro
afterAll(desconectarBaseDePrueba);

describe('GET /api/sedes', () => {
  it('responde 200', async () => {
    const res = await request(app).get('/api/sedes');
    expect(res.status).toBe(200);
  });
});
```

- Cada test **crea los datos que necesita**: no dependas del seed ni del orden de los tests.
- Para comprobar un error, compara el cuerpo completo: `expect(res.body).toEqual({ code, regla, message })`.
- `asUser(rol)` (el token de prueba para los tests de 401/403) llega cuando se entregue `authenticate`.

## Estructura de `src/`

| Carpeta | Para qué |
|---|---|
| `routes/` | Cablea URL → controlador. **Un archivo por dominio**, ya montado en `/api/<dominio>`: edita solo el tuyo |
| `controllers/` | Solo HTTP: lee la petición, llama al servicio, responde. Cero reglas de negocio |
| `services/` | Las reglas de negocio |
| `models/` | Esquemas de Mongoose |
| `middlewares/` | `validate`, `errorHandler`, `notFound` |
| `errors/` | `AppError` y los códigos de error (`errors/codigos/<dominio>.js`) |
| `constants/enums.js` | Los enums del contrato. Nadie crea copias propias |
| `utils/` | `paginar`, `envolver`/`envolverLista`, plugin `toJSON` |
| `config/` | Lectura y validación del entorno, plugin global de Mongoose |

`app.js` construye la aplicación (`crearApp`) y **no** escucha en ningún puerto; `server.js` valida el entorno, conecta a Mongo y escucha.

## Cómo agregar un endpoint (con tests primero)

1. Escribe el test en `tests/<dominio>/` y comprueba que falla por la razón correcta.
2. Declara tus códigos de error en `src/errors/codigos/<dominio>.js` (prefijo del contrato, por ejemplo `SED_`). Nunca strings sueltos.
3. Implementa por capas:

```js
// routes/sedes.routes.js
router.post('/', validate([body('codigo').trim().notEmpty().withMessage('es obligatorio')]), crear);

// controllers/sedes.controller.js  (solo HTTP)
export async function crear(req, res) {
  const sede = await crearSede(req.datos.body); // solo llegan los campos con regla
  res.status(201).json(envolver(sede));         // { data: ... }
}

// services/sedes.service.js  (las reglas)
if (existe) throw new AppError(409, SED.CODIGO_DUPLICADO, `Ya existe una sede con el código ${codigo}.`);
```

- **Listas:** `paginar(Modelo, filtro, req.query, { camposOrdenables: [...] })` devuelve `{ data, meta }`. El filtro lo arma el servicio, nunca la query string.
- **Datos del cliente:** usa `req.datos.body`, `req.datos.params` y `req.datos.query` (lo validado). La identidad y el rol salen del token, nunca del body.
- **Unicidad:** garantízala con un índice único en el esquema. Si dos personas crean lo mismo a la vez, la base rechaza la segunda y el `errorHandler` responde 409.
- **No borres datos con historia:** cambia su `estado`.

## Contrato (resumen)

- **Éxito:** `{ "data": ... }`; listas `{ "data": [...], "meta": { "page", "limit", "total" } }` con `?page=1&limit=20&sort=-apellido` (`limit` máximo 100).
- **Error:** `{ "code": "INS_SIN_CUPO", "regla": "Cupo disponible" | null, "message": "...", "details": {...} }`.
- **Códigos HTTP:** `400` forma inválida · `401` sin sesión · `403` sin permiso · `404` no existe · `409` duplicado o estado · `422` regla académica violada.
- **Ids** viajan como `id`; `_id` y `__v` nunca salen. **Fechas** ISO 8601.
