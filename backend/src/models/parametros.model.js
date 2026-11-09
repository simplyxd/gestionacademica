import mongoose from 'mongoose';

// Un solo documento de parámetros. La clave fija e única impide que existan dos.
export const CLAVE_PARAMETROS = 'institucional';

const esquema = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true, default: CLAVE_PARAMETROS },
    nombreInstitucion: { type: String, required: true, trim: true, maxlength: 160 },
    nombreCorto: { type: String, required: true, trim: true, maxlength: 40 },
    siglasPortal: { type: String, required: true, trim: true, maxlength: 20 },
    correoContacto: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    telefonoMesa: { type: String, required: true, trim: true, maxlength: 30 },
    zonaHoraria: { type: String, required: true, trim: true, maxlength: 64 },
    mensajeBienvenida: { type: String, required: true, trim: true, maxlength: 500 },
    duracionSesionMinutos: { type: Number, required: true, min: 5, max: 720 },
    permitirRecuperacionClave: { type: Boolean, required: true },
    mostrarCodigoAsignaturaEnTablas: { type: Boolean, required: true },
  },
  { timestamps: true, collection: 'parametros' },
);

export const Parametros = mongoose.model('Parametros', esquema);
