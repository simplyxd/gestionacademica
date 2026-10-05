# SGA · Administración de usuarios

Frontend local de RF1. React 18, Mantine 7 y tokens de [`system-desing.md`](../system-desing.md).

```sh
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173/admin/usuarios`.

El mock vive en la memoria de cada pestaña. Crear agrega una cuenta; editar actualiza su ID; desactivar conserva el registro como inactivo. Un evento `usuarios:changed` notifica a las vistas, que se suscriben con `useSyncExternalStore`. Recargar reinicia los datos. Los filtros combinan valores con OR dentro del filtro y filtros con AND; vaciar un filtro incluye todos sus valores.

La sesión mock comienza como Administrador. Para comprobar el acceso de otro perfil:

```sh
VITE_MOCK_ROLE=docente npm run dev -- --port 5174
```

`http://localhost:5174/admin/usuarios` muestra «Acceso restringido». También se admiten `coordinador` y `estudiante`. Un rol desconocido no tiene acceso. Las operaciones sobre el mock verifican el rol antes de modificarlo.

Verificación (Node 22.18+ para ejecutar TypeScript directamente):

```sh
npm test
npm run build
```

El check cubre permisos, límites por rol, validación, filtros, creación, edición, eventos y baja lógica. Datos y fuentes están en el cliente; los cambios y el tema visual no se guardan en el navegador.
