import { describe, expect, it } from 'vitest';
import { CARRERAS, PLANES } from '@/mock/estructura';
import { SEDES } from '@/mock/sedes';
import {
  validarAsignaturaEnPlan,
  validarCarrera,
  validarPlan,
  validarSede,
  type AsignaturaEnPlanInput,
  type CarreraInput,
  type SedeInput,
} from './rules';

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

const carreraValida: CarreraInput = {
  codigo: 'DIS',
  nombre: 'Diseño Gráfico',
  sedes: ['sede-central'],
  modalidad: 'presencial',
  jornada: 'diurna',
  duracionSemestres: 8,
};

describe('validarCarrera', () => {
  it('rechaza código y nombre repetidos, sin sedes y duración fuera de rango', () => {
    const e = validarCarrera(
      { ...carreraValida, codigo: 'inf', nombre: 'ingeniería en informática', sedes: [], duracionSemestres: 15 },
      CARRERAS,
    );
    expect(Object.keys(e).sort()).toEqual(['codigo', 'duracionSemestres', 'nombre', 'sedes']);
    expect(validarCarrera(carreraValida, CARRERAS)).toEqual({});
  });
});

describe('validarPlan', () => {
  it('permite un solo plan vigente por carrera y nombres únicos dentro de ella', () => {
    const e = validarPlan({ carreraId: 'car-inf', nombre: 'plan 2019', estado: 'vigente' }, PLANES);
    expect(e.nombre).toMatch(/ya tiene un plan llamado/);
    expect(e.estado).toMatch(/histórico primero/);
    // El mismo nombre en otra carrera no choca; como histórico, tampoco el estado.
    expect(validarPlan({ carreraId: 'car-adm', nombre: 'Plan 2019', estado: 'histórico' }, PLANES)).toEqual({});
  });
});

describe('validarAsignaturaEnPlan', () => {
  it('rechaza códigos ya presentes, semestres fuera de la carrera y créditos inválidos', () => {
    const plan = PLANES.find((p) => p.id === 'plan-inf-2024')!;
    const base: AsignaturaEnPlanInput = { codigo: 'INF-401', nombre: 'Ingeniería de Software', creditos: 6, semestre: 4, tipo: 'obligatoria' };
    expect(validarAsignaturaEnPlan(base, plan, 8)).toEqual({});
    const e = validarAsignaturaEnPlan({ ...base, codigo: 'inf-101', nombre: '', creditos: 0, semestre: 9 }, plan, 8);
    expect(Object.keys(e).sort()).toEqual(['codigo', 'creditos', 'nombre', 'semestre']);
  });
});
