import mongoose from 'mongoose';
import { ESTADOS_PERIODO } from '../constants/enums.js';
import { toJSONPlugin } from '../utils/toJSONPlugin.js';

// Las fechas se guardan como texto "YYYY-MM-DD" (igual que en el contrato). Así se comparan como texto
// ("2026-03-10" < "2026-03-21") y no hay líos de zona horaria al guardar.
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const fecha = (nombre) => ({
  type: String,
  required: [true, `Falta la fecha ${nombre}.`],
  match: [FECHA, `La fecha ${nombre} debe tener el formato AAAA-MM-DD.`],
});

export const esquemaPeriodo = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'Falta el código del período.'],
      unique: true,
      trim: true,
      match: [/^\d{4}-[12]$/, 'El código debe tener el formato AAAA-S, por ejemplo 2026-1.'],
    },
    nombre: { type: String, required: [true, 'Falta el nombre del período.'], trim: true },
    inicio: fecha('de inicio'),
    termino: fecha('de término'),
    inscripcionInicio: fecha('de apertura de inscripción'),
    inscripcionTermino: fecha('de cierre de inscripción'),
    estado: {
      type: String,
      enum: Object.values(ESTADOS_PERIODO),
      default: ESTADOS_PERIODO.PLANIFICACION,
    },
  },
  { collection: 'periodos', timestamps: true },
);

// D-02: fechas coherentes. Cada mensaje dice qué fecha está mal.
esquemaPeriodo.pre('validate', function revisarFechas() {
  const { inicio, termino, inscripcionInicio, inscripcionTermino } = this;
  if (!inicio || !termino || !inscripcionInicio || !inscripcionTermino) return;

  if (inicio >= termino) {
    this.invalidate('termino', `El término (${termino}) debe ser después del inicio (${inicio}).`);
  }
  if (inscripcionInicio > inscripcionTermino) {
    this.invalidate('inscripcionTermino', `El cierre de inscripción (${inscripcionTermino}) no puede ser antes de la apertura (${inscripcionInicio}).`);
  }
  if (inscripcionTermino > termino) {
    this.invalidate('inscripcionTermino', `El cierre de inscripción (${inscripcionTermino}) no puede ser después del término del semestre (${termino}).`);
  }
});

// D-03: solo un período "en_curso" a la vez. Lo garantiza la base de datos, no un find previo.
esquemaPeriodo.index(
  { estado: 1 },
  { unique: true, partialFilterExpression: { estado: ESTADOS_PERIODO.EN_CURSO }, name: 'un_solo_en_curso' },
);

esquemaPeriodo.plugin(toJSONPlugin);

export const Periodo = mongoose.models.Periodo ?? mongoose.model('Periodo', esquemaPeriodo);
