# SGA · Design System — MASTER

> Resumen operativo para construir y revisar pantallas. **La fuente de verdad es [`system-desing.md`](../../system-desing.md)** (v1.1);
> este archivo no la reemplaza: la condensa, le suma las reglas de la skill `ui-ux-pro-max` que aportan valor y define cómo se verifica.
> Si algo de aquí contradice al spec, gana el spec (y se corrige este archivo).

**Producto:** Sistema de Gestión Académica — Instituto Universitario Nueva Formación · 4 perfiles (Administrador, Coordinador, Docente, Estudiante)
**Alcance actual:** solo frontend en localhost, datos mock, sin API ni servidor (regla transversal del repo).

## Cómo usar este archivo (Master + Overrides)

1. Lee este `MASTER.md` antes de tocar UI.
2. Si existe `design-system/sga/pages/<pantalla>.md`, sus reglas **pisan** a las de aquí solo para esa pantalla.
   Un override debe justificar la excepción; no se crean para preferencias de estilo.
3. Antes de abrir el PR recorre el [checklist](#checklist-de-pr) y la [verificación](#cómo-verificar).

---

## 1. Decisiones cerradas (no re-discutir)

| Tema | Regla | Spec |
|---|---|---|
| Stack | React 18 + TypeScript + Vite + **Mantine 7** + React Router 6 + `@tabler/icons-react` | §1.5 |
| Prohibido | Tailwind, MUI, Chakra, Bootstrap; mezclar familias de iconos | §1.5 |
| Estilos | CSS Modules + variables `--mantine-*` / `--sga-*`. `style={{}}` solo para valores **dinámicos** (p. ej. posición de un bloque horario). Props de estilo de Mantine (`flex`, `miw`, `py`) en lugar de `style` | §1.5, §7.1 |
| Color | Nombres del tema (`teal`, `c="dimmed"`) o variables. **Cero hex** en JSX/CSS (el logo usa tokens) | §7.1 |
| Esquemas | Claro y oscuro desde el día uno. Colores propios con `light-dark()`; nunca leer el esquema en JS para decidir color | §7.3 |
| Iconos | Tabler, `stroke={1.5}`, 16/18/20 px. Excepción: 12/14 px con `stroke={2}` dentro de Badge, ThemeIcon pequeño, bullets de List/Timeline | §1.5 |
| Idioma | Español, tuteo, frases cortas, sin jerga técnica (`409`, `null`, `id`) | §7.1 |
| Tipografía | Inter (+ JetBrains Mono para códigos). Pesos 400/500/600/700. Mínimo `xs` = 12 px, solo metadatos | §2.2 |

## 2. Tokens que se usan todo el tiempo

**Color por significado** (§2.1.5): `navy` acción primaria/enlace/nav activa · `indigo` elemento académico · `amber` prestigio (≤ 1–2 por vista, nunca alerta) ·
`teal` éxito/aprobado/cupo OK/inscripción abierta · `orange` alerta/cupo crítico/período en curso · `crimson` error/choque/bloqueo/cerrado · `sky` informativo/planificación · `slate` inactivo/neutro.

**Texto atenuado:** `c="dimmed"` → slate-6 (claro, ≈7.6:1) / slate-4 (oscuro). Es una variable del tema (`--mantine-color-dimmed`): no se pisa por pantalla.
**Código de asignatura:** `className="sga-code sga-code-indigo"` (índigo con contraste correcto en ambos esquemas). No usar `c="indigo"` para texto: en oscuro no llega a AA.
**Amber/orange como texto:** tonos 8 (claro) / 3 (oscuro); `variant="light"` ya lo resuelve.

**Espaciado** `xs 8 · sm 12 · md 16 · lg 24 · xl 32` (+ `--sga-space-2xl` 48). Gap por defecto `md`; entre secciones `lg`. Nada de `gap={4}` en layouts.
**Radios** `md` (10px) por defecto. **Bordes** 1px `--mantine-color-default-border`.
**Superficies en oscuro:** escala `dark` del tema = pizarra (body/cards `slate-8`, página `slate-9`). No introducir grises neutros.

## 3. Layout y patrones

- **Shell único** (`AppLayout`): Header glass 64px (logo, período, toggle de esquema, menú de usuario) · Navbar por rol (colapsa a iconos en tablet, overlay en móvil) · Main centrado a 1440px · Footer.
- **Cada página:** `PageHeader` (un `h1`, descripción, **una** acción primaria `filled`; el resto `light`/`subtle`; breadcrumbs si hay ≥ 2 niveles).
- **Tablas:** ≤ 7 columnas, código + nombre primero, badges de estado, acciones al final, **paginación siempre**, `EmptyState` con acción, `Skeleton` al cargar.
- **Overlays:** Drawer para ver/editar (glass strong, footer fijo); Modal para confirmar/alertar. Nunca modal con formulario largo, ni Drawer para «¿estás seguro?», ni modal que abre modal.
- **Formularios:** `@mantine/form`, label visible, error en línea (no solo toast), `withAsterisk`, ≤ 7 campos por paso. Acciones destructivas → `ConfirmModal` con color `crimson` y verbo concreto.
- **Errores de regla académica:** nombrar la regla, dar el dato concreto y una salida; persistente en la vista (§6.4). Éxitos/avisos breves → `notify.*` (autoClose ≤ 5 s, `limit=3`).
- **Glass:** solo Header, Navbar, KPIs, Drawer/Modal (`strong`), login. Nunca en tablas, formularios, ni glass dentro de glass.
- **Un perfil, una navegación:** ítems y rutas salen de `NAV_BY_ROLE`; el acceso se controla con `RoleGuard`. No crear Header/Footer propios por pantalla.

## 4. Accesibilidad (WCAG 2.1 AA, + 2.2 donde aplica)

Del spec (§7.2): contraste ≥ 4.5:1 (3:1 texto grande/UI) · foco visible, nunca `outline: none` sin sustituto · todo lo clicable es `<button>`/`<a>` ·
`ActionIcon` con `aria-label` · color nunca es el único canal (icono/texto/cifra) · `respectReducedMotion` y `prefers-reduced-transparency` · `role="status"` en anuncios dinámicos · `<html lang="es">`.

Reglas de la skill `ui-ux-pro-max` incorporadas (spec §7.2 puntos 11–16):

| Regla (skill) | Cómo se cumple aquí |
|---|---|
| `skip-links` | «Saltar al contenido» es el primer enfocable (`AppLayout`) |
| landmarks | **Un solo `<main>`** (`AppShell.Main#contenido-principal`); no anidar `component="main"` |
| `heading-hierarchy` | h1 → h2 → h3 sin saltos; `<Title order={2} size="h3">` si solo cambia el tamaño |
| `focus-on-route-change` | Al cambiar de ruta el foco va al `<main>` (`AppLayout`) |
| `web-target-size` | Objetivos ≥ 24×24 px; enlaces de una línea con `py` |
| `aria-labels` | Controles solo-icono con nombre en español; `Pagination` lo trae del tema |
| `color-dark-mode` / `color-accessible-pairs` | Verificar cada pantalla en ambos esquemas; los tonos de texto salen de tokens por esquema |
| `focus-not-obscured` | Header/Drawer/Skip link no deben tapar el elemento enfocado |

## 5. Rendimiento

- **Una pantalla por chunk:** páginas de `features/` con `React.lazy` en `app/router.tsx`; el `RoleGuard` decide **antes** de descargar el chunk.
- `Suspense` + `PageSkeleton` en `AppLayout` (skeleton con la forma de la página, no un `Loader` gigante).
- Tabs con `keepMounted={false}`; listas largas paginadas; buscadores con `useDebouncedValue(300)`.
- Fuentes autoalojadas (`@fontsource-variable/*`), sin `<link>` a Google Fonts.

## 6. Anti-patrones (lista corta)

Varios botones `filled` en una vista · «Aceptar/OK/Guardar» sin objeto · «Error al inscribir» · tablas de 15+ columnas o scroll horizontal como norma ·
glass sobre glass · `amber` como alerta · emojis como iconos · hex literales · `Text c="indigo"` para código · `<main>` duplicado · saltar de h1 a h3 ·
`ActionIcon` sin `aria-label` · `style={{}}` con valores estáticos · pantallas con Header/Footer propios · dependencias fuera del stack (Tailwind, etc.).

## Checklist de PR

Del spec §8.4 + skill:

- [ ] Mantine y tokens del tema; sin hex ni px arbitrarios; sin dependencias fuera del stack.
- [ ] Un solo `Button filled` por vista; verbos concretos.
- [ ] Tablas: ≤ 7 columnas, paginación, skeleton, estado vacío, acciones al final.
- [ ] Detalle/edición en Drawer; confirmación/alerta en Modal.
- [ ] Formularios con `@mantine/form`, labels visibles, errores en línea.
- [ ] Errores de negocio nombran la regla y ofrecen salida; no solo toast.
- [ ] Glass solo en superficies permitidas.
- [ ] Probado en **claro y oscuro**, en móvil (< 768 px) y tablet.
- [ ] `aria-label` en controles solo-icono, foco visible, contraste AA (texto atenuado incluido).
- [ ] Un `<main>`, títulos sin saltos, skip link operativo, foco al `<main>` tras navegar.
- [ ] Pantalla nueva cargada con `lazy` + skeleton.
- [ ] Copy en español, tuteo, sin jerga.
- [ ] Datos mock, sin API real ni servidor.

## Cómo verificar

```bash
cd frontend
npm run typecheck && npm test && npm run build && npx oxlint
```

Manual (claro **y** oscuro, con cada perfil desde «Probar como…»): navegar solo con teclado (Tab → skip link; tras cambiar de ruta el foco está en el contenido),
`Ctrl +` hasta 200 %, ancho 375 px sin scroll horizontal, y revisar contraste del texto secundario y de los códigos en índigo.
