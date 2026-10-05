# SGA · Frontend (prototipo)

Solo frontend, en `localhost`, con datos mock (sin API, base de datos ni persistencia: al recargar vuelve el seed).
Stack y reglas visuales: [`../system-desing.md`](../system-desing.md) — React 18 + TypeScript + Vite + Mantine 7 + React Router 6.

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test           # reglas de matrícula (vitest)
npm run build
```

## Perfiles

El menú de usuario (arriba a la derecha) permite «Probar como…» Coordinador, Estudiante, Docente o Administrador.
La navegación (`src/app/navigation.ts`) y el control de acceso (`RoleGuard`) dependen del perfil.

| Perfil | Pantallas disponibles |
|---|---|
| Administrador | `/admin` (panel), `/admin/parametros`, `/admin/permisos` (RF1), `/reportes` (RF12) |
| Coordinador académico | `/matricula` (RF6), `/periodos` (RF3), `/estructura/sedes` (RF2), `/coordinador/oferta` (RF9), `/reportes` (RF12) |
| Docente | `/docente/secciones` (con nómina), `/docente/horario` |
| Estudiante | `/oferta`, `/inscripcion`, `/horario` (RF9–RF10 / CU7–CU8) |

El resto de rutas muestran «Próximamente».

### Cómo se conectan las pantallas

La **Oferta de secciones** del coordinador es la fuente única de secciones (`features/oferta/OfertaContext.tsx`):
lo que se programa ahí lo ven el Estudiante (en el período «en curso») y el Docente asignado. Los **Períodos** y las
**Sedes** que crea el coordinador alimentan los selectores de Matrícula y de la oferta. Todo vive en memoria: al
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
- `src/features/` — `auth`, `matricula`, `periodos`, `estructura` (sedes), `oferta`, `inscripcion`, `horario`, `docente`, `permisos`
- `src/theme/` — tema Mantine + tokens (glass, colores, modo claro/oscuro)
- `src/mock/` y `src/mocks/` — datos de ejemplo (⚠️ siguen siendo dos carpetas: `mocks/sga.ts` es el catálogo del Estudiante y alimenta el seed de `mock/oferta.ts`)
