import { describe, it, expect } from 'vitest';
import { envolver, envolverLista } from '../../src/utils/respuesta.js';

// Contrato: éxito = { data: <objeto> }; listas = { data: [...], meta: { page, limit, total } }.

describe('respuesta', () => {
  it('envolver pone el objeto dentro de { data }', () => {
    expect(envolver({ id: '1', nombre: 'Sede Norte' })).toEqual({ data: { id: '1', nombre: 'Sede Norte' } });
  });

  it('envolver entrega { data: null } cuando no hay nada, para que "data" nunca desaparezca del JSON', () => {
    expect(envolver(undefined)).toEqual({ data: null });
  });

  it('envolverLista entrega { data, meta }', () => {
    const meta = { page: 1, limit: 20, total: 2 };

    expect(envolverLista([{ id: '1' }, { id: '2' }], meta)).toEqual({ data: [{ id: '1' }, { id: '2' }], meta });
  });
});
