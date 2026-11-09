import mongoose from 'mongoose';

// Referencia a otra colección por clave natural (el código de la sede), nunca por un ObjectId escrito a mano.
export default async function sembrar({ upsertPorClave, resolver }) {
  const Sede = mongoose.model('SedeDeSemilla');
  const Carrera = mongoose.model('CarreraDeSemilla');
  const sede = await resolver(Sede, { codigo: 'SCL' });
  await upsertPorClave(Carrera, { codigo: 'INF' }, { nombre: 'Informática', sede });
}
