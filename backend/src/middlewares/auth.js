import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { rolPuede } from '../config/permisos.js';
import { AUT } from '../errors/codigos/auth.js';
import { AppError } from '../errors/AppError.js';
import { ESTADOS_USUARIO } from '../constants/enums.js';
import { Usuario } from '../models/usuario.model.js';

const BEARER = /^Bearer\s+(\S+)$/i;

function tokenDe(req) {
  const encabezado = req.get('authorization');
  const coincidencia = typeof encabezado === 'string' ? BEARER.exec(encabezado) : null;
  if (!coincidencia) {
    throw new AppError(401, AUT.TOKEN_AUSENTE, 'Debes iniciar sesión.');
  }
  return coincidencia[1];
}

/**
 * Valida firma y vigencia con req.app.locals.jwtSecret, recarga el usuario y
 * rechaza con 401 si no existe o está inactivo, aunque el JWT siga vigente (D-06).
 * req.user sale de ese usuario: { id, rol, sedes }. Nunca del body ni de los claims.
 */
export async function authenticate(req, _res, next) {
  try {
    const token = tokenDe(req);
    const secreto = req.app.locals.jwtSecret;
    const payload = jwt.verify(token, secreto, { algorithms: ['HS256'] });

    if (typeof payload?.sub !== 'string' || !mongoose.Types.ObjectId.isValid(payload.sub)) {
      throw new AppError(401, AUT.TOKEN_INVALIDO, 'Tu sesión no es válida. Inicia sesión de nuevo.');
    }

    const usuario = await Usuario.findById(payload.sub);
    if (!usuario) {
      throw new AppError(401, AUT.SESION_INVALIDA, 'Tu sesión no es válida. Inicia sesión de nuevo.');
    }
    if (usuario.estado !== ESTADOS_USUARIO.ACTIVO) {
      throw new AppError(401, AUT.CUENTA_INACTIVA, 'Tu cuenta está inactiva.');
    }

    req.user = {
      id: usuario.id,
      rol: usuario.rol,
      sedes: usuario.sedes.map((sede) => String(sede)),
    };
    next();
  } catch (error) {
    next(error);
  }
}

authenticate.esAutenticacion = true;

/** 403 si el rol recargado no tiene `permiso` en la matriz de config/permisos.js (D-09). */
export function authorize(permiso) {
  return function autorizar(req, _res, next) {
    if (!rolPuede(req.user?.rol, permiso)) {
      next(new AppError(403, AUT.SIN_PERMISO, 'Tu rol no tiene permiso para esta acción.'));
      return;
    }
    next();
  };
}
