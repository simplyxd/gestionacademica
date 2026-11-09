import { horarioDelDocente, nominaDeSeccion, seccionesDelDocente } from '../services/docente.service.js';
import { envolver } from '../utils/respuesta.js';

// El id del docente es req.user.id, que deja authenticate a partir del token.
// Estas funciones no leen docenteId del body ni de la query.

export async function listarSecciones(req, res) {
  const secciones = await seccionesDelDocente(req.user.id, req.datos.query.periodoId);
  res.json(envolver(secciones));
}

export async function obtenerNomina(req, res) {
  const nomina = await nominaDeSeccion(req.user.id, req.datos.params.id);
  res.json(envolver(nomina));
}

export async function obtenerHorario(req, res) {
  const bloques = await horarioDelDocente(req.user.id, req.datos.query.periodoId);
  res.json(envolver(bloques));
}
