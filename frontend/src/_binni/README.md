# Código de la rama `biñi` (sin integrar)

Pantallas de Biñi tal como llegaron en su rama, aisladas aquí a propósito: **no forman parte de la app**
(nada las importa) y no compilan con el stack unificado.

Por qué están aparte:

- Están escritas en **JSX + clases Tailwind 4**, para React 19 / Mantine 9 / react-router 7. La app unificada usa
  **TypeScript + Mantine 7 + React 18 + react-router 6** (sin Tailwind).
- Cada página se envuelve con su propio `Header`/`Footer`; la app unificada tiene un único `AppLayout` con navegación por rol.
- `App.jsx` y `main.jsx` convivían con `App.tsx`/`main.tsx`: Vite resuelve `./App` a `.jsx` antes que `.tsx`,
  así que en la raíz de `src/` habrían reemplazado en silencio a la app real.

Pantallas a portar (a Mantine 7 + TS, dentro de `features/` y colgando de `AppLayout`):

| Archivo | Pantalla |
|---|---|
| `pages/Sedes.jsx` | ABM de sedes |
| `pages/Periodos.jsx` | Períodos académicos |
| `pages/Oferta.jsx` | Oferta de secciones (coordinador) |
| `pages/SeccionesPeriodo.jsx` | Secciones por período |
| `pages/Horario.jsx` | Horario semanal |
| `pages/MatrizPermisos.jsx` | Matriz de permisos |
| `pages/Clientes|Cursos|Productos.jsx`, `components/*Card.jsx`, `data/{clientes,cursos,productos}.js` | Restos de plantilla de ejemplo |
