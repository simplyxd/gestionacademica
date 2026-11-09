import { PERMISOS } from '../config/permisos.js';
import { envolver } from '../utils/respuesta.js';

// La matriz es la de config/permisos.js. Este controlador no decide quién puede qué.

export function listarPermisos(req, res) {
  res.status(200).json(envolver(PERMISOS));
}
