import { estadoSalud } from '../services/health.service.js';

// El controlador solo traduce el resultado del servicio a HTTP: no decide reglas.
export function obtenerSalud(req, res) {
  const { sana, cuerpo } = estadoSalud();

  res.status(sana ? 200 : 503).json({ data: cuerpo });
}
