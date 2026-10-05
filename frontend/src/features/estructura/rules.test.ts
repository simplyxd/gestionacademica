import { describe, expect, it } from 'vitest';
import { SEDES } from '@/mock/sedes';
import { validarSede, type SedeInput } from './rules';

const valida: SedeInput = { nombre: 'Sede Providencia', direccion: 'Av. Principal 1234', comuna: 'Santiago', estado: 'activa' };

describe('validarSede', () => {
  it('acepta una sede válida', () => {
    expect(validarSede(valida, SEDES)).toEqual({});
  });

  it('exige nombre, dirección y comuna', () => {
    const e = validarSede({ ...valida, nombre: ' ', direccion: '', comuna: '' }, SEDES);
    expect(Object.keys(e).sort()).toEqual(['comuna', 'direccion', 'nombre']);
  });

  it('el nombre es único sin distinguir mayúsculas', () => {
    expect(validarSede({ ...valida, nombre: 'sede NORTE' }, SEDES).nombre).toMatch(/Ya existe/);
  });

  it('al editar, la propia sede no cuenta como duplicada', () => {
    const norte = SEDES.find((s) => s.id === 'sede-norte')!;
    expect(validarSede({ ...norte }, SEDES, norte.id).nombre).toBeUndefined();
  });
});
