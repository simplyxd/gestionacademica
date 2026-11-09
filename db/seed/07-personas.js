import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { crearAzar } = require('./lib/azar.js');
const { generarDocentes, generarEstudiantes } = require('./lib/personas.js');
const { ALUMNOS_DEMO } = require('./lib/demo.js');

const CAMPOS_COMPATIBLES = new Set([
  'rut',
  'nombres',
  'apellidos',
  'email',
  'telefono',
  'rol',
  'estado',
  'perfilDocente',
  'perfilEstudiante',
]);

async function cargarModeloUsuario() {
  try {
    const modulo = await import('../../backend/src/models/usuario.model.js');
    return modulo.default ?? modulo.Usuario ?? null;
  } catch {
    return null;
  }
}

function camposRequeridosNoCompatibles(Modelo) {
  const requeridos = Modelo?.schema?.requiredPaths?.() ?? [];
  return requeridos.filter((campo) => !CAMPOS_COMPATIBLES.has(campo));
}

export default async function sembrarPersonas({ upsertPorClave, log }) {
  const Usuario = await cargarModeloUsuario();
  if (!Usuario) {
    log('07-personas: omitida (falta backend/src/models/usuario.model.js; depende de Endert).');
    return;
  }

  const faltantes = camposRequeridosNoCompatibles(Usuario);
  if (faltantes.length > 0) {
    log(`07-personas: omitida (el modelo Usuario exige campos fuera del contrato actual: ${faltantes.join(', ')}).`);
    return;
  }

  const azar = crearAzar(2026);
  const personas = [...generarDocentes(20, azar), ...generarEstudiantes(200, azar), ...ALUMNOS_DEMO];

  for (const persona of personas) {
    // Clave natural por RUT para mantener idempotencia incluso si cambia el correo.
    await upsertPorClave(Usuario, { rut: persona.rut }, persona);
  }
  log(`07-personas: ${personas.length} registros procesados (docentes, estudiantes y demo).`);
}
