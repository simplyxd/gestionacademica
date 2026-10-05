# Guía oral — Rúbrica Frontend (React y Diseño)

Prepárate para responder en 1–3 frases por pregunta, apuntando al archivo o pantalla real.

## Dónde está el código en GitHub

| Entrega | Rama | Pull request |
|---|---|---|
| Estudiante (oferta, inscripción, horario) | `cursor/frontend-mockup-rubrica-ec9b` | [#100](https://github.com/simplyxd/gestionacademica/pull/100) |
| Admin (parámetros + reportes RF12) | `cursor/admin-parametros-issue-93-ec9b` | [#103](https://github.com/simplyxd/gestionacademica/pull/103) |

**Importante:** en `main` puede no estar fusionado aún. Abre el PR o cambia a la rama en GitHub → Code → branch.

Para mostrar en clase sin tu PC: entra a GitHub desde el navegador del laboratorio, abre el PR y usa “Files changed”, o clona la rama en el PC del lab:

```bash
git clone https://github.com/simplyxd/gestionacademica.git
cd gestionacademica
git checkout cursor/admin-parametros-issue-93-ec9b
cd frontend && npm install && npm run dev
```

---

## 1. Configuración y funcionamiento (10 pts)

**¿Cómo se levanta el proyecto?**  
`cd frontend` → `npm install` → `npm run dev` → Vite en `localhost:5173`.

**¿Qué herramientas usaste y por qué?**  
React + TypeScript + Vite (arranque rápido), Mantine (UI), React Router (rutas), CSS Modules + tema SGA.

**¿Dónde está el `package.json`?**  
En `frontend/`, no en la raíz del repo. Si `npm` falla con ENOENT, estás en la carpeta equivocada.

**¿Hay backend o base de datos?**  
No. Es mock localhost; datos en `src/mocks/` y estado en React / `localStorage` (parámetros).

---

## 2. Estructura visual (10 pts)

**¿Qué zonas tiene la página?**  
Encabezado (logo, período, usuario), navegación lateral, contenido principal (`<main>` / `<Outlet>`), pie de página (`SiteFooter`).

**¿Dónde se arma el layout?**  
`ShellLayout.tsx` (común). Estudiante: `StudentLayout.tsx`. Admin: `AdminLayout.tsx`.

**¿Cómo demuestras el footer / header?**  
Scroll hasta el pie; o cambia el nombre institucional en `/admin/parametros`, guarda, y se refleja en el encabezado.

---

## 3. Componentes en React (15 pts)

**¿Por qué no está todo en `App.tsx`?**  
`App` solo define rutas y providers. Cada pantalla es un feature (`oferta/`, `inscripcion/`, `admin/`, `reportes/`) y hay UI compartida (`PageHeader`, `BrandLogo`, `ReportTable`).

**Dame 3 componentes propios**  
Ejemplos: `BrandLogo`, `PageHeader`, `SiteFooter`, `ParametroField`, `ReportTable`, `CupoIndicator`, `HorarioSemanal`.

**¿Qué es un componente?**  
Función que recibe props (opcional), retorna JSX y se puede reutilizar en varias pantallas.

---

## 4. JSX y sintaxis (10 pts)

**¿Qué es JSX?**  
Sintaxis que parece HTML dentro de JavaScript/TypeScript; el compilador lo convierte a llamadas React.

**Diferencias importantes vs HTML**  
`className` (no `class`), etiquetas cerradas (`<img />`), expresiones con `{ }`, eventos `onClick`.

**¿Cómo renderizas una lista?**  
`.map()` sobre un arreglo y `key` estable (ej. `item.to` en la navbar).

---

## 5. Props y reutilización (10 pts)

**¿Qué son las props?**  
Datos que el padre pasa al hijo. El hijo no las “inventa”: las recibe y las usa.

**Ejemplos en este proyecto**  
- `PageHeader` → `title`, `description`, `actions`  
- `BrandLogo` → `size`, `wordmark`  
- `SiteFooter` → `links`, `year`  
- `ReportTable` → `columns`, `rows`  
- `ParametroField` → `label`, `hint` + props del input  

**¿Por qué sirve?**  
Misma UI, contenidos distintos (nav estudiante vs admin; varias tablas de reportes).

---

## 6. Estado, eventos e interactividad (15 pts)

**¿Qué es `useState`?**  
Hook que guarda un valor que, al cambiar, vuelve a renderizar el componente.

**Ejemplos útiles para mostrar**  
1. Inscripción / escenarios (selector “Escenario de prueba”) → cambian las 7 reglas.  
2. Parámetros admin → editar campos, `dirty`, Guardar / Restablecer.  
3. Reportes → filtros de período y carrera filtran tablas.  
4. Tema claro/oscuro en el header.

**¿Dónde persisten los parámetros?**  
`ParametrosContext` + `localStorage` (solo en ese navegador; no es servidor).

**Flujo de un evento**  
Usuario hace clic → `onClick` / `onChange` → `setState` o `updateCampo` → React re-renderiza.

---

## 7. Tailwind o CSS (10 pts)

**¿Usaste Tailwind?**  
No es obligatorio: usamos tema Mantine + CSS Modules (`glass.module.css`, estilos de layout/features).

**¿Cómo se ve la identidad visual?**  
Colores institucionales en `src/theme/colors.ts` (navy, indigo, amber, slate) y superficies “glass” en `glass.module.css`.

**¿Qué es un CSS Module?**  
Archivo `.module.css` cuyos nombres de clase no chocan con otros componentes (ej. `classes.navLink`).

---

## 8. Diseño responsivo (10 pts)

**¿Cómo se adapta a móvil?**  
`AppShell` de Mantine: burger en pantallas chicas, navbar colapsable, grids `cols={{ base: 1, sm: 2 }}`, tablas/filtros que se apilan.

**Cómo demostrarlo**  
DevTools → modo responsive (390px): aparece menú hamburguesa; en desktop se ve sidebar completa.

---

## 9. Calidad del código (5 pts)

**¿Cómo organizaste carpetas?**  
`app/` (layout, rutas, contexto), `features/` (pantallas), `components/` (UI compartida), `mocks/`, `theme/`.

**¿Nombres descriptivos?**  
Sí: `ParametrosPage`, `filtrarPorCarrera`, `NAV_ADMIN`, etc.

---

## 10. Documentación y entrega (5 pts)

**¿Dónde están las instrucciones?**  
`frontend/README.md` (instalación, rutas estudiante/admin).

**¿Qué entregaste?**  
Código fuente en GitHub (rama + PR), no un ZIP suelto sin README.

---

## Preguntas de negocio / caso (si las mezcla)

**¿Qué hace el administrador vs el estudiante?**  
Admin: parámetros + reportes lectura. Estudiante: oferta, inscripción, horario. El coordinador (estructura/oferta) no está en este mock admin.

**¿Qué son las 7 reglas de inscripción?**  
Matrícula vigente, ventana abierta, cupo, asignatura del plan, prerrequisitos, no aprobada antes, sin choque de horario. Se demuestran con el selector de escenarios.

**¿RF12 qué muestra?**  
Consultas mock: matrícula por carrera, ocupación/cupos, carga docente, estudiantes por asignatura.

**¿Por qué no hay API?**  
La tarjeta pide mock frontend localhost; las reglas “reales” irían al backend en la entrega fullstack.

---

## Guion corto de demo (2–3 minutos)

1. Abrir `/oferta` → filtros + tabla.  
2. `/inscripcion` o escenario “sin matrícula” → rechazo con regla.  
3. `/horario` → grilla semanal.  
4. `/admin/parametros` → editar nombre, Guardar, ver preview / header.  
5. `/reportes` → cambiar carrera/período y pestaña ocupación.  
6. Reducir ventana → menú móvil.

---

## Si no tienes PC: plan B

1. Abre el PR en el celular/lab y muestra *Files changed* + capturas del PR.  
2. Pide al profesor clonar la rama o abre Codespaces / otro PC del lab con los comandos de arriba.  
3. Lleva anotados: rutas, `useState` ejemplo, un componente con props, y “package.json está en `frontend/`”.
