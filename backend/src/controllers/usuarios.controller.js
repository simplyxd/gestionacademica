import {
  cambiarEstado as cambiarEstadoDeCuenta,
  crearUsuario,
  editarCuenta,
  listarUsuarios,
  obtenerUsuario,
  restablecerClave as generarClaveNueva,
} from '../services/usuarios.service.js';
import { envolver } from '../utils/respuesta.js';

// El controlador solo traduce HTTP. La identidad sale de req.user (authenticate), nunca del body.

export async function listar(req, res, next) {
  try {
    res.json(await listarUsuarios(req.datos.query, req.user));
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json(envolver(await obtenerUsuario(req.datos.params.id, req.user)));
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    res.status(200).json(envolver(await crearUsuario(req.datos.body)));
  } catch (error) {
    next(error);
  }
}

export async function editar(req, res, next) {
  try {
    res.json(envolver(await editarCuenta(req.datos.params.id, req.datos.body)));
  } catch (error) {
    next(error);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    const usuario = await cambiarEstadoDeCuenta(req.datos.params.id, req.datos.body.estado, req.user);
    res.json(envolver(usuario));
  } catch (error) {
    next(error);
  }
}

export async function restablecerClave(req, res, next) {
  try {
    const { claveTemporal } = await generarClaveNueva(req.datos.params.id);
    res.json(envolver({ claveTemporal }));
  } catch (error) {
    next(error);
  }
}
