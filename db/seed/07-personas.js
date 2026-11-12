import { createRequire } from 'node:module';
import { Usuario } from '../../backend/src/models/usuario.model.js';

const require = createRequire(import.meta.url);
const { crearAzar } = require('./lib/azar.js');
const { generarDocentes, generarEstudiantes } = require('./lib/personas.js');
const { ALUMNOS_DEMO } = require('./lib/demo.js');

// Contraseña solo de desarrollo, compartida por todas las personas generadas (docentes, estudiantes y demo).
// Está repetida en db/README.md. No uses estas cuentas fuera de local.
export const CLAVE_PERSONAS_DESARROLLO = 'Clave-Dev-Persona-2026';

const INCORPORACION_DOCENTES = '2024-03-01';

/** Los generadores usan nombres/apellidos/email; el modelo Usuario pide nombre, correo e incorporación. */
export function aUsuario({ nombres, apellidos, email, clave, regla, matricula, aprobadas, intenta, ...resto }, passwordHash) {
  const año = resto.perfilEstudiante?.codigoEstudiante?.slice(4, 8);
  return {
    ...resto,
    nombre: `${nombres} ${apellidos}`,
    correo: email,
    passwordHash,
    debeCambiarClave: false,
    incorporacion: año ? `${año}-03-01` : INCORPORACION_DOCENTES,
  };
}

async function hashCompartido() {
  // Un solo hash para las ~226 personas: bcrypt con costo 12 tarda; hacerlo por persona alarga la semilla minutos.
  const existente = await Usuario.findOne({ correo: ALUMNOS_DEMO[0].email }).select('+passwordHash');
  if (existente?.passwordHash) return existente.passwordHash;
  const temporal = new Usuario();
  await temporal.fijarClave(CLAVE_PERSONAS_DESARROLLO);
  return temporal.passwordHash;
}

export default async function sembrarPersonas({ upsertPorClave, log }) {
  await Usuario.init();
  const passwordHash = await hashCompartido();

  const azar = crearAzar(2026);
  const personas = [...generarDocentes(20, azar), ...generarEstudiantes(200, azar), ...ALUMNOS_DEMO];

  for (const persona of personas) {
    // Clave natural por RUT para mantener idempotencia incluso si cambia el correo.
    await upsertPorClave(Usuario, { rut: persona.rut }, aUsuario(persona, passwordHash));
  }
  log(`07-personas: ${personas.length} registros procesados (docentes, estudiantes y demo).`);
}
