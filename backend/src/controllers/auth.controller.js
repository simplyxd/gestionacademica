import { cambiarClaveDeUsuario, iniciarSesion, perfilActual } from '../services/auth.service.js';
import { envolver } from '../utils/respuesta.js';

// Solo HTTP: lee la petición, llama al servicio y responde. Las reglas están en el servicio.

export async function login(req, res) {
  const sesion = await iniciarSesion({
    correo: req.datos.body.correo,
    password: req.datos.body.password,
    secreto: req.app.locals.jwtSecret,
  });
  res.status(200).json(envolver(sesion));
}

export async function obtenerPerfil(req, res) {
  const usuario = await perfilActual(req.user.id);
  res.status(200).json(envolver(usuario));
}

export async function cambiarClave(req, res) {
  await cambiarClaveDeUsuario({
    usuarioId: req.user.id,
    actual: req.datos.body.actual,
    nueva: req.datos.body.nueva,
  });
  res.status(200).json(envolver(null));
}
