# Sistema de Diseño SGA — Instituto Universitario Nueva Formación

> **Versión:** 1.0 · **Estado:** vigente · **Owner:** equipo SGA (6 devs) · **Actualizado:** 2026-09-06
> **Stack UI:** React 18 + TypeScript + Mantine UI v7 (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`) + `@tabler/icons-react`
> **Alcance:** todo el frontend del SGA (`/frontend`). Este documento es la fuente de verdad visual, técnica y de UX. Si algo no está aquí y hace falta, se propone en PR contra este archivo antes de implementarlo dos veces de forma distinta.

---

## Índice

1. [Introducción y propósito](#1-introducción-y-propósito)
2. [Tokens de diseño y variables](#2-tokens-de-diseño-y-variables)
3. [Configuración de Mantine v7](#3-configuración-de-mantine-v7)
4. [Layout y estructura global](#4-layout-y-estructura-global)
5. [Catálogo de componentes y patrones de interfaz](#5-catálogo-de-componentes-y-patrones-de-interfaz)
6. [Manejo de errores y notificaciones de negocio](#6-manejo-de-errores-y-notificaciones-de-negocio)
7. [Guía de estilo y buenas prácticas](#7-guía-de-estilo-y-buenas-prácticas-dos-and-donts)
8. [Anexos](#8-anexos)

---

## 1. Introducción y propósito

### 1.1 Qué es este documento

El SGA reemplaza hojas de cálculo, correos y archivos sueltos con una sola fuente de verdad para el ciclo semestral del Instituto Universitario Nueva Formación: ~4.500 estudiantes, 3 sedes, modalidades presencial / semipresencial / online y cuatro perfiles de usuario (Administrador, Coordinador Académico, Docente, Estudiante).

Seis personas construyen el frontend en paralelo durante cinco sprints. Sin un sistema de diseño compartido, el resultado típico es un producto con seis estéticas distintas, tablas de 25 columnas y mensajes de error del tipo «Error al inscribir». Este documento existe para que eso no pase: define tokens, configuración, componentes, patrones y copy de forma que cualquier pantalla nueva se vea, se comporte y hable como el resto del sistema.

### 1.2 A quién va dirigido

- **Desarrolladores frontend:** para copiar el tema, usar los componentes correctos y resolver dudas de maquetación sin preguntar.
- **Desarrolladores backend:** para conocer el contrato de errores de negocio (§6) que la UI espera.
- **Quien haga QA / revise PRs:** para usar el checklist de §7 y §8.4 como criterio objetivo.

### 1.3 El problema que evitamos: el ERP académico agobiante

El software académico tradicional comparte una serie de patologías: fondos grises planos, tablas que ocupan la pantalla completa con decenas de columnas de 11px, formularios de 40 campos en una sola vista, errores genéricos y cero jerarquía visual. El usuario no sabe dónde mirar ni qué hacer cuando algo falla.

El SGA adopta la postura contraria. Cada pantalla debe responder tres preguntas en menos de tres segundos: **¿dónde estoy?**, **¿qué puedo hacer aquí?**, **¿qué pasó / qué sigue?**

### 1.4 Principios de diseño

| Principio | Qué significa | Cómo se materializa |
|---|---|---|
| **Claridad Académica** | El dominio (períodos, secciones, cupos, prerrequisitos) es complejo; la interfaz no puede añadir complejidad. Cada dato tiene un nombre del glosario, un lugar y un estado visible. | Terminología idéntica al [glosario](context/general/glossary.md). Badges de estado con color semántico. Códigos de asignatura en monoespaciada. Un solo período «en curso» siempre visible en el header. |
| **No-Agobio** | Menos información por pantalla, mejor organizada. La densidad se controla, no se sufre. | Espaciado `md`/`lg`. Máximo 7 columnas visibles en una tabla; el resto va al Drawer de detalle. Paginación obligatoria. Formularios largos en pasos o acordeones. Cards para agrupar, Tabs para segmentar. |
| **Jerarquía Intuitiva** | El ojo debe ir primero a lo importante. Un título, una acción primaria, un estado destacado por vista. | Un único `Button` `filled` por vista (acción primaria); el resto `light`/`subtle`. Tipografía con escala clara. Color de acento (`amber`) reservado para lo que realmente merece atención. |
| **Elegancia Glassmorphism** | Superficies translúcidas con desenfoque sutil que dan profundidad y modernidad sin sacrificar legibilidad. Es un acento, no un tapiz. | Efecto *Liquid Glass* (§2.6) en Header, Navbar, cards de resumen y paneles flotantes. Nunca en tablas ni sobre texto denso. Siempre con fallback. |

### 1.5 Decisiones de partida (no re-discutir)

- **Mantine v7** como única librería de componentes. No se mezcla con MUI, Chakra, Bootstrap ni Tailwind.
- **CSS Modules** + variables de Mantine para estilos propios. Nada de `style={{}}` inline salvo valores dinámicos calculados (p. ej. posición de un bloque horario).
- **Modo claro y oscuro** soportados desde el día uno vía `MantineProvider` (`defaultColorScheme="auto"`). Todo color propio se define en ambos esquemas.
- **Idioma de la UI: español**, tono cercano y directo (tuteo), sin jerga técnica hacia el usuario final.
- **Iconografía:** exclusivamente `@tabler/icons-react`, `stroke={1.5}`, tamaños 16 / 18 / 20 px.

---

## 2. Tokens de diseño y variables

Los tokens son la única fuente de valores visuales. Se definen una vez en `src/theme/theme.ts` (Mantine) y `src/theme/tokens.css` (variables CSS complementarias) y se consumen siempre por nombre, nunca por valor literal.

### 2.1 Paleta cromática

Todas las escalas tienen 10 tonos (índice 0 = más claro, 9 = más oscuro), como exige `MantineColorsTuple`. Los tonos 6 (modo claro) y 5 (modo oscuro) son los `primaryShade` para colores de marca; los semánticos usan el mismo criterio.

#### 2.1.1 Colores primarios

**`navy` — Azul Marino Institucional.** Color de marca principal. Botones primarios, enlaces, estados activos de navegación, focos.

| Índice | Hex | Uso principal |
|---|---|---|
| 0 | `#EEF2FB` | Fondo de filas seleccionadas, hover muy suave |
| 1 | `#D7E0F4` | Fondo de badges `light` en claro |
| 2 | `#B3C2E6` | Bordes de foco suaves, separadores de marca |
| 3 | `#8AA0D6` | Iconografía decorativa en claro |
| 4 | `#6480C4` | Texto de marca en modo oscuro (enlaces) |
| 5 | `#4462AF` | **Primary shade en modo oscuro** (botones filled) |
| 6 | `#2E4A95` | **Primary shade en modo claro** (botones filled, enlaces) |
| 7 | `#1F3777` | Hover de botones primarios en claro |
| 8 | `#14285A` | Títulos de marca, Header sólido si se desactiva glass |
| 9 | `#0B1B3F` | Fondo de Navbar en tema oscuro «institucional» (opcional) |

**`indigo` — Índigo Académico.** Color de marca secundario. Bloques de horario normales, gradientes junto a `navy`, tabs activos, elementos «académicos» (planes, asignaturas). Sobrescribe el `indigo` por defecto de Mantine.

| Índice | Hex |
|---|---|
| 0 | `#EEF0FC` |
| 1 | `#DCE0F8` |
| 2 | `#BCC3F0` |
| 3 | `#98A3E6` |
| 4 | `#7583DA` |
| 5 | `#5766CC` |
| 6 | `#4351B8` |
| 7 | `#35409A` |
| 8 | `#293178` |
| 9 | `#1E2456` |

#### 2.1.2 Color secundario / acento

**`amber` — Ámbar cálido / Dorado académico.** Se usa con moderación: badges de prestigio («Plan vigente», «Sección destacada», «Coordinador»), estados que requieren atención sin ser error, elementos de énfasis en el dashboard. **Nunca como texto sobre fondo claro con tonos ≤ 7** (ver §2.1.6).

| Índice | Hex |
|---|---|
| 0 | `#FFF8E6` |
| 1 | `#FFEDC2` |
| 2 | `#FFDE94` |
| 3 | `#FFCC61` |
| 4 | `#F7B93A` |
| 5 | `#E6A420` |
| 6 | `#C98A12` |
| 7 | `#A36E0C` |
| 8 | `#7C5308` |
| 9 | `#563A05` |

#### 2.1.3 Neutros

**`slate` — Pizarra fría.** Fondos de página, bordes, texto, superficies. Toda la interfaz «descansa» sobre esta escala.

| Índice | Hex | Uso en modo claro | Uso en modo oscuro |
|---|---|---|---|
| 0 | `#F8FAFC` | Fondo de página (`--sga-page-bg`) | — |
| 1 | `#F1F5F9` | Fondo de secciones alternas, thead de tablas | Texto principal |
| 2 | `#E2E8F0` | Bordes por defecto (`--mantine-color-default-border`) | Texto secundario fuerte |
| 3 | `#CBD5E1` | Bordes de inputs deshabilitados, divisores fuertes | Iconos secundarios |
| 4 | `#94A3B8` | Placeholders, iconos inactivos | Texto atenuado (`dimmed`) |
| 5 | `#64748B` | Texto de apoyo con contraste mínimo AA | Placeholders |
| 6 | `#475569` | Texto atenuado (`dimmed`), etiquetas | Bordes fuertes |
| 7 | `#334155` | Texto secundario | Bordes por defecto |
| 8 | `#1E293B` | Títulos secundarios | Superficie de cards sólidas |
| 9 | `#0F172A` | Texto principal (`theme.black`) | Fondo de página |

#### 2.1.4 Colores semánticos

**`teal` — Éxito / Aprobado / Cupo disponible.** Verde esmeralda-teal. Sobrescribe el `teal` de Mantine.

| Índice | Hex |
|---|---|
| 0 | `#ECFDF7` |
| 1 | `#CDF7EA` |
| 2 | `#9EEFD7` |
| 3 | `#66E0BF` |
| 4 | `#34C9A4` |
| 5 | `#12AC89` |
| 6 | `#0B7F66` |
| 7 | `#0A6753` |
| 8 | `#0B5243` |
| 9 | `#083A30` |

**`crimson` — Error / Choque de horario / Bloqueo.** Rojo carmesí. Se registra con su propio nombre para no confundirlo con el `red` genérico.

| Índice | Hex |
|---|---|
| 0 | `#FEF1F2` |
| 1 | `#FDDDE0` |
| 2 | `#FBBFC5` |
| 3 | `#F7919C` |
| 4 | `#EF5F6F` |
| 5 | `#E23A4E` |
| 6 | `#C4283B` |
| 7 | `#A41F31` |
| 8 | `#861C2C` |
| 9 | `#6E1626` |

**`orange` — Alerta / Cupos críticos.** Naranja cálido, deliberadamente distinto del `amber` de acento para que «alerta» y «prestigio» no se confundan. Sobrescribe el `orange` de Mantine.

| Índice | Hex |
|---|---|
| 0 | `#FFF5EB` |
| 1 | `#FFE6CC` |
| 2 | `#FFCF99` |
| 3 | `#FFB05C` |
| 4 | `#FF9129` |
| 5 | `#F5760F` |
| 6 | `#D95E07` |
| 7 | `#B4480A` |
| 8 | `#90390D` |
| 9 | `#6E2D0C` |

**`sky` — Informativo.** Azul cielo / cyan. Mensajes neutros, tips, estados «pendiente / programado».

| Índice | Hex |
|---|---|
| 0 | `#EFF8FF` |
| 1 | `#D9EEFF` |
| 2 | `#B6E0FF` |
| 3 | `#85CCFA` |
| 4 | `#4DB3F2` |
| 5 | `#2496E0` |
| 6 | `#0E6FB3` |
| 7 | `#0F5A91` |
| 8 | `#124B76` |
| 9 | `#10395A` |

#### 2.1.5 Mapa semántico (qué color para qué concepto)

| Concepto del dominio | Color Mantine | Componentes típicos |
|---|---|---|
| Acción primaria, enlace, navegación activa | `navy` | `Button filled`, `Anchor`, `NavLink active` |
| Elemento académico neutro (asignatura, plan, bloque de horario propio) | `indigo` | `Badge`, `BloqueHorario`, `Tabs` |
| Prestigio, destacado, atención positiva | `amber` | `Badge` «Plan vigente», `ThemeIcon` en KPIs |
| Aprobado, cupo disponible, operación exitosa, período «inscripción abierta» | `teal` | `Badge`, `Progress`, `Notification`, `Alert` |
| Cupos críticos, advertencia, período «en curso» (no se puede inscribir pero no es error) | `orange` | `Badge`, `Progress`, `Alert` |
| Error de negocio, choque de horario, sin cupo, bloqueo de regla, período «cerrado» | `crimson` | `Alert`, `Notification`, borde de `BloqueHorario` en conflicto |
| Información, ventana futura, estado «planificación» | `sky` | `Alert`, `Badge`, `Tooltip` informativos |
| Inactivo, fuera de plan, anulado, deshabilitado | `slate` | `Badge variant="outline"`, texto `dimmed` |

#### 2.1.6 Contraste y accesibilidad de la paleta

Ratios aproximados (WCAG 2.1) calculados sobre los hex definidos. **AA** = ≥ 4.5:1 texto normal / ≥ 3:1 texto grande y elementos UI; **AAA** = ≥ 7:1.

| Combinación | Ratio | Nivel | Regla derivada |
|---|---|---|---|
| `navy-6` sobre blanco | ≈ 8.3:1 | AAA | Texto y botones primarios OK en claro |
| `indigo-6` sobre blanco | ≈ 6.8:1 | AA | OK |
| `teal-6` sobre blanco / `teal-0` | ≈ 4.9:1 / 4.8:1 | AA | Texto de éxito usa tono 6 |
| `crimson-6` sobre blanco / `crimson-0` | ≈ 5.6:1 / 5.2:1 | AA | Texto de error usa tono 6 |
| `sky-6` sobre blanco | ≈ 5.3:1 | AA | OK |
| `orange-6` sobre blanco | ≈ 3.8:1 | ✗ texto | **Texto naranja usa `orange-8`** (`≈ 7:1`) |
| `amber-6` sobre blanco | ≈ 2.9:1 | ✗ texto | **Texto ámbar usa `amber-8`** (`≈ 6.8:1`) |
| Blanco sobre `amber-5` (badge filled) | ≈ 2.2:1 | ✗ | `autoContrast` pone texto oscuro (`slate-9`, ≈ 8:1) |
| `slate-6` sobre blanco (texto atenuado) | ≈ 7.6:1 | AAA | `dimmed` en claro |
| `slate-4` sobre `slate-9` (texto atenuado oscuro) | ≈ 7:1 | AAA | `dimmed` en oscuro |
| Blanco sobre `navy-5` (botón en oscuro) | ≈ 5.8:1 | AA | Por eso `primaryShade.dark = 5` |

La configuración de §3.1 aplica estas reglas de forma automática mediante `autoContrast`, `primaryShade` y un `variantColorResolver` que corrige la variante `light` de `amber` y `orange`.

### 2.2 Tipografía

| Token | Valor | Notas |
|---|---|---|
| `fontFamily` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | Inter vía `@fontsource-variable/inter` o `<link>` a Google Fonts. Fallback del sistema garantiza que nunca haya FOIT prolongado. |
| `fontFamilyMonospace` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Códigos de asignatura (`INF-201`), RUT/ID, horarios tabulares. |
| `headings.fontFamily` | Igual a `fontFamily` | Una sola familia; la jerarquía se logra con peso y tamaño, no cambiando de fuente. |
| `headings.fontWeight` | `600` | Títulos h1/h2 suben a 700 (ver tabla). |

#### Escala de tamaños (`fontSizes`)

| Token | rem | px | Uso |
|---|---|---|---|
| `xs` | 0.75 | 12 | Metadatos, `Badge`, texto de ayuda en tablas. Nunca para contenido principal. |
| `sm` | 0.875 | 14 | **Celdas de tabla, labels de formulario, texto secundario.** |
| `md` | 1 | 16 | **Cuerpo por defecto.** Texto de formularios, descripciones, alerts. |
| `lg` | 1.125 | 18 | Lead de secciones, valores de KPIs pequeños. |
| `xl` | 1.25 | 20 | Destacados, valor de KPI en cards. |

#### Encabezados (`headings.sizes`)

| Nivel | Tamaño | Line-height | Peso | Uso |
|---|---|---|---|---|
| `h1` | 30px (1.875rem) | 1.25 | 700 | Título de página. **Uno por vista.** |
| `h2` | 24px (1.5rem) | 1.3 | 700 | Título de sección / card grande |
| `h3` | 20px (1.25rem) | 1.35 | 600 | Título de card, cabecera de Drawer |
| `h4` | 18px (1.125rem) | 1.4 | 600 | Subsección dentro de una card |
| `h5` | 16px (1rem) | 1.45 | 600 | Título de grupo en formularios (`Fieldset legend`) |
| `h6` | 14px (0.875rem) | 1.5 | 600 | Eyebrow / etiquetas de KPI (con `tt="uppercase"` y `c="dimmed"`) |

#### Line-heights (`lineHeights`)

| Token | Valor |
|---|---|
| `xs` | 1.4 |
| `sm` | 1.45 |
| `md` | 1.55 |
| `lg` | 1.6 |
| `xl` | 1.65 |

#### Pesos permitidos

`400` (regular), `500` (medium: labels, celdas destacadas), `600` (semibold: títulos, botones), `700` (bold: h1/h2, cifras de KPI). No se usan 300 ni 800+.

### 2.3 Espaciado y dimensiones

Escala «intermedia»: más aire que la de Mantine por defecto en `xs` y `lg`, sin disparar la altura de las vistas.

#### `spacing`

| Token | rem | px | Uso canónico |
|---|---|---|---|
| `xs` | 0.5 | 8 | Gap entre icono y texto, entre badges, padding interno de chips |
| `sm` | 0.75 | 12 | Gap entre campos relacionados, padding vertical de celdas |
| `md` | 1 | 16 | **Gap por defecto en `Stack`/`Group`.** Padding de cards compactas |
| `lg` | 1.5 | 24 | **Padding de cards estándar. Separación entre secciones de una página** |
| `xl` | 2 | 32 | Separación entre bloques mayores, padding de `AppShell.Main` en desktop |
| `--sga-space-2xl` (CSS) | 3 | 48 | Margen inferior de página, separación hero → contenido |

#### Dimensiones estándar (variables CSS en `tokens.css`)

| Variable | Valor | Descripción |
|---|---|---|
| `--sga-header-height` | 64px | Altura del Header |
| `--sga-navbar-width` | 264px | Navbar expandida |
| `--sga-navbar-width-collapsed` | 76px | Navbar en modo iconos (tablet) |
| `--sga-content-max-width` | 1440px | Ancho máximo del contenido en `AppShell.Main` |
| `--sga-table-row-height` | 52px | Altura mínima de fila de tabla (con `verticalSpacing="sm"`) |
| `--sga-control-height` | 42px | Altura de inputs/botones `size="md"` (por defecto en el tema) |
| `--sga-drawer-width-md` | 480px | Drawer de detalle |
| `--sga-drawer-width-lg` | 640px | Drawer de edición con formulario |
| `--sga-schedule-hour-height` | 56px | Altura de una hora en el horario semanal |
| `--sga-schedule-start` / `--sga-schedule-end` | 8 / 22 | Rango horario de la grilla (08:00–22:00) |

### 2.4 Radios y bordes

| Token | Valor | Uso |
|---|---|---|
| `radius.xs` | 4px | Checkboxes, indicadores mínimos |
| `radius.sm` | 6px | Badges cuadrados, chips, `Code` |
| **`radius.md`** | **10px** | **Por defecto (`defaultRadius`).** Botones, inputs, cards, modales, drawers |
| `radius.lg` | 14px | Cards hero, paneles glass grandes |
| `radius.xl` | 20px | Contenedores decorativos, avatares grupales |

Bordes: `1px solid var(--mantine-color-default-border)` (→ `slate-2` en claro, `slate-7` en oscuro). Nunca bordes de 2px salvo estado de foco o conflicto de horario.

### 2.5 Sombras

Sombras suaves y difusas, con muy baja opacidad. En modo oscuro las sombras se refuerzan levemente porque el contraste con el fondo es menor.

| Token | Valor (claro) | Uso |
|---|---|---|
| `xs` | `0 1px 2px rgba(15, 23, 42, 0.04)` | Inputs con foco suave |
| `sm` | `0 2px 8px rgba(15, 23, 42, 0.06)` | Cards sólidas en reposo |
| `md` | `0 8px 24px rgba(15, 23, 42, 0.08)` | Cards en hover, Popovers, Menus |
| `lg` | `0 16px 40px rgba(15, 23, 42, 0.10)` | Modales, Drawers |
| `xl` | `0 24px 56px rgba(15, 23, 42, 0.14)` | Elementos hero flotantes (raro) |
| `--sga-glass-shadow` | `0 8px 32px 0 rgba(0, 0, 0, 0.07)` | **Sombra de superficies glass** |

### 2.6 Tokens de Glassmorphism («Liquid Glass»)

El efecto se compone de cuatro capas: fondo translúcido, desenfoque con saturación, borde tipo cristal y sombra difusa. Todos los valores viven en variables CSS resueltas por esquema de color.

| Variable | Modo claro | Modo oscuro |
|---|---|---|
| `--sga-glass-bg` | `rgba(255, 255, 255, 0.75)` | `rgba(15, 23, 42, 0.80)` |
| `--sga-glass-bg-strong` | `rgba(255, 255, 255, 0.88)` | `rgba(15, 23, 42, 0.92)` |
| `--sga-glass-bg-fallback` | `rgba(255, 255, 255, 0.97)` | `rgba(15, 23, 42, 0.97)` |
| `--sga-glass-border` | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.14)` |
| `--sga-glass-highlight` | `rgba(255, 255, 255, 0.30)` | `rgba(255, 255, 255, 0.06)` |
| `--sga-glass-blur` | `12px` | `12px` |
| `--sga-glass-saturate` | `180%` | `160%` |
| `--sga-glass-shadow` | `0 8px 32px 0 rgba(0, 0, 0, 0.07)` | `0 8px 32px 0 rgba(0, 0, 0, 0.35)` |

Sobre el borde: la especificación admite `rgba(255,255,255,0.3)` o `rgba(0,0,0,0.08)`. En modo claro un borde blanco al 30 % sobre una superficie blanca translúcida es invisible; por eso el borde estructural es el oscuro (`0.08`) y el blanco al 30 % se aplica como **highlight interior** (`inset 0 1px 0 0`), que es lo que produce la sensación de cristal.

Para que el vidrio se perciba, detrás debe haber algo que desenfocar. El fondo de página lleva una «aurora» muy sutil (gradientes radiales de `navy`, `indigo` y `amber` a baja opacidad):

| Variable | Modo claro | Modo oscuro |
|---|---|---|
| `--sga-page-bg` | `#F8FAFC` (`slate-0`) | `#0F172A` (`slate-9`) |
| `--sga-aurora-1` | `rgba(46, 74, 149, 0.08)` | `rgba(100, 128, 196, 0.16)` |
| `--sga-aurora-2` | `rgba(67, 81, 184, 0.07)` | `rgba(117, 131, 218, 0.14)` |
| `--sga-aurora-3` | `rgba(230, 164, 32, 0.06)` | `rgba(247, 185, 58, 0.07)` |

**Dónde sí / dónde no**

| ✅ Superficies glass | ❌ Nunca glass |
|---|---|
| `AppShell.Header` y `AppShell.Navbar` | Tablas y sus contenedores |
| Cards de KPI / resumen en dashboards | Formularios con muchos campos |
| Panel del `Drawer` y `Modal` (variante `glassStrong`) | Cualquier superficie *dentro* de otra superficie glass (no anidar) |
| Barra flotante de acciones (selección múltiple) | Fondos de texto denso (> 3 líneas de párrafo) |
| Tarjeta de login | Bloques del horario semanal (necesitan color pleno) |

---

## 3. Configuración de Mantine v7

Estructura de carpetas objetivo:

```
frontend/src/theme/
├── theme.ts                 # createTheme + defaultProps + resolver de variantes
├── colors.ts                # escalas MantineColorsTuple
├── cssVariablesResolver.ts  # variables --sga-* por esquema de color
├── mantine.d.ts             # augmentación de tipos (colores y theme.other)
├── tokens.css               # dimensiones y utilidades no cubiertas por Mantine
├── glass.module.css         # efecto Liquid Glass
└── ThemeProvider.tsx        # MantineProvider + Notifications + imports de estilos
```

### 3.1 Dependencias e instalación

```bash
npm i @mantine/core @mantine/hooks @mantine/dates @mantine/notifications @mantine/form dayjs @tabler/icons-react
npm i -D postcss postcss-preset-mantine postcss-simple-vars
```

> `@mantine/form` no estaba en la lista inicial pero es del mismo ecosistema, no añade dependencias externas y evita reinventar validación en línea. Se adopta como estándar de formularios (§5.3).

`postcss.config.cjs` (obligatorio para `rem()`, `light-dark()` y mixins en CSS Modules):

```js
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

### 3.2 `src/theme/colors.ts`

```ts
import type { MantineColorsTuple } from '@mantine/core';

/** Azul Marino Institucional — color primario de marca. */
export const navy: MantineColorsTuple = [
  '#EEF2FB', '#D7E0F4', '#B3C2E6', '#8AA0D6', '#6480C4',
  '#4462AF', '#2E4A95', '#1F3777', '#14285A', '#0B1B3F',
];

/** Índigo Académico — marca secundaria, elementos académicos. */
export const indigo: MantineColorsTuple = [
  '#EEF0FC', '#DCE0F8', '#BCC3F0', '#98A3E6', '#7583DA',
  '#5766CC', '#4351B8', '#35409A', '#293178', '#1E2456',
];

/** Ámbar cálido / Dorado académico — acento, prestigio, atención positiva. */
export const amber: MantineColorsTuple = [
  '#FFF8E6', '#FFEDC2', '#FFDE94', '#FFCC61', '#F7B93A',
  '#E6A420', '#C98A12', '#A36E0C', '#7C5308', '#563A05',
];

/** Pizarra fría — neutros: fondos, bordes, texto. */
export const slate: MantineColorsTuple = [
  '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8',
  '#64748B', '#475569', '#334155', '#1E293B', '#0F172A',
];

/** Éxito / aprobado / cupo disponible. */
export const teal: MantineColorsTuple = [
  '#ECFDF7', '#CDF7EA', '#9EEFD7', '#66E0BF', '#34C9A4',
  '#12AC89', '#0B7F66', '#0A6753', '#0B5243', '#083A30',
];

/** Error / choque de horario / bloqueo. */
export const crimson: MantineColorsTuple = [
  '#FEF1F2', '#FDDDE0', '#FBBFC5', '#F7919C', '#EF5F6F',
  '#E23A4E', '#C4283B', '#A41F31', '#861C2C', '#6E1626',
];

/** Alerta / cupos críticos. */
export const orange: MantineColorsTuple = [
  '#FFF5EB', '#FFE6CC', '#FFCF99', '#FFB05C', '#FF9129',
  '#F5760F', '#D95E07', '#B4480A', '#90390D', '#6E2D0C',
];

/** Informativo. */
export const sky: MantineColorsTuple = [
  '#EFF8FF', '#D9EEFF', '#B6E0FF', '#85CCFA', '#4DB3F2',
  '#2496E0', '#0E6FB3', '#0F5A91', '#124B76', '#10395A',
];

export const sgaColors = { navy, indigo, amber, slate, teal, crimson, orange, sky } as const;
```

### 3.3 `src/theme/mantine.d.ts` — tipado de colores y `theme.other`

```ts
import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type SgaColors =
  | 'navy'
  | 'indigo'
  | 'amber'
  | 'slate'
  | 'teal'
  | 'crimson'
  | 'orange'
  | 'sky'
  | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<SgaColors, MantineColorsTuple>;
  }

  export interface MantineThemeOther {
    glass: {
      blur: string;
      saturateLight: string;
      saturateDark: string;
      bgLight: string;
      bgDark: string;
      bgStrongLight: string;
      bgStrongDark: string;
      bgFallbackLight: string;
      bgFallbackDark: string;
      borderLight: string;
      borderDark: string;
      highlightLight: string;
      highlightDark: string;
      shadowLight: string;
      shadowDark: string;
    };
    layout: {
      headerHeight: number;
      navbarWidth: number;
      navbarWidthCollapsed: number;
      contentMaxWidth: number;
      tableRowHeight: number;
      drawerWidthMd: number;
      drawerWidthLg: number;
    };
    schedule: {
      hourHeight: number;
      startHour: number;
      endHour: number;
    };
  }
}
```

### 3.4 `src/theme/theme.ts` — tema completo (copiar y pegar)

```ts
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  createTheme,
  defaultVariantColorsResolver,
  Drawer,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  Pagination,
  Paper,
  parseThemeColor,
  PasswordInput,
  Popover,
  Progress,
  rem,
  Select,
  Switch,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Tooltip,
  type VariantColorsResolver,
} from '@mantine/core';
import { DateInput, DatePickerInput, TimeInput } from '@mantine/dates';
import { sgaColors } from './colors';

/**
 * Corrige el contraste de la variante `light` para ámbar y naranja:
 * el tono 6 no alcanza AA como texto sobre fondo claro, por eso el texto
 * usa una variable resuelta por esquema (tono 8 en claro, tono 3 en oscuro).
 */
const variantColorResolver: VariantColorsResolver = (input) => {
  const resolved = defaultVariantColorsResolver(input);
  const parsed = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  if (
    input.variant === 'light' &&
    parsed.isThemeColor &&
    (parsed.color === 'amber' || parsed.color === 'orange')
  ) {
    return {
      ...resolved,
      color: `var(--sga-${parsed.color}-text)`,
    };
  }

  return resolved;
};

export const theme = createTheme({
  /* ---------- Identidad ---------- */
  primaryColor: 'navy',
  primaryShade: { light: 6, dark: 5 },
  colors: sgaColors,
  white: '#FFFFFF',
  black: '#0F172A',
  autoContrast: true,
  luminanceThreshold: 0.35,
  variantColorResolver,
  defaultGradient: { from: 'navy.6', to: 'indigo.5', deg: 135 },

  /* ---------- Tipografía ---------- */
  fontFamily:
    "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSmoothing: true,
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.55',
    lg: '1.6',
    xl: '1.65',
  },
  headings: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '600',
    textWrap: 'balance',
    sizes: {
      h1: { fontSize: rem(30), lineHeight: '1.25', fontWeight: '700' },
      h2: { fontSize: rem(24), lineHeight: '1.3', fontWeight: '700' },
      h3: { fontSize: rem(20), lineHeight: '1.35', fontWeight: '600' },
      h4: { fontSize: rem(18), lineHeight: '1.4', fontWeight: '600' },
      h5: { fontSize: rem(16), lineHeight: '1.45', fontWeight: '600' },
      h6: { fontSize: rem(14), lineHeight: '1.5', fontWeight: '600' },
    },
  },

  /* ---------- Forma ---------- */
  defaultRadius: 'md',
  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
    lg: rem(14),
    xl: rem(20),
  },
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 2px 8px rgba(15, 23, 42, 0.06)',
    md: '0 8px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 40px rgba(15, 23, 42, 0.10)',
    xl: '0 24px 56px rgba(15, 23, 42, 0.14)',
  },
  breakpoints: {
    xs: '36em', // 576px
    sm: '48em', // 768px
    md: '62em', // 992px
    lg: '75em', // 1200px
    xl: '88em', // 1408px
  },
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,

  /* ---------- Tokens propios ---------- */
  other: {
    glass: {
      blur: '12px',
      saturateLight: '180%',
      saturateDark: '160%',
      bgLight: 'rgba(255, 255, 255, 0.75)',
      bgDark: 'rgba(15, 23, 42, 0.80)',
      bgStrongLight: 'rgba(255, 255, 255, 0.88)',
      bgStrongDark: 'rgba(15, 23, 42, 0.92)',
      bgFallbackLight: 'rgba(255, 255, 255, 0.97)',
      bgFallbackDark: 'rgba(15, 23, 42, 0.97)',
      borderLight: 'rgba(0, 0, 0, 0.08)',
      borderDark: 'rgba(255, 255, 255, 0.14)',
      highlightLight: 'rgba(255, 255, 255, 0.30)',
      highlightDark: 'rgba(255, 255, 255, 0.06)',
      shadowLight: '0 8px 32px 0 rgba(0, 0, 0, 0.07)',
      shadowDark: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
    },
    layout: {
      headerHeight: 64,
      navbarWidth: 264,
      navbarWidthCollapsed: 76,
      contentMaxWidth: 1440,
      tableRowHeight: 52,
      drawerWidthMd: 480,
      drawerWidthLg: 640,
    },
    schedule: {
      hourHeight: 56,
      startHour: 8,
      endHour: 22,
    },
  },

  /* ---------- defaultProps por componente ---------- */
  components: {
    /* Acciones */
    Button: Button.extend({
      defaultProps: { size: 'md', radius: 'md', fw: 600 },
      styles: { root: { transition: 'background-color 120ms ease, transform 120ms ease' } },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { variant: 'subtle', color: 'slate', size: 'lg', radius: 'md' },
    }),
    Anchor: Anchor.extend({
      defaultProps: { underline: 'hover', fw: 500 },
    }),

    /* Contenedores */
    Container: Container.extend({
      defaultProps: { size: 'xl' },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: 'md', p: 'lg', withBorder: true, shadow: 'sm' },
    }),
    Card: Card.extend({
      defaultProps: { radius: 'md', padding: 'lg', withBorder: true, shadow: 'sm' },
    }),

    /* Datos */
    Table: Table.extend({
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
        highlightOnHover: true,
        withRowBorders: true,
        withTableBorder: false,
        striped: false,
        layout: 'auto',
      },
    }),
    Badge: Badge.extend({
      defaultProps: { variant: 'light', radius: 'sm', size: 'md', tt: 'none', fw: 600 },
    }),
    Progress: Progress.extend({
      defaultProps: { radius: 'xl', size: 'sm', transitionDuration: 200 },
    }),
    Pagination: Pagination.extend({
      defaultProps: { radius: 'md', size: 'md', withEdges: false, siblings: 1 },
    }),
    Tabs: Tabs.extend({
      defaultProps: { variant: 'default', radius: 'md', keepMounted: false },
    }),

    /* Overlays */
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
        padding: 'lg',
        size: 'md',
        overlayProps: { backgroundOpacity: 0.45, blur: 4 },
        transitionProps: { transition: 'pop', duration: 180 },
        closeButtonProps: { 'aria-label': 'Cerrar' },
      },
    }),
    Drawer: Drawer.extend({
      defaultProps: {
        position: 'right',
        size: 480,
        offset: 8,
        radius: 'md',
        padding: 'lg',
        overlayProps: { backgroundOpacity: 0.35, blur: 3 },
        transitionProps: { transition: 'slide-left', duration: 220 },
        closeButtonProps: { 'aria-label': 'Cerrar panel' },
      },
    }),
    Popover: Popover.extend({
      defaultProps: { radius: 'md', shadow: 'md', withArrow: true },
    }),
    Menu: Menu.extend({
      defaultProps: { radius: 'md', shadow: 'md', position: 'bottom-end', withinPortal: true },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: { radius: 'sm', withArrow: true, openDelay: 300, multiline: true, maw: 280 },
    }),

    /* Feedback */
    Alert: Alert.extend({
      defaultProps: { variant: 'light', radius: 'md' },
    }),

    /* Formularios */
    TextInput: TextInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    PasswordInput: PasswordInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
    Textarea: Textarea.extend({
      defaultProps: { size: 'md', radius: 'md', autosize: true, minRows: 3, maxRows: 8 },
    }),
    Select: Select.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
        searchable: true,
        nothingFoundMessage: 'Sin resultados',
        checkIconPosition: 'right',
        comboboxProps: { shadow: 'md', radius: 'md' },
      },
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
        searchable: true,
        nothingFoundMessage: 'Sin resultados',
        comboboxProps: { shadow: 'md', radius: 'md' },
      },
    }),
    Checkbox: Checkbox.extend({ defaultProps: { radius: 'xs', size: 'md' } }),
    Switch: Switch.extend({ defaultProps: { size: 'md' } }),
    DateInput: DateInput.extend({
      defaultProps: { size: 'md', radius: 'md', valueFormat: 'DD/MM/YYYY', locale: 'es' },
    }),
    DatePickerInput: DatePickerInput.extend({
      defaultProps: { size: 'md', radius: 'md', valueFormat: 'DD/MM/YYYY', locale: 'es' },
    }),
    TimeInput: TimeInput.extend({ defaultProps: { size: 'md', radius: 'md' } }),
  },
});
```

### 3.5 `src/theme/cssVariablesResolver.ts`

```ts
import { rem, type CSSVariablesResolver } from '@mantine/core';

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    /* Layout */
    '--sga-header-height': rem(theme.other.layout.headerHeight),
    '--sga-navbar-width': rem(theme.other.layout.navbarWidth),
    '--sga-navbar-width-collapsed': rem(theme.other.layout.navbarWidthCollapsed),
    '--sga-content-max-width': rem(theme.other.layout.contentMaxWidth),
    '--sga-table-row-height': rem(theme.other.layout.tableRowHeight),
    '--sga-control-height': rem(42),
    '--sga-space-2xl': rem(48),

    /* Horario */
    '--sga-schedule-hour-height': rem(theme.other.schedule.hourHeight),
    '--sga-schedule-start': String(theme.other.schedule.startHour),
    '--sga-schedule-end': String(theme.other.schedule.endHour),

    /* Glass (comunes) */
    '--sga-glass-blur': theme.other.glass.blur,
  },

  light: {
    '--sga-page-bg': theme.colors.slate[0],
    '--sga-aurora-1': 'rgba(46, 74, 149, 0.08)',
    '--sga-aurora-2': 'rgba(67, 81, 184, 0.07)',
    '--sga-aurora-3': 'rgba(230, 164, 32, 0.06)',

    '--sga-glass-bg': theme.other.glass.bgLight,
    '--sga-glass-bg-strong': theme.other.glass.bgStrongLight,
    '--sga-glass-bg-fallback': theme.other.glass.bgFallbackLight,
    '--sga-glass-border': theme.other.glass.borderLight,
    '--sga-glass-highlight': theme.other.glass.highlightLight,
    '--sga-glass-saturate': theme.other.glass.saturateLight,
    '--sga-glass-shadow': theme.other.glass.shadowLight,

    /* Texto de alto contraste para colores cálidos */
    '--sga-amber-text': theme.colors.amber[8],
    '--sga-orange-text': theme.colors.orange[8],

    /* Superficies del horario */
    '--sga-schedule-grid-line': theme.colors.slate[2],
    '--sga-schedule-now-line': theme.colors.crimson[5],
  },

  dark: {
    '--sga-page-bg': theme.colors.slate[9],
    '--sga-aurora-1': 'rgba(100, 128, 196, 0.16)',
    '--sga-aurora-2': 'rgba(117, 131, 218, 0.14)',
    '--sga-aurora-3': 'rgba(247, 185, 58, 0.07)',

    '--sga-glass-bg': theme.other.glass.bgDark,
    '--sga-glass-bg-strong': theme.other.glass.bgStrongDark,
    '--sga-glass-bg-fallback': theme.other.glass.bgFallbackDark,
    '--sga-glass-border': theme.other.glass.borderDark,
    '--sga-glass-highlight': theme.other.glass.highlightDark,
    '--sga-glass-saturate': theme.other.glass.saturateDark,
    '--sga-glass-shadow': theme.other.glass.shadowDark,

    '--sga-amber-text': theme.colors.amber[3],
    '--sga-orange-text': theme.colors.orange[3],

    '--sga-schedule-grid-line': theme.colors.slate[7],
    '--sga-schedule-now-line': theme.colors.crimson[4],
  },
});
```

### 3.6 `src/theme/glass.module.css` — Liquid Glass

```css
/* ------------------------------------------------------------------
   Liquid Glass — superficies translúcidas del SGA
   Uso: import classes from '@/theme/glass.module.css'
        <Paper className={classes.glass} />
   ------------------------------------------------------------------ */

.glass {
  position: relative;
  background: var(--sga-glass-bg);
  -webkit-backdrop-filter: blur(var(--sga-glass-blur)) saturate(var(--sga-glass-saturate));
  backdrop-filter: blur(var(--sga-glass-blur)) saturate(var(--sga-glass-saturate));
  border: 1px solid var(--sga-glass-border);
  border-radius: var(--mantine-radius-md);
  box-shadow:
    var(--sga-glass-shadow),
    inset 0 1px 0 0 var(--sga-glass-highlight);
  transition: box-shadow 160ms ease, transform 160ms ease;
}

/* Variante más opaca: Drawers, Modales, Login. Prioriza legibilidad. */
.glassStrong {
  composes: glass;
  background: var(--sga-glass-bg-strong);
}

/* Header: pegado arriba, sin radio, solo borde inferior. */
.glassHeader {
  composes: glass;
  border-radius: 0;
  border-width: 0 0 1px 0;
  box-shadow: 0 1px 0 0 var(--sga-glass-border);
}

/* Navbar: pegada a la izquierda, sin radio, solo borde derecho. */
.glassNavbar {
  composes: glass;
  border-radius: 0;
  border-width: 0 1px 0 0;
  box-shadow: none;
}

/* Cards glass interactivas (KPI clicables) */
.glassInteractive {
  composes: glass;
  cursor: pointer;

  @mixin hover {
    transform: translateY(-2px);
    box-shadow:
      var(--mantine-shadow-md),
      inset 0 1px 0 0 var(--sga-glass-highlight);
  }
}

/* Fondo de página con «aurora» sutil para que el vidrio tenga qué desenfocar. */
.pageBackground {
  min-height: 100dvh;
  background-color: var(--sga-page-bg);
  background-image:
    radial-gradient(at 0% 0%, var(--sga-aurora-1) 0, transparent 50%),
    radial-gradient(at 100% 0%, var(--sga-aurora-2) 0, transparent 50%),
    radial-gradient(at 50% 100%, var(--sga-aurora-3) 0, transparent 55%);
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* ---------- Fallbacks y accesibilidad ---------- */

/* Navegadores sin backdrop-filter: superficie casi opaca. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass,
  .glassStrong,
  .glassHeader,
  .glassNavbar,
  .glassInteractive {
    background: var(--sga-glass-bg-fallback);
  }
}

/* Usuario pidió menos transparencia (macOS / iOS / Windows). */
@media (prefers-reduced-transparency: reduce) {
  .glass,
  .glassStrong,
  .glassHeader,
  .glassNavbar,
  .glassInteractive {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: var(--sga-glass-bg-fallback);
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass,
  .glassInteractive {
    transition: none;
  }

  .glassInteractive {
    @mixin hover {
      transform: none;
    }
  }
}
```

### 3.7 `src/theme/tokens.css` — utilidades globales

```css
/* Se importa una vez en ThemeProvider.tsx, después de los estilos de Mantine. */

:root {
  color-scheme: light dark;
}

body {
  font-feature-settings: 'cv11', 'ss01', 'tnum';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Números tabulares en tablas, horarios y KPIs */
.sga-tnum {
  font-variant-numeric: tabular-nums;
}

/* Código de asignatura (INF-201) */
.sga-code {
  font-family: var(--mantine-font-family-monospace);
  font-size: var(--mantine-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Foco visible coherente (Mantine ya lo hace; esto cubre elementos propios) */
.sga-focusable:focus-visible {
  outline: 2px solid var(--mantine-primary-color-filled);
  outline-offset: 2px;
  border-radius: var(--mantine-radius-sm);
}

/* Oculta visualmente, mantiene para lectores de pantalla */
.sga-visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 3.8 `src/theme/ThemeProvider.tsx`

```tsx
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './tokens.css';

import 'dayjs/locale/es';
import dayjs from 'dayjs';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { cssVariablesResolver } from './cssVariablesResolver';
import { theme } from './theme';

dayjs.locale('es');

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
        <Notifications position="top-right" limit={3} autoClose={5000} zIndex={1000} />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
```

Y en `src/main.tsx`:

```tsx
import { ColorSchemeScript } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './theme/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
```

> `ColorSchemeScript` debe ir también en `index.html` (`<head>`) si se usa SSR; con Vite SPA basta renderizarlo antes del provider para evitar el parpadeo de esquema.

---

## 4. Layout y estructura global

### 4.1 Patrón `AppShell`

Una única shell para las cuatro áreas de la aplicación. Se compone de:

- **Header (64px, glass):** logo + nombre corto «SGA», selector de período (solo lectura para docente/estudiante), buscador global (coordinador/admin), toggle de esquema de color, menú de usuario con rol visible.
- **Navbar (264px, glass, colapsable):** accesos agrupados según rol. Sección activa resaltada con `navy`. En tablet pasa a modo iconos (76px) con `Tooltip`; en móvil se oculta y se abre como overlay con el `Burger`.
- **Main:** fondo con aurora, `padding` respirable, contenido centrado a un máximo de 1440px. Cada página empieza con un `PageHeader` (título h1 + descripción + acción primaria).

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] SGA · Nueva Formación     Período 2026-2 ▾   🔍   ☾  (EA)│  Header glass 64px
├───────────┬──────────────────────────────────────────────────┤
│ ● Inicio  │  Oferta académica                     [+ Nueva]  │  PageHeader
│ ○ Oferta  │  Secciones del período 2026-2 · 3 sedes          │
│ ○ Horario │                                                  │
│ ○ Insc.   │  ┌───────── Card ─────────┐ ┌──── Card ────────┐ │
│           │  │ KPI                    │ │ KPI              │ │  Glass cards
│ ───────── │  └────────────────────────┘ └──────────────────┘ │
│ ○ Ayuda   │  ┌──────────────── Card sólida ────────────────┐ │
│           │  │ Filtros pills · Tabla 6 col · Paginación     │ │  Solid card
│           │  └──────────────────────────────────────────────┘ │
└───────────┴──────────────────────────────────────────────────┘
  Navbar glass 264px      Main (aurora bg) max 1440px
```

#### 4.1.1 Navegación por rol

```ts
// src/app/navigation.ts
import {
  IconBooks,
  IconBuildingBank,
  IconCalendarEvent,
  IconCalendarTime,
  IconChartBar,
  IconClipboardList,
  IconHome,
  IconLayoutGrid,
  IconListDetails,
  IconSchool,
  IconSettings,
  IconUsers,
  IconUserSquareRounded,
  type Icon,
} from '@tabler/icons-react';

export type Rol = 'admin' | 'coordinador' | 'docente' | 'estudiante';

export interface NavItem {
  label: string;
  to: string;
  icon: Icon;
  /** Grupo visual en la Navbar (se renderiza como etiqueta h6 dimmed). */
  group?: string;
}

export const NAV_BY_ROLE: Record<Rol, NavItem[]> = {
  admin: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Usuarios', to: '/admin/usuarios', icon: IconUsers, group: 'Administración' },
    { label: 'Parámetros', to: '/admin/parametros', icon: IconSettings, group: 'Administración' },
    { label: 'Reportes', to: '/reportes', icon: IconChartBar, group: 'Consultas' },
  ],
  coordinador: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Sedes y carreras', to: '/estructura/carreras', icon: IconBuildingBank, group: 'Estructura' },
    { label: 'Planes de estudio', to: '/estructura/planes', icon: IconBooks, group: 'Estructura' },
    { label: 'Períodos', to: '/periodos', icon: IconCalendarEvent, group: 'Ciclo' },
    { label: 'Matrícula', to: '/matricula', icon: IconClipboardList, group: 'Ciclo' },
    { label: 'Oferta de secciones', to: '/oferta', icon: IconLayoutGrid, group: 'Ciclo' },
    { label: 'Docentes y estudiantes', to: '/personas', icon: IconUserSquareRounded, group: 'Personas' },
    { label: 'Reportes', to: '/reportes', icon: IconChartBar, group: 'Consultas' },
  ],
  docente: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Mis secciones', to: '/docente/secciones', icon: IconSchool },
    { label: 'Mi horario', to: '/docente/horario', icon: IconCalendarTime },
  ],
  estudiante: [
    { label: 'Inicio', to: '/', icon: IconHome },
    { label: 'Oferta académica', to: '/oferta', icon: IconListDetails },
    { label: 'Inscripción', to: '/inscripcion', icon: IconClipboardList },
    { label: 'Mi horario', to: '/horario', icon: IconCalendarTime },
  ],
};
```

#### 4.1.2 Implementación del shell

```tsx
// src/app/layout/AppLayout.tsx
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import glass from '@/theme/glass.module.css';
import { NAV_BY_ROLE, type Rol } from '../navigation';
import classes from './AppLayout.module.css';

interface AppLayoutProps {
  usuario: { nombre: string; rol: Rol; iniciales: string };
  periodoActual: { codigo: string; estado: 'planificación' | 'inscripción abierta' | 'en curso' | 'cerrado' };
  onLogout: () => void;
}

const ESTADO_PERIODO_COLOR: Record<AppLayoutProps['periodoActual']['estado'], string> = {
  planificación: 'sky',
  'inscripción abierta': 'teal',
  'en curso': 'orange',
  cerrado: 'slate',
};

const ROL_LABEL: Record<Rol, string> = {
  admin: 'Administrador',
  coordinador: 'Coordinador académico',
  docente: 'Docente',
  estudiante: 'Estudiante',
};

export function AppLayout({ usuario, periodoActual, onLogout }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);
  const isTablet = useMediaQuery('(max-width: 75em)'); // < lg → iconos
  const collapsed = desktopCollapsed || isTablet;

  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme('light');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = NAV_BY_ROLE[usuario.rol];

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: collapsed ? 76 : 264,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={{ base: 'md', sm: 'lg', lg: 'xl' }}
      className={glass.pageBackground}
    >
      {/* ---------- Header ---------- */}
      <AppShell.Header className={glass.glassHeader}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" aria-label="Abrir menú" />
            <Burger opened={!desktopCollapsed} onClick={toggleDesktop} visibleFrom="lg" size="sm" aria-label="Contraer menú" />
            <Text fw={700} fz="lg" c="navy" component="span">
              SGA
            </Text>
            <Text c="dimmed" fz="sm" visibleFrom="md" component="span">
              Instituto Universitario Nueva Formación
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Badge color={ESTADO_PERIODO_COLOR[periodoActual.estado]} size="lg" visibleFrom="xs">
              {periodoActual.codigo} · {periodoActual.estado}
            </Badge>

            <Tooltip label={scheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
              <ActionIcon
                onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar esquema de color"
              >
                {scheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
              </ActionIcon>
            </Tooltip>

            <Menu width={240}>
              <Menu.Target>
                <Group gap="xs" component="button" className={classes.userButton} aria-label="Menú de usuario">
                  <Avatar color="navy" radius="xl" size="sm">
                    {usuario.iniciales}
                  </Avatar>
                  <Box visibleFrom="sm" ta="left">
                    <Text fz="sm" fw={600} lh={1.2}>
                      {usuario.nombre}
                    </Text>
                    <Text fz="xs" c="dimmed" lh={1.2}>
                      {ROL_LABEL[usuario.rol]}
                    </Text>
                  </Box>
                  <IconChevronDown size={16} stroke={1.5} />
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{ROL_LABEL[usuario.rol]}</Menu.Label>
                <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />} color="crimson" onClick={onLogout}>
                  Cerrar sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ---------- Navbar ---------- */}
      <AppShell.Navbar className={glass.glassNavbar} p="sm">
        <ScrollArea type="never" style={{ flex: 1 }}>
          <Stack gap={4}>
            {items.map((item, index) => {
              const showGroupLabel = !collapsed && item.group && items[index - 1]?.group !== item.group;
              const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
              const link = (
                <NavLink
                  key={item.to}
                  label={collapsed ? undefined : item.label}
                  leftSection={<item.icon size={20} stroke={1.5} />}
                  active={active}
                  variant="light"
                  color="navy"
                  onClick={() => {
                    navigate(item.to);
                    closeMobile();
                  }}
                  className={classes.navLink}
                  aria-label={item.label}
                />
              );
              return (
                <Box key={item.to}>
                  {showGroupLabel && (
                    <Text fz="xs" fw={600} c="dimmed" tt="uppercase" px="sm" pt="md" pb={4}>
                      {item.group}
                    </Text>
                  )}
                  {collapsed ? (
                    <Tooltip label={item.label} position="right">
                      {link}
                    </Tooltip>
                  ) : (
                    link
                  )}
                </Box>
              );
            })}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      {/* ---------- Main ---------- */}
      <AppShell.Main>
        <Box maw="var(--sga-content-max-width)" mx="auto" pb="var(--sga-space-2xl)">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
```

```css
/* src/app/layout/AppLayout.module.css */
.userButton {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--mantine-radius-md);
  padding: rem(4px) rem(8px);
  cursor: pointer;
  color: inherit;

  @mixin hover {
    background: var(--mantine-color-default-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--mantine-primary-color-filled);
    outline-offset: 2px;
  }
}

.navLink {
  border-radius: var(--mantine-radius-md);
  font-weight: 500;

  &[data-active] {
    font-weight: 600;
  }
}
```

#### 4.1.3 `PageHeader` — cabecera estándar de página

```tsx
// src/components/layout/PageHeader.tsx
import { Anchor, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
  /** Acción primaria (un solo Button filled) y secundarias (light/subtle). */
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separatorMargin="xs" fz="sm">
          {breadcrumbs.map((b) =>
            b.to ? (
              <Anchor key={b.label} href={b.to} c="dimmed" fz="sm">
                {b.label}
              </Anchor>
            ) : (
              <Text key={b.label} c="dimmed" fz="sm">
                {b.label}
              </Text>
            ),
          )}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={4} style={{ flex: 1, minWidth: 240 }}>
          <Title order={1}>{title}</Title>
          {description && (
            <Text c="dimmed" fz="md" maw={720}>
              {description}
            </Text>
          )}
        </Stack>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
```

### 4.2 Adaptabilidad responsive

El RNF exige uso en computador, tableta y teléfono. Cuatro rangos operativos:

| Rango | Ancho | Navbar | Main padding | Tablas | Horario semanal | Drawer/Modal |
|---|---|---|---|---|---|---|
| **Desktop L** | ≥ 1200px (`lg`) | Expandida 264px, colapsable manual | `xl` (32px) | Todas las columnas esenciales (≤ 7) | Grilla completa Lun–Sáb | Drawer 480/640px, Modal `md` |
| **Desktop S / Tablet horizontal** | 992–1199px (`md`) | Iconos 76px con tooltips | `lg` (24px) | ≤ 6 columnas; la accesoria pasa al Drawer | Grilla completa con `ScrollArea` horizontal | Drawer 480px, Modal `md` |
| **Tablet vertical** | 768–991px (`sm`) | Iconos 76px | `lg` | ≤ 5 columnas; el resto en el Drawer | Grilla Lun–Vie + Sáb con scroll | Drawer 100 % ancho − offset, Modal `md` |
| **Móvil** | < 768px | Oculta; overlay con `Burger` | `md` (16px) | **Tabla → lista de cards** (`hiddenFrom="sm"` / `visibleFrom="sm"`) | **Vista por día** con `Tabs` o `SegmentedControl` | Drawer `size="100%"` bottom o Modal `fullScreen` |

Reglas de implementación:

1. Usar los props `visibleFrom` / `hiddenFrom` de Mantine para alternar tabla ↔ cards; nunca duplicar lógica de datos, solo la presentación.
2. `SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}` para KPIs. `Grid` con `span={{ base: 12, md: 6, lg: 4 }}` para formularios de dos/tres columnas.
3. Objetivos táctiles ≥ 44×44px en móvil: `ActionIcon size="lg"` (42px) es el mínimo; en tablas móviles las acciones van en un `Menu` al final de la card.
4. `useMediaQuery` solo para decisiones estructurales (colapsar navbar, cambiar de grilla a lista). Para ocultar/mostrar, siempre props responsivos.
5. El horario semanal en móvil muestra un día a la vez con navegación anterior/siguiente y un `SegmentedControl` de días (L M X J V S).

---

## 5. Catálogo de componentes y patrones de interfaz

### 5.1 Cards y contenedores

Dos familias con roles distintos. La decisión es binaria y no depende del gusto del desarrollador:

| | **Glass Card** | **Solid Card** |
|---|---|---|
| Propósito | Resumen, KPI, hero, bienvenida, panel flotante | Contenido operativo: tablas, formularios, listas, detalle |
| Clase / componente | `<Paper className={glass.glass}>` o `<GlassCard>` | `<Card>` (defaultProps del tema) |
| Fondo | Translúcido con blur | `--mantine-color-body` (blanco / `slate-8`) |
| Texto permitido | Títulos, cifras, 1–2 líneas de texto | Cualquiera |
| Puede contener otra card | No | Sí (sub-cards con `withBorder` y sin sombra) |
| Máximo por vista | 4–6 (fila de KPIs) | Sin límite razonable |

#### `GlassCard`

```tsx
// src/components/ui/GlassCard.tsx
import { Paper, type PaperProps } from '@mantine/core';
import clsx from 'clsx';
import glass from '@/theme/glass.module.css';

interface GlassCardProps extends PaperProps {
  /** Más opaca; para paneles que contienen texto o controles. */
  strong?: boolean;
  /** Añade hover elevado y cursor pointer. */
  interactive?: boolean;
}

export function GlassCard({ strong, interactive, className, children, ...rest }: GlassCardProps) {
  return (
    <Paper
      withBorder={false}
      shadow="none"
      className={clsx(
        interactive ? glass.glassInteractive : strong ? glass.glassStrong : glass.glass,
        className,
      )}
      {...rest}
    >
      {children}
    </Paper>
  );
}
```

#### `StatCard` — KPI con acento ámbar

```tsx
// src/components/ui/StatCard.tsx
import { Group, Stack, Text, ThemeIcon, type MantineColor } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: Icon;
  color?: MantineColor;
  onClick?: () => void;
}

export function StatCard({ label, value, hint, icon: IconCmp, color = 'navy', onClick }: StatCardProps) {
  return (
    <GlassCard interactive={Boolean(onClick)} onClick={onClick} p="lg" role={onClick ? 'button' : undefined}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts="0.04em">
            {label}
          </Text>
          <Text fz={28} fw={700} lh={1.1} className="sga-tnum">
            {value}
          </Text>
          {hint && (
            <Text fz="sm" c="dimmed">
              {hint}
            </Text>
          )}
        </Stack>
        <ThemeIcon variant="light" color={color} size={44} radius="md">
          <IconCmp size={22} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </GlassCard>
  );
}
```

Uso en el dashboard del coordinador:

```tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
  <StatCard label="Secciones ofertadas" value={128} hint="Período 2026-2" icon={IconLayoutGrid} />
  <StatCard label="Ocupación promedio" value="74 %" hint="+6 % vs. 2026-1" icon={IconChartBar} color="indigo" />
  <StatCard label="Secciones con cupos críticos" value={9} hint="≥ 90 % de ocupación" icon={IconAlertTriangle} color="orange" />
  <StatCard label="Docentes con carga completa" value={17} icon={IconAward} color="amber" />
</SimpleGrid>
```

#### Card sólida con cabecera estándar

```tsx
<Card>
  <Card.Section inheritPadding withBorder py="sm">
    <Group justify="space-between">
      <Title order={3}>Secciones del período</Title>
      <Button variant="light" size="sm" leftSection={<IconPlus size={16} stroke={1.5} />}>
        Nueva sección
      </Button>
    </Group>
  </Card.Section>
  <Card.Section inheritPadding py="md">
    {/* Filtros + tabla */}
  </Card.Section>
</Card>
```

### 5.2 Tablas no agobiantes

Una tabla del SGA siempre tiene **cinco partes** en este orden:

1. **Toolbar:** buscador (`TextInput` con `IconSearch`), filtros como *pills* (`Chip.Group` o `SegmentedControl`), botón «Más filtros» que abre un `Popover` para los secundarios.
2. **Resumen de resultados:** «128 secciones · 9 con cupos críticos» en `Text c="dimmed" fz="sm"`.
3. **Tabla:** máximo 7 columnas visibles (ideal 5–6). Primera columna = identificador con código monoespaciado + nombre. Estados como `Badge`. Última columna = acciones (`ActionIcon` ver + `Menu` con el resto).
4. **Estado vacío / cargando:** `Skeleton` de 5 filas mientras carga; `EmptyState` con icono, texto y acción si no hay datos.
5. **Paginación:** siempre presente aunque haya una página. `Pagination` a la derecha, «Mostrando 1–20 de 128» y selector de tamaño (20/50/100) a la izquierda.

Regla de columnas: si una columna solo se lee «a veces» (sala, docente secundario, fecha de creación, observaciones), no va en la tabla: va al **Drawer de detalle** que abre el `ActionIcon` de la fila.

```tsx
// src/features/oferta/SeccionesTable.tsx
import {
  ActionIcon,
  Badge,
  Chip,
  Group,
  Menu,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconSearch,
  IconUsers,
  IconArchive,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { CupoIndicator } from '@/features/inscripcion/CupoIndicator';
import { EmptyState } from '@/components/ui/EmptyState';

export interface SeccionRow {
  id: string;
  codigoAsignatura: string;
  nombreAsignatura: string;
  seccion: string;
  docente: string;
  sede: string;
  modalidad: 'presencial' | 'semipresencial' | 'online';
  jornada: string;
  inscritos: number;
  cupo: number;
  estado: 'activa' | 'cerrada' | 'inactiva';
}

interface SeccionesTableProps {
  rows: SeccionRow[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: (q: string) => void;
  onVer: (row: SeccionRow) => void;
  onEditar: (row: SeccionRow) => void;
  onNomina: (row: SeccionRow) => void;
}

const MODALIDAD_COLOR = { presencial: 'indigo', semipresencial: 'sky', online: 'teal' } as const;
const ESTADO_COLOR = { activa: 'teal', cerrada: 'slate', inactiva: 'slate' } as const;

export function SeccionesTable(props: SeccionesTableProps) {
  const { rows, total, page, pageSize, loading, onPageChange, onPageSizeChange, onSearch } = props;
  const [query, setQuery] = useState('');
  const [debounced] = useDebouncedValue(query, 300);
  const [modalidad, setModalidad] = useState<string[]>([]);

  // El fetch real vive en el contenedor; aquí solo se notifica el término ya "debounced".
  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  return (
    <Stack gap="md">
      {/* 1. Toolbar */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Buscar por código, asignatura o docente"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          w={{ base: '100%', sm: 320 }}
          size="sm"
          aria-label="Buscar secciones"
        />
        <Chip.Group multiple value={modalidad} onChange={setModalidad}>
          <Group gap="xs">
            <Chip value="presencial" color="indigo" variant="light" size="sm">Presencial</Chip>
            <Chip value="semipresencial" color="sky" variant="light" size="sm">Semipresencial</Chip>
            <Chip value="online" color="teal" variant="light" size="sm">Online</Chip>
          </Group>
        </Chip.Group>
      </Group>

      {/* 2. Resumen */}
      <Text fz="sm" c="dimmed">
        {total} secciones en el período
      </Text>

      {/* 3. Tabla */}
      <Table.ScrollContainer minWidth={820}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Asignatura</Table.Th>
              <Table.Th>Sección</Table.Th>
              <Table.Th>Docente</Table.Th>
              <Table.Th>Sede · Modalidad</Table.Th>
              <Table.Th w={200}>Cupo</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th w={96} aria-label="Acciones" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={`sk-${i}`}>
                  <Table.Td colSpan={7}>
                    <Skeleton h={20} radius="sm" />
                  </Table.Td>
                </Table.Tr>
              ))}

            {!loading && rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <EmptyState
                    title="Sin secciones para estos filtros"
                    description="Prueba quitar algún filtro o cambia el término de búsqueda."
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!loading &&
              rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text component="span" className="sga-code" c="indigo">
                        {row.codigoAsignatura}
                      </Text>
                      <Text fz="sm" fw={500} lineClamp={1}>
                        {row.nombreAsignatura}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm">{row.seccion}</Text>
                    <Text fz="xs" c="dimmed">{row.jornada}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" lineClamp={1}>{row.docente}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Text fz="sm">{row.sede}</Text>
                      <Badge color={MODALIDAD_COLOR[row.modalidad]} size="sm">
                        {row.modalidad}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <CupoIndicator inscritos={row.inscritos} cupo={row.cupo} compact />
                  </Table.Td>
                  <Table.Td>
                    <Badge color={ESTADO_COLOR[row.estado]} variant={row.estado === 'activa' ? 'light' : 'outline'}>
                      {row.estado}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label="Ver detalle">
                        <ActionIcon onClick={() => props.onVer(row)} aria-label={`Ver ${row.codigoAsignatura} ${row.seccion}`}>
                          <IconEye size={18} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon aria-label="Más acciones">
                            <IconDotsVertical size={18} stroke={1.5} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={16} stroke={1.5} />} onClick={() => props.onEditar(row)}>
                            Editar sección
                          </Menu.Item>
                          <Menu.Item leftSection={<IconUsers size={16} stroke={1.5} />} onClick={() => props.onNomina(row)}>
                            Ver nómina
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item leftSection={<IconArchive size={16} stroke={1.5} />} color="crimson">
                            Inactivar
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* 5. Paginación (siempre visible) */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          <Text fz="sm" c="dimmed" className="sga-tnum">
            Mostrando {desde}–{hasta} de {total}
          </Text>
          <Select
            size="xs"
            w={90}
            value={String(pageSize)}
            onChange={(v) => v && onPageSizeChange(Number(v))}
            data={['20', '50', '100']}
            searchable={false}
            aria-label="Filas por página"
          />
        </Group>
        <Pagination total={Math.max(1, Math.ceil(total / pageSize))} value={page} onChange={onPageChange} />
      </Group>
    </Stack>
  );
}
```

#### Versión móvil: tabla → lista de cards

```tsx
<Box hiddenFrom="sm">
  <Stack gap="sm">
    {rows.map((row) => (
      <Card key={row.id} padding="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Text className="sga-code" c="indigo">{row.codigoAsignatura} · {row.seccion}</Text>
            <Text fw={500}>{row.nombreAsignatura}</Text>
            <Text fz="sm" c="dimmed">{row.docente} · {row.sede}</Text>
          </Stack>
          <ActionIcon onClick={() => onVer(row)} aria-label="Ver detalle"><IconEye size={18} stroke={1.5} /></ActionIcon>
        </Group>
        <CupoIndicator inscritos={row.inscritos} cupo={row.cupo} mt="sm" />
      </Card>
    ))}
  </Stack>
</Box>
<Box visibleFrom="sm">{/* <SeccionesTable /> */}</Box>
```

#### `EmptyState`

```tsx
// src/components/ui/EmptyState.tsx
import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox, type Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: Icon;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: IconCmp = IconInbox, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="sm" py="xl" ta="center">
      <ThemeIcon variant="light" color="slate" size={56} radius="xl">
        <IconCmp size={28} stroke={1.5} />
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      {description && <Text c="dimmed" fz="sm" maw={360}>{description}</Text>}
      {action}
    </Stack>
  );
}
```

### 5.3 Formularios accesibles

Reglas fijas:

- **`@mantine/form`** con `validate` declarativo; errores **en línea bajo el campo**, nunca solo en un toast.
- Todos los inputs con `label` visible. `description` para ayudas breves; `placeholder` no sustituye al label.
- `withAsterisk` en obligatorios y una nota «* Campo obligatorio» al inicio del formulario.
- **≤ 7 campos por vista.** Más de 7 → `Stepper` (procesos lineales: crear sección, matricular) o `Accordion` (fichas con secciones independientes: perfil de docente, parámetros).
- Botón primario a la derecha con verbo específico («Crear sección», no «Guardar»); «Cancelar» como `variant="subtle"` a su izquierda.
- Campos relacionados en `Grid` de 2 columnas en desktop, 1 en móvil. Campos con longitud corta (código, créditos, cupo) no ocupan el ancho completo.
- Al enviar, si el backend rechaza por regla de negocio, se muestra un `Alert` en la cabecera del formulario **y** se marca el campo implicado si aplica (`form.setFieldError`).
- Foco automático al primer campo con error (`form.getInputNode(field)?.focus()`).

#### Ejemplo: crear sección en 3 pasos (`Stepper`)

```tsx
// src/features/oferta/NuevaSeccionStepper.tsx
import {
  Alert,
  Button,
  Fieldset,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Stepper,
  Text,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

interface NuevaSeccionValues {
  asignaturaId: string;
  seccion: string;
  docenteId: string;
  sedeId: string;
  modalidad: 'presencial' | 'semipresencial' | 'online' | '';
  jornada: string;
  cupo: number;
  salaId: string;
  bloques: { dia: number; inicio: string; fin: string }[];
}

export function NuevaSeccionStepper({ onSubmit }: { onSubmit: (v: NuevaSeccionValues) => Promise<void> }) {
  const [active, setActive] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<NuevaSeccionValues>({
    mode: 'uncontrolled',
    initialValues: {
      asignaturaId: '',
      seccion: '',
      docenteId: '',
      sedeId: '',
      modalidad: '',
      jornada: '',
      cupo: 30,
      salaId: '',
      bloques: [{ dia: 0, inicio: '08:00', fin: '09:30' }],
    },
    validate: (values) => {
      if (active === 0) {
        return {
          asignaturaId: values.asignaturaId ? null : 'Selecciona la asignatura',
          seccion: /^[A-Z]$/.test(values.seccion) ? null : 'Una letra mayúscula (A–Z)',
          cupo: values.cupo >= 1 && values.cupo <= 120 ? null : 'Entre 1 y 120 estudiantes',
        };
      }
      if (active === 1) {
        return {
          docenteId: values.docenteId ? null : 'Selecciona el docente',
          sedeId: values.sedeId ? null : 'Selecciona la sede',
          modalidad: values.modalidad ? null : 'Selecciona la modalidad',
          jornada: values.jornada ? null : 'Selecciona la jornada',
        };
      }
      return {};
    },
  });

  const next = () => {
    if (form.validate().hasErrors) return;
    setActive((s) => Math.min(s + 1, 2));
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (e) {
      // El backend devuelve { code, message, field? } (ver §6.1)
      const err = e as { message: string; field?: keyof NuevaSeccionValues };
      setServerError(err.message);
      if (err.field) form.setFieldError(err.field, err.message);
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="lg">
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} size="sm" color="navy">
          <Stepper.Step label="Asignatura" description="Qué se dicta" />
          <Stepper.Step label="Dictado" description="Quién, dónde y cómo" />
          <Stepper.Step label="Horario" description="Bloques y sala" />
        </Stepper>

        {serverError && (
          <Alert color="crimson" icon={<IconAlertCircle size={18} stroke={1.5} />} title="No se pudo crear la sección">
            {serverError}
          </Alert>
        )}

        <Text fz="sm" c="dimmed">* Campo obligatorio</Text>

        {active === 0 && (
          <Fieldset legend="Asignatura y cupo" variant="unstyled">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Select
                  label="Asignatura"
                  placeholder="Busca por código o nombre"
                  withAsterisk
                  data={[]} /* cargar del plan */
                  key={form.key('asignaturaId')}
                  {...form.getInputProps('asignaturaId')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <Select label="Sección" withAsterisk data={['A', 'B', 'C', 'D']} searchable={false} key={form.key('seccion')} {...form.getInputProps('seccion')} />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 2 }}>
                <NumberInput label="Cupo" withAsterisk min={1} max={120} key={form.key('cupo')} {...form.getInputProps('cupo')} />
              </Grid.Col>
            </Grid>
          </Fieldset>
        )}

        {active === 1 && (
          <Fieldset legend="Dictado" variant="unstyled">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label="Docente" withAsterisk data={[]} key={form.key('docenteId')} {...form.getInputProps('docenteId')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label="Sede" withAsterisk data={[]} key={form.key('sedeId')} {...form.getInputProps('sedeId')} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Modalidad"
                  withAsterisk
                  searchable={false}
                  data={[
                    { value: 'presencial', label: 'Presencial' },
                    { value: 'semipresencial', label: 'Semipresencial' },
                    { value: 'online', label: 'Online' },
                  ]}
                  key={form.key('modalidad')}
                  {...form.getInputProps('modalidad')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select label="Jornada" withAsterisk searchable={false} data={['Diurna', 'Vespertina']} key={form.key('jornada')} {...form.getInputProps('jornada')} />
              </Grid.Col>
            </Grid>
          </Fieldset>
        )}

        {active === 2 && (
          <Fieldset legend="Bloques horarios" variant="unstyled">
            <Stack gap="sm">
              {form.getValues().bloques.map((_, i) => (
                <Grid gutter="sm" key={i} align="flex-end">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Select
                      label="Día"
                      searchable={false}
                      data={[
                        { value: '0', label: 'Lunes' }, { value: '1', label: 'Martes' }, { value: '2', label: 'Miércoles' },
                        { value: '3', label: 'Jueves' }, { value: '4', label: 'Viernes' }, { value: '5', label: 'Sábado' },
                      ]}
                      key={form.key(`bloques.${i}.dia`)}
                      {...form.getInputProps(`bloques.${i}.dia`)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 4 }}>
                    <TimeInput label="Inicio" key={form.key(`bloques.${i}.inicio`)} {...form.getInputProps(`bloques.${i}.inicio`)} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 4 }}>
                    <TimeInput label="Fin" key={form.key(`bloques.${i}.fin`)} {...form.getInputProps(`bloques.${i}.fin`)} />
                  </Grid.Col>
                </Grid>
              ))}
              <Button
                variant="subtle"
                size="sm"
                onClick={() => form.insertListItem('bloques', { dia: 0, inicio: '08:00', fin: '09:30' })}
                style={{ alignSelf: 'flex-start' }}
              >
                + Agregar bloque
              </Button>
            </Stack>
          </Fieldset>
        )}

        <Group justify="space-between" mt="md">
          <Button variant="subtle" color="slate" onClick={() => setActive((s) => Math.max(0, s - 1))} disabled={active === 0}>
            Atrás
          </Button>
          {active < 2 ? (
            <Button onClick={next}>Continuar</Button>
          ) : (
            <Button type="submit" leftSection={<IconCheck size={18} stroke={1.5} />}>
              Crear sección
            </Button>
          )}
        </Group>
      </Stack>
    </form>
  );
}
```

### 5.4 Modales vs. Drawers — guía de decisión

| Pregunta | Sí → | No → |
|---|---|---|
| ¿El usuario necesita **seguir viendo** la tabla/página de fondo (comparar, copiar, mantener contexto)? | **Drawer** | sigue |
| ¿Es un **formulario de edición o alta** con más de 3 campos? | **Drawer** (`size={640}`) | sigue |
| ¿Es un **detalle de registro** (ficha de sección, estudiante, docente)? | **Drawer** (`size={480}`) | sigue |
| ¿Es una **confirmación** de acción (inactivar, anular inscripción, cerrar período)? | **Modal** `size="sm"` | sigue |
| ¿Es una **alerta bloqueante** que el usuario debe leer antes de continuar (reglas de inscripción rechazadas)? | **Modal** `size="md"` | sigue |
| ¿Es un asistente de **varios pasos que no depende de la página de fondo** (login, onboarding)? | **Modal** `size="lg"` o página completa | sigue |
| ¿Muestra **previsualización** (horario propuesto antes de confirmar)? | **Drawer** `size="lg"` con el horario dentro | Modal |

Resumen operativo:

- **Drawer** = «trabajar sobre algo sin perder dónde estoy». Lateral derecho, `offset={8}`, `radius="md"`, glass `strong`. Cabecera con título h3, subtítulo dimmed, y footer fijo con acciones.
- **Modal** = «detenerse, leer, decidir». Centrado, breve, una decisión. Si un Modal necesita scroll, probablemente debía ser Drawer.
- Nunca un Modal abre otro Modal. Un Drawer puede abrir un Modal de confirmación.
- Ambos cierran con `Esc`, con el botón de cerrar y con clic fuera **salvo** si hay cambios sin guardar (entonces `closeOnClickOutside={false}` y confirmación).

#### `DetailDrawer` — plantilla de detalle con footer fijo

```tsx
// src/components/ui/DetailDrawer.tsx
import { Box, Drawer, Group, ScrollArea, Stack, Text, Title, type DrawerProps } from '@mantine/core';
import type { ReactNode } from 'react';
import glass from '@/theme/glass.module.css';

interface DetailDrawerProps extends Omit<DrawerProps, 'title'> {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function DetailDrawer({ title, subtitle, footer, children, ...rest }: DetailDrawerProps) {
  return (
    <Drawer
      {...rest}
      classNames={{ content: glass.glassStrong }}
      title={
        <Stack gap={2}>
          <Title order={3}>{title}</Title>
          {subtitle && <Text fz="sm" c="dimmed">{subtitle}</Text>}
        </Stack>
      }
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="lg" pb={footer ? 80 : 0}>
        {children}
      </Stack>
      {footer && (
        <Box
          pos="absolute"
          bottom={0}
          left={0}
          right={0}
          p="md"
          style={{ borderTop: '1px solid var(--mantine-color-default-border)', background: 'var(--sga-glass-bg-strong)' }}
        >
          <Group justify="flex-end" gap="sm">
            {footer}
          </Group>
        </Box>
      )}
    </Drawer>
  );
}
```

#### `ConfirmModal` — confirmación destructiva

```tsx
// src/components/ui/ConfirmModal.tsx
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ opened, title, message, confirmLabel, destructive, loading, onConfirm, onClose }: ConfirmModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <Stack gap="lg">
        <Text>{message}</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="slate" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button color={destructive ? 'crimson' : 'navy'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
```

### 5.5 Calendario / horario semanal

El horario es el componente más visual del SGA y la pieza donde la **regla 7 (choque de horario)** se hace tangible. Base tomada del wireframe `wireframes/e9-3-horario-semanal.html`: días 0–5 (Lun–Sáb), horas en punto, grilla de 08:00 a 22:00.

#### Anatomía

- Grilla CSS: 1 columna de horas (56px) + 6 columnas de días. Filas de 1 hora (`--sga-schedule-hour-height` = 56px); los bloques se posicionan en valores absolutos según minutos desde `startHour`.
- Encabezado de días *sticky*. Línea de «ahora» en `crimson-5` (solo si el período está en curso).
- **Bloques:** `indigo` light para secciones inscritas; `navy` con borde discontinuo para la sección **propuesta** (hover/selección en la oferta); `crimson` con patrón rayado para **conflicto**.
- Cada bloque muestra: código (mono), nombre (1 línea), sala/ambiente y sección. Al pasar el cursor, `HoverCard` con el detalle. Clic abre el Drawer de la sección.
- Móvil: un día a la vez con `SegmentedControl` (L M X J V S) y lista vertical de bloques.

#### Código de color de estados

| Estado del bloque | Fondo | Borde | Texto | Extra |
|---|---|---|---|---|
| `inscrita` | `indigo-1` / `indigo-9` (oscuro) | `indigo-3` / `indigo-7` | `indigo-9` / `indigo-1` | — |
| `propuesta` | `navy-0` / `slate-8` | `2px dashed navy-6` / `navy-4` | `navy-8` / `navy-2` | Aparece al seleccionar una sección en la oferta |
| `conflicto` | rayas `crimson-1`/`crimson-2` (oscuro `crimson-9`/`crimson-8`) | `2px solid crimson-6` | `crimson-8` / `crimson-1` | Se aplica **a los dos bloques** que se solapan + icono `IconAlertTriangle` |
| `docente-ocupado` (vista coordinador, RF8) | `orange-1` / `orange-9` | `orange-5` | `orange-8` / `orange-2` | Otro docente/sala ya ocupa el bloque |
| `pasada` (bloque de sección cerrada) | `slate-1` / `slate-8` | `slate-3` / `slate-6` | `slate-6` / `slate-4` | Opacidad 0.7 |

#### Componentes

```tsx
// src/features/horario/types.ts
export type EstadoBloque = 'inscrita' | 'propuesta' | 'conflicto' | 'docente-ocupado' | 'pasada';

export interface BloqueHorario {
  id: string;
  seccionId: string;
  codigoAsignatura: string;
  nombreAsignatura: string;
  seccion: string;
  sala?: string;
  /** 0 = Lunes … 5 = Sábado */
  dia: 0 | 1 | 2 | 3 | 4 | 5;
  /** Minutos desde 00:00 (p. ej. 8*60 = 08:00) */
  inicioMin: number;
  finMin: number;
  estado: EstadoBloque;
}

/** Devuelve pares de ids que se solapan en el mismo día. */
export function detectarChoques(bloques: BloqueHorario[]): Array<[string, string]> {
  const choques: Array<[string, string]> = [];
  for (let i = 0; i < bloques.length; i++) {
    for (let j = i + 1; j < bloques.length; j++) {
      const a = bloques[i];
      const b = bloques[j];
      if (a.dia === b.dia && a.inicioMin < b.finMin && b.inicioMin < a.finMin) {
        choques.push([a.id, b.id]);
      }
    }
  }
  return choques;
}
```

```tsx
// src/features/horario/HorarioSemanal.tsx
import { Box, Group, HoverCard, ScrollArea, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { detectarChoques, type BloqueHorario } from './types';
import classes from './HorarioSemanal.module.css';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const START_HOUR = 8;
const END_HOUR = 22;
const HOUR_PX = 56;

interface HorarioSemanalProps {
  bloques: BloqueHorario[];
  /** Bloques de la sección que el estudiante está evaluando inscribir. */
  propuestos?: BloqueHorario[];
  onBloqueClick?: (b: BloqueHorario) => void;
}

function fmt(min: number) {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function HorarioSemanal({ bloques, propuestos = [], onBloqueClick }: HorarioSemanalProps) {
  const { todos, enConflicto } = useMemo(() => {
    const merged = [...bloques, ...propuestos.map((p) => ({ ...p, estado: 'propuesta' as const }))];
    const conflictIds = new Set(detectarChoques(merged).flat());
    const marcados = merged.map((b) => (conflictIds.has(b.id) ? { ...b, estado: 'conflicto' as const } : b));
    return { todos: marcados, enConflicto: conflictIds };
  }, [bloques, propuestos]);

  const horas = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <ScrollArea type="auto" offsetScrollbars>
      <Box className={classes.grid} style={{ '--hours': END_HOUR - START_HOUR } as React.CSSProperties} role="grid" aria-label="Horario semanal">
        {/* Cabecera */}
        <Box className={classes.corner} />
        {DIAS.map((d) => (
          <Box key={d} className={classes.dayHeader} role="columnheader">
            <Text fz="sm" fw={600}>{d}</Text>
          </Box>
        ))}

        {/* Columna de horas */}
        <Box className={classes.hoursCol}>
          {horas.map((h) => (
            <Text key={h} fz="xs" c="dimmed" className={clsx(classes.hourLabel, 'sga-tnum')}>
              {String(h).padStart(2, '0')}:00
            </Text>
          ))}
        </Box>

        {/* Columnas de días */}
        {DIAS.map((_, dia) => (
          <Box key={dia} className={classes.dayCol} role="gridcell">
            {todos
              .filter((b) => b.dia === dia)
              .map((b) => {
                const top = ((b.inicioMin - START_HOUR * 60) / 60) * HOUR_PX;
                const height = ((b.finMin - b.inicioMin) / 60) * HOUR_PX;
                return (
                  <HoverCard key={b.id} width={260} shadow="md" openDelay={250}>
                    <HoverCard.Target>
                      <Box
                        component="button"
                        type="button"
                        className={clsx(classes.bloque, classes[b.estado])}
                        style={{ top, height }}
                        onClick={() => onBloqueClick?.(b)}
                        aria-label={`${b.codigoAsignatura} ${b.nombreAsignatura}, ${DIAS[b.dia]} ${fmt(b.inicioMin)} a ${fmt(b.finMin)}${
                          b.estado === 'conflicto' ? ', choque de horario' : ''
                        }`}
                      >
                        <Group gap={4} wrap="nowrap" justify="space-between">
                          <Text className="sga-code" fz="xs">{b.codigoAsignatura}</Text>
                          {b.estado === 'conflicto' && <IconAlertTriangle size={14} stroke={2} aria-hidden />}
                        </Group>
                        <Text fz="xs" fw={500} lineClamp={height > 60 ? 2 : 1}>
                          {b.nombreAsignatura}
                        </Text>
                        {height > 80 && (
                          <Text fz="xs" className={classes.meta}>
                            Sec. {b.seccion}{b.sala ? ` · ${b.sala}` : ''}
                          </Text>
                        )}
                      </Box>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Stack gap={4}>
                        <Text fw={600} fz="sm">{b.codigoAsignatura} · {b.nombreAsignatura}</Text>
                        <Text fz="sm" c="dimmed">
                          {DIAS[b.dia]} {fmt(b.inicioMin)}–{fmt(b.finMin)} · Sección {b.seccion}
                        </Text>
                        {b.sala && <Text fz="sm" c="dimmed">{b.sala}</Text>}
                        {b.estado === 'conflicto' && (
                          <Text fz="sm" c="crimson" fw={500}>
                            Se solapa con otra inscripción de este período.
                          </Text>
                        )}
                      </Stack>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              })}
          </Box>
        ))}
      </Box>
      {enConflicto.size > 0 && (
        <Text fz="sm" c="crimson" mt="sm" role="status">
          {enConflicto.size / 2 === 1 ? '1 choque de horario detectado.' : `${enConflicto.size / 2} choques de horario detectados.`}
        </Text>
      )}
    </ScrollArea>
  );
}
```

```css
/* src/features/horario/HorarioSemanal.module.css */
.grid {
  --hour-h: var(--sga-schedule-hour-height);
  display: grid;
  grid-template-columns: rem(56px) repeat(6, minmax(rem(120px), 1fr));
  grid-template-rows: rem(40px) calc(var(--hours) * var(--hour-h));
  min-width: rem(800px);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-md);
  overflow: hidden;
  background: var(--mantine-color-body);
}

.corner,
.dayHeader {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--mantine-color-body);
  border-bottom: 1px solid var(--mantine-color-default-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hoursCol {
  position: relative;
  border-right: 1px solid var(--mantine-color-default-border);
}

.hourLabel {
  height: var(--hour-h);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: rem(2px);
  transform: translateY(-50%);
}

.dayCol {
  position: relative;
  border-right: 1px solid var(--mantine-color-default-border);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(var(--hour-h) - 1px),
    var(--sga-schedule-grid-line) calc(var(--hour-h) - 1px),
    var(--sga-schedule-grid-line) var(--hour-h)
  );

  &:last-child {
    border-right: none;
  }
}

/* ---------- Bloques ---------- */
.bloque {
  position: absolute;
  left: rem(4px);
  right: rem(4px);
  padding: rem(6px) rem(8px);
  border-radius: var(--mantine-radius-sm);
  border: 1px solid transparent;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: rem(2px);
  font: inherit;
  transition: box-shadow 120ms ease, transform 120ms ease;

  @mixin hover {
    box-shadow: var(--mantine-shadow-sm);
    z-index: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--mantine-primary-color-filled);
    outline-offset: 1px;
    z-index: 1;
  }
}

.meta {
  opacity: 0.8;
}

.inscrita {
  background: light-dark(var(--mantine-color-indigo-1), var(--mantine-color-indigo-9));
  border-color: light-dark(var(--mantine-color-indigo-3), var(--mantine-color-indigo-7));
  color: light-dark(var(--mantine-color-indigo-9), var(--mantine-color-indigo-1));
}

.propuesta {
  background: light-dark(var(--mantine-color-navy-0), var(--mantine-color-slate-8));
  border: 2px dashed light-dark(var(--mantine-color-navy-6), var(--mantine-color-navy-4));
  color: light-dark(var(--mantine-color-navy-8), var(--mantine-color-navy-2));
}

.conflicto {
  background: repeating-linear-gradient(
    135deg,
    light-dark(var(--mantine-color-crimson-1), var(--mantine-color-crimson-9)) 0 rem(6px),
    light-dark(var(--mantine-color-crimson-2), var(--mantine-color-crimson-8)) rem(6px) rem(12px)
  );
  border: 2px solid var(--mantine-color-crimson-6);
  color: light-dark(var(--mantine-color-crimson-8), var(--mantine-color-crimson-1));
}

.docente-ocupado {
  background: light-dark(var(--mantine-color-orange-1), var(--mantine-color-orange-9));
  border-color: var(--mantine-color-orange-5);
  color: light-dark(var(--mantine-color-orange-8), var(--mantine-color-orange-2));
}

.pasada {
  background: light-dark(var(--mantine-color-slate-1), var(--mantine-color-slate-8));
  border-color: light-dark(var(--mantine-color-slate-3), var(--mantine-color-slate-6));
  color: light-dark(var(--mantine-color-slate-6), var(--mantine-color-slate-4));
  opacity: 0.7;
}

@media (prefers-reduced-motion: reduce) {
  .bloque {
    transition: none;
  }
}
```

### 5.6 Indicadores de cupo (`CupoIndicator`)

Se usa en la tabla de oferta, en las cards de sección y en el Drawer de detalle. Los umbrales están centralizados para que toda la app cuente igual:

| Ocupación | Estado | Color | Etiqueta |
|---|---|---|---|
| < 75 % | `disponible` | `teal` | «Cupo disponible» |
| 75 % – 99 % | `critico` | `orange` | «Cupos críticos · quedan N» |
| 100 % | `lleno` | `crimson` | «Sin cupo» |

```tsx
// src/features/inscripcion/CupoIndicator.tsx
import { Badge, Group, Progress, Stack, Text, type MantineColor, type StackProps } from '@mantine/core';

export type EstadoCupo = 'disponible' | 'critico' | 'lleno';

export function estadoCupo(inscritos: number, cupo: number): EstadoCupo {
  if (cupo <= 0 || inscritos >= cupo) return 'lleno';
  const ratio = inscritos / cupo;
  return ratio >= 0.75 ? 'critico' : 'disponible';
}

const CUPO_COLOR: Record<EstadoCupo, MantineColor> = {
  disponible: 'teal',
  critico: 'orange',
  lleno: 'crimson',
};

function etiqueta(estado: EstadoCupo, restantes: number) {
  if (estado === 'lleno') return 'Sin cupo';
  if (estado === 'critico') return `Cupos críticos · quedan ${restantes}`;
  return 'Cupo disponible';
}

interface CupoIndicatorProps extends StackProps {
  inscritos: number;
  cupo: number;
  /** Solo barra + texto corto (para celdas de tabla). */
  compact?: boolean;
}

export function CupoIndicator({ inscritos, cupo, compact, ...rest }: CupoIndicatorProps) {
  const estado = estadoCupo(inscritos, cupo);
  const color = CUPO_COLOR[estado];
  const pct = cupo > 0 ? Math.min(100, Math.round((inscritos / cupo) * 100)) : 100;
  const restantes = Math.max(0, cupo - inscritos);

  return (
    <Stack gap={4} {...rest}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text fz="xs" className="sga-tnum" c={compact ? 'dimmed' : undefined}>
          {inscritos}/{cupo}
        </Text>
        {compact ? (
          <Text fz="xs" c={`${color}.${estado === 'disponible' ? 7 : 8}`} fw={600}>
            {estado === 'lleno' ? 'Sin cupo' : estado === 'critico' ? `Quedan ${restantes}` : 'Disponible'}
          </Text>
        ) : (
          <Badge color={color} size="sm">{etiqueta(estado, restantes)}</Badge>
        )}
      </Group>
      <Progress
        value={pct}
        color={color}
        aria-label={`Ocupación ${pct} %: ${etiqueta(estado, restantes)}`}
        striped={estado === 'lleno'}
      />
    </Stack>
  );
}
```

### 5.7 Cadena de prerrequisitos (`PrerequisitosChain`)

Muestra, para una asignatura, qué prerrequisitos están aprobados y cuáles faltan. Se usa en el Drawer de asignatura, en la oferta (al pasar sobre el candado) y en el editor del plan de estudios.

```tsx
// src/features/inscripcion/PrerequisitosChain.tsx
import { Group, Stack, Text, ThemeIcon, Timeline, Tooltip } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconLock } from '@tabler/icons-react';

export interface Prerrequisito {
  codigo: string;
  nombre: string;
  aprobado: boolean;
  /** Período en que se aprobó, si aplica. */
  periodo?: string;
}

interface PrerequisitosChainProps {
  asignatura: { codigo: string; nombre: string };
  prerrequisitos: Prerrequisito[];
}

export function PrerequisitosChain({ asignatura, prerrequisitos }: PrerequisitosChainProps) {
  const pendientes = prerrequisitos.filter((p) => !p.aprobado).length;

  if (prerrequisitos.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        Esta asignatura no tiene prerrequisitos en tu plan.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <ThemeIcon variant="light" color={pendientes ? 'crimson' : 'teal'} size="sm" radius="xl">
          {pendientes ? <IconLock size={12} stroke={2} /> : <IconCircleCheck size={12} stroke={2} />}
        </ThemeIcon>
        <Text fz="sm" fw={600}>
          {pendientes === 0
            ? 'Prerrequisitos cumplidos'
            : pendientes === 1
              ? 'Falta 1 prerrequisito'
              : `Faltan ${pendientes} prerrequisitos`}
        </Text>
      </Group>

      <Timeline bulletSize={22} lineWidth={2} color="teal">
        {prerrequisitos.map((p) => (
          <Timeline.Item
            key={p.codigo}
            color={p.aprobado ? 'teal' : 'crimson'}
            bullet={p.aprobado ? <IconCircleCheck size={14} stroke={2} /> : <IconCircleX size={14} stroke={2} />}
            title={
              <Group gap="xs">
                <Text component="span" className="sga-code">{p.codigo}</Text>
                <Text component="span" fz="sm" fw={500}>{p.nombre}</Text>
              </Group>
            }
          >
            <Text fz="xs" c={p.aprobado ? 'dimmed' : 'crimson'}>
              {p.aprobado ? `Aprobada${p.periodo ? ` en ${p.periodo}` : ''}` : 'Pendiente de aprobar'}
            </Text>
          </Timeline.Item>
        ))}
        <Timeline.Item
          color="navy"
          bullet={<IconLock size={14} stroke={2} />}
          title={
            <Tooltip label="Asignatura que quieres inscribir">
              <Group gap="xs">
                <Text component="span" className="sga-code">{asignatura.codigo}</Text>
                <Text component="span" fz="sm" fw={600}>{asignatura.nombre}</Text>
              </Group>
            </Tooltip>
          }
        />
      </Timeline>
    </Stack>
  );
}
```

### 5.8 Otros patrones recurrentes

| Patrón | Componente Mantine | Convención SGA |
|---|---|---|
| Estados de registros (activo / inactivo / vigente / cerrado / anulada) | `Badge` | `light` para positivos (`teal`), `outline` + `slate` para inactivos, `light` + `crimson` para anulados |
| Selector de período | `Select` en Header | Solo el coordinador/admin cambia el período de trabajo; docente/estudiante ven el vigente |
| Filtros de oferta (RF9) | `Chip.Group` (modalidad, jornada, día) + `Switch` «Solo con cupo» + `Switch` «Ver toda la oferta» | Los filtros persisten en la URL (`?modalidad=online&dia=1`) |
| Segmentar una entidad grande (ficha de sección: Datos · Horario · Nómina) | `Tabs` | Máximo 5 tabs; cada tab carga su contenido de forma perezosa (`keepMounted={false}`) |
| Acciones masivas sobre selección | Barra flotante glass (`position: sticky; bottom`) | Aparece solo con ≥ 1 seleccionado; muestra conteo y ≤ 3 acciones |
| Carga de datos | `Skeleton` que imita la forma final | Nunca `Loader` centrado a pantalla completa salvo en el arranque de la app |
| Confirmación de éxito | `notifications.show` `teal` | 4–5 s; nunca modal para éxitos |
| Ayuda contextual | `Tooltip` en iconos; `Popover` con `IconInfoCircle` para explicaciones > 1 frase | Nunca ocultar información crítica solo en tooltips |

---

## 6. Manejo de errores y notificaciones de negocio

### 6.1 Contrato de error del backend

Toda respuesta de error de negocio del API sigue este shape (HTTP `409` para reglas de inscripción y conflictos, `422` para validación de formulario, `403` para permisos):

```ts
// src/api/types.ts
export type CodigoReglaInscripcion =
  | 'MATRICULA_NO_VIGENTE'      // Regla 1
  | 'FUERA_DE_VENTANA'          // Regla 2
  | 'SIN_CUPO'                  // Regla 3
  | 'FUERA_DE_PLAN'             // Regla 4
  | 'PRERREQUISITO_PENDIENTE'   // Regla 5
  | 'YA_APROBADA'               // Regla 6
  | 'CHOQUE_HORARIO';           // Regla 7

export interface ReglaRechazada {
  regla: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  code: CodigoReglaInscripcion;
  /** Mensaje humano listo para mostrar. El frontend puede enriquecerlo con `detalle`. */
  message: string;
  detalle?: {
    periodo?: string;
    ventana?: { inicio: string; fin: string };
    cupo?: { inscritos: number; maximo: number };
    prerrequisitos?: { codigo: string; nombre: string; aprobado: boolean }[];
    aprobadaEn?: string;
    choques?: { codigo: string; nombre: string; seccion: string; dia: number; inicio: string; fin: string }[];
  };
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  /** Presente en 409 de inscripción: todas las reglas incumplidas, no solo la primera. */
  reglas?: ReglaRechazada[];
  /** Presente en 422: campo del formulario asociado. */
  field?: string;
}
```

Dos momentos de evaluación:

1. **Pre-evaluación (anticipación):** `GET /api/inscripciones/evaluar?seccionId=…` devuelve `{ ok: boolean; reglas: ReglaRechazada[] }` sin inscribir. La UI lo usa al abrir el detalle de una sección para mostrar el estado de las 7 reglas **antes** de que el estudiante pulse «Inscribir».
2. **Confirmación:** `POST /api/inscripciones` ejecuta las reglas de forma atómica en el backend. Si rechaza, devuelve `409` con `reglas`. La UI trata este resultado como fuente de verdad (puede diferir de la pre-evaluación, p. ej. si el cupo se agotó entre medio).

### 6.2 Patrón de notificaciones (`@mantine/notifications`)

Un único helper. Nadie llama a `notifications.show` directamente con colores a mano.

```ts
// src/lib/notify.tsx
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface NotifyOptions {
  title?: string;
  message: ReactNode;
  /** ms; false = requiere cierre manual */
  autoClose?: number | false;
  id?: string;
}

const base = { radius: 'md', withBorder: true } as const;

export const notify = {
  success: ({ title = 'Listo', message, autoClose = 4500, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'teal', icon: <IconCheck size={18} stroke={2} /> }),

  error: ({ title = 'No se pudo completar', message, autoClose = 7000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'crimson', icon: <IconX size={18} stroke={2} /> }),

  warning: ({ title = 'Atención', message, autoClose = 6000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'orange', icon: <IconAlertTriangle size={18} stroke={2} /> }),

  info: ({ title, message, autoClose = 5000, id }: NotifyOptions) =>
    notifications.show({ ...base, id, title, message, autoClose, color: 'sky', icon: <IconInfoCircle size={18} stroke={2} /> }),

  /** Para operaciones largas: muestra loading y luego actualiza con el mismo id. */
  loading: (id: string, message: ReactNode) =>
    notifications.show({ ...base, id, message, loading: true, autoClose: false, withCloseButton: false }),

  update: (id: string, opts: NotifyOptions & { color: 'teal' | 'crimson' | 'orange' | 'sky' }) =>
    notifications.update({ ...base, id, ...opts, loading: false, withCloseButton: true, autoClose: opts.autoClose ?? 4500 }),
};
```

Cuándo usar cada canal:

| Canal | Cuándo | Ejemplos |
|---|---|---|
| **`notify.success`** (toast) | Operación completada; el usuario puede seguir | «Inscripción confirmada», «Sección creada», «Usuario actualizado» |
| **`notify.error`** (toast) | Error técnico o de red; no hay una regla de negocio detrás | «Sin conexión con el servidor», «Sesión expirada» |
| **`Alert` en la vista** (`variant="light"`) | Estado persistente que condiciona lo que se puede hacer en la página | «No tienes matrícula vigente», «La inscripción abre el 10 de marzo» |
| **`Modal` de reglas** | Rechazo de inscripción tras confirmar: hay que leer qué falló | Reglas 3–7 al pulsar «Inscribir» |
| **Estado en línea** (Badge, Progress, bloque rojo) | Información que debe verse sin interacción, antes de intentar nada | Cupo, prerrequisitos, choque en el horario |

Regla de oro: **un error de regla académica nunca se comunica solo con un toast.** El toast desaparece; la regla debe quedar visible donde el usuario tomó la decisión.

### 6.3 `Alert` de negocio

```tsx
<Alert
  variant="light"
  color="sky"
  icon={<IconCalendarEvent size={18} stroke={1.5} />}
  title="La inscripción aún no está abierta"
>
  Para el período <b>2026-2</b> podrás inscribir del <b>10 al 21 de marzo</b>. Mientras tanto puedes revisar la oferta y armar tu horario tentativo.
</Alert>
```

Estructura obligatoria del copy: **título = qué pasa** (frase corta, sin punto final) · **cuerpo = por qué + qué puede hacer el usuario** (1–2 frases, con datos concretos en negrita).

### 6.4 Mapeo visual y de copy de las 7 reglas académicas (CU8 / RF10)

Cada regla tiene: momento de aparición, componente, color, icono, copy y comportamiento del botón «Inscribir».

| # | Regla | Código | Dónde y cómo se ve **antes** de intentar | Color / icono | Copy (título → cuerpo) | Botón «Inscribir» |
|---|---|---|---|---|---|---|
| 1 | Matrícula vigente en el período | `MATRICULA_NO_VIGENTE` | `Alert` `crimson` fijo en la parte superior de Oferta e Inscripción. Toda la vista queda en modo consulta. | `crimson` · `IconIdOff` | **No tienes una matrícula vigente en 2026-2** → Para inscribir asignaturas necesitas una matrícula activa en este período. Contacta a Coordinación Académica de tu sede. | Deshabilitado en todas las secciones, con `Tooltip` «Requiere matrícula vigente». |
| 2 | Ventana de inscripción abierta | `FUERA_DE_VENTANA` | `Alert` `sky` (si la ventana es futura) u `orange` (si ya cerró / período en curso) en la cabecera. `Badge` del período en el Header con el estado. | `sky` / `orange` · `IconCalendarEvent` / `IconCalendarOff` | **La inscripción aún no está abierta** → Podrás inscribir del **10 al 21 de marzo**. Puedes revisar la oferta y planificar tu horario. · **La inscripción para 2026-2 ya cerró** → El plazo terminó el **21 de marzo**. Si necesitas una excepción, contacta a Coordinación Académica. | Deshabilitado con `Tooltip` que repite las fechas. |
| 3 | Cupo disponible | `SIN_CUPO` | `CupoIndicator` en cada fila/card: `Progress` + `Badge` `teal` → `orange` (≥ 75 %) → `crimson` (100 %). | `teal` / `orange` / `crimson` · `IconUsers` | Inline: «Cupo disponible» · «Cupos críticos · quedan 3» · «Sin cupo». Post-confirmación (carrera): **La sección se llenó mientras confirmabas** → Otro estudiante tomó el último cupo de **INF-201 sección B**. Revisa otras secciones de la misma asignatura. | Deshabilitado si 100 %; si hay 1–3 cupos, habilitado con `Badge` naranja al lado. |
| 4 | Asignatura pertenece al plan | `FUERA_DE_PLAN` | Solo aparece si el estudiante activa «Ver toda la oferta». Las secciones fuera de su plan muestran `Badge` `outline` `slate` «Fuera de tu plan» y la fila se atenúa (`opacity 0.75`). | `slate` · `IconBookOff` | Inline: «Fuera de tu plan». `Tooltip` sobre el botón: **No pertenece a tu plan de estudios** → Solo puedes inscribir asignaturas del plan **Ingeniería en Informática 2024**. | Deshabilitado con `Tooltip`. |
| 5 | Prerrequisitos aprobados | `PRERREQUISITO_PENDIENTE` | Icono `IconLock` `crimson` junto al código de la asignatura; `HoverCard`/Drawer con `PrerequisitosChain` marcando aprobados (✓ teal) y pendientes (✗ crimson). | `crimson` (pendiente) / `teal` (cumplido) · `IconLock` / `IconLockOpen` | **Te falta aprobar un prerrequisito** → **Programación II (INF-201)** requiere tener aprobada **Programación I (INF-101)**. Podrás inscribirla cuando esa asignatura figure como aprobada en tu historial. | Deshabilitado; el `Tooltip` lista los códigos pendientes. |
| 6 | Asignatura no aprobada previamente | `YA_APROBADA` | `Badge` `teal` `variant="outline"` con `IconCircleCheck` «Aprobada en 2025-2» en la fila; la fila se atenúa. Por defecto la oferta **oculta** las aprobadas (toggle «Mostrar aprobadas»). | `teal` · `IconCircleCheck` | Inline: «Aprobada en 2025-2». Si intenta igual: **Ya aprobaste esta asignatura** → **Cálculo I (MAT-101)** figura aprobada en **2025-2**. No es necesario volver a inscribirla. | **Oculto** (se sustituye por el badge). No hay nada que intentar. |
| 7 | Sin choque de horario | `CHOQUE_HORARIO` | Al seleccionar una sección, sus bloques aparecen como `propuesta` (borde discontinuo navy) en el horario semanal del Drawer. Si se solapan con una inscripción existente, **ambos bloques** pasan a `conflicto` (rayado crimson, borde 2px, `IconAlertTriangle`) y aparece un `Alert` crimson bajo el horario listando el cruce. | `crimson` · `IconCalendarX` | **Choca con otra asignatura inscrita** → **INF-201 sección B** se cruza con **Cálculo I (MAT-101, sección A)** el **martes de 10:00 a 11:30**. Elige otra sección de INF-201 o anula la inscripción de MAT-101. | Deshabilitado mientras exista conflicto; el botón muestra `leftSection={<IconCalendarX/>}` y texto «Con choque de horario». |

#### Estado de reglas en el Drawer de sección (pre-evaluación)

El Drawer de cada sección muestra, antes del botón, un checklist compacto con el resultado de la pre-evaluación. Las cumplidas se ven en teal; las incumplidas en crimson con su copy.

```tsx
// src/features/inscripcion/EstadoReglas.tsx
import { Alert, Group, List, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconBookOff,
  IconCalendarEvent,
  IconCalendarX,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconIdOff,
  IconLock,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import type { CodigoReglaInscripcion, ReglaRechazada } from '@/api/types';

interface ReglaMeta {
  regla: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  code: CodigoReglaInscripcion;
  nombre: string;
  icon: Icon;
}

export const REGLAS_INSCRIPCION: ReglaMeta[] = [
  { regla: 1, code: 'MATRICULA_NO_VIGENTE', nombre: 'Matrícula vigente en el período', icon: IconIdOff },
  { regla: 2, code: 'FUERA_DE_VENTANA', nombre: 'Ventana de inscripción abierta', icon: IconCalendarEvent },
  { regla: 3, code: 'SIN_CUPO', nombre: 'Cupo disponible', icon: IconUsers },
  { regla: 4, code: 'FUERA_DE_PLAN', nombre: 'Asignatura de tu plan de estudios', icon: IconBookOff },
  { regla: 5, code: 'PRERREQUISITO_PENDIENTE', nombre: 'Prerrequisitos aprobados', icon: IconLock },
  { regla: 6, code: 'YA_APROBADA', nombre: 'No aprobada previamente', icon: IconCircleCheck },
  { regla: 7, code: 'CHOQUE_HORARIO', nombre: 'Sin choque de horario', icon: IconCalendarX },
];

interface EstadoReglasProps {
  rechazadas: ReglaRechazada[];
}

export function EstadoReglas({ rechazadas }: EstadoReglasProps) {
  const porCodigo = new Map(rechazadas.map((r) => [r.code, r]));
  const ok = rechazadas.length === 0;

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <ThemeIcon variant="light" color={ok ? 'teal' : 'crimson'} size="sm" radius="xl">
          {ok ? <IconCircleCheckFilled size={12} /> : <IconLock size={12} stroke={2} />}
        </ThemeIcon>
        <Text fz="sm" fw={600}>
          {ok ? 'Cumples todas las condiciones para inscribir' : `${rechazadas.length} de 7 condiciones no se cumplen`}
        </Text>
      </Group>

      <List spacing={6} size="sm" center>
        {REGLAS_INSCRIPCION.map((meta) => {
          const rechazo = porCodigo.get(meta.code);
          const IconCmp = rechazo ? meta.icon : IconCircleCheck;
          return (
            <List.Item
              key={meta.code}
              icon={
                <ThemeIcon variant="light" color={rechazo ? 'crimson' : 'teal'} size={22} radius="xl">
                  <IconCmp size={14} stroke={2} />
                </ThemeIcon>
              }
            >
              <Text fz="sm" c={rechazo ? undefined : 'dimmed'} fw={rechazo ? 500 : 400}>
                {meta.nombre}
              </Text>
            </List.Item>
          );
        })}
      </List>

      {rechazadas.map((r) => {
        const meta = REGLAS_INSCRIPCION.find((m) => m.code === r.code)!;
        const IconCmp = meta.icon;
        return (
          <Alert key={r.code} color="crimson" icon={<IconCmp size={18} stroke={1.5} />} title={tituloRegla(r)}>
            {r.message}
          </Alert>
        );
      })}
    </Stack>
  );
}

/** Títulos cortos por regla; el cuerpo lo entrega el backend en `message`. */
export function tituloRegla(r: ReglaRechazada): string {
  switch (r.code) {
    case 'MATRICULA_NO_VIGENTE':
      return `No tienes una matrícula vigente${r.detalle?.periodo ? ` en ${r.detalle.periodo}` : ''}`;
    case 'FUERA_DE_VENTANA':
      return 'La inscripción no está abierta';
    case 'SIN_CUPO':
      return 'La sección no tiene cupo';
    case 'FUERA_DE_PLAN':
      return 'No pertenece a tu plan de estudios';
    case 'PRERREQUISITO_PENDIENTE':
      return 'Te falta aprobar un prerrequisito';
    case 'YA_APROBADA':
      return 'Ya aprobaste esta asignatura';
    case 'CHOQUE_HORARIO':
      return 'Choca con otra asignatura inscrita';
  }
}
```

#### Modal de rechazo tras confirmar

Cuando el `POST` devuelve `409`, se abre un `Modal` con **todas** las reglas incumplidas (no solo la primera), reutilizando `tituloRegla` y el `message` del backend. El botón primario del modal es «Entendido»; el secundario «Ver otras secciones» lleva de vuelta a la oferta filtrada por esa asignatura.

```tsx
// src/features/inscripcion/useInscribir.ts
import { useState } from 'react';
import { notify } from '@/lib/notify';
import type { ApiError, ReglaRechazada } from '@/api/types';
import { inscribirSeccion } from '@/api/inscripciones';

export function useInscribir() {
  const [rechazo, setRechazo] = useState<ReglaRechazada[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function inscribir(seccionId: string, etiqueta: string) {
    setLoading(true);
    const id = `insc-${seccionId}`;
    notify.loading(id, `Inscribiendo ${etiqueta}…`);
    try {
      await inscribirSeccion(seccionId);
      notify.update(id, { color: 'teal', title: 'Inscripción confirmada', message: `${etiqueta} ya está en tu horario.` });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409 && err.reglas?.length) {
        // Regla de negocio: modal persistente, no solo toast.
        notify.update(id, { color: 'crimson', title: 'No se pudo inscribir', message: 'Revisa las condiciones que no se cumplen.', autoClose: 3000 });
        setRechazo(err.reglas);
      } else {
        notify.update(id, { color: 'crimson', title: 'Error de conexión', message: err.message ?? 'Inténtalo de nuevo en unos segundos.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return { inscribir, loading, rechazo, cerrarRechazo: () => setRechazo(null) };
}
```

```tsx
// src/features/inscripcion/ReglasRechazadasModal.tsx
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import type { ReglaRechazada } from '@/api/types';
import { EstadoReglas } from './EstadoReglas';

interface Props {
  reglas: ReglaRechazada[] | null;
  asignatura: string;
  onClose: () => void;
  onVerOtrasSecciones: () => void;
}

export function ReglasRechazadasModal({ reglas, asignatura, onClose, onVerOtrasSecciones }: Props) {
  return (
    <Modal opened={Boolean(reglas)} onClose={onClose} title={`No se pudo inscribir ${asignatura}`} size="md">
      {reglas && (
        <Stack gap="lg">
          <Text c="dimmed" fz="sm">
            El sistema revisó las 7 condiciones de inscripción. Estas son las que no se cumplen:
          </Text>
          <EstadoReglas rechazadas={reglas} />
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="slate" onClick={onVerOtrasSecciones}>
              Ver otras secciones
            </Button>
            <Button onClick={onClose}>Entendido</Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
```

### 6.5 Otros errores de negocio (fuera de CU8)

| Situación | Canal | Color | Copy ejemplo |
|---|---|---|---|
| Conflicto de docente o sala al crear sección (RF8) | `Alert` en el paso 3 del Stepper + bloque `docente-ocupado` en el horario del docente | `orange` | **El docente ya tiene clase en ese bloque** → María Pérez dicta **MAT-101 sección A** el martes 10:00–11:30. Cambia el horario o asigna otro docente. |
| Cerrar un período con inscripciones abiertas | `ConfirmModal` destructivo | `crimson` | **¿Cerrar el período 2026-1?** → Las inscripciones quedarán congeladas y no se podrán modificar. Esta acción no se puede deshacer. |
| Inactivar registro con historia (soft-delete) | `ConfirmModal` | `crimson` | **¿Inactivar la asignatura INF-101?** → Dejará de aparecer en nuevos planes y ofertas. El historial de estudiantes que la aprobaron se conserva. |
| Sesión expirada (401) | `notify.error` + redirección a login | `crimson` | **Tu sesión expiró** → Vuelve a iniciar sesión para continuar. |
| Sin permiso (403) | Página `403` con `EmptyState` | `slate` | **No tienes acceso a esta sección** → Tu perfil de **Docente** no incluye esta función. |
| Validación de formulario (422) | Error en línea bajo el campo (`form.setFieldError`) | `crimson` | «Este código ya existe en el plan 2024» |

---

## 7. Guía de estilo y buenas prácticas (Do's and Don'ts)

### 7.1 Tabla comparativa

| Tema | ✅ Hacer | ❌ Evitar |
|---|---|---|
| **Color** | Usar nombres del tema (`color="teal"`, `c="dimmed"`, `var(--mantine-color-navy-6)`) | Hex literales en JSX/CSS; `red`/`green`/`yellow` genéricos de Mantine |
| **Color de acento** | `amber` solo para prestigio/destacado (≤ 1–2 elementos por vista) | Ámbar como color de alerta (para eso está `orange`) o como fondo de secciones |
| **Botones** | Un solo `Button` `filled` por vista (acción primaria). Secundarias `light`, terciarias `subtle`. Verbos concretos: «Crear sección», «Inscribir» | Varios botones azules compitiendo; «Aceptar/OK/Guardar» sin objeto; botones `filled` rojos para acciones no destructivas |
| **Tablas** | ≤ 7 columnas; código + nombre en la primera; badges de estado; acciones al final; paginación siempre | Tablas de 15+ columnas; texto de 11px; scroll horizontal como norma; cargar 500 filas sin paginar |
| **Densidad** | `spacing="md"` por defecto, `lg` entre secciones; `Card padding="lg"` | `gap={4}` en layouts; cards pegadas sin margen; padding cero para «aprovechar espacio» |
| **Glass** | Header, Navbar, KPIs, Drawer/Modal (`strong`), login | Glass sobre glass; glass en tablas/formularios; blur > 16px; opacidades < 0.7 |
| **Overlays** | Drawer para editar/ver detalle; Modal para confirmar/alertar | Modal con formulario de 12 campos; Drawer para «¿Estás seguro?»; modal que abre modal |
| **Formularios** | `@mantine/form`, label visible, error en línea, ≤ 7 campos por paso, `withAsterisk` | Placeholder como único label; errores solo en toast; formulario de 30 campos en una columna |
| **Estados vacíos y carga** | `Skeleton` con la forma del contenido; `EmptyState` con acción | `Loader` gigante centrado; tabla vacía sin explicación; «No data» |
| **Errores de regla académica** | Nombrar la regla, dar el dato concreto y una salida (§6.4). Persistente en la vista | «Error al inscribir», «Operación no permitida», solo toast que desaparece |
| **Iconos** | `@tabler/icons-react`, `stroke={1.5}`, 16/18/20px; icono + texto en botones importantes | Emojis; iconos sin `aria-label` en `ActionIcon`; mezclar familias de iconos |
| **Tipografía** | `Title order={n}` semántico; un h1 por página; `fz="sm"` en tablas, `md` en cuerpo | `Text fw={900}`; tamaños arbitrarios (`fz={13}`); títulos en mayúsculas sostenidas |
| **Códigos e identificadores** | `className="sga-code"` (mono, 600) | Códigos en la misma tipografía que el texto |
| **Estilos** | CSS Modules + variables `--mantine-*` / `--sga-*`; `light-dark()`; props responsivos | `style={{}}` con valores estáticos; `!important`; media queries con px arbitrarios |
| **Responsive** | `visibleFrom`/`hiddenFrom`; `SimpleGrid cols={{ base:1, sm:2, lg:4 }}`; cards en móvil | `display:none` a mano; ocultar la acción primaria en móvil; tablas horizontales en teléfono |
| **Copy** | Español, tuteo, frases cortas, datos en negrita, sin jerga (`409`, `null`, `id`) | «Ha ocurrido un error inesperado», mensajes en inglés, códigos técnicos al usuario |
| **Estados de registro** | Badges con el vocabulario del glosario: `vigente`, `cerrado`, `inactiva`, `anulada` | Inventar sinónimos («deshabilitado», «borrado», «off») |
| **Modo oscuro** | Probar cada pantalla en ambos esquemas; usar variables resueltas por esquema | Colores fijos que solo funcionan en claro; `#fff` de fondo |

### 7.2 Accesibilidad (WCAG 2.1 AA)

Checklist por pantalla:

1. **Contraste:** texto ≥ 4.5:1, texto grande y UI ≥ 3:1. Usar la tabla §2.1.6; para `amber`/`orange` como texto, tonos 8 (claro) / 3 (oscuro). El `variantColorResolver` ya lo aplica en `variant="light"`.
2. **Foco visible:** nunca `outline: none` sin sustituto. Mantine gestiona `focusRing: 'auto'`; en elementos propios (bloques del horario, botón de usuario) usar `:focus-visible` con `--mantine-primary-color-filled`.
3. **Teclado:** todo lo clicable es `<button>` o `<a>` (el `BloqueHorario` es `component="button"`). Drawers y Modales atrapan el foco y devuelven al disparador (Mantine lo hace por defecto; no desactivar `trapFocus`/`returnFocus`).
4. **Etiquetas:** `ActionIcon` siempre con `aria-label`; inputs con `label`; `Progress` con `aria-label` que incluya el valor; imágenes decorativas con `aria-hidden`.
5. **Color no es el único canal:** cada estado semántico lleva icono y/o texto (badges con texto, bloques de conflicto con icono y rayado, `Progress` con cifra `n/m`).
6. **Movimiento:** `respectReducedMotion: true` en el tema; transiciones ≤ 220ms; CSS propio con `@media (prefers-reduced-motion: reduce)`.
7. **Transparencia:** `@media (prefers-reduced-transparency: reduce)` desactiva el blur (ya en `glass.module.css`).
8. **Anuncios dinámicos:** el conteo de choques usa `role="status"`; las notificaciones de Mantine ya son `role="alert"`.
9. **Zoom 200 %:** las vistas deben seguir operables; probar con `Ctrl/Cmd +` hasta 200 % (las tablas pasan a `ScrollContainer`, no se rompen).
10. **Idioma:** `<html lang="es">`.

### 7.3 Modo claro / modo oscuro

- `MantineProvider defaultColorScheme="auto"` + `ColorSchemeScript`. El toggle del Header persiste en `localStorage` (Mantine lo hace vía `localStorageColorSchemeManager` por defecto).
- **En CSS Modules:** `light-dark(valorClaro, valorOscuro)` para cualquier color propio; o `@mixin dark { … }` cuando cambian varias propiedades.
- **En JS/JSX:** nunca leer el esquema para decidir colores; usar variables (`var(--sga-glass-bg)`) o props de Mantine (`c="dimmed"`, `bg="var(--mantine-color-body)"`). `useComputedColorScheme` solo para iconos del toggle o gráficos de terceros.
- **Superficies en oscuro:** fondo de página `slate-9`, cards sólidas `--mantine-color-body` (Mantine → `dark.7`; con nuestra escala visualmente próxima a `slate-8`), bordes `--mantine-color-default-border`.
- **Glass en oscuro:** fondo `rgba(15,23,42,0.8)`, borde `rgba(255,255,255,0.14)`, sombra más marcada. La aurora sube de opacidad porque sobre fondo oscuro se percibe menos.
- **Bloques de horario en oscuro:** fondos en tono 9 y texto en tono 1 de la misma familia (ya en `HorarioSemanal.module.css`).
- Verificar contraste de badges `light` en oscuro: Mantine usa tono 3–4 para el texto en `light` sobre fondo semitransparente; con las escalas definidas todos los semánticos cumplen AA.

### 7.4 Rendimiento percibido

- `Skeleton` inmediato al navegar; los datos llegan sobre la forma final.
- Tabs con `keepMounted={false}` para no montar el horario y la nómina si el usuario solo ve los datos.
- Listas largas (nómina de 120 estudiantes) paginadas o con `ScrollArea` de altura fija; no virtualizar salvo > 1.000 filas.
- `useDebouncedValue(300)` en buscadores; `notifications.limit=3` para no apilar toasts.

---

## 8. Anexos

### 8.1 Estructura de carpetas del frontend

```
frontend/src/
├── api/                    # cliente HTTP, tipos de respuesta (ApiError, ReglaRechazada)
├── app/
│   ├── layout/             # AppLayout, AppLayout.module.css
│   ├── navigation.ts       # NAV_BY_ROLE
│   └── router.tsx
├── components/
│   ├── layout/             # PageHeader
│   └── ui/                 # GlassCard, StatCard, EmptyState, DetailDrawer, ConfirmModal
├── features/
│   ├── auth/
│   ├── estructura/         # sedes, carreras, planes, asignaturas
│   ├── periodos/
│   ├── personas/
│   ├── matricula/
│   ├── oferta/             # SeccionesTable, NuevaSeccionStepper
│   ├── inscripcion/        # CupoIndicator, PrerequisitosChain, EstadoReglas, useInscribir
│   ├── horario/            # HorarioSemanal, types
│   └── reportes/
├── lib/                    # notify.tsx, formatters, hooks compartidos
└── theme/                  # theme.ts, colors.ts, cssVariablesResolver.ts, glass.module.css, tokens.css, ThemeProvider.tsx
```

### 8.2 Iconografía de referencia (Tabler)

| Concepto | Icono |
|---|---|
| Sede / institución | `IconBuildingBank` |
| Carrera | `IconSchool` |
| Plan de estudios / asignatura | `IconBooks` / `IconBook` |
| Prerrequisito (bloqueado / cumplido) | `IconLock` / `IconLockOpen` |
| Período | `IconCalendarEvent` |
| Ventana cerrada | `IconCalendarOff` |
| Choque de horario | `IconCalendarX` |
| Horario | `IconCalendarTime` |
| Sección / oferta | `IconLayoutGrid` |
| Cupo | `IconUsers` |
| Matrícula | `IconClipboardList` |
| Matrícula no vigente | `IconIdOff` |
| Aprobada | `IconCircleCheck` |
| Docente | `IconUserSquareRounded` |
| Estudiante | `IconUser` |
| Reportes | `IconChartBar` |
| Éxito / error / alerta / info | `IconCheck` / `IconX` / `IconAlertTriangle` / `IconInfoCircle` |
| Ver / editar / más / inactivar | `IconEye` / `IconEdit` / `IconDotsVertical` / `IconArchive` |

### 8.3 Snippets de uso rápido

```tsx
// Badge de estado de período
<Badge color={ESTADO_PERIODO_COLOR[estado]}>{estado}</Badge>

// Texto atenuado
<Text c="dimmed" fz="sm">…</Text>

// Código de asignatura
<Text component="span" className="sga-code" c="indigo">INF-201</Text>

// Card glass de KPI
<StatCard label="Inscritos" value={1284} icon={IconUsers} />

// Drawer de detalle con footer
<DetailDrawer opened={opened} onClose={close} title="INF-201 · Programación II" subtitle="Sección B · Sede Centro · Presencial"
  footer={<><Button variant="subtle" color="slate" onClick={close}>Cerrar</Button><Button>Inscribir</Button></>}>
  <EstadoReglas rechazadas={evaluacion.reglas} />
  <HorarioSemanal bloques={misBloques} propuestos={seccion.bloques} />
</DetailDrawer>

// Notificación
notify.success({ title: 'Sección creada', message: 'INF-201 sección C ya está en la oferta de 2026-2.' });
```

### 8.4 Checklist de revisión de PR (UI)

- [ ] Usa componentes Mantine y tokens del tema; sin hex ni px arbitrarios.
- [ ] Un solo `Button filled` por vista; verbos concretos.
- [ ] Tablas: ≤ 7 columnas, paginación, skeleton, estado vacío, acciones al final.
- [ ] Detalle/edición en Drawer; confirmación/alerta en Modal (según §5.4).
- [ ] Formularios con `@mantine/form`, labels visibles, errores en línea, ≤ 7 campos por paso.
- [ ] Errores de negocio nombran la regla y ofrecen salida (§6.4); no solo toast.
- [ ] Glass solo en superficies permitidas (§2.6); fallback verificado.
- [ ] Probado en claro y oscuro; en móvil (< 768px) y tablet.
- [ ] `aria-label` en `ActionIcon`, foco visible, contraste AA.
- [ ] Copy en español, tuteo, sin jerga técnica.

### 8.5 Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-09-06 | Versión inicial: tokens, tema Mantine v7, glass, layout, catálogo, reglas CU8/RF10, guía de estilo. |
