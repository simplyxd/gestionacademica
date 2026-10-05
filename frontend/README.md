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
| Coordinador académico | `/matricula` (RF6 / CU5) |
| Estudiante | `/oferta`, `/inscripcion`, `/horario` (RF9–RF10 / CU7–CU8) |

El resto de rutas muestran «Próximamente».

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
- `src/features/` — `auth`, `matricula`, `oferta`, `inscripcion`, `horario`
- `src/theme/` — tema Mantine + tokens (glass, colores, modo claro/oscuro)
- `src/mock/` y `src/mocks/` — datos de ejemplo (⚠️ hoy hay dos modelos de mock; ver nota de integración)
