import { describe, expect, it } from 'vitest';
import { inicialesDe, leerLogin, normalizarUsuario } from './usuario';

describe('inicialesDe', () => {
  it('usa la primera letra del nombre y del apellido', () => {
    expect(inicialesDe('Andrés Valdés')).toBe('AV');
    expect(inicialesDe('  valentina   rojas ')).toBe('VR');
  });

  it('con un solo nombre usa una letra, y sin nombre usa ?', () => {
    expect(inicialesDe('Ana')).toBe('A');
    expect(inicialesDe('   ')).toBe('?');
  });
});

describe('normalizarUsuario', () => {
  it('lee el usuario del login y completa el correo que el login no trae', () => {
    const usuario = normalizarUsuario(
      { id: 'u1', nombre: 'Camila Soto', rol: 'admin', sedes: ['s1', { id: 's2' }], debeCambiarClave: true },
      'Camila.Soto@instituto.example',
    );

    expect(usuario).toMatchObject({
      id: 'u1',
      nombre: 'Camila Soto',
      rol: 'admin',
      iniciales: 'CS',
      sedes: ['s1', 's2'],
      debeCambiarClave: true,
      correo: 'Camila.Soto@instituto.example',
    });
  });

  it('prefiere el correo que viene en /auth/me y trata la clave pendiente solo si es true', () => {
    const usuario = normalizarUsuario(
      { id: 'u1', nombre: 'Camila Soto', rol: 'docente', correo: 'camila@instituto.example', sedes: [] },
      'otro@instituto.example',
    );

    expect(usuario?.correo).toBe('camila@instituto.example');
    expect(usuario?.debeCambiarClave).toBe(false);
  });

  it('rechaza un rol desconocido o un cuerpo vacío', () => {
    expect(normalizarUsuario({ id: 'u1', nombre: 'Ana', rol: 'rector' })).toBeNull();
    expect(normalizarUsuario(null)).toBeNull();
  });
});

describe('leerLogin', () => {
  it('exige token y usuario', () => {
    expect(leerLogin({ token: '', usuario: { id: 'u1', nombre: 'Ana', rol: 'admin' } }, 'a@b.cl')).toBeNull();
    expect(leerLogin({ token: 'abc', usuario: { nombre: 'Ana' } }, 'a@b.cl')).toBeNull();
    expect(leerLogin({ token: 'abc', usuario: { id: 'u1', nombre: 'Ana', rol: 'admin' } }, 'a@b.cl')?.token).toBe('abc');
  });
});
