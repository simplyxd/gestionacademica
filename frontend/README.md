# Frontend SGA — Mock UI (React)

Mock local del **Sistema Web de Gestión Académica** para el rol estudiante:
consulta de oferta, inscripción con las 7 reglas y horario semanal (RF9–RF10 / CU7–CU8).

Diseño institucional: azul marino, índigo académico, acento ámbar y superficies glass.
Sin backend: los datos viven en `src/mocks/sga.ts`.

## Requisitos

- Node.js 20+ (recomendado 22)
- npm 10+

## Instalación y ejecución

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Otros scripts

| Comando | Descripción |
|---|---|
| `npm run build` | Compila TypeScript y genera el build de producción |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Ejecuta Oxlint |

## Estructura de la interfaz

Cumple la rúbrica de frontend React:

| Zona | Dónde |
|---|---|
| Encabezado | Logo SGA, período, escenario de prueba, tema claro/oscuro, usuario |
| Navegación | Sidebar (Oferta, Inscripción, Mi horario) — colapsable / menú móvil |
| Sección principal | Páginas de feature con `PageHeader` + contenido |
| Pie de página | `SiteFooter` con marca, enlaces y créditos |

## Componentes y reutilización

- `BrandLogo`, `PageHeader`, `SiteFooter` — layout compartido con **props**
- `EmptyState`, `ConfirmModal`, `DetailDrawer`, `CupoIndicator` — UI reutilizable
- Features: `oferta/`, `inscripcion/`, `horario/` con estado (`useState`) y eventos

## Interactividad de demo

En el encabezado, el selector **Escenario de prueba** cambia las reglas de inscripción:

- inscripción normal
- sin matrícula
- ventana futura / cerrada

Así se demuestra rechazo con mensaje de la regla que falló.

## Stack

- React 18 + TypeScript + Vite
- Mantine 7 + CSS Modules (tema SGA en `src/theme/`)
- React Router 6
- Tabler Icons

## Nota

Este directorio es solo el frontend mock. El backend Express y MongoDB se integran en épicas posteriores del monorepo.
