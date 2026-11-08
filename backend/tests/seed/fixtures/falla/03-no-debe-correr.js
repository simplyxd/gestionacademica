import mongoose from 'mongoose';

export default async function sembrar({ upsertPorClave }) {
  await upsertPorClave(mongoose.model('SedeDeSemilla'), { codigo: 'NOCORRE' }, { nombre: 'No debe existir', estado: 'activa' });
}
