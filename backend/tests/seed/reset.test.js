import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { reiniciarBase } from '../../src/seed/runner.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Decisión 3B: --reset borra toda la base tras una pregunta "s/n".
// Protecciones agregadas por seguridad: se niega con NODE_ENV=production, muestra qué base va a borrar
// y no corre si no hay una terminal donde preguntar.

let Prueba;

beforeAll(async () => {
  await conectarBaseDePrueba();
  Prueba = mongoose.model('DocumentoDeReset', new mongoose.Schema({ texto: String }));
});

afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

const opciones = (cambios = {}) => ({
  conexion: mongoose.connection,
  esProduccion: false,
  hayTerminal: true,
  preguntar: vi.fn().mockResolvedValue('s'),
  ...cambios,
});

describe('reiniciarBase', () => {
  it('se niega con NODE_ENV=production y ni siquiera pregunta', async () => {
    const config = opciones({ esProduccion: true });

    await expect(reiniciarBase(config)).rejects.toThrow('production');
    expect(config.preguntar).not.toHaveBeenCalled();
  });

  it('se niega si no hay terminal donde pedir la confirmación', async () => {
    const config = opciones({ hayTerminal: false });

    await expect(reiniciarBase(config)).rejects.toThrow('terminal');
    expect(config.preguntar).not.toHaveBeenCalled();
  });

  it('la pregunta dice qué base y qué servidor se van a borrar', async () => {
    const config = opciones({ preguntar: vi.fn().mockResolvedValue('n') });

    await reiniciarBase(config);

    const pregunta = config.preguntar.mock.calls[0][0];
    expect(pregunta).toContain(mongoose.connection.name);
    expect(pregunta).toContain(mongoose.connection.host);
    expect(pregunta).toContain('(s/n)');
  });

  it.each(['n', 'N', '', 'no', 'quizás', 'y'])('con la respuesta "%s" no borra nada', async (respuesta) => {
    await Prueba.create({ texto: 'conservar' });
    const config = opciones({ preguntar: vi.fn().mockResolvedValue(respuesta) });

    const reinicio = await reiniciarBase(config);

    expect(reinicio).toBe(false);
    expect(await Prueba.countDocuments()).toBe(1);
  });

  it.each(['s', 'S', ' si ', 'sí'])('con la respuesta "%s" borra toda la base', async (respuesta) => {
    await Prueba.create({ texto: 'borrar' });
    const config = opciones({ preguntar: vi.fn().mockResolvedValue(respuesta) });

    const reinicio = await reiniciarBase(config);

    expect(reinicio).toBe(true);
    expect(await Prueba.countDocuments()).toBe(0);
  });
});
