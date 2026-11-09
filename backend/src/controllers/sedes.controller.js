import * as servicio from '../services/sedes.service.js';

// El controlador solo traduce HTTP: toma lo validado (req.datos) y la identidad del token (req.user),
// llama al servicio y responde. Cero reglas de negocio aquí.
const http = (accion, status = 200) => async (req, res, next) => {
  try {
    res.status(status).json(await accion(req));
  } catch (error) {
    next(error);
  }
};

export const listar = http((req) => servicio.listar(req.user, req.datos.query));
export const obtener = http((req) => servicio.obtener(req.user, req.datos.params.id));
export const crear = http((req) => servicio.crear(req.user, req.datos.body), 201);
export const actualizar = http((req) => servicio.actualizar(req.user, req.datos.params.id, req.datos.body));
export const cambiarEstado = http((req) => servicio.cambiarEstado(req.user, req.datos.params.id, req.datos.body.estado));
