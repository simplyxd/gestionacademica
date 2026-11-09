import { envolver, envolverLista } from '../utils/respuesta.js';
import { listar, cambiarEstado } from '../services/matriculas.service.js';

export async function listarMatriculas(req, res) {
  const { data, meta } = await listar(req.datos?.query ?? req.query);
  res.json(envolverLista(data, meta));
}

export async function actualizarEstadoMatricula(req, res) {
  const matricula = await cambiarEstado(req.params.id, req.body.estado);
  res.json(envolver(matricula));
}
