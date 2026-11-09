import { describe, expect, it } from 'vitest';
import { destinoTrasCambiarClave, destinoTrasLogin, rutaInicio, rutaPedida } from './rutaInicio';

describe('ruta de regreso', () => {
  it('acepta una ruta interna y descarta el login y las externas', () => {
    expect(rutaPedida({ from: '/admin/usuarios?q=ana' })).toBe('/admin/usuarios?q=ana');
    expect(rutaPedida({ from: '/login' })).toBeNull();
    expect(rutaPedida({ from: '//evil.example' })).toBeNull();
    expect(rutaPedida({ from: 'https://evil.example' })).toBeNull();
  });

  it('si debes cambiar la clave, el login no entra al resto', () => {
    expect(destinoTrasLogin('admin', true, { from: '/admin/usuarios' })).toBe('/cambiar-clave');
    expect(destinoTrasLogin('admin', false, { from: '/admin/usuarios' })).toBe('/admin/usuarios');
    expect(destinoTrasLogin('docente', false, null)).toBe(rutaInicio('docente'));
  });

  it('después de cambiar la clave vuelve a la ruta pedida', () => {
    expect(destinoTrasCambiarClave('admin', { from: '/admin/usuarios' })).toBe('/admin/usuarios');
    expect(destinoTrasCambiarClave('estudiante', { from: '/cambiar-clave' })).toBe('/');
    expect(destinoTrasCambiarClave('admin', null)).toBe('/admin');
  });
});
