# Archivos de código de Matias (rama `matias-branch`)

Mapa simple de qué hace cada archivo y **dónde está cada regla**.

## Cómo encaja todo

```
modelo (cómo se guarda)  →  servicio (las reglas)  →  controlador y ruta (todavía no; falta authenticate de Endert)
```

- El **modelo** define los campos y lo que la base de datos no deja romper (por ejemplo, duplicados).
- El **servicio** tiene la lógica: qué se permite y qué no.
- Los **tests** prueban que cada regla funcione.

---

## 1. Períodos

### `backend/src/models/periodo.model.js` — el modelo del período
Campos: `codigo` (ej. `2026-2`), `nombre`, `inicio`, `termino`, `inscripcionInicio`, `inscripcionTermino` y `estado`.

Reglas que están aquí:
| Regla | Dónde |
|---|---|
| El código tiene que ser `AAAA-1` o `AAAA-2` | campo `codigo` (`match`) |
| El código no se repite | campo `codigo` (`unique: true`) |
| El término es después del inicio | `pre('validate')` → `revisarFechas` |
| El cierre de la inscripción no es antes de la apertura | `revisarFechas` |
| La inscripción no cierra después del término del semestre | `revisarFechas` |
| Solo un período `en_curso` a la vez | índice `un_solo_en_curso` |

### `backend/src/services/periodos.service.js` — la lógica de períodos
| Función | Qué hace |
|---|---|
| `TRANSICIONES` | El orden de los estados: `planificacion → inscripcion_abierta → en_curso → cerrado`. No se retrocede. |
| `hoyEnSantiago()` | La fecha de hoy en hora de Chile. |
| `ventanaAbierta()` | Dice si hoy se puede inscribir. Cuentan el primer y el último día. |
| `listar()` | Todos los períodos. |
| `actual()` | El período actual: el de inscripción abierta o, si no hay, el que está en curso. |
| `crear()` | Crea un período. Siempre parte en `planificacion`. |
| `actualizar()` | Edita un período. Si está `cerrado`, no se puede. |
| `cambiarEstado()` | Cambia el estado. Si no sigue el orden, da error 409. |

### `backend/src/errors/codigos/periodos.js` — los códigos de error de períodos
`PER_NO_ENCONTRADO`, `PER_SIN_PERIODO_ACTUAL`, `PER_TRANSICION_INVALIDA`, `PER_CERRADO` y `PER_YA_HAY_EN_CURSO`.

### `db/seed/06-periodos.js` — datos de ejemplo
Crea 2 períodos con fechas calculadas desde hoy: uno `en_curso` y otro con la inscripción abierta.

---

## 2. Inscripciones

### `backend/src/models/inscripcion.model.js` — el modelo de la inscripción
Campos: `estudianteId`, `seccionId`, `periodoId`, `matriculaId`, `estado` (`activa` o `anulada`), `fechaInscripcion`, `fechaAnulacion` y `motivo`.

| Regla | Dónde |
|---|---|
| Un alumno no puede tener 2 inscripciones activas en la misma sección (evita el doble clic) | índice `una_activa_por_seccion` |
| Después de anular se puede volver a inscribir | el mismo índice cuenta solo las `activa` |
| El motivo de anulación solo puede ser `estudiante` o `seccion_cancelada` | `MOTIVOS_ANULACION` y el campo `motivo` |

### `backend/src/services/reglasInscripcion.js` — ⭐ las 7 reglas de inscripción
**Aquí está lo más importante de la tarea.** Cada regla es una función que recibe los datos y responde `ok` o un error con su mensaje.

| # | Regla | Función | Código de error |
|---|---|---|---|
| 1 | Matrícula vigente en el período | `reglaMatricula` | `INS_MATRICULA_NO_VIGENTE` |
| 2 | Ventana de inscripción abierta | `reglaVentana` | `INS_FUERA_DE_VENTANA` |
| 3 | Hay cupo en la sección | `reglaCupo` | `INS_SIN_CUPO` |
| 4 | La asignatura es de tu plan | `reglaPlan` | `INS_ASIGNATURA_FUERA_DE_PLAN` |
| 5 | Tienes aprobados los prerrequisitos | `reglaPrerrequisitos` | `INS_PREREQUISITO_PENDIENTE` |
| 6 | No la aprobaste antes | `reglaYaAprobada` | `INS_YA_APROBADA` |
| 7 | No choca con tu horario | `reglaHorario` | `INS_CHOQUE_HORARIO` |

Otras funciones del mismo archivo:
- `bloquesChocan(a, b)`: revisa si dos bloques horarios se pisan. Si una clase termina a las 10:00 y otra parte a las 10:00, **no** chocan.
- `REGLAS`: la lista de las 7 reglas en orden.
- `evaluarReglas(ctx)`: corre las 7 y devuelve **todas** las que fallan, de la 1 a la 7.

### `backend/src/services/inscripciones.service.js` — acciones sobre inscripciones
| Función | Qué hace |
|---|---|
| `anularPorCancelacion(seccionId, sesion)` | Cuando Diego cancela una sección, anula sus inscripciones activas con motivo `seccion_cancelada`. No las borra. |

(Aquí van a ir `inscribir` y `anular` cuando estén los modelos de Diego y Angel.)

### `backend/src/errors/codigos/inscripciones.js` — los códigos de error de inscripción
Los 7 de las reglas, más `INS_NO_ENCONTRADA`, `INS_YA_INSCRITA`, `INS_YA_ANULADA` e `INS_PERIODO_CERRADO`.

---

## 3. Tests (`backend/tests/inscripcion/`)

| Archivo | Qué prueba |
|---|---|
| `periodo.model.test.js` | Fechas, formato del código, que no haya duplicados ni 2 períodos en curso |
| `periodos.service.test.js` | Hoy en hora de Chile, el borde de la ventana, el orden de los estados y el período actual |
| `reglas.test.js` | Cada una de las 7 reglas, con casos felices y bordes (cupo justo lleno, último día, bloques contiguos) |
| `inscripcion.model.test.js` | Sin doble inscripción, y que se pueda volver a inscribir después de anular |
| `anularPorCancelacion.test.js` | Que se anule con motivo, sin borrar nada, y que se deshaga si la transacción falla |

Para correrlos:

```powershell
cd backend
npm.cmd test
```

## 5. Demo en la terminal (sin servidor)

Con las otras ramas ya integradas en `pre-main`, puedes **demostrar las 7 reglas** así:

```powershell
cd backend
npm.cmd run demo:reglas
```

Eso imprime el caso feliz y cada regla fallando con su mensaje (matrícula, ventana, cupo, plan, prerrequisito, ya aprobada, choque). También un borde: bloques contiguos que **no** chocan.

Archivo del script: `backend/scripts/demo-reglas.js`.

---

## 4. Lo que vino de Juan (no es tuyo)

Todo lo demás de `backend/` es la base que dejó Juan: errores (`AppError`), transacciones, seed, validación y helpers de tests. Se usa, pero no se modifica.
