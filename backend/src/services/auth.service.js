import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUT } from '../errors/codigos/auth.js';
import { AppError } from '../errors/AppError.js';
import { ESTADOS_USUARIO } from '../constants/enums.js';
import { CLAVE_PARAMETROS, Parametros } from '../models/parametros.model.js';
import { Usuario } from '../models/usuario.model.js';
import { validarPoliticaClave } from './claves.js';

// D-05: correo inexistente, clave incorrecta y cuenta inactiva responden igual,
// para no revelar cuál de los tres falló. El límite de intentos queda pendiente con Juan.
const MENSAJE_CREDENCIALES = 'El correo o la clave no son correctos.';

// Hash bcrypt de relleno (costo 12). No es la clave de ninguna cuenta: solo hace que
// un correo inexistente tarde lo mismo que una clave incorrecta. No se registra.
const HASH_DE_RELLENO = '$2b$12$9dc9DxH4CZNr6SENZsk//efaruLLYIwoVDMIKhClciVoU6b35cUDi';

const DURACION_POR_DEFECTO_MINUTOS = 45;

async function minutosDeSesion() {
  const parametros = await Parametros.findOne({ clave: CLAVE_PARAMETROS });
  return parametros?.duracionSesionMinutos ?? DURACION_POR_DEFECTO_MINUTOS;
}

function firmar(usuario, secreto, minutos) {
  return jwt.sign(
    {
      sub: usuario.id,
      rol: usuario.rol,
      sedes: usuario.sedes.map((sede) => String(sede)),
    },
    secreto,
    { algorithm: 'HS256', expiresIn: minutos * 60 },
  );
}

function usuarioDeLogin(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.rol,
    sedes: usuario.sedes.map((sede) => String(sede)),
    debeCambiarClave: usuario.debeCambiarClave,
  };
}

/** Login. El secreto es el de la app (app.locals.jwtSecret); no hay otro. */
export async function iniciarSesion({ correo, password, secreto }) {
  const usuario = await Usuario.findOne({ correo }).select('+passwordHash');
  const hash = typeof usuario?.passwordHash === 'string' ? usuario.passwordHash : HASH_DE_RELLENO;
  const coincide = await bcrypt.compare(password, hash);
  const activo = usuario?.estado === ESTADOS_USUARIO.ACTIVO;

  if (!usuario || !activo || !coincide) {
    throw new AppError(401, AUT.CREDENCIALES_INVALIDAS, MENSAJE_CREDENCIALES);
  }

  const minutos = await minutosDeSesion();
  return { token: firmar(usuario, secreto, minutos), usuario: usuarioDeLogin(usuario) };
}

/** Perfil fresco para GET /me. toJSON ya omite passwordHash. */
export async function perfilActual(usuarioId) {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    throw new AppError(401, AUT.SESION_INVALIDA, 'Tu sesión no es válida. Inicia sesión de nuevo.');
  }
  if (usuario.estado !== ESTADOS_USUARIO.ACTIVO) {
    throw new AppError(401, AUT.CUENTA_INACTIVA, 'Tu cuenta está inactiva.');
  }
  return usuario.toJSON();
}

/** Cambia la clave de la persona autenticada. La identidad sale del token, nunca del body. */
export async function cambiarClaveDeUsuario({ usuarioId, actual, nueva }) {
  // La política no depende del hash guardado y el mensaje dice qué falta (D-07).
  const motivo = validarPoliticaClave(nueva);
  if (motivo) throw new AppError(400, AUT.POLITICA_CLAVE, motivo);

  const usuario = await Usuario.findById(usuarioId).select('+passwordHash');
  if (!usuario) {
    throw new AppError(401, AUT.SESION_INVALIDA, 'Tu sesión no es válida. Inicia sesión de nuevo.');
  }
  if (usuario.estado !== ESTADOS_USUARIO.ACTIVO) {
    throw new AppError(401, AUT.CUENTA_INACTIVA, 'Tu cuenta está inactiva.');
  }

  const coincide = await bcrypt.compare(actual, usuario.passwordHash);
  if (!coincide) {
    throw new AppError(401, AUT.CLAVE_ACTUAL_INCORRECTA, 'La clave actual no es correcta.');
  }

  await usuario.fijarClave(nueva);
  usuario.debeCambiarClave = false;
  await usuario.save();
}
