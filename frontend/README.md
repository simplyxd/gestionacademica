# SGA · Frontend (prototipo)

Las pantallas siguen con datos mock (al recargar vuelve el seed). El cliente HTTP para hablar con el backend ya está listo en `src/lib/` y cada dominio lo irá adoptando (ver «Hablar con el backend»).
Stack y reglas visuales: [`../system-desing.md`](../system-desing.md) — React 18 + TypeScript + Vite + Mantine 7 + React Router 6.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test           # reglas de matrícula (vitest)
npm run build
```

## Hablar con el backend

El backend (`../backend`) expone la API bajo `/api`. **En desarrollo no hay que configurar nada:** Vite reenvía `/api` a
`http://localhost:3000` (si el backend corre en otro puerto: `API_PROXY_TARGET=http://localhost:4000 npm run dev`).
Levanta antes el backend: `cd ../backend && npm run dev`.

| Archivo | Para qué |
|---|---|
| `src/lib/api.ts` | **El único lugar que hace `fetch`:** `api.get / post / patch / delete`. Devuelve el JSON del contrato (`{ data }` o `{ data, meta }`) y lanza `ApiError { status, code, regla, message, details }`. Un 5xx da un mensaje genérico; sin conexión es un `ApiError` de status 0 |
| `src/lib/session.ts` | El token de sesión (`getToken / setToken / clear`), en `sessionStorage`. Provisional |
| `src/lib/usePaginacionServidor.ts` | Tablas paginadas por el servidor (`?page&limit&sort` y filtros). Cancela la petición atrasada. Para listas locales pequeñas sigue existiendo `usePaginacion` |
| `src/app/EscucharSesionInvalida.tsx` | Un **401 con token** borra la sesión y lleva al login sin recargar la página |

```ts
import { api, type RespuestaLista } from '@/lib/api';

const { data, meta } = await api.get<RespuestaLista<Sede>>('/sedes', { query: { page: 1, limit: 20 } });
```

- Cómo mostrar un `ApiError`: `system-desing.md` §6 (error de regla persistente y con salida; formulario en línea; 5xx genérico).
- Códigos HTTP del contrato: `400` forma inválida · `401` sin sesión · `403` sin permiso · `404` no existe · `409` duplicado o estado · `422` regla académica violada. **Ojo:** `system-desing.md` §6.1 los tiene al revés (409 para reglas de inscripción y 422 para formularios); está pendiente de acordar con el grupo y de actualizar. No mapees por número, usa `error.code`.
- `VITE_API_URL` solo se define si el frontend se despliega separado del backend (ver `.env.example`).

## Perfiles

El menú de usuario (arriba a la derecha) permite «Probar como…» Coordinador, Estudiante, Docente o Administrador.
La navegación (`src/app/navigation.ts`) y el control de acceso (`RoleGuard`) dependen del perfil.

| Perfil | Pantallas disponibles |
|---|---|
| Administrador | `/admin` (panel), `/admin/usuarios` (ABM, RF1), `/admin/parametros`, `/admin/permisos` (RF1), `/reportes` (RF12) |
| Coordinador académico | `/matricula` (RF6), `/periodos` (RF4), `/estructura/sedes` (RF2), `/personas` (RF5), `/coordinador/oferta` (RF7–RF8), `/reportes` (RF12) |
| Docente | `/docente/secciones` (con nómina), `/docente/horario` (RF11) |
| Estudiante | `/oferta`, `/inscripcion`, `/horario` (RF9–RF10 / CU7–CU8) |

El resto de rutas muestran «Próximamente».

### Cómo se conectan las pantallas

La **Oferta de secciones** del coordinador es la fuente única de secciones (`features/oferta/OfertaContext.tsx`):
lo que se programa ahí lo ven el Estudiante (en el período «en curso») y el Docente asignado. Los **Períodos** y las
**Sedes** que crea el coordinador alimentan los selectores de Matrícula y de la oferta. En
**Docentes y estudiantes** la baja lógica importa: solo los *activos* se ofrecen al asignar docentes en la oferta y al
matricular (la ficha del docente calcula su carga académica desde la oferta). Todo vive en memoria: al
recargar vuelve el seed (excepto los **Parámetros institucionales**, que se guardan en `localStorage`: siglas y nombre de la
institución se leen en el encabezado y el pie).

### Datos para probar

`src/mock/datos-de-prueba.ts` trae casos listos (datos de formulario y recorridos entre perfiles) con el resultado
esperado: choque de docente o de sala, cupo menor a los inscritos, período duplicado o con dos «en curso», sede
repetida, etc. `npm test` comprueba que cada caso se comporte como dice.

### Matrícula (`/matricula`)

- Alta en Drawer: estudiante + carrera + plan de esa carrera + período.
- Una sola matrícula `vigente` por estudiante y período. Estados `vigente | suspendida | egresada | retirada`;
  `egresada` y `retirada` son finales; `suspendida` solo puede pasar a `retirada`.
- Reglas en `src/features/matricula/rules.ts` (funciones puras, con tests).

### Oferta · Inscripción · Horario (Estudiante)

Consulta de oferta, inscripción con las 7 reglas y horario semanal. Para el Estudiante, el encabezado muestra el
selector **Escenario de prueba** (inscripción normal, sin matrícula, ventana futura / cerrada) para ver el rechazo
con el mensaje de la regla que falló.

## Estructura

- `src/app/` — router, layout (header, navegación por rol, footer), navegación
- `src/components/` — `BrandLogo`, `PageHeader`, `SiteFooter`, `EmptyState`, `ConfirmModal`, `DetailDrawer`
- `src/features/` — `auth`, `personas`, `matricula`, `periodos`, `estructura` (sedes), `oferta`, `inscripcion`, `horario`, `docente`, `permisos`
- `src/theme/` — tema Mantine + tokens (glass, colores, modo claro/oscuro)
- `src/lib/` — cliente HTTP (`api.ts`), sesión (`session.ts`), paginación (`usePaginacion`, `usePaginacionServidor`), `notify`, utilidades
- `src/mock/` y `src/mocks/` — datos de ejemplo (⚠️ siguen siendo dos carpetas: `mocks/sga.ts` es el catálogo del Estudiante y alimenta el seed de `mock/oferta.ts`)
