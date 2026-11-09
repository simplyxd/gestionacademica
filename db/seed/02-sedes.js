// Seed de sedes (dueño: Lorenzo). Idempotente: se identifica cada sede por su nombre (clave natural).
// Una sede en mantenimiento para que la demo muestre los tres estados posibles en la UI.
import { Sede } from '../../backend/src/models/sede.model.js';

export const SEDES = [
  { nombre: 'Sede Central', direccion: 'Av. Libertador 4500', comuna: 'Santiago', estado: 'activa' },
  { nombre: 'Sede Norte', direccion: 'Camino Costero 800', comuna: 'Antofagasta', estado: 'activa' },
  { nombre: 'Sede Sur', direccion: 'Calle Prat 215', comuna: 'Concepción', estado: 'en_mantenimiento' },
];

export default async function sembrar({ upsertPorClave, log }) {
  await Sede.init(); // asegura el índice único antes de insertar
  for (const { nombre, ...datos } of SEDES) {
    await upsertPorClave(Sede, { nombre }, datos);
  }
  log(`${SEDES.length} sedes listas`);
}
