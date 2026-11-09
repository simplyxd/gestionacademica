# Base de datos y seed

Aquí viven los **datos de ejemplo** del sistema (el seed) y las instrucciones para cargarlos. Sirven para usar la app y para la demo: **los tests automáticos no dependen de ellos** (cada test crea sus propios datos en una base temporal).

## Cómo cargar los datos

Desde `backend/`, con el `.env` configurado (ver `backend/README.md`) y MongoDB encendido:

```bash
cd backend
npm run seed
```

- Ejecuta los archivos `db/seed/NN-nombre.js` **en orden numérico**.
- Es **idempotente**: se puede correr las veces que quieras; no duplica nada (actualiza lo que ya existe).
- Si un archivo falla, se detiene en ese, dice cuál y por qué. Lo anterior queda hecho; corrige y vuelve a correr.
- Usa la base de `MONGO_URI`. Mira bien a cuál apunta antes de correrlo.

### Empezar de cero

```bash
npm run seed -- --reset
```

**Borra toda la base** y la vuelve a sembrar. Pregunta antes (`s/n`) mostrando qué base y qué servidor va a borrar. Se niega con `NODE_ENV=production` y si no hay una terminal donde preguntar.

## Qué datos deja

Mínimo previsto para poder demostrar las reglas de inscripción: 3 sedes, 4 carreras, 2 planes, 40 asignaturas, 20 docentes, 200 alumnos, 2 períodos y el historial de asignaturas aprobadas (sin eso no se demuestran los prerrequisitos ni «ya aprobada»).

| Archivo | Contenido | Dueño |
|---|---|---|
| `01-parametros-usuarios.js` | Parámetros institucionales y usuarios | Endert |
| `02-sedes.js` | Sedes | Lorenzo |
| `03-asignaturas.js` | Asignaturas | Lorenzo |
| `04-carreras.js` | Carreras | Lorenzo |
| `05-planes.js` | Planes de estudio y prerrequisitos | Lorenzo |
| `06-periodos.js` | Períodos académicos | Matias |
| `07-personas.js` | Docentes y estudiantes | Angel |
| `08-matriculas.js` | Matrículas y historial de aprobadas | Angel |
| `09-secciones.js` | Secciones y horarios | Diego |
| `10-inscripciones.js` | Inscripciones | Matias |

## Cómo escribir tu archivo de semilla

Un archivo exporta por defecto una función `async` que recibe `{ upsertPorClave, resolver, log }`. Importa el **modelo** de tu dominio con ruta relativa:

```js
// db/seed/02-sedes.js
import { Sede } from '../../backend/src/models/sede.model.js';

export default async function sembrar({ upsertPorClave, log }) {
  await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });
  await upsertPorClave(Sede, { codigo: 'VLP' }, { nombre: 'Valparaíso', estado: 'activa' });
  log('sedes listas');
}
```

```js
// db/seed/04-carreras.js: referencia otra colección por su clave natural
import { Carrera } from '../../backend/src/models/carrera.model.js';
import { Sede } from '../../backend/src/models/sede.model.js';

export default async function sembrar({ upsertPorClave, resolver }) {
  const sede = await resolver(Sede, { codigo: 'SCL' }); // devuelve el _id
  await upsertPorClave(Carrera, { codigo: 'INF' }, { nombre: 'Informática', sede });
}
```

### Reglas

- **`upsertPorClave(Modelo, clave, datos)`**: actualiza si existe, inserta si no. La clave es un objeto con campos reales (`{ codigo }`, `{ rut }`, `{ correo }`). Una clave vacía se rechaza.
- **`resolver(Modelo, clave)`**: devuelve el `_id` del registro. Falla si no existe (¿su archivo tiene un número menor?) o si hay más de uno.
- **Nunca** escribas un `ObjectId` a mano ni uses `deleteMany`: los ids cambian en cada base y el seed no debe borrar datos.
- Referencia las colecciones por **clave natural** (código, RUT, correo).
- El número del archivo es único (dos archivos con `04-` se rechazan). Un archivo puede usar lo creado por los de número menor.
- Los modelos pasan por sus validaciones, así que los datos de ejemplo deben ser válidos.
- Contraseñas de ejemplo: nunca reales, y siempre guardadas con hash (bcrypt, costo 12). No se escriben en los logs.

### Cuentas de desarrollo (semilla 01)

Solo para la base local. No son cuentas reales.

| Rol | Correo | Clave |
|---|---|---|
| admin | `admin@iunf.cl` | `Clave-Dev-Admin-2026` |
| coordinador | `coordinador@iunf.cl` | `Clave-Dev-Coord-2026` |

El coordinador queda en las sedes de código `central` y `norte`. La semilla 01 las asegura por ese código (upsert) para poder referenciarlas; la semilla 02 debe reutilizar los mismos códigos si quiere esas sedes.

## Generadores de Angel (`db/seed/lib/`)

`07-personas.js` y `08-matriculas.js` se ejecutan con **guardas de compatibilidad**: si falta el modelo de usuario o las colecciones
base de otros dominios (usuarios/carreras/planes/períodos), registran una omisión explícita y no rompen el seed completo.
En paralelo, se avanzó en utilidades y tests de consistencia:

| Archivo | Qué hace |
|---|---|
| `azar.js` | Pseudoaleatorio con semilla fija (reproducible) |
| `rut.js` | RUT chileno válido (módulo 11) |
| `personas.js` | 20 docentes y 200 estudiantes con RUT/correos únicos y perfil válido |
| `historial.js` | Genera y verifica historial coherente con prerrequisitos |
| `demo.js` | Casos reservados para demo de reglas de inscripción |

Los tests se corren desde `backend/` con `npm test` (incluye `db/seed/**/*.test.js`).
