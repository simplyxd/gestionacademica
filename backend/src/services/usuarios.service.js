// Acuerdo con Angel: el admin edita la cuenta (nombre, rut, correo, teléfono, rol, sedes, estado,
// incorporacion, clave); el coordinador editará el perfil académico (perfilDocente / perfilEstudiante).
// Este PR no implementa la edición del perfil.

import { randomInt } from 'node:crypto';
import { AppError } from '../errors/AppError.js';
import { USR } from '../errors/codigos/usuarios.js';
import { ESTADOS_USUARIO, ROLES } from '../constants/enums.js';
import { validarPerfilSegunRol } from '../models/perfiles.schemas.js';
import { Usuario } from '../models/usuario.model.js';
import { validarPoliticaClave } from './claves.js';
import { claveDeBloqueo, conTransaccion } from '../utils/transaccion.js';
import { paginar } from '../utils/paginar.js';
import { rutCanonico } from '../utils/rut.js';

// Una sola clave para todas las operaciones que pueden quitar al último admin activo.
// Dos transacciones con esta clave se turnan: la segunda reintenta, ve lo que guardó la primera y se rechaza.
const BLOQUEO_ADMINS = claveDeBloqueo('usuarios', 'admins-activos');

const CAMPOS_DE_CUENTA = ['nombre', 'rut', 'correo', 'telefono', 'rol', 'sedes', 'incorporacion'];
const CAMPOS_ORDENABLES = ['nombre', 'rut', 'correo', 'rol', 'estado', 'incorporacion'];

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const NUMEROS = '23456789';
const ALFABETO_CLAVE = LETRAS + NUMEROS;
const LARGO_CLAVE_TEMPORAL = 12;

function noEncontrado() {
  return new AppError(404, USR.NO_ENCONTRADO, 'No existe un usuario con ese identificador.');
}

function errorDeIndice(error) {
  if (error?.code === 11000) return error;
  if (error?.cause?.code === 11000) return error.cause;
  return null;
}

function campoDelIndice(error) {
  const claves = Object.keys(error.keyPattern ?? error.keyValue ?? {});
  if (claves[0]) return claves[0];
  const porNombre = /index:\s+([A-Za-z0-9_.]+)_1\b/.exec(error.message ?? '');
  return porNombre?.[1] ?? '';
}

/**
 * Traduce el 11000 del índice único. No consulta antes si el RUT o el correo existen:
 * el índice es quien rechaza, y aquí solo se cambia el error por un 409 que nombra el campo
 * sin repetir el valor (ese valor es el de otra persona).
 */
function traducirDuplicado(error) {
  const indice = errorDeIndice(error);
  if (!indice) return null;

  const campo = campoDelIndice(indice);
  if (campo === 'rut') {
    return new AppError(409, USR.RUT_DUPLICADO, 'Ya existe un usuario con ese RUT.', { details: { campo: 'rut' } });
  }
  if (campo === 'correo') {
    return new AppError(409, USR.CORREO_DUPLICADO, 'Ya existe un usuario con ese correo.', { details: { campo: 'correo' } });
  }
  return null;
}

async function guardar(usuario, sesion) {
  try {
    await (sesion ? usuario.save({ session: sesion }) : usuario.save());
  } catch (error) {
    const duplicado = traducirDuplicado(error);
    if (duplicado) throw duplicado;
    throw error;
  }
  return usuario;
}

async function buscarPorId(id, sesion) {
  const consulta = Usuario.findById(id);
  if (sesion) consulta.session(sesion);
  const usuario = await consulta;
  if (!usuario) throw noEncontrado();
  return usuario;
}

/**
 * Acepta lo que exponga el módulo de auth: lanzar, devolver un motivo, `false` o `{ ok: false }`.
 * `null` o `undefined` significan que la clave cumple.
 */
async function exigirClave(clave) {
  const resultado = await validarPoliticaClave(clave);
  if (resultado === false) {
    throw new AppError(400, USR.CLAVE_INVALIDA, 'La clave debe tener al menos 10 caracteres, una letra y un número.');
  }
  if (typeof resultado === 'string' && resultado.trim() !== '') {
    throw new AppError(400, USR.CLAVE_INVALIDA, resultado);
  }
  if (resultado && typeof resultado === 'object' && resultado.ok === false) {
    const mensaje = typeof resultado.message === 'string' && resultado.message.trim() !== ''
      ? resultado.message
      : 'La clave debe tener al menos 10 caracteres, una letra y un número.';
    throw new AppError(400, USR.CLAVE_INVALIDA, mensaje);
  }
}

function caracter(alfabeto) {
  return alfabeto[randomInt(alfabeto.length)];
}

/** 12 caracteres, con al menos una letra y un número: cumple el mínimo de la política de clave. */
function generarClaveTemporal() {
  const chars = [caracter(LETRAS), caracter(NUMEROS)];
  while (chars.length < LARGO_CLAVE_TEMPORAL) chars.push(caracter(ALFABETO_CLAVE));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const actual = chars[i];
    chars[i] = chars[j];
    chars[j] = actual;
  }
  return chars.join('');
}

function sedesDelActor(sedes) {
  if (Array.isArray(sedes)) return sedes;
  if (typeof sedes === 'string' && sedes !== '') return [sedes];
  return [];
}

/** Admin ve a todos. Coordinador solo docentes y estudiantes con al menos una sede en común. */
function filtroDeVisibilidad(actor) {
  if (actor?.rol === ROLES.ADMIN) return {};
  if (actor?.rol === ROLES.COORDINADOR) {
    return {
      rol: { $in: [ROLES.DOCENTE, ROLES.ESTUDIANTE] },
      sedes: { $in: sedesDelActor(actor.sedes) },
    };
  }
  return { _id: { $exists: false } };
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function condicionesDeBusqueda(q) {
  if (typeof q !== 'string') return null;
  const texto = q.trim();
  if (texto === '') return null;

  const patron = escaparRegex(texto);
  const condiciones = [
    { nombre: { $regex: patron, $options: 'i' } },
    { correo: { $regex: patron, $options: 'i' } },
    { rut: { $regex: patron, $options: 'i' } },
  ];
  const canonico = rutCanonico(texto);
  if (canonico && canonico !== texto) condiciones.push({ rut: canonico });
  return condiciones;
}

function armarFiltro(query, actor) {
  const visibilidad = filtroDeVisibilidad(actor);
  const filtro = {};

  if (visibilidad.rol) {
    const permitidos = visibilidad.rol.$in;
    if (query.rol && !permitidos.includes(query.rol)) filtro.rol = { $in: [] };
    else if (query.rol) filtro.rol = query.rol;
    else filtro.rol = visibilidad.rol;
  } else if (query.rol) {
    filtro.rol = query.rol;
  }

  if (visibilidad.sedes) filtro.sedes = visibilidad.sedes;
  if (visibilidad._id) filtro._id = visibilidad._id;
  if (query.estado) filtro.estado = query.estado;

  const busqueda = condicionesDeBusqueda(query.q);
  if (busqueda) filtro.$or = busqueda;
  return filtro;
}

function aplicarCuenta(usuario, cambios) {
  for (const campo of CAMPOS_DE_CUENTA) {
    if (cambios[campo] !== undefined) usuario[campo] = cambios[campo];
  }
}

function rechazarPerfilQueNoCalza(usuario) {
  const motivo = validarPerfilSegunRol({
    rol: usuario.rol,
    perfilDocente: usuario.perfilDocente ?? null,
    perfilEstudiante: usuario.perfilEstudiante ?? null,
  });
  if (motivo) throw new AppError(409, USR.ROL_NO_CALZA, motivo);
}

/**
 * El conteo va DESPUÉS de tomar el bloqueo y DENTRO de la transacción.
 * Un count y un update separados (cada uno en su petición, sin bloqueo) dejan pasar a las dos.
 */
async function exigirOtroAdminActivo(sesion, idExcluido) {
  const otros = await Usuario.countDocuments({
    _id: { $ne: idExcluido },
    rol: ROLES.ADMIN,
    estado: ESTADOS_USUARIO.ACTIVO,
  }).session(sesion);

  if (otros < 1) {
    throw new AppError(409, USR.ULTIMO_ADMIN, 'No se puede dejar el sistema sin un administrador activo.');
  }
}

function esLaMismaPersona(usuario, actor) {
  return String(usuario._id) === String(actor?.id);
}

export function listarUsuarios(query, actor) {
  return paginar(Usuario, armarFiltro(query, actor), query, {
    camposOrdenables: CAMPOS_ORDENABLES,
    ordenPorDefecto: 'nombre',
  });
}

export async function obtenerUsuario(id, actor) {
  const usuario = await Usuario.findOne({ _id: id, ...armarFiltro({}, actor) });
  if (!usuario) throw noEncontrado();
  return usuario;
}

export async function crearUsuario(datos) {
  await exigirClave(datos.clave);

  const usuario = new Usuario({
    rut: datos.rut,
    nombre: datos.nombre,
    correo: datos.correo,
    telefono: datos.telefono ?? '',
    rol: datos.rol,
    sedes: datos.sedes ?? [],
    incorporacion: datos.incorporacion,
  });
  await usuario.fijarClave(datos.clave);
  return guardar(usuario);
}

async function editarDentroDe(id, cambios, sesion) {
  const usuario = await buscarPorId(id, sesion);
  const eraAdminActivo = usuario.rol === ROLES.ADMIN && usuario.estado === ESTADOS_USUARIO.ACTIVO;

  aplicarCuenta(usuario, cambios);
  rechazarPerfilQueNoCalza(usuario);

  if (eraAdminActivo && usuario.rol !== ROLES.ADMIN) {
    await exigirOtroAdminActivo(sesion, usuario._id);
  }
  return guardar(usuario, sesion);
}

export function editarCuenta(id, cambios) {
  const puedeQuitarAlUltimoAdmin = cambios.rol !== undefined && cambios.rol !== ROLES.ADMIN;
  if (!puedeQuitarAlUltimoAdmin) return editarDentroDe(id, cambios);

  return conTransaccion((sesion) => editarDentroDe(id, cambios, sesion), { bloqueos: [BLOQUEO_ADMINS] });
}

export function cambiarEstado(id, estado, actor) {
  if (estado !== ESTADOS_USUARIO.INACTIVO) {
    return (async () => {
      const usuario = await buscarPorId(id);
      usuario.estado = estado;
      return guardar(usuario);
    })();
  }

  return conTransaccion(
    async (sesion) => {
      const usuario = await buscarPorId(id, sesion);
      if (actor?.rol === ROLES.ADMIN && esLaMismaPersona(usuario, actor)) {
        throw new AppError(409, USR.NO_AUTOBAJA, 'No puedes desactivar tu propia cuenta.');
      }
      if (usuario.rol === ROLES.ADMIN && usuario.estado === ESTADOS_USUARIO.ACTIVO) {
        await exigirOtroAdminActivo(sesion, usuario._id);
      }
      usuario.estado = estado;
      return guardar(usuario, sesion);
    },
    { bloqueos: [BLOQUEO_ADMINS] },
  );
}

export async function restablecerClave(id) {
  const usuario = await buscarPorId(id);
  const claveTemporal = generarClaveTemporal();
  await exigirClave(claveTemporal);

  usuario.debeCambiarClave = true;
  await usuario.fijarClave(claveTemporal);
  await guardar(usuario);
  return { claveTemporal };
}
