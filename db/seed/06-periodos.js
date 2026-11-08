import { Periodo } from '../../backend/src/models/periodo.model.js';

// Dos períodos con fechas relativas a hoy, así la demo siempre tiene uno en curso y uno con inscripción abierta.
const DIA = 24 * 60 * 60 * 1000;
const enDias = (n) => new Date(Date.now() + n * DIA).toISOString().slice(0, 10);

export default async function sembrar({ upsertPorClave, log }) {
  const anio = new Date().getFullYear();

  // El que se está cursando: empezó hace 60 días y termina en 60.
  await upsertPorClave(Periodo, { codigo: `${anio}-1` }, {
    nombre: `Primer semestre ${anio}`,
    inicio: enDias(-60),
    termino: enDias(60),
    inscripcionInicio: enDias(-75),
    inscripcionTermino: enDias(-55),
    estado: 'en_curso',
  });

  // El próximo: la inscripción abrió hace 5 días y cierra en 10; las clases parten en 20.
  await upsertPorClave(Periodo, { codigo: `${anio}-2` }, {
    nombre: `Segundo semestre ${anio}`,
    inicio: enDias(20),
    termino: enDias(140),
    inscripcionInicio: enDias(-5),
    inscripcionTermino: enDias(10),
    estado: 'inscripcion_abierta',
  });

  log('períodos listos (uno en curso y uno con inscripción abierta)');
}
