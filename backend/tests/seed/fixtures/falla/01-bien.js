import mongoose from 'mongoose';

export default async function sembrar({ upsertPorClave }) {
  await upsertPorClave(mongoose.model('SedeDeSemilla'), { codigo: 'A1' }, { nombre: 'Sede A1', estado: 'activa' });
}
