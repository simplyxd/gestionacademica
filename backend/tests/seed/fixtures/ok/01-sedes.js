import mongoose from 'mongoose';

export default async function sembrar({ upsertPorClave, log }) {
  const Sede = mongoose.model('SedeDeSemilla');
  await upsertPorClave(Sede, { codigo: 'SCL' }, { nombre: 'Santiago', estado: 'activa' });
  await upsertPorClave(Sede, { codigo: 'VLP' }, { nombre: 'Valparaíso', estado: 'activa' });
  log('sedes listas');
}
