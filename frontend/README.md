# SGA · Frontend (prototipo)

Solo frontend, en `localhost`, con datos mock (sin API, base de datos ni persistencia: al recargar vuelve el seed).
Stack y reglas visuales: [`../system-desing.md`](../system-desing.md) (React 18 + TypeScript + Mantine v7).

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # reglas de matrícula (vitest)
```

## Pantalla `/matricula` (RF6 / CU5)

Solo el perfil **Coordinador académico**. Desde el menú de usuario (arriba a la derecha) se puede cambiar de perfil para
probar el control de acceso: el Estudiante ve «No tienes acceso a esta sección».

- Alta en Drawer: estudiante (mock de personas) + carrera + plan de esa carrera + período.
- Una sola matrícula `vigente` por estudiante y período: el segundo intento se bloquea con un error claro y no duplica.
  Otro período sí lo permite; una matrícula suspendida, egresada o retirada no bloquea.
- Estados `vigente | suspendida | egresada | retirada`. Desde la lista: Suspender, Egresar, Retirar (con confirmación).
  No hay borrado. `egresada` y `retirada` son finales; `suspendida` solo puede pasar a `retirada`.

Las reglas viven en `src/features/matricula/rules.ts` (funciones puras, con tests); la UI las consume.
