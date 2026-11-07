const mongoose = require('mongoose');
const { conectar, desconectar } = require('./mongo');

describe('helper de MongoDB en memoria', () => {
  beforeAll(conectar);
  afterAll(desconectar);

  it('deja una conexión abierta', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
