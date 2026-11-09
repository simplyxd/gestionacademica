import { describe, expect, it } from 'vitest';
import { DOCENTES_SEED, ESTUDIANTES_SEED } from '@/mock/personas-academicas';
import { OFERTA_SEED } from '@/mock/oferta';
import { calcularCarga } from './carga';
import { validarPersona } from './rules';
import type { PersonaInput } from './types';

const HOY = '2026-10-05';

const docente: PersonaInput = {
  rut: '14.567.891-9', nombres: 'Sofía', apellidos: 'Lagos', email: 'sofia.lagos@nuevaformacion.cl', telefono: '+56 9 5500 0300',
  incorporacion: '2026-03-02', especialidad: 'Informática', tipoVinculo: 'Por horas',
  codigoEstudiante: '', contactoEmergencia: '', nivelCursando: '',
};
const estudiante: PersonaInput = {
  ...docente, rut: '21.111.222-0', nombres: 'Pablo', apellidos: 'Soto', email: 'pablo.soto@alumnos.nuevaformacion.cl',
  especialidad: '', tipoVinculo: '', codigoEstudiante: 'EST-2026-050', contactoEmergencia: 'Ana Soto · +56 9 5700 0400', nivelCursando: 'Nivel 1',
};

describe('validarPersona', () => {
  it('los seeds son válidos (RUT, correo, código)', () => {
    for (const d of DOCENTES_SEED) {
      const otros = DOCENTES_SEED;
      const e = validarPersona('docente', { ...docente, rut: d.rut, nombres: d.nombres, apellidos: d.apellidos, email: d.email, telefono: d.telefono, incorporacion: d.incorporacion, especialidad: d.especialidad, tipoVinculo: d.tipoVinculo }, otros, d.id, HOY);
      expect(e, d.id).toEqual({});
    }
    for (const s of ESTUDIANTES_SEED) {
      const e = validarPersona('estudiante', { ...estudiante, rut: s.rut, nombres: s.nombres, apellidos: s.apellidos, email: s.email, telefono: s.telefono, incorporacion: s.incorporacion, codigoEstudiante: s.codigoEstudiante, contactoEmergencia: s.contactoEmergencia, nivelCursando: s.nivelCursando }, ESTUDIANTES_SEED, s.id, HOY);
      expect(e, s.id).toEqual({});
    }
  });

  it('acepta un docente y un estudiante nuevos', () => {
    expect(validarPersona('docente', docente, DOCENTES_SEED, undefined, HOY)).toEqual({});
    expect(validarPersona('estudiante', estudiante, ESTUDIANTES_SEED, undefined, HOY)).toEqual({});
  });

  it('exige RUT válido y no repetido', () => {
    expect(validarPersona('docente', { ...docente, rut: '12.345.678-0' }, DOCENTES_SEED, undefined, HOY).rut).toMatch(/válido/);
    expect(validarPersona('docente', { ...docente, rut: DOCENTES_SEED[0].rut }, DOCENTES_SEED, undefined, HOY).rut).toMatch(/Ya existe/);
  });

  it('correo con formato y único; teléfono de 7 a 15 dígitos', () => {
    expect(validarPersona('docente', { ...docente, email: 'sin-arroba' }, DOCENTES_SEED, undefined, HOY).email).toBeDefined();
    expect(validarPersona('docente', { ...docente, email: DOCENTES_SEED[1].email.toUpperCase() }, DOCENTES_SEED, undefined, HOY).email).toMatch(/ya pertenece/);
    expect(validarPersona('docente', { ...docente, telefono: '123' }, DOCENTES_SEED, undefined, HOY).telefono).toBeDefined();
  });

  it('la incorporación no puede ser futura', () => {
    expect(validarPersona('docente', { ...docente, incorporacion: '2027-01-01' }, DOCENTES_SEED, undefined, HOY).incorporacion).toMatch(/futura/);
  });

  it('datos propios del rol: docente (especialidad, vínculo) y estudiante (código único, nivel, contacto)', () => {
    expect(Object.keys(validarPersona('docente', { ...docente, especialidad: '', tipoVinculo: 'Otro' }, DOCENTES_SEED, undefined, HOY)).sort()).toEqual(['especialidad', 'tipoVinculo']);
    expect(validarPersona('estudiante', { ...estudiante, codigoEstudiante: 'X-1' }, ESTUDIANTES_SEED, undefined, HOY).codigoEstudiante).toMatch(/formato/);
    expect(validarPersona('estudiante', { ...estudiante, codigoEstudiante: ESTUDIANTES_SEED[0].codigoEstudiante }, ESTUDIANTES_SEED, undefined, HOY).codigoEstudiante).toMatch(/ya pertenece/);
    expect(Object.keys(validarPersona('estudiante', { ...estudiante, contactoEmergencia: '', nivelCursando: '' }, ESTUDIANTES_SEED, undefined, HOY)).sort()).toEqual(['contactoEmergencia', 'nivelCursando']);
  });
});

describe('calcularCarga', () => {
  it('suma secciones, asignaturas, horas pedagógicas (45 min) e inscritos del período', () => {
    const c = calcularCarga('Rodrigo Fuentes', OFERTA_SEED, 'per-2026-2');
    const propias = OFERTA_SEED.filter((s) => s.docente === 'Rodrigo Fuentes' && s.periodoId === 'per-2026-2');
    expect(c.secciones).toBe(propias.length);
    expect(c.asignaturas).toBe(new Set(propias.map((s) => s.codigoAsignatura)).size);
    expect(c.inscritos).toBe(propias.reduce((a, s) => a + s.inscritosOtros, 0));
    expect(c.horasPedagogicas).toBeGreaterThan(0);
  });

  it('sin secciones en el período: todo en cero', () => {
    expect(calcularCarga('Rodrigo Fuentes', OFERTA_SEED, 'per-2027-1')).toEqual({ secciones: 0, asignaturas: 0, horasPedagogicas: 0, inscritos: 0 });
  });
});
