import { afterEach, describe, expect, it, vi } from 'vitest';
import { session } from './session';

// Decisión D-13: el token vive en sessionStorage (se pierde al cerrar la pestaña). Es provisional;
// Endert lo revisa en su decisión de autenticación.

function almacenFalso() {
  const datos = new Map<string, string>();
  return {
    datos,
    getItem: vi.fn((clave: string) => datos.get(clave) ?? null),
    setItem: vi.fn((clave: string, valor: string) => {
      datos.set(clave, valor);
    }),
    removeItem: vi.fn((clave: string) => {
      datos.delete(clave);
    }),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('session', () => {
  it('guarda el token y lo devuelve', () => {
    vi.stubGlobal('sessionStorage', almacenFalso());

    session.setToken('abc.def.ghi');

    expect(session.getToken()).toBe('abc.def.ghi');
  });

  it('sin token devuelve null', () => {
    vi.stubGlobal('sessionStorage', almacenFalso());

    expect(session.getToken()).toBeNull();
  });

  it('clear borra el token', () => {
    vi.stubGlobal('sessionStorage', almacenFalso());
    session.setToken('abc');

    session.clear();

    expect(session.getToken()).toBeNull();
  });

  it('usa sessionStorage y nunca localStorage', () => {
    const delaSesion = almacenFalso();
    const local = almacenFalso();
    vi.stubGlobal('sessionStorage', delaSesion);
    vi.stubGlobal('localStorage', local);

    session.setToken('abc');

    expect(delaSesion.setItem).toHaveBeenCalledTimes(1);
    expect(local.setItem).not.toHaveBeenCalled();
  });

  it('si el almacenamiento falla (modo privado, bloqueado), no rompe la app', () => {
    const roto = {
      getItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
      setItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
      removeItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
    };
    vi.stubGlobal('sessionStorage', roto);

    expect(session.getToken()).toBeNull();
    expect(() => session.setToken('abc')).not.toThrow();
    expect(() => session.clear()).not.toThrow();
  });

  it('si no existe sessionStorage (entorno sin navegador), tampoco rompe', () => {
    expect(session.getToken()).toBeNull();
    expect(() => session.clear()).not.toThrow();
  });
});
