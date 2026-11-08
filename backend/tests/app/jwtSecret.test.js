import { describe, it, expect } from 'vitest';
import { crearApp } from '../../src/app.js';

// Decisión 2A: la app recibe el secreto con el que se verifican los tokens y lo deja en app.locals.jwtSecret.
// El middleware authenticate (Endert) lo lee de ahí con req.app.locals.jwtSecret; así los tests pasan su propio
// secreto de prueba sin tocar variables globales como process.env.

describe('crearApp · jwtSecret', () => {
  it('deja el secreto en app.locals.jwtSecret para que authenticate lo lea', () => {
    const secreto = 'un-secreto-de-al-menos-32-caracteres-xx';

    expect(crearApp({ jwtSecret: secreto }).locals.jwtSecret).toBe(secreto);
  });

  it('sin secreto queda sin definir: las apps que no autentican no lo necesitan', () => {
    expect(crearApp().locals.jwtSecret).toBeUndefined();
  });
});
