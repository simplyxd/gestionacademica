import { CLAVE_PARAMETROS, Parametros } from '../../backend/src/models/parametros.model.js';
import { Usuario } from '../../backend/src/models/usuario.model.js';

// db/ no tiene node_modules propio: no se importan paquetes (bcryptjs, mongoose) directamente.
// El hash sale de Usuario#fijarClave y la conexión de Usuario.db, que resuelven desde backend/.

// Contraseñas solo de desarrollo. Están repetidas en db/README.md. No uses estas cuentas fuera de local.
export const CLAVE_ADMIN_DESARROLLO = 'Clave-Dev-Admin-2026';
export const CLAVE_COORDINADOR_DESARROLLO = 'Clave-Dev-Coord-2026';
export const CLAVE_DOCENTE_DESARROLLO = 'Clave-Dev-Docente-2026';

const PARAMETROS_POR_DEFECTO = {
  clave: CLAVE_PARAMETROS,
  nombreInstitucion: 'Instituto Universitario Nueva Formación',
  nombreCorto: 'IUNF',
  siglasPortal: 'SGA',
  correoContacto: 'mesa.ayuda@iunf.cl',
  telefonoMesa: '+56 2 2345 6789',
  zonaHoraria: 'America/Santiago',
  mensajeBienvenida: 'Bienvenido al portal académico. Ante dudas de matrícula o inscripción, contacta a la mesa de ayuda.',
  duracionSesionMinutos: 45,
  permitirRecuperacionClave: true,
  mostrarCodigoAsignaturaEnTablas: true,
};

const CUENTAS = [
  {
    rut: '12345678-5',
    nombre: 'Camila Soto',
    correo: 'admin@iunf.cl',
    telefono: '+56 9 5555 0101',
    rol: 'admin',
    sedes: [],
    incorporacion: '2024-03-01',
    clave: CLAVE_ADMIN_DESARROLLO,
  },
  {
    rut: '11111111-1',
    nombre: 'Tomás Rojas',
    correo: 'coordinador@iunf.cl',
    telefono: '+56 9 5555 0102',
    rol: 'coordinador',
    sedesCodigos: ['central', 'norte'],
    incorporacion: '2024-03-01',
    clave: CLAVE_COORDINADOR_DESARROLLO,
  },
  {
    rut: '16666666-K',
    nombre: 'Elena Vargas',
    correo: 'docente@iunf.cl',
    telefono: '+56 9 5555 0103',
    rol: 'docente',
    sedesCodigos: ['central'],
    incorporacion: '2024-03-01',
    clave: CLAVE_DOCENTE_DESARROLLO,
    perfilDocente: { especialidad: 'Informática', tipoVinculo: 'planta', departamentos: ['Computación'] },
  },
];

const SEDES_DEL_COORDINADOR = [
  { codigo: 'central', nombre: 'Sede Central' },
  { codigo: 'norte', nombre: 'Sede Norte' },
];

/** Asegura la sede por código y devuelve su _id, sin registrar el modelo de Lorenzo. */
async function idDeSede(codigo, nombre) {
  const crudo = await Usuario.db.collection('sedes').findOneAndUpdate(
    { codigo },
    { $setOnInsert: { codigo, nombre, estado: 'activa' } },
    { upsert: true, returnDocument: 'after' },
  );
  const documento = crudo?.value ?? crudo;
  if (!documento?._id) throw new Error(`No se pudo asegurar la sede ${codigo}`);
  return documento._id;
}

async function hashSiNoExiste(correo, clave) {
  const existente = await Usuario.findOne({ correo }).select('+passwordHash');
  if (existente?.passwordHash) return existente.passwordHash;
  const temporal = new Usuario();
  await temporal.fijarClave(clave);
  return temporal.passwordHash;
}

export default async function sembrar({ upsertPorClave, log }) {
  await upsertPorClave(Parametros, { clave: CLAVE_PARAMETROS }, PARAMETROS_POR_DEFECTO);

  const sedes = {};
  for (const sede of SEDES_DEL_COORDINADOR) {
    sedes[sede.codigo] = await idDeSede(sede.codigo, sede.nombre);
  }

  for (const cuenta of CUENTAS) {
    const { clave, sedesCodigos, ...datos } = cuenta;
    const passwordHash = await hashSiNoExiste(datos.correo, clave);
    await upsertPorClave(Usuario, { rut: datos.rut }, {
      ...datos,
      passwordHash,
      estado: 'activo',
      debeCambiarClave: false,
      sedes: (sedesCodigos ?? []).map((codigo) => sedes[codigo]),
    });
  }

  log('parámetros, admin y coordinador listos');
}
