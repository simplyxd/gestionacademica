import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { crearApp } from '../../src/app.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

// Contrato (D-X2, D-X3, D-X4): GET /api/health es público.
//   base disponible -> 200 { data: { api: 'ok', db: 'conectada' } }
//   base caída      -> 503 { data: { api: 'ok', db: 'desconectada' } }
// Se compara el cuerpo completo con toEqual para que no se filtre ningún dato interno.

const app = crearApp();

describe('GET /api/health', () => {
  describe('con la base de datos caída', () => {
    it('responde 503 y avisa que la base está desconectada, sin pedir token', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(503);
      expect(res.body).toEqual({ data: { api: 'ok', db: 'desconectada' } });
    });
  });

  describe('con la base de datos disponible', () => {
    beforeAll(conectarBaseDePrueba);
    afterAll(desconectarBaseDePrueba);

    it('responde 200 y avisa que la base está conectada, sin pedir token', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toEqual({ data: { api: 'ok', db: 'conectada' } });
    });
  });
});
