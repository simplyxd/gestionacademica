import mongoose from 'mongoose';
import { ESTADOS_PERIODO } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { GEN } from '../errors/codigos/general.js';
import { PER } from '../errors/codigos/periodos.js';
import { Periodo } from '../models/periodo.model.js';

const { PLANIFICACION, INSCRIPCION_ABIERTA, EN_CURSO, CERRADO } = ESTADOS_PERIODO;

// D-04: los estados solo avanzan, nunca retroceden.
export const TRANSICIONES = Object.freeze({
  [PLANIFICACION]: [INSCRIPCION_ABIERTA],
  [INSCRIPCION_ABIERTA]: [EN_CURSO],
  [EN_CURSO]: [CERRADO],
  [CERRADO]: [],
});

const CAMPOS_EDITABLES = ['nombre', 'inicio', 'termino', 'inscripcionInicio', 'inscripcionTermino'];

/**
 * D-05: "hoy" según la hora de Chile, como texto AAAA-MM-DD.
 * Se puede pasar otra fecha para los tests.
 */
export function hoyEnSantiago(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(ahora);
}

/** La ventana es inclusiva: el primer y el último día cuentan como abiertos. */
export function ventanaAbierta(periodo, hoy) {
  return periodo.estado === INSCRIPCION_ABIERTA && periodo.inscripcionInicio <= hoy && hoy <= periodo.inscripcionTermino;
}

async function buscar(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, GEN.ID_INVALIDO, 'El identificador del período no es válido.');
  const periodo = await Periodo.findById(id);
  if (!periodo) throw new AppError(404, PER.NO_ENCONTRADO, 'No existe ese período.');
  return periodo;
}

export async function listar() {
  return Periodo.find().sort({ codigo: -1 });
}

/** D-06: el actual es el que tiene la inscripción abierta; si no hay, el que está en curso. */
export async function actual() {
  const periodo =
    (await Periodo.findOne({ estado: INSCRIPCION_ABIERTA }).sort({ codigo: -1 })) ??
    (await Periodo.findOne({ estado: EN_CURSO }));
  if (!periodo) throw new AppError(404, PER.SIN_PERIODO_ACTUAL, 'No hay ningún período con inscripción abierta ni en curso.');
  return periodo;
}

export async function crear(datos) {
  const limpio = Object.fromEntries(CAMPOS_EDITABLES.concat('codigo').map((c) => [c, datos[c]]));
  return Periodo.create(limpio); // siempre parte en planificacion
}

export async function actualizar(id, datos) {
  const periodo = await buscar(id);
  if (periodo.estado === CERRADO) {
    throw new AppError(409, PER.CERRADO, `El período ${periodo.codigo} está cerrado y ya no se puede editar.`);
  }
  for (const campo of CAMPOS_EDITABLES) {
    if (datos[campo] !== undefined) periodo[campo] = datos[campo];
  }
  return periodo.save();
}

export async function cambiarEstado(id, nuevo) {
  const periodo = await buscar(id);
  const permitidos = TRANSICIONES[periodo.estado];

  if (!permitidos.includes(nuevo)) {
    throw new AppError(
      409,
      PER.TRANSICION_INVALIDA,
      `El período ${periodo.codigo} está en "${periodo.estado}" y no puede pasar a "${nuevo}". ` +
        (permitidos.length ? `Solo puede pasar a: ${permitidos.join(', ')}.` : 'Ya no cambia más.'),
      { details: { actual: periodo.estado, permitidos } },
    );
  }

  periodo.estado = nuevo;
  try {
    return await periodo.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(409, PER.YA_HAY_EN_CURSO, 'Ya hay otro período en curso. Ciérralo antes de iniciar este.');
    }
    throw error;
  }
}
