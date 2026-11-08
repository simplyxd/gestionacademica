import express from 'express';
import { body, param, query } from 'express-validator';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { validate } from '../../src/middlewares/validate.js';

// Decisiones: 4B (los campos sin regla se descartan: el servicio solo recibe lo validado)
// y 5C (se informan todos los errores de todos los campos, aunque un campo falle por varios motivos).

/** App mínima con una ruta que valida y devuelve lo que el servicio recibiría. */
function crearAppDePrueba() {
  const app = express();
  app.use(express.json());
  app.post(
    '/personas/:id',
    validate([
      param('id').isInt({ min: 1 }).withMessage('debe ser un entero positivo'),
      body('correo').isEmail().withMessage('debe ser un correo válido'),
      body('nombre')
        .trim()
        .notEmpty()
        .withMessage('es obligatorio')
        .isLength({ min: 3 })
        .withMessage('debe tener al menos 3 caracteres'),
      body('edad').optional().isInt({ min: 0 }).withMessage('debe ser un entero mayor o igual a 0'),
      query('modo').optional().isIn(['a', 'b']), // sin mensaje propio
    ]),
    (req, res) => res.json({ body: req.body, datos: req.datos }),
  );
  app.use(errorHandler);
  return app;
}

const publicar = (url, cuerpo) => request(crearAppDePrueba()).post(url).send(cuerpo);

describe('validate · datos válidos', () => {
  it('descarta los campos sin regla: "rol" nunca llega al servicio', async () => {
    const res = await publicar('/personas/5', { correo: 'ana@sga.cl', nombre: 'Ana', rol: 'admin', esAdmin: true });

    expect(res.status).toBe(200);
    expect(res.body.body).toEqual({ correo: 'ana@sga.cl', nombre: 'Ana' });
    expect(res.body.datos.body).toEqual({ correo: 'ana@sga.cl', nombre: 'Ana' });
  });

  it('entrega el valor ya saneado (trim)', async () => {
    const res = await publicar('/personas/5', { correo: 'ana@sga.cl', nombre: '  Ana  ' });

    expect(res.body.datos.body.nombre).toBe('Ana');
  });

  it('separa lo validado por ubicación: body, params y query', async () => {
    const res = await publicar('/personas/5?modo=a&otro=x', { correo: 'ana@sga.cl', nombre: 'Ana', edad: 30 });

    expect(res.body.datos).toEqual({
      body: { correo: 'ana@sga.cl', nombre: 'Ana', edad: 30 },
      params: { id: '5' },
      query: { modo: 'a' },
    });
  });

  it('no inventa los campos opcionales que no se enviaron', async () => {
    const res = await publicar('/personas/5', { correo: 'ana@sga.cl', nombre: 'Ana' });

    expect(res.body.datos.body).not.toHaveProperty('edad');
  });
});

describe('validate · datos inválidos', () => {
  it('responde 400 con TODOS los campos con error y todos sus motivos', async () => {
    const res = await publicar('/personas/abc', { correo: 'no-es-correo', nombre: '' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      code: 'GEN_DATOS_INVALIDOS',
      regla: null,
      message: 'Hay datos inválidos en: id, correo, nombre.',
      details: {
        campos: [
          { campo: 'id', motivo: 'debe ser un entero positivo' },
          { campo: 'correo', motivo: 'debe ser un correo válido' },
          { campo: 'nombre', motivo: 'es obligatorio' },
          { campo: 'nombre', motivo: 'debe tener al menos 3 caracteres' },
        ],
      },
    });
  });

  it('usa "no es válido" cuando la regla no define un mensaje en español', async () => {
    const res = await publicar('/personas/5?modo=z', { correo: 'ana@sga.cl', nombre: 'Ana' });

    expect(res.status).toBe(400);
    expect(res.body.details.campos).toEqual([{ campo: 'modo', motivo: 'no es válido' }]);
  });

  it('no repite en la respuesta los valores que envió el usuario', async () => {
    const res = await publicar('/personas/5', { correo: 'SECRETO_EN_CORREO', nombre: 'SECRETO_EN_NOMBRE_QUE_ES_LARGO', clave: 'SECRETO_EN_CLAVE' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain('SECRETO');
  });

  it('también valida cuando no se envía ningún body', async () => {
    const res = await request(crearAppDePrueba()).post('/personas/5');

    expect(res.status).toBe(400);
    expect(res.body.details.campos.map((c) => c.campo)).toEqual(expect.arrayContaining(['correo', 'nombre']));
  });
});
