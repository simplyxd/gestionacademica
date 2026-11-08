import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { crearApp } from '../../src/app.js';

// Decisiones: D-05 (CORS con lista blanca), D-06 (helmet y límite de body), D-07 (logs sin datos sensibles).
// No hace falta base de datos: estas pruebas miran cabeceras y comportamiento HTTP.

describe('cabeceras de seguridad (helmet, D-06)', () => {
  it('agrega cabeceras de seguridad y no anuncia que usa Express', async () => {
    const res = await request(crearApp()).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('límite de tamaño del body (D-06)', () => {
  it('rechaza con 413 un JSON de más de 100kb', async () => {
    const demasiadoGrande = { texto: 'x'.repeat(150 * 1024) };

    const res = await request(crearApp()).post('/api/health').send(demasiadoGrande);

    expect(res.status).toBe(413);
  });

  it('no rechaza por tamaño un JSON pequeño', async () => {
    const res = await request(crearApp()).post('/api/health').send({ texto: 'hola' });

    expect(res.status).not.toBe(413);
  });
});

describe('CORS (D-05)', () => {
  const PERMITIDO = 'https://sga.ejemplo.cl';
  const appConCors = () => crearApp({ corsOrigins: [PERMITIDO] });

  it('permite el origen que está en la lista', async () => {
    const res = await request(appConCors()).get('/api/health').set('Origin', PERMITIDO);

    expect(res.headers['access-control-allow-origin']).toBe(PERMITIDO);
  });

  it('no permite un origen que no está en la lista', async () => {
    const res = await request(appConCors()).get('/api/health').set('Origin', 'https://otro.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('responde la solicitud previa (preflight) del origen permitido', async () => {
    const res = await request(appConCors())
      .options('/api/health')
      .set('Origin', PERMITIDO)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(PERMITIDO);
  });

  it('en desarrollo (sin orígenes configurados) no agrega cabeceras CORS: el proxy de Vite evita CORS', async () => {
    const res = await request(crearApp()).get('/api/health').set('Origin', PERMITIDO);

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('registro de peticiones (morgan, D-07)', () => {
  /** Crea una app cuyo registro se guarda en un arreglo, para poder inspeccionarlo. */
  function appConRegistro() {
    const lineas = [];
    const app = crearApp({ registro: { write: (linea) => lineas.push(linea) } });
    return { app, lineas };
  }

  it('registra método, ruta, estado y tiempo de cada petición', async () => {
    const { app, lineas } = appConRegistro();

    await request(app).get('/api/inexistente');

    expect(lineas).toHaveLength(1);
    expect(lineas[0]).toMatch(/^GET \/api\/inexistente 404 [\d.]+ ms/);
  });

  it('no escribe la query string, el body ni el token', async () => {
    const { app, lineas } = appConRegistro();

    await request(app)
      .post('/api/inexistente?token=SECRETO_EN_QUERY')
      .set('Authorization', 'Bearer SECRETO_EN_TOKEN')
      .send({ password: 'SECRETO_EN_BODY' });

    const registro = lineas.join('');
    expect(registro).toContain('POST /api/inexistente');
    expect(registro).not.toContain('SECRETO_EN_QUERY');
    expect(registro).not.toContain('SECRETO_EN_TOKEN');
    expect(registro).not.toContain('SECRETO_EN_BODY');
  });

  it('no registra nada si no se configura el registro (tests silenciosos)', async () => {
    const salidaOriginal = process.stdout.write;
    const escrituras = [];
    process.stdout.write = (...args) => {
      escrituras.push(args[0]);
      return true;
    };

    try {
      await request(crearApp()).get('/api/inexistente');
    } finally {
      process.stdout.write = salidaOriginal;
    }

    expect(escrituras.join('')).not.toContain('/api/inexistente');
  });
});
