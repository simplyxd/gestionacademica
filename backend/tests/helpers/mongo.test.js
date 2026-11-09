import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { conectar, desconectar } from './mongo.js';

describe('helper de MongoDB en memoria', () => {
  beforeAll(conectar);
  afterAll(desconectar);

  it('deja una conexión abierta', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
