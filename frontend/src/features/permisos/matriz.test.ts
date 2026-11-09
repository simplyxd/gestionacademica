import { describe, expect, it } from 'vitest';
import { leerMatriz } from './matriz';

describe('leerMatriz', () => {
  it('lee filas con permisos booleanos', () => {
    const filas = leerMatriz([
      {
        id: 'usuarios',
        nombre: 'Gestión de usuarios',
        permisos: { admin: true, coordinador: false, docente: false, estudiante: false },
      },
    ]);

    expect(filas).toEqual([
      {
        id: 'usuarios',
        nombre: 'Gestión de usuarios',
        permisos: { admin: true, coordinador: false, docente: false, estudiante: false },
      },
    ]);
  });

  it('acepta recurso + roles y un mapa recurso → roles', () => {
    expect(leerMatriz([{ recurso: 'parametros', roles: ['admin'] }])).toEqual([
      {
        id: 'parametros',
        nombre: 'parametros',
        permisos: { admin: true, coordinador: false, docente: false, estudiante: false },
      },
    ]);
    expect(leerMatriz({ 'usuarios.listar': ['admin', 'coordinador'] })?.[0]).toMatchObject({
      nombre: 'Listar usuarios',
      permisos: { admin: true, coordinador: true, docente: false, estudiante: false },
    });
    expect(leerMatriz({ oferta: ['coordinador', 'estudiante'] })?.[0]?.permisos).toMatchObject({
      coordinador: true,
      estudiante: true,
      admin: false,
    });
  });

  it('una lista vacía es válida; un formato desconocido no', () => {
    expect(leerMatriz([])).toEqual([]);
    expect(leerMatriz([{ id: 'usuarios' }])).toBeNull();
    expect(leerMatriz(null)).toBeNull();
  });
});
