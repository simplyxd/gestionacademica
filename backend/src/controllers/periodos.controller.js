import { listar } from '../services/periodos.service.js';
import { envolverLista } from '../utils/respuesta.js';

export async function listarPeriodos(_req, res, next) {
  try {
    const periodos = await listar();
    const data = periodos.map((periodo) => periodo.toJSON());
    res.json(envolverLista(data, { page: 1, limit: Math.max(data.length, 1), total: data.length }));
  } catch (error) {
    next(error);
  }
}
