import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { crearApp } from '../../src/app.js';
import * as indice from '../../src/routes/index.js';

// Contrato: recursos en plural español y minúscula bajo /api. Cada dominio tiene su archivo de rutas
// (vacío al inicio) y ya está montado en el índice, para que nadie tenga que editar routes/index.js.
const DOMINIOS_DEL_CONTRATO = [
  'auth',
  'usuarios',
  'parametros',
  'sedes',
  'carreras',
  'planes',
  'asignaturas',
  'periodos',
  'matriculas',
  'secciones',
  'oferta',
  'inscripciones',
  'docente',
  'reportes',
];

describe('routes/index · dominios', () => {
  it('registra exactamente los dominios del contrato', () => {
    expect(Object.keys(indice.DOMINIOS ?? {}).sort()).toEqual([...DOMINIOS_DEL_CONTRATO].sort());
  });

  it.each(DOMINIOS_DEL_CONTRATO)('el dominio "%s" es un Router de Express', (dominio) => {
    const router = indice.DOMINIOS?.[dominio];

    expect(typeof router, `falta el router de ${dominio}`).toBe('function');
    expect(Array.isArray(router.stack)).toBe(true);
  });

  it('cada dominio tiene su propio Router, no uno compartido', () => {
    const routers = Object.values(indice.DOMINIOS ?? {});

    expect(new Set(routers).size).toBe(DOMINIOS_DEL_CONTRATO.length);
  });

  it('monta cada dominio bajo /api/<dominio>', async () => {
    // Se agrega una ruta de prueba AL PRINCIPIO del router de "sedes" para que no la tape
    // ningún middleware que su dueño agregue después (por ejemplo, authenticate).
    const router = indice.DOMINIOS.sedes;
    router.get('/__montaje_de_prueba__', (req, res) => res.json({ montado: true }));
    router.stack.unshift(router.stack.pop());

    const res = await request(crearApp()).get('/api/sedes/__montaje_de_prueba__');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ montado: true });
  });
});
