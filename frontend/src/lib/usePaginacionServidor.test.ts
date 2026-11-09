import { describe, expect, it, vi } from 'vitest';
import { cargarPagina, construirQuery, totalPaginas } from './usePaginacionServidor';

// La lógica de paginar contra el servidor (query y cálculo de páginas) está en funciones puras, que se prueban aquí.
// El hook usePaginacionServidor es solo el pegamento de React que las usa: estado, useEffect y cancelación.

describe('construirQuery', () => {
  it('traduce pagina, limite y orden a page, limit y sort', () => {
    expect(construirQuery({ pagina: 2, limite: 10, orden: '-apellido' })).toEqual({ page: 2, limit: 10, sort: '-apellido' });
  });

  it('sin orden no manda sort', () => {
    expect(construirQuery({ pagina: 1, limite: 20 })).toEqual({ page: 1, limit: 20 });
  });

  it('agrega los filtros sin los valores vacíos', () => {
    const query = construirQuery({ pagina: 1, limite: 20, filtros: { q: 'ana', estado: '', rol: undefined, activo: false } });

    expect(query).toEqual({ page: 1, limit: 20, q: 'ana', activo: false });
  });

  it('los filtros no pueden pisar page, limit ni sort', () => {
    const query = construirQuery({ pagina: 3, limite: 10, orden: 'nombre', filtros: { page: 99, limit: 1000, sort: 'clave' } });

    expect(query).toEqual({ page: 3, limit: 10, sort: 'nombre' });
  });
});

describe('totalPaginas', () => {
  it.each([
    [25, 10, 3],
    [20, 10, 2],
    [1, 10, 1],
    [0, 10, 1], // una lista vacía igual tiene «página 1»
  ])('con %i filas y %i por página hay %i páginas', (total, limite, esperado) => {
    expect(totalPaginas(total, limite)).toBe(esperado);
  });
});

describe('cargarPagina', () => {
  it('pide la página al servidor con la query armada y la señal de cancelación', async () => {
    const respuesta = { data: [{ id: '1' }], meta: { page: 2, limit: 10, total: 11 } };
    const api = { get: vi.fn().mockResolvedValue(respuesta) };
    const control = new AbortController();

    const resultado = await cargarPagina(api, '/sedes', { pagina: 2, limite: 10, orden: 'nombre' }, control.signal);

    expect(api.get).toHaveBeenCalledWith('/sedes', { query: { page: 2, limit: 10, sort: 'nombre' }, senal: control.signal });
    expect(resultado).toEqual(respuesta);
  });
});
