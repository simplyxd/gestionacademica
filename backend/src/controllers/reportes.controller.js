import * as servicio from '../services/reportes.service.js';

// Solo HTTP: los filtros validados y el usuario del token van al servicio, que arma la agregación.
const http = (accion) => async (req, res, next) => {
  try {
    res.json(await accion(req));
  } catch (error) {
    next(error);
  }
};

export const matriculas = http((req) => servicio.matriculas(req.user, req.datos.query));
export const estudiantes = http((req) => servicio.estudiantes(req.user, req.datos.query));
export const ocupacion = http((req) => servicio.ocupacion(req.user, req.datos.query));
export const cupos = http((req) => servicio.cupos(req.user, req.datos.query));
export const cargaDocente = http((req) => servicio.cargaDocente(req.user, req.datos.query));
